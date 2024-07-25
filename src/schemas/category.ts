import * as yup from 'yup'

export const createUpdateCategorySchema = yup.object({
  body: yup.object({
    parentUniqueId: yup.string().uuid(),
    title: yup.string().required(),
  }).required(),
});
export const deleteCategorySchema = yup.object({
  params: yup.object({
    uid: yup.string().uuid().required(),
  }),
});

export const listCategorySchema = yup.object({
  query: yup.object({
    showSubcategories:yup.string().oneOf(['true','false']),
    categoryUniqueId: yup.string().uuid(),
    levels: yup.number(),
    sortBy: yup.string(),
    sortAs: yup.string().oneOf(["DESC", "ASC"]),
  }),
});
