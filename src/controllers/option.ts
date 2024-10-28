import { Request, Response, NextFunction } from "express";
import { BadRequestError } from "../utils/api-errors";
import { Attribute } from "../models/Attribute";
import { Op } from "sequelize";
import { Option } from "../models/Options";

export const Delete = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { uid } = req.params; // uid of the attribute which will delete its value along with it.

    const option = await Option.findOne({
      where: {
        uuid: uid,
      },
    });
    if (option) {
      await option.destroy();
    } else {
      const err = new BadRequestError("Option not found");
      return res.status(err.status).send({ message: err.message });
    }

    res.send({ message: "Success" });
  } catch (error) {
    next(error);
  }
};

export const List = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // @ts-expect-error
    const { title } = req.search;
    // @ts-expect-error
    const { attribute } = req.filter;

    const _attribute = await Attribute.findOne({
      where: {
        uuid: attribute,
      },
    });

    let where: { AttributeId?: number; value?: any } = {};
    if (_attribute) {
      where["AttributeId"] = _attribute.id;
    }
    if (title) {
      where["value"] = {
        [Op.iLike]: `%${title}%`,
      };
    }
    const data = await Option.findAll({
      where,
      attributes: {
        exclude: ["id", "AttributeId"],
      },
    });

    res.send({ message: "Success", data });
  } catch (error: any) {
    next(error);
  }
};
