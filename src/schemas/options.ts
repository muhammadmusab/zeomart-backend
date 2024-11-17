import * as yup from "yup";

export const createOptionsSchema = yup.object({
  body: yup
    .object({
      value: yup.string().required(),
      
    })
    .required(),
});
export const updateOptionsSchema = yup.object({
  body: yup
    .object({
        value: yup.string(),
    })
    .required(),
  params: yup.object({
    uid: yup.string().uuid().required(), //uuid of the Options
  }),
});

export const deleteOptionsSchema = yup.object({
  params: yup.object({
    uid: yup.string().uuid().required(), //uuid of the Options
  }),
});
export const getOptionsSchema = yup.object({
  params: yup.object({
    uid: yup.string().uuid().required(),
  }),
});
export const listOptionsSchema = yup.object({
  search: yup.string(),
  filter: yup.string(),
});