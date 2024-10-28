import * as yup from "yup";
// productUniqueId, ProductSkuUniqueId, name, title, body, rating
export const createProductReviewSchema = yup.object({
  body: yup
    .object({
      product: yup.string().uuid().required(),
      productSku: yup.string().uuid(),
      title: yup.string().required(),
      body: yup.string().required(),
      rating: yup.number().required(),
    })
    .required(),
});
export const updateProductReviewSchema = yup.object({
  body: yup
    .object({
      title: yup.string(),
      body: yup.string(),
      rating: yup.number(),
    })
    .required(),
  params: yup.object({
    uid: yup.string().uuid().required(), //uuid of the Product SKu
  }),
});

export const deleteProductReviewSchema = yup.object({
  params: yup.object({
    uid: yup.string().uuid().required(), //uuid of the Product SKu
  }),
});

export const listProductReviewSchema = yup.object({
  filter: yup.string(),
});
