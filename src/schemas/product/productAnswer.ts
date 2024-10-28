import * as yup from "yup";

export const createProductAnswerSchema = yup.object({
  body: yup
    .object({
      product: yup.string().uuid().required(),
      answer: yup.string().uuid().required(),
    })
    .required(),
});
export const updateProductAnswerSchema = yup.object({
  body: yup
    .object({
      answer: yup.string(),
    })
    .required(),
  params: yup.object({
    uid: yup.string().uuid().required(), //uuid of the Answer
  }),
});

export const deleteProductAnswerSchema = yup.object({
  params: yup.object({
    uid: yup.string().uuid().required(), //uuid of the Answer
  }),
});
export const getProductAnswerSchema = yup.object({
  params: yup.object({
    uid: yup.string().uuid().required(),
  }),
});
export const listProductAnswerSchema = yup.object({
  filter: yup.string(),
});
