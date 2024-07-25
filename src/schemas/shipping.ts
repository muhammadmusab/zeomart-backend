import * as yup from "yup";

export const createShippingSchema = yup.object({
  body: yup
    .object({
      cartUniqueId: yup.string().uuid().required(),
    })
    .required(),
});
export const updateShippingSchema = yup.object({
  body: yup
    .object({
      cost: yup.number(),
    })
    .required(),
  params: yup.object({
    uid: yup.string().uuid().required(), //uuid of the Shipping
  }),
});
export const deleteShippingSchema = yup.object({
  params: yup.object({
    uid: yup.string().uuid().required(), //uuid of the Shipping
  }),
});
export const getShippingSchema = yup.object({
  params: yup.object({
    uid: yup.string().uuid().required(),
  }),
});
