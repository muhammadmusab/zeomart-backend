import * as yup from "yup";

export const updateProductAttributeSchema = yup.object({
  body: yup
    .object({
      name: yup.string(),
      value: yup.string(),
    })
    .required(),
  params: yup.object({
    uid: yup.string().uuid().required(), //uuid of the product attribute
  }),
});

export const deleteProductAttributeSchema = yup.object({
  params: yup.object({
    uid: yup.string().uuid().required(), // uuid of product attribute
  }),
});
