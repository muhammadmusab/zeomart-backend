import { Category } from "../../models/Category";
import { Product } from "../../models/Product";
import { Request, Response, NextFunction } from "express";
import { BadRequestError } from "../../utils/api-errors";
import { getValidUpdates } from "../../utils/validate-updates";
import { getPaginated } from "../../utils/paginate";
import { ProductVariantType } from "../../models/ProductVariantType";
import { ProductVariantValues } from "../../models/ProductVariantValue";
import { SkuVariations } from "../../models/SkuVariation";
import { ProductSkus } from "../../models/ProductSku";
import { ProductImage } from "../../models/ProductImage";
import { Op, QueryTypes, Sequelize } from "sequelize";
import { ProductTypes } from "../../models/ProductType";
import { sequelize } from "../../config/db";
import { Option } from "../../models/Options";

export const Create = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let { productVariantType, values } = req.body;

    const _productVariantType = await ProductVariantType.scope(
      "withId"
    ).findOne({
      where: {
        uuid: productVariantType,
      },
    });

    if (!_productVariantType) {
      return res.status(403).send({ message: "Variant Type not found" });
    }

    values = values.map((value: string | number) => {
      return {
        value,
        ProductVariantTypeId: _productVariantType.id,
      };
    });

    //3. Create Variant Value
    const result = await ProductVariantValues.bulkCreate(values);

    res.send({
      message: "Success",
      data: {
        productVariantType: _productVariantType,
        ProductVariantValues: result,
      },
    });
  } catch (error: any) {
    console.log(error.message);
    next(error);
  }
};
export const AssignVariants = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let { productVariantValue, productSku, product, media } = req.body;

    const productVariantValues = await ProductVariantValues.findAll({
      where: {
        uuid: productVariantValue,
      },
      attributes: ["id"],
    });

    if (!productVariantValues.length) {
      return res.status(403).send({ message: "Variant Values not found" });
    }
    const _productSku = await ProductSkus.scope("withId").findOne({
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

    // Add product media/images to database
    if (_product.id && _productSku.id) {
      const formattedMedia = media.map((item: any) => {
        return {
          url: item.url,
          ProductId: _product.id,
          ProductSkuId: _productSku.id,
        };
      });

      await ProductImage.bulkCreate(formattedMedia);
    }

    const productVariantValueIds = productVariantValues.map(
      (item) => item.dataValues.id
    ) as number[];

    const total = await SkuVariations.count({
      where: {
        ProductSkuId: _productSku.id,
      },
    });
    if (total && total >= productVariantValueIds.length) {
      return res.status(403).send({ message: "Variant already added" });
    }

    await Promise.all(
      productVariantValueIds.map(async (value: any) => {
        const skuVariantion = await SkuVariations.create({
          ProductVariantValueId: value,
          ProductSkuId: _productSku.id,
          ProductId: _product.id,
          combinationIds: productVariantValueIds,
        });
        delete skuVariantion.dataValues.id;
        delete skuVariantion.dataValues.ProductId;
        delete skuVariantion.dataValues.ProductVariantValueId;
        delete skuVariantion.dataValues.ProductSkuId;
      })
    );

    const skuVariations = await SkuVariations.findAll({
      where: {
        ProductSkuId: _productSku.id,
      },
    });

    res.send({
      message: "Success",
      data: skuVariations,
    });
  } catch (error: any) {
    next(error);
  }
};

export const setDefaultVariant = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { productSkuUniqueId } = req.body;
    const productSku = await ProductSkus.scope("withId").findOne({
      where: {
        uuid: productSkuUniqueId,
      },
    });
    await SkuVariations.update(
      {
        setAsDefault: false,
      },
      {
        where: {
          [Op.not]: {
            ProductSkuId: productSku?.id,
          },
        },
      }
    );
    const variants = await SkuVariations.update(
      {
        setAsDefault: true,
      },
      {
        where: {
          ProductSkuId: productSku?.id,
        },
      }
    );

    if (!variants[0]) {
      const err = new BadRequestError("Could not update");
      res.status(err.status).send({ message: err.message });
      return;
    }
    res.send({ message: "Success", data: variants });
  } catch (error) {
    next(error);
  }
};
export const Update = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const validUpdates = ["value"];
    const validBody = getValidUpdates(validUpdates, req.body);
    const { uid } = req.params;

    const productVariantValue = await ProductVariantValues.update(
      {
        ...validBody,
      },
      {
        where: {
          uuid: uid, // uid of the productVariant table
        },
      }
    );
    if (!productVariantValue[0]) {
      const err = new BadRequestError(
        "Could not update the product variant value"
      );
      res.status(err.status).send({ message: err.message });
      return;
    }
    res.send({ message: "Success", data: productVariantValue });
  } catch (error) {
    next(error);
  }
};
export const Get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { uid } = req.params; //uuid of the product
    let product = await Product.scope("withId").findOne({
      where: {
        uuid: uid,
      },
    });

    const query = `
              SELECT pt."type" as "type",  array_agg(json_build_object('productVariantValueUniqueId',pvv.uuid,'value',o."value")) as "ProductVariants"
              FROM "ProductVariantTypes" as pvt
                  JOIN "ProductVariantValues" as pvv ON pvv."ProductVariantTypeId" = pvt."id"
                  JOIN "ProductTypes" as pt ON pvt."ProductTypeId" = pt."id"
                  JOIN "Options" as o ON ppv."OptionId" = o."id"
              WHERE pvt."ProductId"=${product?.id}
              GROUP BY pvt."ProductTypeId",pt."type";
              `;

    const [productVariants] = await sequelize.query(query, {
      type: QueryTypes.RAW,
    });

    res.send({ message: "Success", data: productVariants });
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

    const result = await ProductVariantValues.destroy({
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
  } catch (error) {
    next(error);
  }
};

export const List = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // sortBy
    const sortBy = req.query.sortBy ? req.query.sortBy : "createdAt";
    const sortAs = req.query.sortAs ? (req.query.sortAs as string) : "DESC";

    const { uid } = req.params; // uid

    const _productVariantType = await ProductVariantType.scope(
      "withId"
    ).findOne({
      where: {
        uuid: uid as string,
      },
    });
    if (!_productVariantType?.id) {
      res.status(403).send({ message: "Variant type not found" });
    }

    const productVariantvalues = await ProductVariantValues.findAll({
      where: {
        ProductVariantTypeId: _productVariantType?.id,
      },
      order: [[sortBy as string, sortAs]],
    });

    res.send({ message: "Success", data: productVariantvalues });
  } catch (error: any) {
    console.log(error.message);
    next(error);
  }
};

export const AssignedList = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // sortBy
    const sortBy = req.query.sortBy ? req.query.sortBy : "createdAt";
    const sortAs = req.query.sortAs ? (req.query.sortAs as string) : "DESC";
    //@ts-expect-error
    const { product, productSku, skuVariant ,separate="false"} = req.filter;

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
        attributes: ["id"],
      });
    }

    let where: {
      ProductId: any;
      ProductSkuId?: any;
      // skuVariantUniqueId?: any;
      uuid?: any;
    } = {
      ProductId: product?.id,
    };
    if (_productSku) {
      where.ProductSkuId = _productSku.id;
    }
    if (skuVariant) {
      where.uuid = skuVariant;
    }

    let data = null;

    if (separate === "true") {
      data = await SkuVariations.findAll({
        where,
        include: [
          {
            model: ProductSkus,
            attributes: {
              exclude: ["id", "ProductId"],
            },
          },
          {
            model: ProductVariantValues,
            include: [
              {
                model: Option,
              },
              {
                model: ProductVariantType,
                include: [
                  {
                    model: ProductTypes,
                  },
                ],
              },
            ],
            attributes: {
              exclude: ["id", "ProductVariantTypeId"],
            },
          },
        ],
      });
    } else {
      let where = `sv."ProductId" = ${_product?.id}`;
      if (_productSku?.id) {
        where = `sv."ProductId" = ${_product?.id} AND sv."ProductSkuId" = ${_productSku?.id}`;
      }
      const query = `
                SELECT ps.sku,ps."oldPrice",ps."currentPrice",ps.quantity,array_agg(json_build_object('productVariantValueUniqueId',pvv.uuid,'skuUniqueId',ps.uuid,'value',o."value",'elementType',pvt."elementType",'type',pt."type",'skuVariantUniqueId',sv.uuid,'skuUniqueId',ps.uuid)) as "variantValues"
                FROM "SkuVariations" as sv
                    JOIN "ProductSkus" as ps ON sv."ProductSkuId" = ps."id"
                    JOIN "ProductVariantValues" as pvv ON sv."ProductVariantValueId" = pvv."id"
                    JOIN "Options" as o ON pvv."OptionId" = o."id"
                    JOIN "ProductVariantTypes" as pvt ON pvv."ProductVariantTypeId" = pvt."id"
                    JOIN "ProductTypes" as pt ON pvt."ProductTypeId" = pt."id"
                WHERE ${where}
                GROUP BY "ProductSkuId",ps.sku,ps."oldPrice",ps."currentPrice",ps.quantity,ps.uuid;
                `;
      const [results, metadata] = await sequelize.query(query, {
        type: QueryTypes.RAW,
      });

      data = results;
    }
    res.send({ message: "Success", data });
  } catch (error: any) {
    res.status(500).send({ message: error.message });
  }
};
