import * as yup from 'yup'



export const createUpdateCartItemSchema = yup.object({
  body: yup.object({
    quantity:yup.number().required(), // of single product...
    product:yup.string().uuid().required(),
    cart:yup.string().uuid().required(),//
    productSku:yup.string().uuid(), // if product sku unique id has different variants.
    cartItem:yup.string().uuid(),
    media:yup.string().uuid(),
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
