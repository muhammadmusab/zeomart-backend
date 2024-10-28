import { Category } from "../../models/Category";
import { Product } from "../../models/Product";
import { Request, Response, NextFunction } from "express";
import { BadRequestError } from "../../utils/api-errors";
import { getValidUpdates } from "../../utils/validate-updates";
import { getPaginated } from "../../utils/paginate";
import { ProductVariantValues } from "../../models/ProductVariantValue";
import { SkuVariations } from "../../models/SkuVariation";
import { ProductSkus } from "../../models/ProductSku";

import { Op, QueryTypes } from "sequelize";
import { Attribute } from "../../models/Attribute";
import { sequelize } from "../../config/db";
import { Option } from "../../models/Options";
import { Media } from "../../models/Media";

export const Create = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let { productSku, product, attributeOptions } = req.body;

    const attributes = attributeOptions.map((item: any) => {
      return item.attribute;
    });

    const hasDuplicate = new Set(attributes).size !== attributeOptions.length;
    if (hasDuplicate) {
      const err = new BadRequestError("Each attributes must be unique");
      return res.status(err.status).send({ message: err.message });
    }

    const skuVariations = await sequelize.transaction(async (t) => {
      const _productSku = await ProductSkus.findOne({
        where: {
          uuid: productSku,
        },
      });
      if (!_productSku) {
        return res.status(403).send({ message: "Product Sku not found" });
      }
      const _product = await Product.scope("withId").findOne({
        where: {
          uuid: product,
        },
      });
      if (!_product) {
        return res.status(403).send({ message: "Product not found" });
      }

      // let productVariantValueIds = [];
      const productVariantValues = await Promise.all(
        attributeOptions.map(
          async (item: {
            attribute: string;
            option: string;
            label?: string;
          }) => {
            // add values to ProductVariantValues table
            const _attribute = await Attribute.findOne({
              where: {
                uuid: item.attribute,
              },
              attributes: ["id", "title"],
            });
            const _option = await Option.findOne({
              where: {
                uuid: item.option,
              },
              attributes: ["id", "value"],
            });
            const foundProductVariantValue = await ProductVariantValues.findOne(
              {
                where: {
                  AttributeId: _attribute?.id,
                  OptionId: _option?.id,
                },
              }
            );
            if (foundProductVariantValue) {
              return foundProductVariantValue.id;
            } else {
              const productVariantValues = await ProductVariantValues.create({
                AttributeId: _attribute?.id,
                OptionId: _option?.id,
                label: _attribute?.title + _option?.value,
              });
              // productVariantValueIds.push(productVariantValues.dataValues.id);
              return productVariantValues.dataValues.id;
            }
          }
        )
      );

      await Promise.all(
        productVariantValues.map(async (ProductVariantValueId: number) => {
          const foundskuVariantion = await SkuVariations.findOne({
            where: {
              ProductVariantValueId,
              ProductSkuId: _productSku?.id,
              ProductId: _product?.id,
            },
          });

          if (foundskuVariantion) {
            const err = new BadRequestError("Sku Variant Already added");
            return next(err);
          }
          const skuVariantion = await SkuVariations.create({
            ProductVariantValueId,
            ProductSkuId: _productSku?.id,
            ProductId: _product?.id,
            combinationIds: productVariantValues,
          });
          delete skuVariantion.dataValues.id;
          delete skuVariantion.dataValues.ProductId;
          delete skuVariantion.dataValues.ProductVariantValueId;
          delete skuVariantion.dataValues.ProductSkuId;
        })
      );

      // const productVariantValues = await ProductVariantValues.findAll({
      //   where: {
      //     uuid: productVariantValue,
      //   },
      //   attributes: ["id"],
      // });

      // if (!productVariantValues.length) {
      //   return res.status(403).send({ message: "Variant Values not found" });
      // }

      const skuVariations = await SkuVariations.findAll({
        where: {
          ProductSkuId: _productSku.id,
        },
        include: [
          {
            model: ProductSkus,
            include: [
              {
                model: Media,
                as: "media",
              },
              {
                model: Product,
                include: [
                  {
                    model: Media,
                    as: "media",
                  },
                ],
              },
            ],
          },
          {
            model: ProductVariantValues,
            attributes: {
              exclude: ["id", "OptionId", "AttributeId"],
            },

            include: [
              {
                model: Option,
                as: "options",
                attributes: {
                  exclude: ["id", "AttributeId"],
                },
                include: [
                  {
                    model: Attribute,
                    attributes: {
                      exclude: ["id"],
                    },
                  },
                ],
              },
            ],
          },
        ],
      });
      return skuVariations;
    });

    res.send({
      message: "Success",
      data: skuVariations,
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
    const validUpdates = ["attributeOptions", "deletedAttributeOptions"];
    const validBody = getValidUpdates(validUpdates, req.body);
    const { uid } = req.params; // sku
    const _productSku = await ProductSkus.findOne({
      where: {
        uuid: uid,
      },
      attributes: ["id", "ProductId"],
    });
    const total = await SkuVariations.count({
      where: {
        ProductSkuId: _productSku?.id,
      },
    });

    if (validBody.deletedAttributeOptions.length) {
      if (total - validBody?.deletedAttributeOptions?.length < 2) {
        const err = new BadRequestError("At least two attributes are required");
        return next(err);
      }
      await SkuVariations.destroy({
        where: {
          uuid: validBody?.deletedAttributeOptions,
        },
      });
    }
    let productVariantValues = await Promise.all(
      validBody.attributeOptions.map(
        async (
          item: {
            skuVariantUniqueId: string;
            attribute: string;
            option: string;
          },
          i: number
        ) => {
          const _attribute = await Attribute.findOne({
            where: {
              uuid: item?.attribute,
            },
          });
          const _option = await Option.findOne({
            where: {
              uuid: item?.option,
            },
          });
          const _productVariantValue = await ProductVariantValues.findOne({
            where: {
              AttributeId: _attribute?.id,
              OptionId: _option?.id,
            },
          });
          let foundProductVariantValueId;
          if (_productVariantValue) {
            foundProductVariantValueId = _productVariantValue.id;
            const _skuvariation = await SkuVariations.scope("withId").findOne({
              where: {
                uuid: item?.skuVariantUniqueId,
              },
            });
            if (_skuvariation && foundProductVariantValueId) {
              _skuvariation.ProductVariantValueId = foundProductVariantValueId;
              await _skuvariation.save();
            }
            return {
              status: "old",
              id: _skuvariation?.ProductVariantValueId,
            };
          } else {
            // Product Variant Value needs to be created ( because new attribute/option is added)
            const productVariantValues = await ProductVariantValues.create({
              AttributeId: _attribute?.id,
              OptionId: _option?.id,
              label: _attribute?.title + _option?.value,
            });
            return {
              status: "new",
              id: productVariantValues.dataValues.id,
            };
          }
        }
      )
    );

    if (productVariantValues.length) {
      productVariantValues = productVariantValues.filter(
        (item: { id: number; status: "old" | "new" }) => {
          return item.status === "new";
        }
      );
      await Promise.all(
        productVariantValues.map(async (id: number) => {
          const skuVariantion = await SkuVariations.create({
            ProductVariantValueId: id,
            ProductSkuId: _productSku?.id,
            ProductId: _productSku?.ProductId,
            combinationIds: productVariantValues,
          });
          delete skuVariantion.dataValues.id;
          delete skuVariantion.dataValues.ProductId;
          delete skuVariantion.dataValues.ProductVariantValueId;
          delete skuVariantion.dataValues.ProductSkuId;
        })
      );
    }

    res.send({ message: "Success" });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
export const Get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { uid } = req.params; //uuid of the sku

    let Querywhere = `ps."uuid" = '${uid}'`;
    const query = `
    SELECT p.uuid as "productUniqueId",json_build_object('uuid', ps."uuid",'sku','isDefault',ps."isDefault", ps.sku,'oldPrice',ps."oldPrice",'currentPrice',ps."currentPrice",'quantity',ps.quantity) as "sku",array_agg(json_build_object('productVariantValueUniqueId',pvv.uuid,'option',o."value",'optionUniqueId',o."uuid",'attribute',a."title",'type',a."type",'attributeUniqeId',a."uuid",'skuVariantUniqueId',sv.uuid)) as "attributeOptions"
    FROM "SkuVariations" as sv
        JOIN "ProductSkus" as ps ON sv."ProductSkuId" = ps."id"
        JOIN "Products" as p ON sv."ProductId" = p."id"
        JOIN "ProductVariantValues" as pvv ON sv."ProductVariantValueId" = pvv."id"
        JOIN "Options" as o ON pvv."OptionId" = o."id"
        JOIN "Attributes" as a ON pvv."AttributeId" = a."id"
    WHERE ${Querywhere}
    GROUP BY  p.uuid, ps.uuid,ps.sku,ps."oldPrice",ps."currentPrice",ps.quantity,ps.uuid,ps."isDefault"
    `;
    const [results, metadata] = await sequelize.query(query, {
      type: QueryTypes.RAW,
    });

    res.send({ message: "Success", data: results?.[0] });
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
    const { uid } = req.params; // sku id

    const _productSku = await ProductSkus.findOne({
      where: {
        uuid: uid,
      },
    });

    await SkuVariations.destroy({
      where: {
        ProductSkuId: _productSku?.id as number,
      },
    });

    res.send({ message: "Success" });
  } catch (error) {
    next(error);
  }
};
export const List = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // sortBy
    const sortBy = req.query.sortBy ? req.query.sortBy : "createdAt";
    const sortAs = req.query.sortAs ? (req.query.sortAs as string) : "DESC";

    const { limit, offset } = getPaginated(req.query);
    //@ts-expect-error
    const { productSku, skuVariant } = req.filter;
    const { uid: product } = req.params;

    const _product = await Product.scope("withId").findOne({
      where: {
        uuid: product as string,
      },
      attributes: ["uuid", "id"],
    });
    let _productSku = null;

    if (productSku) {
      _productSku = await ProductSkus.findOne({
        where: {
          uuid: productSku,
        },
        // attributes: ["id"],
      });
    }

    let where: {
      ProductId: any;
      ProductSkuId?: any;
      // skuVariantUniqueId?: any;
      uuid?: any;
    } = {
      ProductId: _product?.id,
    };
    if (_productSku) {
      where.ProductSkuId = _productSku.id;
    }
    if (skuVariant) {
      where.uuid = skuVariant;
    }

    let Querywhere = `sv."ProductId" = ${_product?.id}`;
    if (_productSku?.id) {
      Querywhere = `sv."ProductId" = ${_product?.id} AND sv."ProductSkuId" = ${_productSku?.id}`;
    }

    const query = `
                SELECT p.uuid as "productUniqueId",json_build_object('uuid', ps."uuid",'isDefault',ps."isDefault",'sku', ps.sku,'oldPrice',ps."oldPrice",'currentPrice',ps."currentPrice",'quantity',ps.quantity) as "sku",array_agg(json_build_object('productVariantValueUniqueId',pvv.uuid,'option',o."value",'optionUniqueId',o."uuid",'attribute',a."title",'type',a."type",'attributeUniqeId',a."uuid",'skuVariantUniqueId',sv.uuid)) as "attributeOptions"
                FROM "SkuVariations" as sv
                    JOIN "ProductSkus" as ps ON sv."ProductSkuId" = ps."id"
                    JOIN "Products" as p ON sv."ProductId" = p."id"
                    JOIN "ProductVariantValues" as pvv ON sv."ProductVariantValueId" = pvv."id"
                    JOIN "Options" as o ON pvv."OptionId" = o."id"
                    JOIN "Attributes" as a ON pvv."AttributeId" = a."id"
                WHERE ${Querywhere}
                GROUP BY  p.uuid, ps.uuid,ps.sku,ps."oldPrice",ps."currentPrice",ps.quantity,ps.uuid,ps."isDefault"
                LIMIT ${limit} OFFSET ${offset};
                `;
    const [results, metadata] = await sequelize.query(query, {
      type: QueryTypes.RAW,
    });

    const total = await SkuVariations.count({
      where: {
        ProductId: _product?.id,
      },
    });

    res.send({ message: "Success", data: results, total });
  } catch (error: any) {
    console.log(error);
    res.status(500).send({ message: error.message });
  }
};
