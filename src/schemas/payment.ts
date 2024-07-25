import * as yup from "yup";

export const createPaymentSchema = yup.object({
  body: yup.object({
    paymentMethod: yup.string().required(),
    paymentStatus: yup.string().required(),
    transactionId: yup.string().required(),
    cartUniqueId: yup.string().uuid().required(),
    amount: yup.number().required(),
  }),
});

export const updatePaymentSchema = yup.object({
  body: yup.object({
    paymentMethod: yup.string(),
    paymentStatus: yup.string(),
    transactionId: yup.string(),
    cartUniqueId: yup.string().uuid(),
    amount: yup.number(),
  }),
});

export const deletePaymentSchema = yup.object({
  params: yup.object({
    uid: yup.string().uuid().required(),
  }),
});
export const getPaymentSchema = yup.object({
  params: yup.object({
    uid: yup.string().uuid().required(),
  }),
});

export const listPaymentSchema = yup.object({
  query: yup.object({
    page: yup.number().required(),
    limit: yup.number().required(),
    sortBy: yup.string(),
    sortAs: yup.string().oneOf(["DESC", "ASC"]),
  }),
});
