import * as yup from "yup";

export const createProductQuestionSchema = yup.object({
  body: yup
    .object({
      product: yup.string().uuid().required(),
      question: yup.string().uuid().required(),//uuid
    })
    .required(),
});
export const updateProductQuestionSchema = yup.object({
  body: yup
    .object({
      question: yup.string(),
    })
    .required(),
  params: yup.object({
    uid: yup.string().uuid().required(), //uuid of the Coupon
  }),
});

export const deleteProductQuestionSchema = yup.object({
  params: yup.object({
    uid: yup.string().uuid().required(), //uuid of the Coupon
  }),
});
export const getProductQuestionSchema = yup.object({
  params: yup.object({
    uid: yup.string().uuid().required(),
  }),
});
export const listProductQuestionSchema = yup.object({
  filter: yup.string(),
});
