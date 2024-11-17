import * as yup from "yup";

export const createProductQuestionSchema = yup.object({
  body: yup
    .object({
      product: yup.string().uuid().required(),
      question: yup.string().required(),//uuid
    })
    .required(),
});
export const createProductAnswerSchema = yup.object({
  body: yup
    .object({
      question: yup.string().uuid().required(),
      answer: yup.string().required(),//uuid
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
    uid: yup.string().uuid().required(), //uuid of the question
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
