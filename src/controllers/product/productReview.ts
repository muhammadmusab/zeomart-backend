import { Product } from "../../models/Product";
import { Request, Response, NextFunction } from "express";
import { BadRequestError } from "../../utils/api-errors";
import { getPaginated } from "../../utils/paginate";
import { ProductVariantValues } from "../../models/ProductVariantValue";
import { ProductReview } from "../../models/ProductReview";
import { ProductSkus } from "../../models/ProductSku";
import { getValidUpdates } from "../../utils/validate-updates";

export const Create = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { productUniqueId, ProductSkuUniqueId, name, title, body, rating } =
    req.body;
  try {
    const email = req.user.email;
    const product = await Product.scope("withId").findOne({
      where: {
        uuid: productUniqueId,
      },
    });
    let productSku = null;
    if (product?.hasVariants === false && ProductSkuUniqueId) {
      productSku = await ProductSkus.scope("withId").findOne({
        where: {
          uuid: ProductSkuUniqueId,
        },
      });
    }
    const payload: {
      name: string;
      email: string;
      title: string;
      body: string;
      rating: number;
      ProductId?: number;
      ProductSkuId?: number;
    } = {
      name,
      email,
      title,
      body,
      rating,
      ProductId: product?.id,
    };
    if (productSku) {
      payload.ProductSkuId = productSku?.id;
    }
    const review = await ProductReview.create(payload);
    delete review.dataValues.id;
    delete review.dataValues.ProductId;
    delete review.dataValues.ProductSkuId;
    res.send({ message: "Success", data: review });
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
    const validUpdates = ["title", "rating", "name", "body"];
    const validBody = getValidUpdates(validUpdates, req.body);
    const { uid } = req.params;
    const result = await ProductReview.update(
      { ...validBody },
      {
        where: {
          uuid: uid,
        },
      }
    );
    if (!result[0]) {
      const err = new BadRequestError("Could not update the review");
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
    const { uid } = req.params; // uid of the review

    let where: {
      uuid: string;
    } = {
      uuid: uid,
    };

    const result = await ProductReview.destroy({
      where,
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
    const { limit, offset } = getPaginated(req.query);
    // sortBy
    const sortBy = req.query.sortBy ? req.query.sortBy : "createdAt";
    const sortAs = req.query.sortAs ? (req.query.sortAs as string) : "DESC";

    const { productUniqueId, ProductSkuUniqueId } = req.query;

    const product = await Product.scope("withId").findOne({
      where: {
        uuid: productUniqueId as string,
      },
    });

    let productSku = null;
    if (product?.hasVariants && ProductSkuUniqueId) {
      productSku = await ProductSkus.scope("withId").findOne({
        where: {
          uuid: ProductSkuUniqueId as string,
        },
      });
    }
    const where: {
      ProductId?: number;
      ProductSkuId?: number;
    } = {};
    if (product?.id) {
      where.ProductId = product.id;
    }
    if (productSku && productSku?.id) {
      where.ProductSkuId = productSku.id;
    }

    const { count: total, rows: images } = await ProductReview.findAndCountAll({
      where,
      attributes: {
        exclude: ["ProductSkuId", "id", "ProductId"],
      },
      include: [
        {
          model: Product,
          attributes: {
            exclude: ["id", "ProductId"],
          },
        },
      ],
      offset: offset,
      limit: limit,
      order: [[sortBy as string, sortAs]],
    });

    res.send({ message: "Success", data: images, total });
  } catch (error: any) {
    console.log(error.message);
    next(error);
  }
};
