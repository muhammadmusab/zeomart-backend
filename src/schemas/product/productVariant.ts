import * as yup from "yup";

export const createProductVariantSchema = yup.object({
  body: yup
    .object({
      productSku: yup.string().uuid().required(),
      product: yup.string().uuid().required(),
      attributeOptions: yup
        .array(
          yup.object({
            attribute: yup.string().required(),
            option: yup.string().required(),
          })
        )
        .min(2)
        .required(),
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
  params: yup.object({
    uid: yup.string().uuid().required(), //uuid of the Product SKu
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
  filter: yup.string(),
  // query: yup.object({
  //   separate: yup.boolean(),
  // }),
});
