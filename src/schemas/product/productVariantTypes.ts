import * as yup from "yup";

export const createProductVariantTypeSchema = yup.object({
  body: yup
    .object({
      productTypeUniqueId: yup.string().uuid().required(),
      elementType:yup.mixed().required()
    })
    .required(),
});
export const updateProductVariantTypeSchema = yup.object({
  body: yup
    .object({
      productTypeUniqueId: yup.string().uuid(),
      elementType:yup.mixed()
    })
    .required(),
  params: yup.object({
    uid: yup.string().uuid().required(), //uuid of the ProductVariantType
  }),
});

export const deleteProductVariantTypeSchema = yup.object({
  params: yup.object({
    uid: yup.string().uuid().required(), //uuid of the ProductVariantType
  }),
});
export const getProductVariantTypeSchema = yup.object({
  params: yup.object({
    uid: yup.string().uuid().required(),
  }),
});
export const listProductVariantTypeSchema = yup.object({
  params: yup.object({
    uid: yup.string().uuid().required(), // uid of productUniqueId
  }),
});