import * as yup from "yup";

export const createUpdateVendorSocialSchema = yup.object({
  body: yup.object({
    socialLinks: yup.array(
      yup.object({
        uid: yup.string().uuid(),
        name: yup.string(),
        url: yup.string(),
      })
    ),
  }),
});