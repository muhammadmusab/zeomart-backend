import { Product } from "../../models/Product";
import { Request, Response, NextFunction } from "express";
import { BadRequestError } from "../../utils/api-errors";
import { getPaginated } from "../../utils/paginate";
import { ProductVariantValues } from "../../models/ProductVariantValue";
import { ProductReview } from "../../models/ProductReview";
import { ProductSkus } from "../../models/ProductSku";
import { getValidUpdates } from "../../utils/validate-updates";
import { sequelize } from "../../config/db";
import { QueryTypes, Sequelize } from "sequelize";
import { Auth } from "../../models/Auth";
import { User } from "../../models/User";

export const Create = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { product, productSku, title, body, rating } = req.body;
  try {
    const email = req.user.email;
    const name = req.user.User?.firstName as string;
    const user = await Auth.scope("withoutPasswordAndVerified").findOne({
      where: {
        email,
      },
      attributes: ["UserId"],
    });

    const _product = await Product.scope("withId").findOne({
      where: {
        uuid: product,
      },
    });

    let _productSku = null;
    if (_product?.hasVariants && productSku) {
      _productSku = await ProductSkus.findOne({
        where: {
          uuid: productSku,
        },
      });
    }
    const ProductId = _product?.id;
    const ProductSkuId = _productSku?.id;
    const payload: {
      name: string;
      UserId: number;
      title: string;
      body: string;
      rating: number;
      ProductId?: number;
      ProductSkuId?: number;
    } = {
      name,
      UserId: user?.UserId as number,
      title,
      body,
      rating,
      ProductId,
    };
    if (_productSku) {
      payload.ProductSkuId = ProductSkuId;
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
    const validUpdates = ["title", "rating", "body"];
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
    const { limit, offset, page } = getPaginated(req.query);
    // sortBy
    const sortBy = req.query.sortBy ? req.query.sortBy : "createdAt";
    const sortAs = req.query.sortAs ? (req.query.sortAs as string) : "DESC";

    // @ts-expect-error
    const { product, productSku } = req.filter;

    const _product = await Product.scope("withId").findOne({
      where: {
        uuid: product as string,
      },
    });

    let _productSku = null;
    if (_product?.hasVariants && productSku) {
      _productSku = await ProductSkus.findOne({
        where: {
          uuid: productSku as string,
        },
      });
    }
    const where: {
      ProductId?: number;
      ProductSkuId?: number;
    } = {};
    if (_product?.id) {
      where.ProductId = _product.id;
    }
    if (productSku && _productSku?.id) {
      where.ProductSkuId = _productSku.id;
    }

    let reviewWhere = `pr."ProductId"=${_product?.id}`;
    if (productSku?.id) {
      reviewWhere += ` AND pr."ProductSku"=${_productSku?.id}`;
    }
    const reviewQuery = `
    SELECT pr."uuid",pr."rating",pr."name",pr."title",pr."body",pr."createdAt", json_build_object('uuid',u."uuid",'firstName',u."firstName",'lastName',u."lastName",'phone',u."phone",'avatar',a."avatar") as "user" from "ProductReview" as pr
           JOIN "Products" as p ON p."id" = pr."ProductId"
           JOIN "Users" as u ON u."id" = pr."UserId"
           JOIN "Auth" as a ON a."UserId" = u."id"
           WHERE ${reviewWhere}
           LIMIT ${limit} OFFSET ${offset}
    `;

    const groupRatingQuery = `
    SELECT ROUND((COUNT(pr."rating")::decimal / SUM(COUNT(pr."rating")) OVER ()) * 100)  AS percentage, pr."rating" from "ProductReview" as pr 
    WHERE ${reviewWhere}
    GROUP BY pr."rating"
    `;

    const total = await ProductReview.count({
      where,
    });

    const [reviews] = await sequelize.query(reviewQuery, {
      type: QueryTypes.RAW,
    });
    const [groupRating] = await sequelize.query(groupRatingQuery, {
      type: QueryTypes.RAW,
    });
    const average = await ProductReview.findAll({
      where,
      attributes: [
        [
          sequelize.fn("ROUND", sequelize.fn("AVG", Sequelize.col("rating"))),
          "average",
        ],
      ],
    });
    const nextPage = offset + limit >= total ? null : page + 1;
    res.send({
      message: "Success",
      data: {
        reviews,
        groupRating: groupRating,
        averageRating: average,
      },
      total,
      nextPage,
    });
  } catch (error: any) {
    console.log(error.message);
    next(error);
  }
};
