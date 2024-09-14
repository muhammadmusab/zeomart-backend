import * as yup from "yup";
import { mediaObject, urlValidation } from "./general";

export const createUpdateCategorySchema = yup.object({
  body: yup.object({
    parentUniqueId: yup.string().uuid(),
    title: yup.string().required(),
    slug: yup.string(),
    media: yup.array(mediaObject.nullable()),
  }),
});
export const deleteCategorySchema = yup.object({
  params: yup.object({
    uid: yup.string().uuid().required(),
  }),
});
export const getCategorySchema = yup.object({
  params: yup.object({
    uid: yup.string().required(),
  }),
});

export const listCategorySchema = yup.object({
  query: yup.object({
    // showSubcategories: yup.string().oneOf(["true", "false"]),
    // categoryUniqueId: yup.string().uuid(),
    filter:yup.string(),
    levels: yup.number(),
    sortBy: yup.string(),
    sortAs: yup.string().oneOf(["DESC", "ASC"]),
  }),
});
