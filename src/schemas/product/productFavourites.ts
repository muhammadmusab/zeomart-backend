import * as yup from "yup";

export const createUpdateProductFavouritesSchema = yup.object({
  body: yup
    .object({
      productUniqueId: yup.string().uuid().required(),
      productVariantValueId: yup.string().uuid(),
      favouriteUniqueId: yup.string().uuid(),
      state: yup.boolean().required(),
    })
    .required(),
});

export const deleteProductFavouritesSchema = yup.object({
  params: yup.object({
    uid: yup.string().uuid().required(),
  }),
});
export const getProductFavouritesSchema = yup.object({
  body: yup.object({
    productUniqueId: yup.string().uuid().required(),
    productVariantValueId: yup.string().uuid(),
  }),
});

export const listProductFavouritesSchema = yup.object({
  query: yup.object({
    page: yup.number().required(),
    limit: yup.number().required(),
    sortBy: yup.string(),
    sortAs: yup.string().oneOf(["DESC", "ASC"]),
    productUniqueId: yup.string().uuid().required(),
    ProductVariantValueId: yup.string().uuid(),
  }),
});
