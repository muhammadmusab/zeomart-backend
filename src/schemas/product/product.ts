import * as yup from "yup";

export const createProductSchema = yup.object({
  body: yup.object({
    title: yup.string().required(),
    slug: yup.string().nullable(),
    brand: yup.string().uuid().required(),
    status: yup.string().nullable(),
    hasVariants: yup.boolean(),
    skus: yup.array(
      yup.object({
        sku: yup.string().required(),
        oldPrice: yup.number().required(),
        currentPrice: yup.number().required(),
        quantity: yup.number().required(),
      })
    ).nullable(),
    sku: yup
      .string()
      .when("hasVariants", {
        is: false,
        then(schema) {
          return schema.nullable(); // set to required after checking
        },
      })
      .nullable(),
    quantity: yup
      .number().nullable()
      .when("hasVariants", {
        is: false,
        then(schema) {
          return schema.required();
        },
      })
      .nullable(),
    currentPrice: yup
      .number().nullable()
      .when("hasVariants", {
        is: false,
        then(schema) {
          return schema.required();
        },
      })
      .nullable(),
    oldPrice: yup
      .number().nullable()
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
    ).nullable(),
    highlights: yup.string().nullable(),
    overview: yup.string().required(),
  }),
});
export const updateProductSchema = yup.object({
  body: yup
    .object({
      title: yup.string().nullable(),
      slug: yup.string().nullable(),
      brand: yup.string().uuid(),
      status: yup.string().nullable(),
      sku: yup.string().nullable(),
      skus: yup.array(  // ProductSkus
        yup.object({
          sku: yup.string().required(),
          oldPrice: yup.number().required(),
          currentPrice: yup.number().required(),
          quantity: yup.number().required(),
        })
      ).nullable(),
      quantity: yup.number().nullable(),
      currentPrice: yup.number().nullable(),
      oldPrice: yup.number().nullable(),
      category: yup.string().uuid(),
      specifications: yup.array(
        yup.object({
          key: yup.string().required(),
          value: yup.string().required(),
        })
      ).nullable(),
      highlights: yup.string().nullable(),
      overview: yup.string().nullable(),
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
    filter: yup.string(),
  }),
  params: yup.object({
    uid: yup.string().uuid().required(),
  }),
});
export const getProductBrandSchema = yup.object({
  query: yup.object({
    // productVariantValues: yup.array(yup.string().uuid().required()),
    search: yup.string(),
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
