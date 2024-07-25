import * as yup from "yup";

export const createCartSchema = yup.object({
  body: yup.object({
    cartUniqueId: yup.string().uuid().required(),
  }),
});
export const CalculateTotalSchema = yup.object({
  body: yup.object({
    cartUniqueId: yup.string().uuid().required(),
    country: yup.string().required(),
  }),
});
export const UpdateStatusSchema = yup.object({
  body: yup.object({
    cartUniqueId: yup.string().uuid().required(),
    status: yup
      .string()
      .oneOf([
        "PENDING",
        "AWAITING_PAYMENT",
        "AWAITING_SHIPMENT",
        "SHIPPED",
        "COMPLETED",
        "CANCELLED",
        "REFUNDED",
      ]),
  }),
});

export const createUpdateCartSchema = yup.object({
  body: yup.object({
    quantity: yup.number().required(), // of single product...
    productUniqueId: yup.string().uuid().required(),
    cartUniqueId: yup.string().uuid(), // it is optional ( if cart is not created yet then it will be null or undefined )
    productSkuUniqueId: yup.string().uuid(), // if product sku unique id has different variants.
    cartItemUniqueId: yup.string().uuid(),
    productImageUniqueId: yup.string().uuid(),
  }),
});

export const deleteCartSchema = yup.object({
  params: yup.object({
    uid: yup.string().uuid().required(),
  }),
});

export const getCartSchema = yup.object({
  params: yup.object({
    uid: yup.string().uuid().required(),
  }),
});
