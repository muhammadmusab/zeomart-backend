import { Category } from "../models/Category";
import { Filter } from "../models/Filter";
import { Request, Response, NextFunction } from "express";
import { BadRequestError } from "../utils/api-errors";
import { getValidUpdates } from "../utils/validate-updates";
import { FilterCategory } from "../models/FilterCategory";
import { Op } from "sequelize";
import { Option } from "../models/Options";
import { FilterOption } from "../models/FilterOption";

export const Create = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { title, additionalTitle, options, type, categories } = req.body;

    let body = { title, type } as any;
    if (additionalTitle) {
      body.additionalTitle = additionalTitle;
    }

    const filter = await Filter.create(body);
    let filterId = filter.dataValues.id;

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
    });
    options.map(async (uuid: string) => {
      const option = await Option.scope("withId").findOne({
        where: {
          uuid: uuid,
        },
        attributes: ["id"],
      });
      if (option) {
        await FilterOption.create({
          OptionId: option.id,
          FilterId: filterId,
        });
      }
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
    const validUpdates = ["title", "additionalTitle", "type"];
    const validBody = getValidUpdates(validUpdates, req.body);
    const { uid } = req.params;

    const categories = req.body.categories;
    const options = req.body.options;
    const filter = await Filter.scope("withId").findOne({
      where: {
        uuid: uid,
      },
    });
    if (filter) {
      filter.title = validBody.title ?? filter?.title;
      filter.additionalTitle =
        validBody.additionalTitle ?? filter?.additionalTitle;
      filter.type = validBody.type ?? filter?.type;
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
      });
    }
    if (options.length) {
      // Delete all filtersCategory record based on filter id
      await FilterOption.destroy({
        where: {
          FilterId: filter?.id,
        },
      });

      // re-add all the record with new options coming from FE
      options.map(async (uuid: string) => {
        const category = await Category.scope("withId").findOne({
          where: {
            uuid: uuid,
          },
        });
        if (category && filter) {
          await FilterCategory.create({
            CategoryId: category.id,
            FilterId: filter.id,
          });
        }
      });
    }
    res.send({ message: "Success", data: filter });
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
    const filter = await Filter.scope("withId").findOne({
      where: {
        uuid: uid,
      },
    });
    await FilterCategory.destroy({
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
            exclude: ["id"],
          },
          through: {
            attributes: [],
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
    if (category) {
      let foundCategory = await Category.scope("withId").findOne({
        where: {
          uuid: category,
        },
        attributes: ["id"],
      });
      if (foundCategory) {
        categoryId = foundCategory.id;
      }
    }
    let where: { id?: number; title?: Record<string, any> } = {};

    let filters;
    let response;
    if (categoryId) {
      where["id"] = categoryId as number;
      response = await Category.findAndCountAll({
        where,
        attributes: {
          exclude: ["id", "parentId"],
        },
        include: [
          {
            model: Filter,

            as: "filter",
            attributes: {
              exclude: ["id"],
            },
            through: {
              attributes: [],
            },
            include: [
              {
                model: Option,
                as: "options",
              },
            ],
          },
        ],
      });
      filters = response.rows;
    } else {
      if (title) {
        where["title"] = {
          [Op.iLike]: `%${title}%`,
        };
      }
      response = await Filter.findAndCountAll({
        where,
        attributes: {
          exclude: ["id"],
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
              exclude: ["id"],
            },
            through: {
              attributes: [],
            },
          },
        ],
      });
      filters = response.rows;
    }

    res.send({ message: "Success", data: filters, total: response?.count });
  } catch (error: any) {
    next(error);
  }
};

const getData = (instance: any) => {
  delete instance.dataValues.id;
  delete instance.dataValues.CategoryId;
  return { data: instance };
};
