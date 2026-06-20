import * as yup from "yup";

export const createCartSchema = yup.object({
  body: yup.object({
    cart: yup.string().uuid().required(),
    user: yup.string().uuid().required(),
  }),
});
export const CalculateTotalSchema = yup.object({
  body: yup.object({
    cartUniqueId: yup.string().uuid().required(),
    country: yup.string().required(),
  }),
});
export const PlaceOrderSchema = yup.object({
  body: yup.object({
    paymentMethod: yup
      .string()
      .oneOf(["cash_on_delivery", "credit_card"])
      .required(),
    // status: yup
    //   .string()
    //   .oneOf([
    //     "IN_CART",
    //     "PENDING",
    //     "AWAITING_PAYMENT",
    //     "CONFIRMED",
    //     "AWAITING_SHIPMENT",
    //     "SHIPPED",
    //     "COMPLETED",
    //     "CANCELLED",
    //     "REFUNDED",
    //   ]),
  }),
});

export const createUpdateCartSchema = yup.object({
  body: yup.object({
    quantity: yup.number().required(), // of single product...
    product: yup.string().uuid().required(),
    cart: yup.string().uuid(), // it is optional ( if cart is not created yet then it will be null or undefined )
    productSku: yup.string().uuid(), // if product sku unique id has different variants.
    cartItem: yup.string().uuid(),
    media: yup.string().uuid(),
  }),
});

export const deleteCartSchema = yup.object({
  params: yup.object({
    uid: yup.string().uuid().required(),
  }),
});

export const getCartSchema = yup.object({
  params: yup.object({
    uid: yup.string(),
  }),
});
export const addUserCartSchema = yup.object({
  params: yup.object({
    uid: yup.string().required(),
  }),
});
export const UpdateOrderStatusSchema = yup.object({
  params: yup.object({
    uid: yup.string().uuid().required(),
  }),
  body: yup.object({
    status: yup
      .string()
      .oneOf(["AWAITING_SHIPMENT", "SHIPPED", "DELIVERED"])
      .required(),
  }),
});
