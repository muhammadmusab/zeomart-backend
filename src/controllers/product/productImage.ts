import { Product } from "../../models/Product";
import { Request, Response, NextFunction } from "express";
import { BadRequestError } from "../../utils/api-errors";
import { getPaginated } from "../../utils/paginate";
import { ProductVariantValues } from "../../models/ProductVariantValue";
import { ProductImage } from "../../models/ProductImage";

export const Create = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { productUniqueId, productVariantValueUniqueId } = req.body;
  try {
    let product: any = null;
    let productVariant: any = null;

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

    if (!req.file || !req.file?.fieldname) {
      return res.status(403).send({
        message: "Please Upload Image File",
      });
    }

    let imageObject: {
      url: string;
      ProductId: number;
      ProductVariantValueId?: number;
    } = {
      url: `${process.env.API_URL}media/${req.file?.filename}`,
      ProductId: product.id,
    };
    if (productVariant && productVariant.id) {
      imageObject.ProductVariantValueId = productVariant.id;
    }

    let image = await ProductImage.create(imageObject);


    delete image.dataValues.ProductVariantValueId;
    delete image.dataValues.ProductId;
    delete image.dataValues.id;

    if (image) {
      res.send(image);
    } else {
      res.status(403).send({ message: "Error, Bad Request" });
    }
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
    const { productVariantValueUniqueId, productUniqueId } = req.query; // variant unique id if we want to narrow down image deleting to specific variant of the product and not all images of the product.
    const { uid } = req.params; // uid of the image to delete the product
    let productVariant = null;
    if (productVariantValueUniqueId) {
      productVariant = await ProductVariantValues.scope("withId").findOne({
        where: {
          uuid: productVariantValueUniqueId as string,
        },
        attributes: {
          include: ["id"],
        },
      });
    }

    let product = null;
    if (productUniqueId) {
      product = await Product.scope("withId").findOne({
        where: {
          uuid: productUniqueId as string,
        },
        attributes: {
          include: ["id"],
        },
      });
    }

    let where: {
      ProductId?: number;
      ProductVariantValueUniqueId?: number;
      uuid: string;
    } = {
      uuid: uid,
    };
    if (productVariant) {
      where["ProductVariantValueUniqueId"] = productVariant.id;
    }
    if (product) {
      where["ProductId"] = product?.id;
    }

    const result = await ProductImage.destroy({
      where,
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
    } = {};
    if (product?.id) {
      where.ProductId = product.id;
    }
    if (productVariant && productVariant?.id) {
      where.productVariantValueId = productVariant.id;
    }

    const { count: total, rows: images } = await ProductImage.findAndCountAll({
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
      ],
      offset: offset,
      limit: limit,
      order: [[sortBy as string, sortAs]],
    });

    res.send({ message: "Success", data: images, total });
  } catch (error: any) {
    console.log(error.message);
    res.status(500).send({ message: error });
  }
};
