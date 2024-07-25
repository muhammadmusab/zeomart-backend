import { Request, Response, NextFunction } from "express";
import { BadRequestError } from "../../utils/api-errors";
import { ProductVariantType } from "../../models/ProductVariantType";
import { Product } from "../../models/Product";
import { ProductVariantValues } from "../../models/ProductVariantValue";
import { ProductTypes } from "../../models/ProductType";

export const Create = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let { productTypeUniqueId, elementType, productUniqueId } = req.body;

    const product = await Product.scope('withId').findOne({
      where: {
        uuid: productUniqueId,
      },
    });
    const productType = await ProductTypes.scope('withId').findOne({
      where: {
        uuid: productTypeUniqueId,
      },
    });
    const productVariantType = await ProductVariantType.create({
      ProductTypeId: productType?.id as number,
      elementType,
      ProductId: product?.id,
    });
    // delete productVariantType.ProductTypeId;
    delete productVariantType.dataValues.ProductId;
    delete productVariantType.dataValues.id;
    delete productVariantType.dataValues.ProductTypeId;
    res.status(201).send({
      message: "Success",
      data: productVariantType,
    });
  } catch (error: any) {
    res.status(500).send({ message: error });
  }
};
export const Update = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { productTypeUniqueId, elementType } = req.body;

    const { uid } = req.params; // uid of the ProductVariantType
    let productType=null
      if(productTypeUniqueId){
        productType = await ProductTypes.findOne({
          where: {
            uuid: productTypeUniqueId,
          },
        });
      }

    const updateValues: { ProductTypeId?: any; elementType?: any } = {};
    if(productType?.id){
      updateValues.ProductTypeId=productType.id;
    }
    if(elementType){
      updateValues.elementType = elementType;
    }
   
    
     
    

    const productVariant = await ProductVariantType.update(updateValues, {
      where: {
        uuid: uid, // uid of productVariantType
      },
    });
    if (!productVariant[0]) {
      const err = new BadRequestError(
        "Could not update the product variant type"
      );
      res.status(err.status).send({ message: err.message });
      return;
    }

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
    const { uid } = req.params; // uid of the product variant type which will delete its value along with it.

    const result = await ProductVariantType.destroy({
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
    const { uid } = req.params; // uuid of the product variant NOT the variant values

    const productvariantType = await ProductVariantType.scope("withId").findOne(
      {
        where: {
          uuid: uid,
        },
      }
    );

    if (productvariantType?.uuid && productvariantType.uuid) {
      res.send({
        message: "Success",
        data: {
          type: productvariantType,
        },
      });
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
    const { uid } = req.params;
    const product = await Product.scope('withId').findOne({
      where: {
        uuid: uid,
      },
    });
    const data = await ProductVariantType.findAll({
      where: {
        ProductId: product?.id,
      },
      attributes:['uuid','elementType'],
      include:[{
        model:ProductTypes,
        attributes:{
          exclude:['createdAt','updatedAt','id']
        }
      }]
    });

    res.send({ message: "Success", data });
  } catch (error: any) {
    console.log(error.message);
    res.status(500).send({ message: error });
  }
};
