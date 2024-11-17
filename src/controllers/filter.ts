import { Category } from "../models/Category";
import { Filter } from "../models/Filter";
import { Request, Response, NextFunction } from "express";
import { BadRequestError } from "../utils/api-errors";
import { getValidUpdates } from "../utils/validate-updates";
import { FilterCategory } from "../models/FilterCategory";
import { Op } from "sequelize";
import { Option } from "../models/Options";
import { Attribute } from "../models/Attribute";
import { FilterOption } from "../models/FilterOption";
import { sequelize } from "../config/db";
import { isValidUUID } from "../utils/is-valid-uuid";

export const Create = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { attribute, additionalTitle, ui, categories, options } =
      req.body;
    const filter = await sequelize.transaction(async (t) => {
      const _attribute = await Attribute.findOne({
        where: {
          uuid: attribute,
        },
      });
      let body = { AttributeId: _attribute?.id } as any;
      if (additionalTitle) {
        body.additionalTitle = additionalTitle;
      }
      if (ui) {
        body.ui = ui;
      }

      const filter = await Filter.create(body);
      let filterId = filter.dataValues.id;

      if (filterId && categories.length) {
        await Promise.all(
          categories.map(async (uuid: string) => {
            const category = await Category.scope("withId").findOne({
              where: {
                uuid: uuid,
              },
              attributes: ["id"],
            });
            if (category) {
              await FilterCategory.create({
                CategoryId: category.id,
                FilterId: filterId,
              });
            }
          })
        );
      }

      if (_attribute) {
        await Promise.all(
          options.map(async (uuid: string) => {
            const option = await Option.findOne({
              where: {
                uuid: uuid,
                AttributeId: _attribute?.id as number,
              },
              attributes: ["id"],
            });
            if (option) {
              await FilterOption.create({
                OptionId: option.id,
                FilterId: filterId,
              });
            }
          })
        );
      }
      return filter;
    });

    const { data } = getData(filter);
    res.status(201).send({ message: "Success", data });
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
    const validUpdates = ["additionalTitle", "attribute", "ui"];
    const validBody = getValidUpdates(validUpdates, req.body);
    const { uid } = req.params;

    const categories = req.body.categories;
    const options = req.body.options;
    const result = await sequelize.transaction(async (t) => {
      const filter = await Filter.findOne({
        where: {
          uuid: uid,
        },
      });
      const _attribute = await Attribute.findOne({
        where: {
          uuid: validBody.attribute,
        },
        attributes: ["id"],
      });

      if (filter) {
        filter.additionalTitle =
          validBody.additionalTitle ?? filter?.additionalTitle;
        filter.ui = validBody.ui ?? filter?.ui;
        filter.AttributeId =
          validBody.attribute && _attribute
            ? (_attribute.id as number)
            : filter.AttributeId;
        await filter.save();
        await filter.reload();
      }

      if (categories.length) {
        // Delete all filtersCategory record based on filter id
        await FilterCategory.destroy({
          where: {
            FilterId: filter?.id,
          },
        });

        // re-add all the record with new categories coming from FE
        await Promise.all(
          categories.map(async (categoryUniqueId: string) => {
            const category = await Category.scope("withId").findOne({
              where: {
                uuid: categoryUniqueId,
              },
            });
            if (category && filter) {
              await FilterCategory.create({
                CategoryId: category.id,
                FilterId: filter.id,
              });
            }
          })
        );
      }
      if (options.length) {
        // Delete all FilterOption record based on filter id
        await FilterOption.destroy({
          where: {
            FilterId: filter?.id,
          },
        });

        // re-add all the record with new options coming from FE
        await Promise.all(
          options.map(async (uuid: string) => {
            const option = await Option.findOne({
              where: {
                uuid: uuid,
                AttributeId: _attribute?.id as number,
              },
            });
            if (option && filter) {
              await FilterOption.create({
                OptionId: option.id,
                FilterId: filter.id,
              });
            }
          })
        );
      }
    });

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
    const { uid } = req.params;
    const filter = await Filter.findOne({
      where: {
        uuid: uid,
      },
    });
    await FilterCategory.destroy({
      where: {
        FilterId: filter?.id,
      },
    });
    await FilterOption.destroy({
      where: {
        FilterId: filter?.id,
      },
    });
    await filter?.destroy();
    res.send({ message: "Success" });
  } catch (error) {
    next(error);
  }
};
export const Get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { uid } = req.params;
    const filter = await Filter.findOne({
      where: {
        uuid: uid,
      },
      attributes: {
        exclude: ["id", "AttributeId"],
      },
      include: [
        {
          model: Category,
          as: "categories",
          attributes: {
            exclude: ["id", "parentId"],
          },
          through: {
            attributes: [],
          },
        },
        {
          model: Option,
          as: "options",
          attributes: {
            exclude: ["id", "AttributeId"],
          },
          through: {
            attributes: [],
          },
        },
        {
          model: Attribute,
          as: "attribute",
          attributes: {
            exclude: ["id"],
          },
        },
      ],
    });

    res.send({ message: "Success", data: filter });
  } catch (error) {
    next(error);
  }
};
export const List = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { category } = req.filter as any;
    // @ts-expect-error
    const { title } = req.search as any;
    let categoryId;
    let categoryWhere;
    if (isValidUUID(category)) {
      categoryWhere = {
        uuid: category as string,
      };
    } else {
      categoryWhere = {
        slug: category as string,
      };
    }

    if (category) {
      let foundCategory = await Category.scope("withId").findOne({
        where: categoryWhere,
        attributes: ["id"],
      });
      if (foundCategory) {
        categoryId = foundCategory.id;
      }
    }
    let where: { id?: number; title?: Record<string, any> } = {};

    let filters;

    if (title) {
      where["title"] = {
        [Op.iLike]: `%${title}%`,
      };
    }
    const include:any = [
      {
        model: Attribute,
        where,
        as: "attribute",
        attributes: {
          exclude: ["id"],
        },
      },
      {
        model: Option,
        as: "options",
        attributes: {
          exclude: ["id", "AttributeId"],
        },
        through: {
          attributes: [],
        },
      },
    ];
    if (categoryId) {
      include.push({
        model: Category,
        where: {
          [Op.or]: [
            {
              id: categoryId,
            },
            { slug: "general" },
          ],
        },

        required: true,
        as: "categories",
        attributes: {
          exclude: ["id", "parentId"],
        },
        through: {
          attributes: [],
        },
      });
    }
    let { count, rows } = await Filter.findAndCountAll({
      attributes: {
        exclude: ["id", "AttributeId"],
      },
      include: include,
    });
    filters = rows;

    res.send({ message: "Success", data: filters, total: count });
  } catch (error: any) {
    next(error);
  }
};

const getData = (instance: any) => {
  delete instance.dataValues.id;
  delete instance.dataValues.CategoryId;
  return { data: instance };
};
