import * as yup from "yup";

export const createAddressSchema = yup.object({
  body: yup.object({
    city: yup.string().required(),
    zip: yup.number().required(),
    streetAddress: yup.string().required(),
    state: yup.string().required(),
    addressType: yup
      .string()
      .oneOf(["billing", "shipping"])
      .when("query.type", {
        is: "user",
        then: (schema) => schema.required(),
      }),
  }),
  query: yup.object({
    type: yup.string().oneOf(["user", "vendor"]).required(),
  }),
});

export const updateAddressSchema = yup.object({
  body: yup.object({
    city: yup.string(),
    zip: yup.number(),
    streetAddress: yup.string(),
    state: yup.string(),
  }),
  params: yup.object({
    uid: yup.string().uuid().required(),
  }),
  query: yup.object({
    type: yup.string().oneOf(["user", "vendor"]).required(),
  }),
});
export const setDefaultAddressSchema = yup.object({
  params: yup.object({
    uid: yup.string().uuid().required(),
  }),
  // query: yup.object({
  //   type: yup.string().oneOf(["user", "vendor"]).required(),
  // }),
});

export const deleteAddressSchema = yup.object({
  params: yup.object({
    uid: yup.string().uuid().required(),
  }),
});

export const listAddressSchema = yup.object({
  query: yup.object({
    // page: yup.number().required(),
    // limit: yup.number().required(),
    sortBy: yup.string(),
    sortAs: yup.string().oneOf(["DESC", "ASC"]),
  }),
});
