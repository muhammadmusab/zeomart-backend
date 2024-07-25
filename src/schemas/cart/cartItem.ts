import * as yup from 'yup'



export const createUpdateCartItemSchema = yup.object({
  body: yup.object({
    quantity:yup.number().required(), // of single product...
    productUniqueId:yup.string().uuid().required(),
    cartUniqueId:yup.string().uuid().required(),//
    productSkuUniqueId:yup.string().uuid(), // if product sku unique id has different variants.
    cartItemUniqueId:yup.string().uuid(),
    productImageUniqueId:yup.string().uuid(),
  }),
});

export const deleteCartItemSchema = yup.object({
  params: yup.object({
    uid: yup.string().uuid().required(),
  }),
});

export const listCartItemSchema = yup.object({
    params: yup.object({
        uid: yup.string().uuid().required(),
      }),
});
