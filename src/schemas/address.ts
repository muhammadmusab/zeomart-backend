import * as yup from 'yup'

export const createAddressSchema = yup.object({
  body: yup.object({
    name: yup.string().required(),
    city: yup.string().required(),
    country: yup.string().required(),
    address1: yup.string().required(),
    address2: yup.string(),
    postalCode: yup.number().required(),
  }),
});

export const updateAddressSchema = yup.object({
  body: yup.object({
    name: yup.string(),
    city: yup.string(),
    country: yup.string(),
    address1: yup.string(),
    address2: yup.string(),
    postalCode: yup.number(),
  }),
});

export const deleteAddressSchema = yup.object({
  params: yup.object({
    uid: yup.string().uuid().required(),
  }),
});

export const listAddressSchema = yup.object({
  query: yup.object({
    page: yup.number().required(),
    limit: yup.number().required(),
    sortBy: yup.string(),
    sortAs: yup.string().oneOf(["DESC", "ASC"]),
  }),
});
