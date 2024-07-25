import * as yup from 'yup'

export const updateUserSchema = yup.object({
  body: yup.object({
    name: yup.string(),
    gender: yup.string().oneOf(['male','female']),
    dob: yup.string(),
    mobile: yup.number(),
  }),
});

// export const getUserSchema = yup.object({
//   params: yup.object({
//     uid: yup.string().uuid().required(),
//   }),
// });
