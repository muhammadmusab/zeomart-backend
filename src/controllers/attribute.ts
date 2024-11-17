import { Request, Response, NextFunction } from "express";
import { BadRequestError } from "../utils/api-errors";
import { Attribute } from "../models/Attribute";
import { Op } from "sequelize";
import { Option } from "../models/Options";
import { sequelize } from "../config/db";
export const Create = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      title,
      type,
      options,
    }: { title: string; type: string | null; options: { value: string }[] } =
      req.body;
    await sequelize.transaction(async (t) => {
      const attributePayload: any = {
        title,
      };
      if (type) {
        attributePayload.type = type;
      }

      const attribute = await Attribute.create(attributePayload);
      await Promise.all(
        options.map(async (options) => {
          await Option.create({
            AttributeId: attribute.dataValues.id as number,
            value: options.value,
          });
        })
      );

      delete attribute.dataValues.id;

      res.status(201).send({
        message: "Success",
        data: attribute,
      });
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
    const {
      title,
      type,
      options,
    }: {
      title: string;
      type?: string;
      options: { value: string; uid?: string }[];
    } = req.body;

    const { uid } = req.params; // uid of the Attribute
    await sequelize.transaction(async (t) => {
      const _attribute = await Attribute.findOne({
        where: {
          uuid: uid,
        },
      });
      let AttributeId: any = null;

      if (_attribute) {
        _attribute.title = title;
        if (type) {
          _attribute.type = type;
        }
        AttributeId = _attribute?.id as number;
        if (AttributeId) {
          await Promise.all(
            options.map(async (option) => {
              if (option.uid) {
                await Option.update(
                  {
                    value: option.value,
                  },
                  {
                    where: {
                      uuid: option.uid,
                      AttributeId: AttributeId as number,
                    },
                  }
                );
              } else {
                await Option.create({
                  value: option.value,
                  AttributeId: AttributeId as number,
                });
              }
            })
          );
        }
        _attribute?.save();
        _attribute?.reload();
      }
    });

    res.send({
      message: "Success",
    });
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
    const { uid } = req.params; // uid of the attribute which will delete its value along with it.
    await sequelize.transaction(async (t) => {
      const _attribute = await Attribute.findOne({
        where: {
          uuid: uid,
        },
      });

      await Option.destroy({
        where: {
          AttributeId: _attribute?.id,
        },
      });

      await _attribute?.destroy();
    });

    res.send({ message: "Success" });
  } catch (error) {
    next(error);
  }
};

export const Get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { uid } = req.params;

    const attribute = await Attribute.findOne({
      where: {
        uuid: uid,
      },
      attributes: {
        exclude: ["id"],
      },
      include: [
        {
          model: Option,
          as: "options",
          attributes: {
            exclude: ["id", "AttributeId"],
          },
        },
      ],
    });

    if (attribute) {
      res.send({
        message: "Success",
        data: attribute,
      });
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
    // @ts-expect-error
    const { title } = req.search;
    let where = {};
    if (title) {
      where = {
        title: {
          [Op.iLike]: `%${title}%`,
        },
      };
    }
    const data = await Attribute.findAll({
      where,
      attributes: {
        exclude: ["id"],
      },
      include: [
        {
          model: Option,
          as: "options",
          attributes: {
            exclude: ["id", "AttributeId"],
          },
        },
      ],
    });

    res.send({ message: "Success", data });
  } catch (error: any) {
    next(error);
  }
};
