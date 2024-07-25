import * as yup from "yup";
// productUniqueId, ProductSkuUniqueId, name, title, body, rating
export const createProductReviewSchema = yup.object({
  body: yup
    .object({
      productUniqueId: yup.string().uuid().required(),
      ProductSkuUniqueId: yup.string().uuid(),
      name: yup.string().required(),
      title: yup.string().required(),
      body: yup.string().required(),
      rating: yup.number().required(),
    })
    .required(),
});
export const updateProductReviewSchema = yup.object({
  body: yup
    .object({
      name: yup.string(),
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
  params: yup.object({
    uid: yup.string().uuid().required(), // uid of product
  }),
  query: yup.object({
    productUniqueId: yup.string().uuid().required(), // uid of product
    ProductSkuUniqueId: yup.string().uuid(), // uid of productSku (if product has variant then required otherwise not required)
  }),
});
