import * as yup from "yup";

export const updateVendorSchema = yup.object({
  body: yup.object({
    name: yup.string(),
    description: yup.string(),
    phone: yup.string(),
    address: yup.object({
      streetAddress: yup.string(),
      city: yup.string(),
      zip: yup.string(),
      state: yup.string(),
    }),
  }),
});
