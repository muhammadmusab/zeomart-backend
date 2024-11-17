import * as yup from "yup";

export const createFilterSchema = yup.object({
  body: yup.object({
    type: yup.string().required(),
    additionalTitle: yup.string(),
    attribute: yup.string().uuid().required(),
    categories: yup.array(yup.string().uuid().required()),
    options: yup.array(yup.string().uuid().required()).required(),
  }),
});
export const updateFilterSchema = yup.object({
  body: yup.object({
    attribute: yup.string().uuid().required(),
    type: yup.string(),
    additionalTitle: yup.string(),
    categories: yup.array(yup.string().uuid().required()),
    options: yup.array(yup.string().uuid().required()),
  }),
  params: yup.object({
    uid: yup.string().uuid().required(),
  }),
});

export const deleteFilterSchema = yup.object({
  params: yup.object({
    uid: yup.string().uuid().required(),
  }),
});
export const getFilterSchema = yup.object({
  params: yup.object({
    uid: yup.string().uuid().required(),
  }),
});

export const listFilterSchema = yup.object({
  query: yup.object({
    filter: yup.string().uuid().required(),
  }),
});
