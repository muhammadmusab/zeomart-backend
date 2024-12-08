import { Category } from "../../models/Category";
import { Product } from "../../models/Product";
import { Request, Response, NextFunction } from "express";
import { BadRequestError } from "../../utils/api-errors";

import { getValidUpdates } from "../../utils/validate-updates";
import { getPaginated } from "../../utils/paginate";

import { ProductSkus } from "../../models/ProductSku";
import { ProductImage } from "../../models/ProductImage";
import { SkuVariations } from "../../models/SkuVariation";
import { ProductVariantValues } from "../../models/ProductVariantValue";
import { Op, QueryTypes, where } from "sequelize";
import { sequelize } from "../../config/db";
import { Vendor } from "../../models/Vendor";
import { Media } from "../../models/Media";
import { Option } from "../../models/Options";
import { Attribute } from "../../models/Attribute";
import { ProductReview } from "../../models/ProductReview";
import { UnprocessableError } from "../../utils/api-errors/unprocessable-content";

export const Create = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      title,
      status = "NEW",
      skus = null,
      brand, //brand
      category,
      overview,
      highlights,
      features, //features
      media,
      // if product has no variant
      currentPrice,
      oldPrice,
      quantity,
      sku,
    } = req.body;

    const product = await sequelize.transaction(async (t) => {
      let vendor = await Vendor.scope("withId").findOne({
        where: {
          uuid: req.user.Vendor?.uuid,
        },
      });
      const body: {
        title: string;
        status?: string;
        quantity?: number;
        currentPrice?: number;
        oldPrice?: number;
        sku?: string;
        slug: string;
        OptionId?: number;
        CategoryId?: number | null;
        overview: string;
        highlights: string;
        hasVariants: any;
        features: Record<string, any>[];
        VendorId: number;
      } = {
        features,
        highlights,
        overview,
        hasVariants: Boolean(req.body.hasVariants) ? "true" : "false",
        slug: title
          .replaceAll(" ", "-")
          .replaceAll("/", "-")
          .replaceAll(",", "-"),
        title,
        VendorId: vendor?.id as number,
      };

      // Handle hasVariants =true but no Skus array in body
      if (req.body.hasVariants && !req.body.skus.length) {
        const err = new BadRequestError(
          "Bad Request, Skus not found in the body"
        );
        return res.status(err.status).send({ message: err.message });
      }
      let _brand;
      if (brand) {
        _brand = await Option.findOne({
          where: {
            uuid: brand,
          },
          attributes: ["id"],
        });
      }
      if (_brand) {
        body.OptionId = _brand.id;
      }

      if (status) {
        body["status"] = status;
      }
      if (body.hasVariants === "false") {
        body.currentPrice = currentPrice;
        if (oldPrice) {
          body.oldPrice = oldPrice;
        }
        body.quantity = quantity;
        if (sku) {
          body.sku = sku;
        }
      }

      const _category = await Category.findOne({
        where: {
          uuid: category,
        },
        attributes: {
          include: ["id"],
        },
      });

      if (_category?.id) {
        //@ts-ignore
        body.CategoryId = _category.id as string;
      }

      const product = await Product.create({ ...body });

      media?.map(async (item: any, i: number) => {
        await Media.create({
          default: i === 0 ? true : false,
          url: item?.url,
          width: item?.width,
          height: item?.height,
          size: item?.size,
          mime: item?.mime,
          name: item?.name,
          mediaableType: "Product",
          mediaableId: product?.id,
        });
      });

      if (body.hasVariants && skus?.length) {
        await Promise.all(
          skus?.map(async (item: any) => {
            let mediaArray = item.media;
            let payload = {
              ...item,
              ProductId: product.id,
            };
            delete payload.media;
            const _productSku = await ProductSkus.findOne({
              where: {
                sku: payload.sku,
                ProductId: product.id,
              },
            });
            if (_productSku) {
              const error = new UnprocessableError("Sku already found");
              return next(error);
            }
            let productSku = await ProductSkus.create(payload);
            await Promise.all(
              mediaArray.map(async (mediaObj: any, i: number) => {
                let imagePayload = {
                  default: i === 0 ? true : false,
                  url: mediaObj?.url,
                  width: mediaObj?.width,
                  height: mediaObj?.height,
                  size: mediaObj?.size,
                  mime: mediaObj?.mime,
                  name: mediaObj?.name,
                  mediaableType: "ProductSku",
                  mediaableId: productSku.dataValues.id,
                };
                await Media.create(imagePayload);
              })
            );
          })
        );
      }
      return product;
    });

    const { data } = getData(product);

    res.status(201).send({
      message: "Success",
      data: { ...data },
    });
  } catch (error: any) {
    next(error);
  }
};
export const Update = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { uid } = req.params;
    const validUpdates = [
      "sku",
      "skus",
      "title",
      "status",
      "brand",
      "category",
      "overview",
      "highlights",
      "currentPrice",
      "oldPrice",
      "quantity",
      "media",
      "deletedMedia",
    ];
    const validBody: Record<string, any> = getValidUpdates(
      validUpdates,
      req.body
    );

    const result: any = await sequelize.transaction(async (t) => {
      const _product = await Product.scope("withId").findOne({
        where: {
          uuid: uid,
        },
      });
      if (!_product) {
        return res.status(404).send({
          message: "Product Not Found",
          data: null,
        });
      }
      if (validBody?.deletedMedia?.length) {
        await Promise.all(
          validBody?.deletedMedia?.map(async (uuid: string) => {
            await Media.destroy({ where: { uuid: uuid } });
          })
        );
      }
      if (validBody?.media?.length) {
        const ProductId = _product.id;
        await Promise.all(
          validBody?.media.map(async (item: any, i: number) => {
            if (!item.uuid) {
              let imagePayload = {
                default: i === 0 ? true : false,
                url: item?.url,
                width: item?.width,
                height: item?.height,
                size: item?.size,
                mime: item?.mime,
                name: item?.name,
                mediaableType: "Product",
                mediaableId: ProductId,
              };
              await Media.create(imagePayload);
            }
          })
        );
      }

      // if we want to change the parent of the current category
      if (req.body.category) {
        const category = await Category.findOne({
          where: {
            uuid: req.body.category,
          },
          attributes: ["id"],
        });
        validBody.CategoryId = category?.id;
      }

      if (_product.hasVariants) {
        if (validBody?.skus?.length) {
          await Promise.all(
            validBody?.skus?.map(async (item: any) => {
              let _productSkuId: any;
              if (item.uuid) {
                const _productSku = await ProductSkus.findOne({
                  where: {
                    uuid: item.uuid,
                  },
                });
                if (_productSku) {
                  _productSkuId = _productSku.id;
                  _productSku.sku = item.sku;
                  _productSku.oldPrice = item.oldPrice;
                  _productSku.currentPrice = item.currentPrice;
                  _productSku.quantity = item.quantity;
                  await _productSku.save();
                }
              } else {
                const _foundProductSku = await ProductSkus.findOne({
                  where: {
                    sku: item.sku,
                    ProductId: _product.id,
                  },
                });
                if (_foundProductSku) {
                  const error = new UnprocessableError("Sku already found");
                  return next(error);
                }
                const _productSku = await ProductSkus.create({
                  sku: item.sku,
                  oldPrice: item.oldPrice,
                  currentPrice: item.currentPrice,
                  quantity: item.quantity,
                  ProductId: _product.id,
                });
                _productSkuId = _productSku.dataValues.id;
              }
              if (item?.deletedMedia?.length) {
                await Promise.all(
                  item?.deletedMedia.map(async (uuid: string) => {
                    await Media.destroy({ where: { uuid: uuid } });
                  })
                );
              }
              if (item?.media?.length) {
                await Promise.all(
                  item?.media.map(async (mediaObj: any, i: number) => {
                    if (!mediaObj.uuid) {
                      let imagePayload = {
                        default: i == 0 ? true : false,
                        url: mediaObj?.url,
                        width: mediaObj?.width,
                        height: mediaObj?.height,
                        size: mediaObj?.size,
                        mime: mediaObj?.mime,
                        name: mediaObj?.name,
                        mediaableType: "ProductSku",
                        mediaableId: _productSkuId,
                      };
                      await Media.create(imagePayload);
                    }
                  })
                );
              }
            })
          );
        }
      } else {
        delete validBody.skus;
      }
      if (validBody?.brand) {
        let _brand = await Option.findOne({
          where: {
            uuid: validBody.brand,
          },
          attributes: ["id"],
        });

        if (_brand) {
          delete validBody.brand;

          validBody.OptionId = _brand.id;
        }
      }
      const result = await Product.update(
        { ...validBody },
        {
          where: {
            uuid: uid,
          },
        }
      );
      return result;
    });

    if (!result[0]) {
      const err = new BadRequestError("Could not update the product data");
      res.status(err.status).send({ message: err.message });
      return;
    }
    res.send({ message: "Success", data: result });
  } catch (error) {
    next(error);
  }
};
export const Delete = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { uid } = req.params;

    const _product = await Product.scope("withId").findOne({
      where: {
        uuid: uid,
      },
    });
    if (_product) {
      await Media.destroy({
        where: {
          mediaableId: _product.id,
          mediaableType: "Product",
        },
      });
      await ProductSkus.destroy({
        where: {
          ProductId: _product.id,
        },
      });

      await SkuVariations.destroy({
        where: {
          ProductId: _product.id,
        },
      });
      await _product.destroy();

      res.send({ message: "Success" });
    } else {
      const err = new BadRequestError("Bad Request");
      res.status(err.status).send({ message: err.message });
    }
  } catch (error: any) {
    res.status(500).send({ message: error.message });
  }
};
export const Get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { uid } = req.params;
    // @ts-expect-error
    const { productVariantValues } = req.filter;

    let _product = await Product.scope("withId").findOne({
      where: {
        uuid: uid,
      },
      attributes: {
        exclude: ["VendorId", "OptionId"],
      },
      include: [
        {
          model: Media,
          as: "media",
        },
        {
          model: Category,
          as: "category",
          attributes: {
            exclude: ["id", "parentId"],
          },
        },
      ],
    });
    const ProductId = _product?.id;
    let _productSku = null;
    let data: any = {};
    if (productVariantValues) {
      let ids = Object.values(productVariantValues);
      const _productVariantValues = await ProductVariantValues.findAll({
        where: {
          uuid: ids as string[],
        },
        attributes: {
          include: ["id"],
        },
      });
      let productVariantValuesIds = _productVariantValues.map(
        (item) => item.id
      );

      _productSku = await SkuVariations.findAll({
        where: {
          combinationIds: {
            [Op.contains]: productVariantValuesIds as number[],
          },
        },
        attributes: {
          include: ["ProductSkuId"],
        },
      });
      _productSku = _productSku.map((item) => item.ProductSkuId);
      _productSku = [...new Set(_productSku)];
      _productSku = {
        id: _productSku[0],
      };
    } else {
      _productSku = await ProductSkus.findOne({
        where: {
          ProductId: ProductId,
          isDefault: true,
        },
      });
    }

    let productWhere = `p."uuid"='${uid}'`;
    let having = ``;
    let productSkuWhere = `ps."ProductId"='${ProductId}'`;
    if (_productSku) {
      productSkuWhere += ` AND ps."id"='${_productSku.id}'`;
    }
    let reviewWhere = `WHERE "ProductId"=${ProductId}`;

    if (_productSku) {
      reviewWhere += ` AND "ProductSkuId"=${_productSku.id}`;
    }
    const productReviewQuery = `Select json_build_object(
    'total',COUNT(DISTINCT pr."id"),
    'average', COALESCE(ROUND(CAST(AVG(pr."rating") AS NUMERIC), 1), 0)
    ) as "rating" from "ProductReview" as pr
     ${reviewWhere}
    `;
    const productQuery = `
    SELECT p."uuid",p."title",p."status",p."slug",p."overview",p."highlights",p."sku",p."currentPrice",p."oldPrice",p."quantity",p."features",p."sold",p."hasVariants",p."createdAt",
     json_build_object('title',c."title",'slug',c."slug") as "category",
     jsonb_build_object('uuid',f."uuid",'state',f."state") as "wishlist"
    FROM public."Products" as p
      LEFT JOIN "Categories" as c ON p."CategoryId" = c."id"
     LEFT JOIN "Favourites" as f ON f."ProductId" = p."id"
    WHERE ${productWhere}
    GROUP BY p."uuid",p."hasVariants",p."title",p."status",p."slug",p."overview",p."highlights",p."sku",p."currentPrice",p."oldPrice",p."quantity",p."features",p."sold",p."createdAt",c."title",c."slug",f."uuid",f."state"`;

    const productMediaQuery = `
    SELECT  pm."uuid","url","width","height","size","mime","name" from "Media" as pm
   JOIN "Products" as p ON pm."mediaableId" = p."id"
   WHERE ${productWhere} AND pm."mediaableType"='Product' AND  pm."mediaableId" = p."id";`;

    const [productMediaData] = await sequelize.query(productMediaQuery, {
      type: QueryTypes.RAW,
    });
    const [productData] = await sequelize.query(productQuery, {
      type: QueryTypes.RAW,
    });
    const [productReviewData] = await sequelize.query(productReviewQuery, {
      type: QueryTypes.RAW,
    });

    if (_product && Boolean(_product?.hasVariants)) {
      let productSkuQuery = `
      SELECT json_build_object('uuid', ps."uuid",'isDefault',ps."isDefault",'sku', ps."sku",'oldPrice',ps."oldPrice",'currentPrice',ps."currentPrice",'quantity',ps."quantity") as "sku",
      array_agg(
      json_build_object('productVariantValueUniqueId',pvv."uuid",'option',o."value",'optionUniqueId',o."uuid",'attribute',a."title",'type',a."type",'attributeUniqeId',a."uuid",'skuVariantUniqueId',sv."uuid")) as "selectedOptions",
      array_agg(
        DISTINCT jsonb_build_object (
        'uuid',psm."uuid",'url',psm."url",'width', psm."width",'height', psm."height",'size', psm."size",'mime', psm."mime",'name', psm."name"
      )) as "media",jsonb_build_object('uuid',f."uuid",'state',f."state") as "wishlist"
      FROM "SkuVariations" as sv
          JOIN "ProductSkus" as ps ON sv."ProductSkuId" = ps."id"
          LEFT JOIN "Favourites" as f ON f."ProductSkuId" = ps."id"
          JOIN "ProductVariantValues" as pvv ON sv."ProductVariantValueId" = pvv."id"
          JOIN "Options" as o ON pvv."OptionId" = o."id"
          JOIN "Attributes" as a ON pvv."AttributeId" = a."id"
          JOIN "Media" as psm ON psm."mediaableId"=ps."id" AND psm."mediaableType"='ProductSku'
      WHERE ${productSkuWhere}
      GROUP BY  ps."uuid",ps."sku",ps."oldPrice",ps."currentPrice",ps."quantity",ps."isDefault",f."uuid",f."state"`;

      // let attributeOptions = `
      // SELECT json_build_object('uuid', a."uuid",'title',a."title",'type',a."type") as "attribute",
      //  array_agg(jsonb_build_object('productVariantValueUniqueId', pvv."uuid",
      //                                       'option', o."value",
      //                                       'optionUniqueId', o."uuid",
      //                                       'skuVariationUniqueId', sv."uuid",
      //                                       'productSkuUniqueId', ps."uuid")) as "options"
      // FROM "SkuVariations" as sv
      //     JOIN "ProductSkus" as ps ON sv."ProductSkuId" = ps."id"
      //     JOIN "ProductVariantValues" as pvv ON sv."ProductVariantValueId" = pvv."id"
      //     JOIN "Options" as o ON pvv."OptionId" = o."id"
      //     JOIN "Attributes" as a ON pvv."AttributeId" = a."id"
      // WHERE ps."ProductId" = ${ProductId}
      // GROUP BY a."uuid", a."title", a."type"`;

      let attributeOptions = `
      SELECT json_build_object('uuid', a."uuid",'title',a."title",'type',a."type") as "attribute",
       array_agg(
       json_build_object(
       'productVariantValueUniqueId', option_data."productVariantValueUniqueId",
        'option', option_data."option",
        'optionUniqueId', option_data."optionUniqueId",
        'skuVariationUniqueId', option_data."skuVariationUniqueId"
        )) as "options"
        FROM "Attributes" as a
        JOIN 
        (
          SELECT DISTINCT ON (o."uuid") pvv."uuid" as "productVariantValueUniqueId", 
                  o."value" as "option", 
                  o."uuid" as "optionUniqueId", 
                  sv."uuid" as "skuVariationUniqueId", 
                  ps."uuid" as "productSkuUniqueId", 
                  pvv."AttributeId"
            FROM "SkuVariations" as sv
            JOIN "ProductSkus" as ps ON sv."ProductSkuId" = ps."id"
            JOIN "ProductVariantValues" as pvv ON sv."ProductVariantValueId" = pvv."id"
            JOIN "Options" as o ON pvv."OptionId" = o."id"
            WHERE ps."ProductId" = ${ProductId}
        ) as option_data ON option_data."AttributeId" = a."id"
        GROUP BY a."uuid", a."title", a."type"`;

      const [productSkuData] = await sequelize.query(productSkuQuery, {
        type: QueryTypes.RAW,
      });
      const [attributeOptionsData] = await sequelize.query(attributeOptions, {
        type: QueryTypes.RAW,
      });

      data = {
        // @ts-expect-error
        ...productData[0],
        // @ts-expect-error
        ...productReviewData?.[0],
        media: productMediaData,
        skus: productSkuData,

        attributeOption: attributeOptionsData,
      };
    } else {
      data = {
        // @ts-expect-error
        ...productData[0],
        // @ts-expect-error
        ...productReviewData?.[0],
        media: productMediaData,
      };
    }

    res.send({
      message: "Success",
      data,
    });
  } catch (error: any) {
    console.log("error", error.message);
    res.status(500).send({ message: error.message });
  }
};
export const GetAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // for ADMIN
    const { uid } = req.params;
    const _product = await Product.findOne({
      where: {
        uuid: uid,
      },
      include: [
        {
          model: Media,
          as: "media",
        },
        {
          model: ProductSkus,
          as: "skus",
          attributes: {
            exclude: ["id", "ProductId"],
          },

          include: [
            {
              model: Media,
              as: "media",
            },
          ],
        },

        {
          model: Category,
          as: "category",
          attributes: {
            exclude: ["id", "parentId"],
          },
        },
        {
          model: Option,
          as: "brand",
          attributes: {
            exclude: ["id", "AttributeId"],
          },
        },
        {
          model: SkuVariations,

          attributes: {
            exclude: [
              "id",
              "combinationIds",
              "ProductVariantValueId",
              "ProductSkuId",
              "ProductId",
            ],
          },
          include: [
            {
              model: ProductVariantValues,
              attributes: {
                exclude: ["id", "AttributeId", "OptionId"],
              },
              include: [
                {
                  model: Attribute,
                  as: "attribute",
                  attributes: {
                    exclude: ["id"],
                  },
                },
                {
                  model: Option,
                  as: "options",
                  attributes: {
                    exclude: ["id", "AttributeId"],
                  },
                },
              ],
            },
          ],
        },
      ],
    });
    const { data } = getData(_product);
    res.send({
      message: "Success",
      data,
    });
  } catch (error: any) {
    console.log(error.message);
    res.status(500).send({ message: error.message });
  }
};
export const GetBrand = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    //@ts-expect-error
    const { title } = req.search;

    let _brand = await Attribute.findOne({
      where: {
        title: {
          [Op.iLike]: `%brand%`,
        },
      },
      attributes: ["uuid", "title"],
      include: [
        {
          model: Option,
          as: "options",
          where: {
            value: {
              [Op.iLike]: `%${title}%`,
            },
          },
          attributes: {
            exclude: ["id", "AttributeId"],
          },
        },
      ],
    });
    res.send({ message: "Success", data: _brand });
  } catch (error: any) {
    console.log(error.message);
    res.status(500).send({ message: error.message });
  }
};
export const List = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { limit, offset } = getPaginated(req.query);
    // @ts-expect-error
    const { category, filters } = req.filter;
    //@ts-expect-error
    const sort = req.sort;

    let _category:any=null;
    if (category) {
      _category = await Category.findOne({
        where: {
          slug: category,
        },
        attributes:{
          exclude:['ParentId']
        },
        include: [
          {
            model: Category,
            as: "subCategories",
          },
        ],
      });
    }

    const categoryId=_category?.id
    let subCategoryIds:any=_category?.subCategories.map((item:any)=>{
      return item.id
    })
    if(subCategoryIds.length){
      subCategoryIds.push(categoryId)
    }
 
    let Querywhere = ``;
    let having = ``;
    if (_category?.id) {
      Querywhere = `AND p."CategoryId" IN (${subCategoryIds})`;
    }

    let optionIds: number[] = [];

    if (filters) {
      const attributes = JSON.parse(JSON.stringify(filters));
      delete attributes?.["Price"];
      delete attributes?.["Brand"];
      delete attributes?.["Rating"];
      if (attributes && Object.values(attributes).length) {
        let options: any = Object.values(attributes).reduce(
          (prev: any, currentValue) => prev.concat(currentValue),
          []
        );
        await Promise.all(
          options.map(async (uuid: string) => {
            const option = await Option.findOne({
              where: {
                uuid,
              },
            });
            if (option?.id) {
              optionIds.push(option.id);
            }
          })
        );

        let result = await ProductVariantValues.findAll({
          where: {
            OptionId: optionIds,
          },
        });

        let variantValues: any = result.map((item: any) => item.id);

        variantValues = variantValues.join(",");
        Querywhere += ` AND pvv."id" IN (${variantValues})`;
      }

      if (Object.keys(filters).includes("Price")) {
        const price: string[] = filters.Price;
        let min = +price?.[0];
        let max = +price?.[1];
        if (min && isNaN(min)) {
          price.shift();
        }
        if (max && isNaN(max)) {
          price.pop();
        }

        let priceCondition = ``;

        if (price.length < 2) {
          // price.unshift("1");
          priceCondition = `>= ${+price[0]}`;
          // priceCondition = `BETWEEN ${+price[0]} AND ${+price[1]}`;
        } else {
          if (min > max) {
            priceCondition = `BETWEEN ${+price[1]} AND ${+price[0]}`;
          } else {
            priceCondition = `BETWEEN ${+price[0]} AND ${+price[1]}`;
          }
        }

        Querywhere += ` And ((p."currentPrice" ${priceCondition}) OR ((ps."currentPrice" ${priceCondition}) AND ps."isDefault"))`;
      }
      if (Object.keys(filters).includes("Brands")) {
        const brands = await Promise.all(
          filters.Brands.map(async (brand: string) => {
            const option = await Option.findOne({
              where: {
                uuid: brand,
              },
            });
            if (option) {
              return option.id;
            }
          })
        );

        Querywhere += ` And p."OptionId" IN (${brands})`;
      }
      if (Object.keys(filters).includes("Rating")) {
        if (filters.Rating && !isNaN(filters.Rating)) {
          having = `HAVING AVG(pr."rating") >= ${+filters.Rating}`;
        }
      }
    }

    let orderBY = `ORDER BY `;

    if (sort.length) {
      sort.map((item: { sortBy: string; sortAs: string }) => {
        if (item.sortBy == "Price") {
          orderBY += ` COALESCE(p."currentPrice",ps."currentPrice") ${item.sortAs}`;
        }
        if (item.sortBy == "Title") {
          orderBY += `p."title" ${item.sortAs}`;
        }
      });
    } else {
      orderBY = "";
    }

    const query = `
                SELECT p."uuid",p."title",p."status",p."slug",p."overview",p."highlights",p."sku",p."currentPrice",p."oldPrice",p."quantity",p."features",p."sold",p."hasVariants",p."createdAt",
                array_agg(
                DISTINCT jsonb_build_object(
                'id',pm."id",'url',pm."url",'width',pm."width",'height',pm."height",'size',pm."size",'mime',pm."mime",'name',pm."name") 
                ) as "media",
                array_agg(DISTINCT pvv."uuid") as "selectedOptions",
                json_build_object(
                'total',COUNT(DISTINCT pr."id"),
                'average', COALESCE(ROUND(CAST(AVG(pr."rating") AS NUMERIC), 1), 0)
                ) as "rating",
                 json_build_object('title',c."title",'slug',c."slug") as "category",
                 json_build_object('uuid',ps."uuid",'sku',ps."sku",'oldPrice',ps."oldPrice",'currentPrice',ps."currentPrice",'quantity',ps."quantity",'isDefault',ps."isDefault") as "sku",
                 jsonb_build_object('uuid',f."uuid",'state',f."state") as "wishlist"
                FROM public."Products" as p
                   LEFT  JOIN "Media" as pm ON pm."mediaableId" = p."id" AND pm."mediaableType"='Product'
                   LEFT  JOIN "Categories" as c ON p."CategoryId" = c."id"
                   LEFT  JOIN "ProductSkus" as ps ON ps."ProductId" = p."id"
                   LEFT  JOIN "Favourites" as f ON f."ProductId" = p."id" OR (f."ProductSkuId" IS NOT NULL AND f."ProductSkuId" = ps."id")
                   LEFT  JOIN "SkuVariations" as sv ON sv."ProductId" = p."id"
                   LEFT  JOIN "ProductVariantValues" as pvv ON sv."ProductVariantValueId" = pvv."id"
                   LEFT  JOIN "Options" as o ON pvv."OptionId" = o."id"
                   LEFT  JOIN "Attributes" as a ON pvv."AttributeId" = a."id"
                   LEFT  JOIN "ProductReview" as pr ON pr."ProductId" = p."id"
                WHERE (ps."isDefault" = TRUE OR ps."id" IS NULL) ${Querywhere}
                GROUP BY p."uuid",p."hasVariants",p."title",p."status",p."slug",p."overview",p."highlights",p."sku",p."currentPrice",p."oldPrice",p."quantity",p."features",p."sold",p."createdAt",c."title",c."slug",ps."uuid",ps."sku",ps."oldPrice",ps."currentPrice",ps."quantity",ps."uuid",ps."isDefault",f."uuid",f."state"
                ${orderBY}
                ${having}
                LIMIT ${limit} OFFSET ${offset}
                ;
                `;

    const totalQuery = `SELECT DISTINCT "total" 
                      FROM (
                          SELECT 
                              COUNT(*) OVER() as "total",p."uuid",p."title",p."status",p."slug",p."overview",p."highlights",p."sku",p."currentPrice",p."oldPrice",p."quantity",p."features",p."sold",p."createdAt",
                              json_build_object('title', c."title", 'slug', c."slug") as "category",
                              json_build_object('sku', ps."sku", 'oldPrice', ps."oldPrice", 'currentPrice', ps."currentPrice", 'quantity', ps."quantity", 'isDefault', ps."isDefault") as "sku"
                          FROM public."Products" as p
                          LEFT JOIN "Categories" as c ON p."CategoryId" = c."id"
                          LEFT JOIN "ProductSkus" as ps ON ps."ProductId" = p."id"
                          LEFT JOIN "SkuVariations" as sv ON sv."ProductId" = p."id"
                          LEFT JOIN "ProductVariantValues" as pvv ON sv."ProductVariantValueId" = pvv."id"
                          LEFT JOIN "ProductReview" as pr ON pr."ProductId" = p."id"
                          WHERE (ps."isDefault" = TRUE OR ps."id" IS NULL) ${Querywhere}
                          GROUP BY 
                              p."uuid", p."title", p."status", p."slug", p."overview", p."highlights", 
                              p."sku", p."currentPrice", p."oldPrice", p."quantity", p."features", p."sold", 
                              p."createdAt", c."title", c."slug", ps."uuid", ps."sku", ps."oldPrice", 
                              ps."currentPrice", ps."quantity", ps."uuid", ps."isDefault"
                              ${having}
                      ) as "totalCount";`;

    const [results] = await sequelize.query(query, {
      type: QueryTypes.RAW,
    });
    const [totalResult] = await sequelize.query(totalQuery, {
      type: QueryTypes.RAW,
    });

    const total =
      //@ts-expect-error
      totalResult.length && totalResult[0].total ? totalResult[0].total : 0;
    res.send({ message: "Success", data: results, total });
  } catch (error: any) {
    console.log(error.message);
    next(error);
  }
};

export const DealList = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { limit, offset } = getPaginated(req.query);
 
    let Querywhere = `AND ((p."oldPrice" IS NOT NULL AND p."currentPrice" IS NOT NULL AND p."oldPrice" > p."currentPrice")
    OR
    (ps."oldPrice" IS NOT NULL AND ps."currentPrice" IS NOT NULL AND ps."oldPrice" > ps."currentPrice"))`;
    const query = `
                SELECT p."uuid",p."title",p."status",p."slug",p."overview",p."highlights",p."sku",p."currentPrice",p."oldPrice",p."quantity",p."features",p."sold",p."hasVariants",p."createdAt",
                array_agg(
                DISTINCT jsonb_build_object(
                'id',pm."id",'url',pm."url",'width',pm."width",'height',pm."height",'size',pm."size",'mime',pm."mime",'name',pm."name") 
                ) as "media",
                array_agg(DISTINCT pvv."uuid") as "selectedOptions",
                json_build_object(
                'total',COUNT(DISTINCT pr."id"),
                'average', COALESCE(ROUND(CAST(AVG(pr."rating") AS NUMERIC), 1), 0)
                ) as "rating",
                 json_build_object('title',c."title",'slug',c."slug") as "category",
                 json_build_object('uuid',ps."uuid",'sku',ps."sku",'oldPrice',ps."oldPrice",'currentPrice',ps."currentPrice",'quantity',ps."quantity",'isDefault',ps."isDefault") as "sku",
                 jsonb_build_object('uuid',f."uuid",'state',f."state") as "wishlist"
                FROM public."Products" as p
                   LEFT  JOIN "Media" as pm ON pm."mediaableId" = p."id" AND pm."mediaableType"='Product'
                   LEFT  JOIN "Categories" as c ON p."CategoryId" = c."id"
                   LEFT  JOIN "ProductSkus" as ps ON ps."ProductId" = p."id"
                   LEFT  JOIN "Favourites" as f ON f."ProductId" = p."id" OR (f."ProductSkuId" IS NOT NULL AND f."ProductSkuId" = ps."id")
                   LEFT  JOIN "SkuVariations" as sv ON sv."ProductId" = p."id"
                   LEFT  JOIN "ProductVariantValues" as pvv ON sv."ProductVariantValueId" = pvv."id"
                   LEFT  JOIN "Options" as o ON pvv."OptionId" = o."id"
                   LEFT  JOIN "Attributes" as a ON pvv."AttributeId" = a."id"
                   LEFT  JOIN "ProductReview" as pr ON pr."ProductId" = p."id"
                WHERE (ps."isDefault" = TRUE OR ps."id" IS NULL) ${Querywhere}
                GROUP BY p."uuid",p."hasVariants",p."title",p."status",p."slug",p."overview",p."highlights",p."sku",p."currentPrice",p."oldPrice",p."quantity",p."features",p."sold",p."createdAt",c."title",c."slug",ps."uuid",ps."sku",ps."oldPrice",ps."currentPrice",ps."quantity",ps."uuid",ps."isDefault",f."uuid",f."state"
                LIMIT ${limit} OFFSET ${offset}
                ;
                `;

    const totalQuery = `SELECT DISTINCT "total" 
                      FROM (
                          SELECT 
                              COUNT(*) OVER() as "total",p."uuid",p."title",p."status",p."slug",p."overview",p."highlights",p."sku",p."currentPrice",p."oldPrice",p."quantity",p."features",p."sold",p."createdAt",
                              json_build_object('title', c."title", 'slug', c."slug") as "category",
                              json_build_object('sku', ps."sku", 'oldPrice', ps."oldPrice", 'currentPrice', ps."currentPrice", 'quantity', ps."quantity", 'isDefault', ps."isDefault") as "sku"
                          FROM public."Products" as p
                          LEFT JOIN "Categories" as c ON p."CategoryId" = c."id"
                          LEFT JOIN "ProductSkus" as ps ON ps."ProductId" = p."id"
                          LEFT JOIN "SkuVariations" as sv ON sv."ProductId" = p."id"
                          LEFT JOIN "ProductVariantValues" as pvv ON sv."ProductVariantValueId" = pvv."id"
                          LEFT JOIN "ProductReview" as pr ON pr."ProductId" = p."id"
                          WHERE (ps."isDefault" = TRUE OR ps."id" IS NULL) ${Querywhere}
                          GROUP BY 
                              p."uuid", p."title", p."status", p."slug", p."overview", p."highlights", 
                              p."sku", p."currentPrice", p."oldPrice", p."quantity", p."features", p."sold", 
                              p."createdAt", c."title", c."slug", ps."uuid", ps."sku", ps."oldPrice", 
                              ps."currentPrice", ps."quantity", ps."uuid", ps."isDefault"
                      ) as "totalCount";`;

    const [results] = await sequelize.query(query, {
      type: QueryTypes.RAW,
    });
    const [totalResult] = await sequelize.query(totalQuery, {
      type: QueryTypes.RAW,
    });

    const total =
      //@ts-expect-error
      totalResult.length && totalResult[0].total ? totalResult[0].total : 0;
    res.send({ message: "Success", data: results, total });
  } catch (error: any) {
    console.log(error.message);
    next(error);
  }
};
export const BestSellerList = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { limit, offset } = getPaginated(req.query);
 
    let Querywhere = ``;
    const query = `
                SELECT p."uuid",p."title",p."status",p."slug",p."overview",p."highlights",p."sku",p."currentPrice",p."oldPrice",p."quantity",p."features",p."sold",p."hasVariants",p."createdAt",
                array_agg(
                DISTINCT jsonb_build_object(
                'id',pm."id",'url',pm."url",'width',pm."width",'height',pm."height",'size',pm."size",'mime',pm."mime",'name',pm."name") 
                ) as "media",
                array_agg(DISTINCT pvv."uuid") as "selectedOptions",
                json_build_object(
                'total',COUNT(DISTINCT pr."id"),
                'average', COALESCE(ROUND(CAST(AVG(pr."rating") AS NUMERIC), 1), 0)
                ) as "rating",
                 json_build_object('title',c."title",'slug',c."slug") as "category",
                 json_build_object('uuid',ps."uuid",'sku',ps."sku",'oldPrice',ps."oldPrice",'currentPrice',ps."currentPrice",'quantity',ps."quantity",'isDefault',ps."isDefault") as "sku",
                 jsonb_build_object('uuid',f."uuid",'state',f."state") as "wishlist"
                FROM public."Products" as p
                   LEFT  JOIN "Media" as pm ON pm."mediaableId" = p."id" AND pm."mediaableType"='Product'
                   LEFT  JOIN "Categories" as c ON p."CategoryId" = c."id"
                   LEFT  JOIN "ProductSkus" as ps ON ps."ProductId" = p."id"
                   LEFT  JOIN "Favourites" as f ON f."ProductId" = p."id" OR (f."ProductSkuId" IS NOT NULL AND f."ProductSkuId" = ps."id")
                   LEFT  JOIN "SkuVariations" as sv ON sv."ProductId" = p."id"
                   LEFT  JOIN "ProductVariantValues" as pvv ON sv."ProductVariantValueId" = pvv."id"
                   LEFT  JOIN "Options" as o ON pvv."OptionId" = o."id"
                   LEFT  JOIN "Attributes" as a ON pvv."AttributeId" = a."id"
                   LEFT  JOIN "ProductReview" as pr ON pr."ProductId" = p."id"
                WHERE (ps."isDefault" = TRUE OR ps."id" IS NULL) ${Querywhere}
                GROUP BY p."uuid",p."hasVariants",p."title",p."status",p."slug",p."overview",p."highlights",p."sku",p."currentPrice",p."oldPrice",p."quantity",p."features",p."sold",p."createdAt",c."title",c."slug",ps."uuid",ps."sku",ps."oldPrice",ps."currentPrice",ps."quantity",ps."uuid",ps."isDefault",f."uuid",f."state"
                LIMIT ${limit} OFFSET ${offset}
                ORDER BY p."sold" DESC;
                `;

    const totalQuery = `SELECT DISTINCT "total" 
                      FROM (
                          SELECT 
                              COUNT(*) OVER() as "total",p."uuid",p."title",p."status",p."slug",p."overview",p."highlights",p."sku",p."currentPrice",p."oldPrice",p."quantity",p."features",p."sold",p."createdAt",
                              json_build_object('title', c."title", 'slug', c."slug") as "category",
                              json_build_object('sku', ps."sku", 'oldPrice', ps."oldPrice", 'currentPrice', ps."currentPrice", 'quantity', ps."quantity", 'isDefault', ps."isDefault") as "sku"
                          FROM public."Products" as p
                          LEFT JOIN "Categories" as c ON p."CategoryId" = c."id"
                          LEFT JOIN "ProductSkus" as ps ON ps."ProductId" = p."id"
                          LEFT JOIN "SkuVariations" as sv ON sv."ProductId" = p."id"
                          LEFT JOIN "ProductVariantValues" as pvv ON sv."ProductVariantValueId" = pvv."id"
                          LEFT JOIN "ProductReview" as pr ON pr."ProductId" = p."id"
                          WHERE (ps."isDefault" = TRUE OR ps."id" IS NULL) ${Querywhere}
                          GROUP BY 
                              p."uuid", p."title", p."status", p."slug", p."overview", p."highlights", 
                              p."sku", p."currentPrice", p."oldPrice", p."quantity", p."features", p."sold", 
                              p."createdAt", c."title", c."slug", ps."uuid", ps."sku", ps."oldPrice", 
                              ps."currentPrice", ps."quantity", ps."uuid", ps."isDefault"
                      ) as "totalCount";`;

    const [results] = await sequelize.query(query, {
      type: QueryTypes.RAW,
    });
    const [totalResult] = await sequelize.query(totalQuery, {
      type: QueryTypes.RAW,
    });

    const total =
      //@ts-expect-error
      totalResult.length && totalResult[0].total ? totalResult[0].total : 0;
    res.send({ message: "Success", data: results, total });
  } catch (error: any) {
    console.log(error.message);
    next(error);
  }
};
export const ListAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    //@ts-expect-error
    let sort = req.sort[0];
    if (!sort) {
      sort = { sortBy: "createdAt", sortAs: "DESC" };
      // sort.sortBy = "CreatedAt";
      // sort.sortAs = "DESC";
    }
    const { limit, offset } = getPaginated(req.query);
    const vendor = req.user.Vendor?.uuid;
    let _vendor;
    if (vendor) {
      _vendor = await Vendor.scope("withId").findOne({
        where: {
          uuid: vendor as string,
        },
      });
    }

    const where: { CategoryId?: number; VendorId?: number } = {};

    if (_vendor?.id) {
      where.VendorId = _vendor.id;
    }

    const { count: total, rows: products } = await Product.findAndCountAll({
      where,
      include: [
        {
          model: Media,
          as: "media",
        },
        {
          model: Category,
          as: "category",
          attributes: {
            exclude: ["id", "parentId"],
          },
        },
        {
          model: SkuVariations,

          required: false,
          attributes: {
            exclude: [
              "id",
              "combinationIds",
              "ProductVariantValueId",
              "ProductSkuId",
              "ProductId",
            ],
          },
          include: [
            {
              model: ProductSkus,
              where: {
                isDefault: true,
              },
              // : {},
              // as:"ProductSku",
              attributes: {
                exclude: ["id", "ProductId"],
              },
              required: false,
              include: [
                {
                  model: Media,
                  as: "media",
                },
              ],
            },

            {
              model: ProductVariantValues,
            },
          ],
        },
      ],
      offset: offset,
      limit: limit,
      order: [[sort.sortBy as string, sort.sortAs]],
    });

    res.send({ message: "Success", data: products, total });
  } catch (error: any) {
    console.log(error.message);
    next(error);
  }
};
const getData = (instance: any) => {
  delete instance.dataValues.id;
  delete instance.dataValues.CategoryId;
  return { data: instance.dataValues };
};
