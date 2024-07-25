import * as yup from "yup";

export const registerSchema = yup.object({
  body: yup.object({
    email: yup.string().email().required(),
    password: yup.string().required(),
    name: yup.string().required(),
  }),
  query: yup.object({
    type: yup.string(),
  }),
});
export const loginSchema = yup.object({
  body: yup.object({
    email: yup.string().email().required(),
    password: yup.string().required(),
  }),
  query: yup.object({
    type: yup.string(),
  }),
});
export const resendVerificationMailSchema = yup.object({
  body: yup.object({
    email: yup.string().email().required(),
  }),
});
export const verifyEmailAddressSchema = yup.object({
  query: yup.object({
    token: yup.string().required(),
  }),
});
const emailBodySchema = yup.object({
  body: yup.object({
    email: yup.string().email().required(),
  }),
});
export const resetPasswordMailSchema = emailBodySchema;
export const deleteAccountSchema = emailBodySchema;
export const resetPasswordSchema = yup.object({
  body: yup.object({
    password: yup.string().required(),
  }),
  query: yup.object({
    token: yup.string().required(),
  }),
});
export const resetPasswordWithoutMailSchema = yup.object({
  body: yup.object({
    oldPassword: yup.string().required(),
    newPassword: yup.string().required(),
  }),
});
