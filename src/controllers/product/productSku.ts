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
import { Sequelize } from "sequelize";

export const Create = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let { oldPrice, currentPrice, quantity, sku, productUniqueId } = req.body;

    const product = await Product.scope("withId").findOne({
      where: {
        uuid: productUniqueId,
      },
    });

    if (!product) {
      return res.status(403).send({ message: "Product not found" });
    }

    //4 Create Skus
    const productSkus = await ProductSkus.create({
      oldPrice,
      currentPrice,
      quantity,
      sku,
      ProductId: product.id,
    });

    delete product.dataValues.id;
    delete product.dataValues.CategoryId;
    delete productSkus.dataValues.id;
    delete productSkus.dataValues.ProductId;

    res.send({
      message: "Success",
      data: {
        productSkus,
      },
    });
  } catch (error: any) {
    console.log(error.message);
    res.status(500).send({ message: error });
  }
};
export const Update = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const validUpdates = [
      "value",
      "oldPrice",
      "currentPrice",
      "quantity",
      "sku",
    ];
    const validBody = getValidUpdates(validUpdates, req.body);
    const { uid } = req.params;

    const productVariantValue = await ProductSkus.update(
      {
        ...validBody,
      },
      {
        where: {
          uuid: uid, // uid of the productSkus table
        },
      }
    );
    if (!productVariantValue[0]) {
      const err = new BadRequestError(
        "Could not update the product variant values"
      );
      res.status(err.status).send({ message: err.message });
      return;
    }
    res.send({ message: "Success", data: productVariantValue });
  } catch (error) {
    res.status(500).send({ message: error });
  }
};
export const Get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { uid } = req.params;

    const productVariant = await ProductSkus.findOne({
      where: {
        uuid: uid, // uid of the productSkus table
      },
    });

    res.send({ message: "Success", data: productVariant });
  } catch (error) {
    res.status(500).send({ message: error });
  }
};
export const Delete = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { uid } = req.params; // ProductSkuUniqueId

    const result = await ProductSkus.scope("withId").destroy({
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
    res.status(500).send({ message: error });
  }
};

export const List = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // sortBy
    const sortBy = req.query.sortBy ? req.query.sortBy : "createdAt";
    const sortAs = req.query.sortAs ? (req.query.sortAs as string) : "DESC";

    const { uid } = req.params; // productUniqueId

    const product = await Product.scope("withId").findOne({
      where: {
        uuid: uid as string,
      },
    });

    const productVariations = await ProductSkus.findAll({
      where: {
        ProductId: product?.id,
      },
      attributes: {
        exclude: ["ProductId", "id"],
      },
      order: [[sortBy as string, sortAs]],
    });

    res.send({ message: "Success", data: productVariations });
  } catch (error: any) {
    console.log(error.message);
    res.status(500).send({ message: error });
  }
};
