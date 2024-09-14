import { Category } from "../models/Category";
import { Request, Response, NextFunction } from "express";
import { BadRequestError } from "../utils/api-errors";
import { getValidUpdates } from "../utils/validate-updates";
import { UserType } from "../types/model-types";
import { getPaginated } from "../utils/paginate";
import { Model, Op } from "sequelize";
import { isValidUUID } from "../utils/is-valid-uuid";
import { Media } from "../models/Media";

export const Create = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { parent, title, media } = req.body;

    let parentCategory = null;
    let body = {
      title,
      slug: title
        .replace(" ", "_")
        .replace("-", "_")
        .replace(",", "_")
        .toLocaleLowerCase()
        .trim(),
    } as any;
    // in case we want to add the category as sub-category of a already existing category(parent)
    if (parent) {
      parentCategory = await Category.scope("withId").findOne({
        where: {
          uuid: parent,
        },
        attributes: {
          include: ["id"],
        },
      });
      body.parentId = parentCategory?.id;
    }
    let category = await Category.scope("withId").findOne({
      where: {
        title,
      },
    });
    if (category) {
      const err = new BadRequestError("Category already exists");
      return next(err);
    }
    category = await Category.create(body);
    let mediaObject;

    if (media?.length) {
      const tempMedia = media[0];

      mediaObject = await Media.create({
        url: tempMedia?.url,
        width: tempMedia?.width,
        height: tempMedia?.height,
        size: tempMedia?.size,
        mime: tempMedia?.mime,
        name: tempMedia?.name,
        mediaableType: "Category",
        mediaableId: category?.id,
      });
    }

    const { data } = getData(category);
    const { data: mediaData } = getData(mediaObject, "media");
    res.status(201).send({
      message: "Success",
      data: { ...data, media: mediaData },
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
    const validUpdates = ["title", "media"];
    const validBody = getValidUpdates(validUpdates, req.body);
    const { uid } = req.params;

    // if we want to change the parent of the current category
    if (req.body.parent) {
      const parentCategory = await Category.scope("withId").findOne({
        where: {
          uuid: req.body.parent,
        },
        attributes: ["id"],
      });

      validBody.parentId = parentCategory?.id;
    }

    const category = await Category.scope("withId").findOne({
      where: {
        uuid: uid,
      },
    });
    let mediaObject = await Media.scope("withId").findOne({
      where: {
        mediaableId: category?.id,
      },
    });
    if (category) {
      if (!validBody.media?.length) {
        await mediaObject?.destroy();
      } else {
        let tempMedia = validBody.media[0];
        if (!mediaObject) {
          mediaObject = await Media.create({
            url: tempMedia?.url,
            width: tempMedia?.width,
            height: tempMedia?.height,
            size: tempMedia?.size,
            mime: tempMedia?.mime,
            name: tempMedia?.name,
            mediaableType: "Category",
            mediaableId: category?.id,
          });
        } else {
          mediaObject.url = tempMedia.url;
          mediaObject.width = tempMedia.width ?? null;
          mediaObject.height = tempMedia.height ?? null;
          mediaObject.size = tempMedia.size;
          mediaObject.mime = tempMedia.mime;
          mediaObject.name = tempMedia.name;
          await mediaObject.save();
        }
      }
      if (validBody.parentId) {
        if (validBody.parentId === category.id) {
          const err = new BadRequestError(
            "Category can not be parent of itself"
          );
          return next(err);
        }
        category.parentId = validBody.parentId;
      }
      category.title = validBody.title;
      category.slug = validBody.title
        ? validBody.title
            .replace(" ", "_")
            .replace("-", "_")
            .replace(",", "_")
            .toLocaleLowerCase()
            .trim()
        : category.slug;
      await category.save();
      await category.reload();
      delete category.dataValues.id;
      delete category.dataValues.parentId;
    }

    res.send({ message: "Success", data: category });
  } catch (error) {
    next(error);
  }
};
export const Get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { uid } = req.params;
    const isValid = isValidUUID(uid);
    const where: any = {};
    if (isValid) {
      where["uuid"] = uid;
    } else {
      where["slug"] = uid;
    }
    const category = await Category.findOne({
      where,
      include: [
        {
          model: Media,
          as: "media",
          attributes: { exclude: ["ProductId", "id", "CategoryId"] },
        },
        {
          model: Category,
          as: "parent",
          attributes: { exclude: ["parentId", "id"] },
          include: [
            {
              model: Media,
              as: "media",
              attributes: { exclude: ["ProductId", "id", "CategoryId"] },
            },
          ],
        },
      ],
    });

    res.send({ message: "Success", data: category });
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
    next(error);
  }
};
export const List = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // @ts-expect-error
    const { title } = req?.search ?? {};
    const { limit, offset } = getPaginated(req.query);
    // sortBy
    const sortBy = req.query.sortBy ? req.query.sortBy : "createdAt";
    const sortAs = req.query.sortAs ? (req.query.sortAs as string) : "DESC";
    const showChildren =
      req.query.showSubcategories?.toString().toLocaleLowerCase().trim() ===
      "true"
        ? true
        : false;
    // level of deep subcategories
    const levels = req.query.levels ? req.query.levels : 1;
    const { include } = addIncludeLevels(levels as number, showChildren);
    const where: { uuid?: string; title?: any } = {};
    if (title) {
      where["title"] = {
        [Op.iLike]: `%${title}%`,
      };
    }
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
      offset: offset,
      limit: limit,
      order: [[sortBy as string, sortAs]],
    });

    res.send({ message: "Success", data: categories, total });
  } catch (error: any) {
    next(error);
  }
};

const getData = (instance: any, type: "category" | "media" = "category") => {
  delete instance.dataValues.id;
  if (type == "category") {
    delete instance.dataValues.parentId;
  }
  return { data: instance };
};

const addIncludeLevels = (levels: number, showChildren: boolean) => {
  const includeArray: any = [];
  // if (showChildren) {
  let currentArray = includeArray;
  const model = Category;

  for (let i = 0; i < levels; i++) {
    if (!currentArray.length || !currentArray[0].include) {
      currentArray[0] = {
        model,
        as: showChildren ? "subCategories" : "parent",
        attributes: { exclude: ["parentId", "id"] },
        include: [
          {
            model: Media,
            as: "media",
            attributes: { exclude: ["ProductId", "id", "CategoryId"] },
          },
        ],
      };
      currentArray[1] = {
        model: Media,
        as: "media",
        attributes: { exclude: ["ProductId", "id", "CategoryId"] },
      };
    }
    currentArray = currentArray[0].include;
  }
  // }
  return { include: includeArray };
};
