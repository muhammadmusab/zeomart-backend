import * as yup from 'yup'

export const updateUserSchema = yup.object({
  body: yup.object({
    firstName: yup.string(),
    lastName: yup.string(),
    phone: yup.number(),
  }),
});

// export const getUserSchema = yup.object({
//   params: yup.object({
//     uid: yup.string().uuid().required(),
//   }),
// });
