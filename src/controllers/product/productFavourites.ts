import { Product } from "../../models/Product";
import { Request, Response, NextFunction } from "express";
import { BadRequestError } from "../../utils/api-errors";
import { getPaginated } from "../../utils/paginate";
import { Favourites } from "../../models/Favourites";
import { User } from "../../models/User";
import { ProductSkus } from "../../models/ProductSku";
import { sequelize } from "../../config/db";
import { QueryTypes } from "sequelize";

export const CreateUpdate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { product, productSku, state } = req.body;
  console.log(req.body);
  try {
    let _product: any = null;
    let _productSku: any = null;
    let _favourite = null;
    const user = req.user.User?.uuid;

    const _user = await User.scope("withId").findOne({
      where: {
        uuid: user,
      },
    });
    const where: { ProductId?: number; ProductSkuId?: number; UserId: number } =
      {
        UserId: _user?.id as number,
      };
    if (product) {
      _product = await Product.scope("withId").findOne({
        where: {
          uuid: product,
        },
        attributes: {
          include: ["id"],
        },
      });
    }
    if (productSku) {
      _productSku = await ProductSkus.findOne({
        where: {
          uuid: productSku,
        },

        attributes: {
          include: ["id"],
        },
      });
    }

    if (_productSku) {
      where["ProductSkuId"] = _productSku.id as number;
    } else {
      where["ProductId"] = _product.id;
    }
    console.log("where--------", where);
    _favourite = await Favourites.scope("withId").findOne({
      where,
    });

    // if product is already in fav table then update it.
    if (_favourite) {
      _favourite.state = state;
      await _favourite.save();
    } else {
      let favouritesObject: {
        state: boolean;
        UserId: number;
        ProductId?: number;
        ProductSkuId?: number;
      } = {
        state,
        UserId: _user?.id as number,
      };
      if (_productSku && _productSku.id) {
        favouritesObject.ProductSkuId = _productSku.id;
      } else {
        favouritesObject.ProductId = _product.id;
      }

      _favourite = await Favourites.create(favouritesObject);
      delete _favourite.dataValues.ProductSkuId;
      delete _favourite.dataValues.ProductId;
      delete _favourite.dataValues.id;
      delete _favourite.dataValues.UserId;
    }
    console.log("fav------", _favourite);
    res.send({
      message: "Success",
      data: _favourite,
    });
  } catch (error: any) {
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

    const result = await Favourites.destroy({
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

export const Get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { product, productSku } = req.body;
    let _productSku = null;
    let _product = await Product.scope("withId").findOne({
      where: {
        uuid: product,
      },
    });
    if (productSku) {
      _productSku = await ProductSkus.findOne({
        where: {
          uuid: productSku,
        },
      });
    }

    let where: any = {
      ProductId: _product?.id,
    };

    if (_productSku) {
      where.ProductSkuId = _productSku.id;
    }
    const data = await Favourites.scope("withId").findOne({
      where,
      include: [
        {
          model: Product,
          attributes: {
            exclude: ["id", "ProductId"],
          },
        },
        {
          model: User,
          attributes: {
            exclude: ["id"],
          },
        },
      ],
    });

    res.send({
      message: "Success",
      data,
    });
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

    console.log(req.user.User?.uuid);

    const _user = await User.scope("withId").findOne({
      where: {
        uuid: req.user.User?.uuid,
      },
    });
    
    const Querywhere = `AND f."UserId"=${_user?.id} AND f."state"='true'`;
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
                 json_build_object('uuid',ps."uuid",'sku',ps."sku",'oldPrice',ps."oldPrice",'currentPrice',ps."currentPrice",'quantity',ps."quantity",'isDefault',ps."isDefault") as "sku",
                 jsonb_build_object('uuid',f."uuid",'state',f."state") as "wishlist"
                FROM public."Products" as p
                   LEFT  JOIN "Media" as pm ON pm."mediaableId" = p."id" AND pm."mediaableType"='Product'
                   LEFT  JOIN "ProductSkus" as ps ON ps."ProductId" = p."id"
                   LEFT  JOIN "Favourites" as f ON f."ProductId" = p."id" OR (f."ProductSkuId" IS NOT NULL AND f."ProductSkuId" = ps."id")
                   LEFT  JOIN "SkuVariations" as sv ON sv."ProductId" = p."id"
                   LEFT  JOIN "ProductVariantValues" as pvv ON sv."ProductVariantValueId" = pvv."id"
                   LEFT  JOIN "Options" as o ON pvv."OptionId" = o."id"
                   LEFT  JOIN "Attributes" as a ON pvv."AttributeId" = a."id"
                   LEFT  JOIN "ProductReview" as pr ON pr."ProductId" = p."id"
                WHERE (ps."isDefault" = TRUE OR ps."id" IS NULL) ${Querywhere}
                GROUP BY p."uuid",p."hasVariants",p."title",p."status",p."slug",p."overview",p."highlights",p."sku",p."currentPrice",p."oldPrice",p."quantity",p."features",p."sold",p."createdAt",ps."uuid",ps."sku",ps."oldPrice",ps."currentPrice",ps."quantity",ps."uuid",ps."isDefault",f."uuid",f."state"
                LIMIT ${limit} OFFSET ${offset}
                ;
                `;

    const [results] = await sequelize.query(query, {
      type: QueryTypes.RAW,
    });
    const totalQuery = `SELECT DISTINCT "total" 
    FROM (
        SELECT 
            COUNT(*) OVER() as "total",p."uuid",p."title",p."status",p."slug",p."overview",p."highlights",p."sku",p."currentPrice",p."oldPrice",p."quantity",p."features",p."sold",p."createdAt",
            json_build_object('sku', ps."sku", 'oldPrice', ps."oldPrice", 'currentPrice', ps."currentPrice", 'quantity', ps."quantity", 'isDefault', ps."isDefault") as "sku"
        FROM public."Products" as p
        LEFT JOIN "ProductSkus" as ps ON ps."ProductId" = p."id"
        LEFT JOIN "SkuVariations" as sv ON sv."ProductId" = p."id"
        LEFT  JOIN "Favourites" as f ON f."ProductId" = p."id" OR (f."ProductSkuId" IS NOT NULL AND f."ProductSkuId" = ps."id")
        LEFT JOIN "ProductVariantValues" as pvv ON sv."ProductVariantValueId" = pvv."id"
        LEFT JOIN "ProductReview" as pr ON pr."ProductId" = p."id"
        WHERE (ps."isDefault" = TRUE OR ps."id" IS NULL) ${Querywhere}
        GROUP BY 
            p."uuid", p."title", p."status", p."slug", p."overview", p."highlights", 
            p."sku", p."currentPrice", p."oldPrice", p."quantity", p."features", p."sold", 
            p."createdAt", ps."uuid", ps."sku", ps."oldPrice", 
            ps."currentPrice", ps."quantity", ps."uuid", ps."isDefault",f."uuid",f."state"
    ) as "totalCount";`;
   
   
    const [totalResult] = await sequelize.query(totalQuery, {
      type: QueryTypes.RAW,
    });

    const total =
    //@ts-expect-error
    totalResult.length && totalResult[0].total ? totalResult[0].total : 0;
    const nextPage = offset + limit >= total ? null : page + 1;
    res.send({ message: "Success", data: results, total,nextPage });
  } catch (error: any) {
    next(error);
  }
};
