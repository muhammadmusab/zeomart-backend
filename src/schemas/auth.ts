import * as yup from "yup";
const min = 2;
const max = 255;
export const registerSchema = yup.object({
  query: yup
    .object({
      type: yup.string().oneOf(["user", "vendor"]).required(),
    })
    .required(),
  body: yup
    .object({
      email: yup.string().email().required(),
      password: yup.string().required().min(8).max(128),
      firstName: yup.string(),
      // .test('firstName-required', 'firstName is required', function (value,context) {
      //   const { query } =context.parent.query || {}; // Access the `query` object
      //   console.log(context)
      //   if (query.type === 'user') {
      //     return !!value && value.length >= min && value.length <= max;
      //   }
      //   return true; // If `type` is not "user", it's valid regardless of `firstName`
      // }),
      lastName: yup.string().when("query.type", {
        is: "user",
        then: (schema) => schema.required().min(min).max(max),
      }),
      name: yup.string().when("query.type", {
        is: "vendor",
        then: (schema) => schema.required().min(min).max(max),
      }),
      address: yup.object({
        streetAddress: yup.string().when("query.type", {
          is: "vendor",
          then: (schema) => schema.required().min(min).max(max),
        }),
        city: yup.string().when("query.type", {
          is: "vendor",
          then: (schema) => schema.required().min(min).max(max),
        }),
        zip: yup.string().when("query.type", {
          is: "vendor",
          then: (schema) => schema.required().min(min).max(max),
        }),
        state: yup.string().when("query.type", {
          is: "vendor",
          then: (schema) => schema.required().min(min).max(max),
        }),
      }),
    })
    .required(),
});
export const loginSchema = yup.object({
  body: yup.object({
    email: yup.string().email().required(),
    password: yup.string().required(),
  }),
  query: yup.object({
    type: yup.string().oneOf(["user", "vendor"]).required(),
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
