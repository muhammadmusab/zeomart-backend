import { Category } from "../models/Category";
import { Filter } from "../models/Filter";
import { Request, Response, NextFunction } from "express";
import { BadRequestError } from "../utils/api-errors";
import { getValidUpdates } from "../utils/validate-updates";

export const Create = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { title, additionalTitle, options, type, categoryUniqueId } =
      req.body;
    const category = await Category.scope("withId").findOne({
      where: {
        uuid: categoryUniqueId,
      },
    });
    console.log("category---", category);
    let body = { title, options, type } as any;
    if (additionalTitle) {
      body.additionalTitle = additionalTitle;
    }
    body.CategoryId = category?.id;
    console.log("body---", body);

    const filter = await Filter.create(body);
    console.log("after-filter-create", filter);
    const { data } = getData(filter);
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
    const validUpdates = ["title", "additionalTitle", "options", "type"];
    const validBody = getValidUpdates(validUpdates, req.body);
    const { uid } = req.params;
    // if we want to change the parent of the current category
    if (req.body.categoryUniqueId) {
      const category = await Category.scope("withId").findOne({
        where: {
          uuid: req.body.categoryUniqueId,
        },
        include: ["id"],
      });
      validBody.categoryId = category?.id;
    }
    const result = await Filter.update(
      { ...validBody },
      {
        where: {
          uuid: uid,
        },
      }
    );
    if (!result[0]) {
      const err = new BadRequestError("Could not update the filter data");
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

    const result = await Filter.destroy({
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
    const category = await Category.scope("withId").findOne({
      where: {
        uuid: req.query.categoryUniqueId as string,
      },
      attributes: { include: ["id"] },
    });

    const filters = await Filter.findAll({
      where: {
        CategoryId: category?.id,
      },
      attributes: {
        exclude: ["CategoryId", "id"],
      },
      include: {
        model: Category,
      },
    });

    res.send({ message: "Success", data: filters });
  } catch (error: any) {
    console.log(error.message);
    res.status(500).send({ message: error });
  }
};

const getData = (instance: any) => {
  delete instance.dataValues.id;
  delete instance.dataValues.CategoryId;
  return { data: instance };
};
