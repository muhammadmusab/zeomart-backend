import * as yup from "yup";

export const createProductVariantSchema = yup.object({
  body: yup
    .object({
      productVariantTypeUniqueId: yup.string().uuid().required(),
      productUniqueId: yup.string().uuid().required(),
      value: yup.string().required(),
      oldPrice: yup.number().required(),
      currentPrice: yup.number().required(),
      quantity: yup.number().required(),
      sku: yup.string().required(),
    })
    .required(),
});
export const assignVariantSchema = yup.object({
  body: yup
    .object({
      productVariantValueUniqueIds: yup.array(yup.string().uuid()).required(),
      productSkuUniqueId: yup.string().uuid().required(),
      productUniqueId: yup.string().uuid().required(),
    })
    .required(),
});
export const setDefaultVariantSchema = yup.object({
  body: yup
    .object({
      productSkuUniqueId: yup.string().uuid().required(),
    })
    .required(),
});
export const updateProductVariantSchema = yup.object({
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

export const deleteProductVariantSchema = yup.object({
  body: yup.object({
    productVariantValueUniqueId: yup.string().uuid().required(), //uuid of the Product
    productSkuUniqueId: yup.string().uuid().required(), //uuid of the Product
  }),
});
export const getProductVariantSchema = yup.object({
  params: yup.object({
    uid: yup.string().uuid().required(), //uuid of the Product SKu
  }),
});
export const listProductVariantSchema = yup.object({
  // body: yup.object({
    // product: yup.string().uuid().required(), // uid of product
    // productVariantValues: yup.array(yup.string().uuid().required()),
  // }),
  filter:yup.string(),
  // query: yup.object({
  //   separate: yup.boolean(),
  // }),
});
