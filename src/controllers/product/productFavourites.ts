import { Product } from "../../models/Product";
import { Request, Response, NextFunction } from "express";
import { BadRequestError } from "../../utils/api-errors";
import { getPaginated } from "../../utils/paginate";
import { ProductVariantValues } from "../../models/ProductVariantValue";
import { ProductImage } from "../../models/ProductImage";
import { Favourites } from "../../models/Favourites";
import { User } from "../../models/User";

export const CreateUpdate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const {
    productUniqueId,
    productVariantValueUniqueId,
    state,
    favouriteUniqueId,
  } = req.body;
  try {
    let product: any = null;
    let productVariant: any = null;
    const UserId = req.user.id;
    let fav = null;
    if (favouriteUniqueId) {
      fav = await Favourites.scope("withId").findOne({
        where: {
          uuid: favouriteUniqueId,
        },
      });
    }
    // if product is already in fav table then update it.
    if (fav) {
      fav.state = state;
      await fav.save();
    } else {
      product = await Product.scope("withId").findOne({
        where: {
          uuid: productUniqueId,
        },
        attributes: {
          include: ["id"],
        },
      });

      if (productVariantValueUniqueId && product.multipart) {
        productVariant = await ProductVariantValues.scope("withId").findOne({
          where: {
            uuid: productVariantValueUniqueId,
          },

          attributes: {
            include: ["id"],
          },
        });
      }
      if (!product) {
        res.status(403).send({
          message: "Product not found",
        });
        return;
      }

      let favouritesObject: {
        state: boolean;
        UserId: number;
        ProductId: number;
        ProductVariantValueId?: number;
      } = {
        state,
        UserId: UserId as number,
        ProductId: product.id,
      };
      if (productVariant && productVariant.id) {
        favouritesObject.ProductVariantValueId = productVariant.id;
      }

      fav = await Favourites.create(favouritesObject);
    }

    delete fav.dataValues.ProductVariantValueId;
    delete fav.dataValues.ProductId;
    delete fav.dataValues.id;
    delete fav.dataValues.UserId;

    res.send({
      message: "Success",
      data: fav,
    });
  } catch (error: any) {
    console.log(error.message);
    res.status(500).send({ message: error });
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
    res.status(500).send({ message: error });
  }
};

export const Get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { productUniqueId, productVariantValueUniqueId } = req.body;
    let productVariant = null;
    let product = await Product.scope("withId").findOne({
      where: {
        uuid: productUniqueId,
      },
    });
    if (productVariantValueUniqueId) {
      productVariant = await ProductVariantValues.scope("withId").findOne({
        where: {
          uuid: productVariantValueUniqueId,
        },
      });
    }

    let where: any = {
      ProductId: product?.id,
    };

    if (productVariant) {
      where.ProductVariantValueId = productVariant.id;
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
    res.status(500).send({ message: error });
  }
};

export const List = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { limit, offset } = getPaginated(req.query);
    // sortBy
    const sortBy = req.query.sortBy ? req.query.sortBy : "createdAt";
    const sortAs = req.query.sortAs ? (req.query.sortAs as string) : "DESC";

    const { productUniqueId, productVariantValueUniqueId } = req.query;

    let productVariant = null;
    if (productVariantValueUniqueId) {
      productVariant = await ProductVariantValues.scope("withId").findOne({
        where: {
          uuid: productVariantValueUniqueId as string,
        },
      });
    }
    const product = await Product.scope("withId").findOne({
      where: {
        uuid: productUniqueId as string,
      },
    });
    const where: {
      ProductId?: number;
      productVariantValueId?: number;
      UserId: number;
    } = {
      UserId: req.user.id as number,
    };
    if (product?.id) {
      where.ProductId = product.id;
    }
    if (productVariant && productVariant?.id) {
      where.productVariantValueId = productVariant.id;
    }

    const { count: total, rows: favs } = await Favourites.findAndCountAll({
      where,
      attributes: {
        exclude: ["ProductVariantValueId", "id", "ProductId"],
      },
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
      offset: offset,
      limit: limit,
      order: [[sortBy as string, sortAs]],
    });

    res.send({ message: "Success", data: favs, total });
  } catch (error: any) {
    console.log(error.message);
    res.status(500).send({ message: error });
  }
};
