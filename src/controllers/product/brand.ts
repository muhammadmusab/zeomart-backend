import { Request, Response, NextFunction } from "express";
import { BadRequestError } from "../../utils/api-errors";
import { Product } from "../../models/Product";
import { Brand } from "../../models/Brand";

export const Create = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { title }: { title: string; } = req.body;
    const brand = await Brand.create({
      title
    });

    const { data } = getData(brand);
    res.status(201).send({
      message: "Success",
      data,
    });
  } catch (error: any) {
    next(error);
  }
};
export const Update = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { title }: { title: string } = req.body;
    const { uid } = req.params; 

    const brand = await Brand.findOne({
      where: {
        uuid: uid, 
      },
    });

    if (!brand) {
      return res.status(404).send({ message: "Brand not found" });
    }

    brand.title = title;
    await brand.save();
    await brand.reload();

    res.send({ message: "Success", data: brand });
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

    const result = await Brand.destroy({
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
    const { uid } = req.params; 

    const brand = await Brand.scope("withId").findOne({
      where: {
        uuid: uid,
      },
    });

    if (!brand) {
      res.status(404).send({ message: "Brand not found" });
    }
  } catch (error) {
    next(error);
  }
};
export const List = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await Brand.findAll({});

    res.send({ message: "Success", data });
  } catch (error: any) {
    next(error);
  }
};

const getData = (instance: any) => {
  delete instance.dataValues.id;

  return { data: instance };
};
