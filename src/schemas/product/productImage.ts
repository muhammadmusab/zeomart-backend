import * as yup from "yup";

export const createProductImageSchema = yup.object({
  body: yup
    .object({
      productUniqueId: yup.string().uuid().required(),
      productVariantValueId: yup.string().uuid(),
    })
    .required(),
    // files: yup.array().min(1, 'File is required').required('File is required'),
});

export const deleteProductImageSchema = yup.object({
  params: yup.object({
    uid: yup.string().uuid().required(), //uuid of the product to delete the images
  }),
  query: yup.object({
    ProductVariantValueId: yup.string().uuid(), //uuid of the product variant value to delete specific ids
  }),
});

export const listProductImageSchema = yup.object({
  query: yup.object({
    page: yup.number().required(),
    limit: yup.number().required(),
    sortBy: yup.string(),
    sortAs: yup.string().oneOf(["DESC", "ASC"]),
    productUniqueId: yup.string().uuid().required(),
    ProductVariantValueId:yup.string().uuid()
  }),
});
