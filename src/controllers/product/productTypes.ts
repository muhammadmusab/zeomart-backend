import { Request, Response, NextFunction } from "express";
import { BadRequestError } from "../../utils/api-errors";
import { ProductTypes } from "../../models/ProductType";


export const Create = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { type }:{type:string} = req.body;

    const productType = await ProductTypes.create({
      type:type.replace(' ','_').replace('-','_').replace(',','_').toLocaleLowerCase().trim(),
    });

    delete productType.id;
    res.status(201).send({
      message: "Success",
      data: productType,
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
    const { type }:{type:string} = req.body;
    const { uid } = req.params; // uid of the ProductTypes

    const productVariant = await ProductTypes.update(
      {
        type:type.replace(' ','_').replace('-','_').replace(',','_').toLocaleLowerCase().trim(),
      },
      {
        where: {
          uuid: uid, // uid of productVariant
        },
      }
    );
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

    const result = await ProductTypes.destroy({
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

    const productvariantType = await ProductTypes.scope("withId").findOne(
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
          type: productvariantType?.type,
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
    const data = await ProductTypes.findAll();

    res.send({ message: "Success", data });
  } catch (error: any) {
    console.log(error.message);
    res.status(500).send({ message: error });
  }
};