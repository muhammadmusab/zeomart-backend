import * as yup from "yup";

export const createUpdateProductFavouritesSchema = yup.object({
  body: yup
    .object({
      product: yup.string().uuid().nullable(),
      productSku: yup.string().uuid().nullable(),
      state: yup.boolean().required(),
    })
    .required(),
});

export const deleteProductFavouritesSchema = yup.object({
  params: yup.object({
    uid: yup.string().uuid(),
  }),
});
export const getProductFavouritesSchema = yup.object({
  body: yup.object({
    product: yup.string().uuid(),
    productSku: yup.string().uuid(),
  }),
});

export const listProductFavouritesSchema = yup.object({
  query: yup.object({
    page: yup.number(),
    limit: yup.number(),
    sortBy: yup.string(),
    sortAs: yup.string().oneOf(["DESC", "ASC"]),
    product: yup.string().uuid(),
    ProductSku: yup.string().uuid(),
  }),
});
