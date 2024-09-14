import * as yup from "yup";

export const createProductSchema = yup.object({
  body: yup.object({
    title: yup.string().required(),
    slug: yup.string(),
    brand: yup.string().uuid().required(),
    status: yup.string().nullable(),
    hasVariants: yup.boolean(),
    sku: yup
      .string()
      .when("hasVariants", {
        is: false,
        then(schema) {
          return schema.required();
        },
      })
      .nullable(),
    quantity: yup
      .number()
      .when("hasVariants", {
        is: false,
        then(schema) {
          return schema.required();
        },
      })
      .nullable(),
    currentPrice: yup
      .number()
      .when("hasVariants", {
        is: false,
        then(schema) {
          return schema.required();
        },
      })
      .nullable(),
    oldPrice: yup
      .number()
      .when("hasVariants", {
        is: false,
        then(schema) {
          return schema.required();
        },
      })
      .nullable(),
    category: yup.string().uuid().required(),
    features: yup.array(
      yup.object({
        label: yup.string().required(),
        value: yup.string().required(),
      })
    ),
    highlights: yup.string(),
    overview: yup.string().required(),
  }),
});
export const updateProductSchema = yup.object({
  body: yup
    .object({
      title: yup.string(),
      slug: yup.string(),
      brand: yup.string().uuid(),
      status: yup.string(),
      sku: yup.string(),
      quantity: yup.number(),
      currentPrice: yup.number(),
      oldPrice: yup.number(),
      category: yup.string().uuid(),
      specifications: yup.array(
        yup.object({
          key: yup.string().required(),
          value: yup.string().required(),
        })
      ),
      highlights: yup.string(),
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
  query: yup.object({
    // productVariantValues: yup.array(yup.string().uuid().required()),
    filter:yup.string()
  }),
  params: yup.object({
    uid: yup.string().uuid().required(),
  }),
});

export const listProductSchema = yup.object({
  query: yup.object({
    page: yup.number().required(),
    limit: yup.number().required(),
    sortBy: yup.string(),
    sortAs: yup.string().oneOf(["DESC", "ASC"]),
    category: yup.string(),
  }),
});
