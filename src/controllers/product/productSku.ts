import { Category } from "../../models/Category";
import { Product } from "../../models/Product";
import { Request, Response, NextFunction } from "express";
import { BadRequestError } from "../../utils/api-errors";
import { getValidUpdates } from "../../utils/validate-updates";
import { getPaginated } from "../../utils/paginate";
import { ProductVariantValues } from "../../models/ProductVariantValue";
import { SkuVariations } from "../../models/SkuVariation";
import { ProductSkus } from "../../models/ProductSku";
import { Op } from "sequelize";
import { Media } from "../../models/Media";
import { UnprocessableError } from "../../utils/api-errors/unprocessable-content";

export const Create = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let { oldPrice, currentPrice, quantity, sku, product } = req.body;

    const _product = await Product.scope("withId").findOne({
      where: {
        uuid: product,
      },
    });

    if (!_product) {
      return res.status(403).send({ message: "Product not found" });
    }

    const _foundProductSku = await ProductSkus.findOne({
      where: {
        sku: sku,
        ProductId: _product.id,
      },
    });
    if (_foundProductSku) {
      const error = new UnprocessableError("Sku already found");
      return next(error);
    }

    //4 Create Skus
    const productSkus = await ProductSkus.create({
      oldPrice,
      currentPrice,
      quantity,
      sku,
      ProductId: _product.id,
    });

    delete _product.dataValues.id;
    delete _product.dataValues.CategoryId;
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
    next(error);
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
    next(error);
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
    next(error);
  }
};
export const setDefaultVariant = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { productSku, product } = req.body;
    const _product = await Product.scope("withId").findOne({
      where: {
        uuid: product,
      },
    });
    await ProductSkus.update(
      {
        isDefault: false,
      },
      {
        where: {
          ProductId: _product?.id,
        },
      }
    );
    const _productSku = await ProductSkus.findOne({
      where: {
        uuid: productSku,
      },
    });
    if (_productSku) {
      _productSku.isDefault = true;
      await _productSku?.save();
      await _productSku.reload();
    }

    if (!_productSku) {
      const err = new BadRequestError("Could not update");
      res.status(err.status).send({ message: err.message });
      return;
    }
    res.send({ message: "Success", data: _productSku });
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
    const { uid } = req.params; // ProductSkuUniqueId

    const _productSku = await ProductSkus.findOne({
      where: {
        uuid: uid,
      },
    });
    if (_productSku) {
      await Media.destroy({
        where: {
          mediaableId: _productSku.id,
          mediaableType: "ProductSku",
        },
      });
      await SkuVariations.destroy({
        where: {
          ProductSkuId: _productSku.id,
        },
      });
      await _productSku.destroy();
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

    const { uid } = req.params; // productUniqueId
    //@ts-expect-error
    const { title: sku } = req.search;

    const product = await Product.scope("withId").findOne({
      where: {
        uuid: uid as string,
      },
    });

    const _productSku = await ProductSkus.findAll({
      where: {
        ProductId: product?.id,
        sku: {
          [Op.iLike]: `%${sku}%`,
        },
      },
      attributes: {
        exclude: ["ProductId", "id"],
      },
      // order: [[sortBy as string, sortAs]],
    });

    res.send({ message: "Success", data: _productSku });
  } catch (error: any) {
    console.log(error.message);
    next(error);
  }
};
