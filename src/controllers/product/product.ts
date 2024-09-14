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
import { Op, QueryTypes } from "sequelize";
import { sequelize } from "../../config/db";
import { ProductTypes } from "../../models/ProductType";
import { ProductVariantType } from "../../models/ProductVariantType";
import { Vendor } from "../../models/Vendor";
import { Media } from "../../models/Media";
import { Brand } from "../../models/Brand";

export const Create = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      title,
      status,
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
      BrandId?: number;
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
      _brand = await Brand.scope("withId").findOne({
        where: {
          uuid: brand,
        },
        attributes: ["id"],
      });
    }
    if (_brand) {
      body.BrandId = _brand.id;
    }

    if (status) {
      body["status"] = status;
    }
    if (!body.hasVariants) {
      body.currentPrice = currentPrice;
      if (oldPrice) {
        body.oldPrice = oldPrice;
      }
      body.quantity = quantity;
      if (sku) {
        body.sku = sku;
      }
    }

    const _category = await Category.scope("withId").findOne({
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

    media?.map(async (item: any) => {
      await Media.create({
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

    if (body.hasVariants) {
      skus.map(async (item: any) => {
        let mediaArray = item.media;
        let payload = {
          ...item,
          ProductId: product.id,
        };
        delete payload.media;
        console.log("product sku payload", payload);

        let productSku = await ProductSkus.create(payload);
        console.log(mediaArray);

        mediaArray.map(async (mediaObj: any) => {
          let imagePayload = {
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
        });
      });
      // await ProductSkus.bulkCreate(productSkus);
    }

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
    ];
    const validBody = getValidUpdates(validUpdates, req.body);
    const product = await Product.findOne({
      where: {
        uuid: uid,
      },
    });
    if (!product) {
      return res.status(404).send({
        message: "Product Not Found",
        data: null,
      });
    }

    // if we want to change the parent of the current category
    if (req.body.category) {
      const category = await Category.scope("withId").findOne({
        where: {
          uuid: req.body.category,
        },
        include: ["id"],
      });
      validBody.CategoryId = category?.id;
    }

    if (product.hasVariants) {
      validBody.skus.map(async (item: any) => {
        const productSku = await ProductSkus.findOne({
          where: {
            uuid: item.uuid,
          },
        });
        if (productSku) {
          productSku.sku = item.sku;
          productSku.oldPrice = item.oldPrice;
          productSku.currentPrice = item.currentPrice;
          productSku.quantity = item.quantity;
          await productSku.save();
        }
      });
    } else {
      delete validBody.skus;
    }
    if (validBody.brand) {
      let _brand = await Brand.scope("withId").findOne({
        where: {
          uuid: validBody.brand,
        },
        attributes: ["id"],
      });

      if (_brand) {
        delete validBody.brand;

        validBody.BrandId = _brand.id;
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

    const result = await Product.destroy({
      where: {
        uuid: uid,
      },
    });
    if (result === 1) {
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
    });
    if (_product && _product?.hasVariants === false) {
      delete _product.dataValues.id;
      delete _product.dataValues.CategoryId;
      return res.send({ message: "Success", data: _product });
    }

    const query = `
              SELECT pt."type" as "type",  array_agg(json_build_object('productVariantValueUniqueId',pvv.uuid,'value',o."value")) as "ProductVariants"
              FROM "ProductVariantTypes" as pvt
                  JOIN "ProductVariantValues" as pvv ON pvv."ProductVariantTypeId" = pvt."id"
                  JOIN "ProductTypes" as pt ON pvt."ProductTypeId" = pt."id"
                  JOIN "Options" as o ON ppv."OptionId" = o."id"
              WHERE pvt."ProductId"=${_product?.id}
              GROUP BY pvt."ProductTypeId",pt."type";
              `;

    const [productVariantsWithTypes] = await sequelize.query(query, {
      type: QueryTypes.RAW,
    });
    let _productVariantValue = null;
    let productVariantValueIds = null;
    if (productVariantValues) {
      _productVariantValue = await ProductVariantValues.findAll({
        where: {
          uuid: productVariantValues,
        },
        attributes: ["id"],
      });
      productVariantValueIds = _productVariantValue.map(
        (item) => item.dataValues.id
      );
    }

    let where: {
      combinationIds?: number[];
      setAsDefault?: boolean;
    } = {};

    if (
      productVariantValues &&
      productVariantValues.length &&
      productVariantValueIds &&
      productVariantValueIds.length
    ) {
      where.combinationIds = productVariantValueIds as number[];
    } else {
      where.setAsDefault = true;
    }

    // finding sku for this product

    const productSku = await SkuVariations.findOne({
      where,
      attributes: {
        exclude: [
          "combinationIds",
          "uuid",
          "setAsDefault",
          "createdAt",
          "updatedAt",
        ],
      },
      include: [
        {
          model: ProductSkus,
        },
      ],
    });

    _product = await Product.scope("withId").findOne({
      where: {
        uuid: uid,
      },
      include: [
        {
          model: Category,
          attributes: {
            exclude: ["id", "parentId"],
          },
        },

        {
          model: SkuVariations,
          where: where,

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

              include: [
                {
                  model: ProductImage,
                },
              ],
            },
          ],
        },
      ],
    });

    if (!_product) {
      const err = new BadRequestError("Data Not Found");
      res.status(err.status).send({ message: err.message });
      return;
    }

    const { data } = getData(_product);
    if (data?.uuid) {
      res.send({
        message: "Success",
        data: {
          product: _product,
          ...productSku?.dataValues,
          variantsList: productVariantsWithTypes,
        },
      });
    } else {
      const err = new BadRequestError("Bad Request");
      res.status(err.status).send({ message: err.message });
    }
  } catch (error: any) {
    console.log(error.message);
    res.status(500).send({ message: error.message });
  }
};
export const List = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { limit, offset } = getPaginated(req.query);

    // sortBy
    const sortBy = req.query.sortBy ? req.query.sortBy : "createdAt";
    const sortAs = req.query.sortAs ? (req.query.sortAs as string) : "DESC";
    let _category;
    if (req.query.category) {
      _category = await Category.scope("withId").findOne({
        where: {
          uuid: req.query?.category as string,
        },
      });
    }

    let _vendor;
    if (req.query.vendor) {
      _vendor = await Vendor.scope("withId").findOne({
        where: {
          uuid: req.query.vendor as string,
        },
      });
    }

    const where: { CategoryId?: number; VendorId?: number } = {};
    if (_category?.id) {
      where.CategoryId = _category.id;
    }
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
          attributes: {
            exclude: ["id", "parentId"],
          },
        },
        {
          model: SkuVariations,
          where: {
            setAsDefault: true,
          },
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
      order: [[sortBy as string, sortAs]],
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
