import * as yup from "yup";

export const createCouponSchema = yup.object({
  body: yup
    .object({
      code: yup.string().required(),
      discountAmount: yup.number().required(),
      discountType: yup.string().oneOf(["fixed", "percentage"]).required(),
      expirationDate: yup.string().required(),
      usageLimit: yup.number().required(),
    })
    .required(),
});
export const updateCouponSchema = yup.object({
  body: yup
    .object({
      code: yup.string(),
      discountAmount: yup.number(),
      discountType: yup.string().oneOf(["fixed", "percentage"]),
      expirationDate: yup.string(),
      usageLimit: yup.number(),
    })
    .required(),
  params: yup.object({
    uid: yup.string().uuid().required(), //uuid of the Coupon
  }),
});

export const applyCouponSchema = yup.object({
  body: yup
    .object({
      code: yup.string().required(),
      cartUniqueId: yup.string().uuid().required(),
    })
    .required(),
});

export const deleteCouponSchema = yup.object({
  params: yup.object({
    uid: yup.string().uuid().required(), //uuid of the Coupon
  }),
});
export const getCouponSchema = yup.object({
  params: yup.object({
    uid: yup.string().uuid().required(),
  }),
});
