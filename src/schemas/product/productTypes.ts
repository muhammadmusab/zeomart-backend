import * as yup from "yup";

export const createProductTypesSchema = yup.object({
  body: yup
    .object({
      type: yup.string().required(),
      
    })
    .required(),
});
export const updateProductTypesSchema = yup.object({
  body: yup
    .object({
        type: yup.string(),
    })
    .required(),
  params: yup.object({
    uid: yup.string().uuid().required(), //uuid of the ProductTypes
  }),
});

export const deleteProductTypesSchema = yup.object({
  params: yup.object({
    uid: yup.string().uuid().required(), //uuid of the ProductTypes
  }),
});
export const getProductTypesSchema = yup.object({
  params: yup.object({
    uid: yup.string().uuid().required(),
  }),
});