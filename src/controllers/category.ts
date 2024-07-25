import { Category } from "../models/Category";
import { Request, Response, NextFunction } from "express";
import { BadRequestError } from "../utils/api-errors";
import { getValidUpdates } from "../utils/validate-updates";
import { UserType } from "../types/model-types";
import { getPaginated } from "../utils/paginate";

export const Create = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { parentUniqueId, title } = req.body;

    let parentCategory = null;
    let body = {
      title,
    } as any;
    // in case we want to add the category as sub-category of a already existing category(parent)
    if (parentUniqueId) {
      parentCategory = await Category.scope("withId").findOne({
        where: {
          uuid: parentUniqueId,
        },
        attributes: {
          include: ["id"],
        },
      });
      body.parentId = parentCategory?.id;
    }

    const category = await Category.create(body);
    const { data } = getData(category);
    res.status(201).send({ message: "Success", data });
  } catch (error: any) {
    console.log(error.message);
    res.status(500).send({ message: error });
  }
};
export const Update = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const validUpdates = ["title"];
    const validBody = getValidUpdates(validUpdates, req.body);
    const { uid } = req.params;
    // if we want to change the parent of the current category
    if (req.body.parentUniqueId) {
      const parentCategory = await Category.scope("withId").findOne({
        where: {
          uuid: req.body.parentUniqueId,
        },
        include: ["id"],
      });
      validBody.parentId = parentCategory?.id;
    }
    const result = await Category.update(
      { ...validBody },
      {
        where: {
          uuid: uid,
        },
      }
    );
    if (!result[0]) {
      const err = new BadRequestError("Could not update the category data");
      res.status(err.status).send({ message: err.message });
      return;
    }
    res.send({ message: "Success", data: result });
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
    const { uid } = req.params;

    const result = await Category.destroy({
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
export const List = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // const { limit, offset } = getPaginated(req.query);
    // sortBy
    const sortBy = req.query.sortBy ? req.query.sortBy : "createdAt";
    const sortAs = req.query.sortAs ? (req.query.sortAs as string) : "DESC";
    const showSubcategories =
      req.query.showSubcategories?.toString().toLocaleLowerCase().trim() ===
      "true"
        ? true
        : false;
    // level of deep subcategories
    const levels = req.query.levels ? req.query.levels : 1;
    const { include } = addIncludeLevels(levels as number, showSubcategories);
    const where = {};
    if (req.query.categoryUniqueId) {
      //@ts-ignore
      where["uuid"] = req.query.categoryUniqueId;
    }

    const { count: total, rows: categories } = await Category.findAndCountAll({
      where,
      attributes: {
        exclude: ["parentId", "id"],
      },
      include,
      // offset: offset,
      // limit: limit,
      order: [[sortBy as string, sortAs]],
    });

    res.send({ message: "Success", data: categories, total });
  } catch (error: any) {
    console.log(error.message);
    res.status(500).send({ message: error });
  }
};

const getData = (instance: any) => {
  delete instance.dataValues.id;
  delete instance.dataValues.parentId;
  return { data: instance };
};

const addIncludeLevels = (levels: number, addInclude: boolean) => {
  const includeArray: any = [];
  if (addInclude) {
    let currentArray = includeArray;
    const model = Category;

    for (let i = 0; i < levels; i++) {
      if (!currentArray.length || !currentArray[0].include) {
        currentArray[0] = {
          model,
          as: "subCategories",
          // required: false,
          include: [],
          attributes: { exclude: ["parentId", "id"] },
        };
      }
      currentArray = currentArray[0].include;
    }
  }
  return { include: includeArray };
};
