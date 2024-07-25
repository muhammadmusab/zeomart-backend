import * as yup from "yup";

export const createProductSkuSchema = yup.object({
  body: yup
    .object({
      productUniqueId: yup.string().uuid().required(),
      oldPrice: yup.number().required(),
      currentPrice: yup.number().required(),
      quantity: yup.number().required(),
      sku: yup.string().required(),
    })
    .required(),
});
export const updateProductSkuSchema = yup.object({
  body: yup
    .object({
      value: yup.string(),
      oldPrice: yup.number(),
      currentPrice: yup.number(),
      quantity: yup.number(),
    })
    .required(),
  params: yup.object({
    uid: yup.string().uuid().required(), //uuid of the Product SKu
  }),
});

export const deleteProductSkuSchema = yup.object({
  params: yup.object({
    uid: yup.string().uuid().required(), //uuid of the Product SKu
  }),
});
export const getProductSkuSchema = yup.object({
  params: yup.object({
    uid: yup.string().uuid().required(), //uuid of the Product SKu
  }),
});
export const listProductSkuSchema = yup.object({
  params: yup.object({
    uid: yup.string().uuid().required(), // uid of product
  }),
});
