import * as yup from "yup";

export const createProductSchema = yup.object({
  body: yup
    .object({
      title: yup.string().required(),
      slug: yup.string(),
      brand: yup.string().required(),
      status: yup.string().nullable(),
      multipart: yup.boolean().required(),
      sku: yup.string().when("multipart", {
        is: 0,
        then(schema) {
          return schema.required();
        },
      }).nullable(),
      baseQuantity: yup.number().when("multipart", {
        is: 0,
        then(schema) {
          return schema.required();
        },
      }).nullable(),
      basePrice: yup.number().when("multipart", {
        is: 0,
        then(schema) {
          return schema.required();
        },
      }).nullable(),
      oldPrice: yup.number().when("multipart", {
        is: 0,
        then(schema) {
          return schema.required();
        },
      }).nullable(),
      categoryUniqueId: yup.string().uuid().required(),
      specifications: yup
        .array(
          yup.object({
            label: yup.string().required(),
            value: yup.string().required(),
          })
        )
        .required(),
      highlights: yup.array(yup.string()).required(),
      overview: yup.string().required(),
    })
   
});
export const updateProductSchema = yup.object({
  body: yup
    .object({
      title: yup.string(),
      slug: yup.string(),
      brand: yup.string(),
      status: yup.string(),
      sku: yup.string(),
      baseQuantity: yup.number(),
      basePrice: yup.number(),
      oldPrice: yup.number(),
      categoryUniqueId: yup.string().uuid(),
      specifications: yup.array(
        yup.object({
          key: yup.string().required(),
          value: yup.string().required(),
        })
      ),
      highlights: yup.array(yup.string()),
      overview: yup.string(),
    })
    .required(),
  params: yup.object({
    uid: yup.string().uuid().required(), //uuid of the product
  }),
});

export const deleteProductSchema = yup.object({
  params: yup.object({
    uid: yup.string().uuid().required(),
  }),
});
export const getProductSchema = yup.object({
  body: yup.object({
    productUniqueId: yup.string().uuid().required(),
    productVariantValueUniqueIds: yup.array(yup.string().uuid().required()),
  }),
});

export const listProductSchema = yup.object({
  query: yup.object({
    page: yup.number().required(),
    limit: yup.number().required(),
    sortBy: yup.string(),
    sortAs: yup.string().oneOf(["DESC", "ASC"]),
    categoryUniqueId: yup.string().required(),
  }),
});
