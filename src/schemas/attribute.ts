import * as yup from "yup";

export const createAttributeSchema = yup.object({
  body: yup
    .object({
      title: yup.string().required(),
      type: yup.string().nullable(),
      options: yup
        .array(yup.object({ value: yup.string().required() }).required())
        .required(),
    })
    .required(),
});
export const updateAttributeSchema = yup.object({
  body: yup
    .object({
      title: yup.string().required(),
      type: yup.string().nullable(),
      options: yup.array(
        yup.object({
          value: yup.string().required(),
          uid: yup.string().uuid(),
        })
      ),
    })
    .required(),
  params: yup.object({
    uid: yup.string().uuid().required(), //uuid of the Attribute
  }),
});

export const deleteAttributeSchema = yup.object({
  params: yup.object({
    uid: yup.string().uuid().required(), //uuid of the Attribute
  }),
});
export const getAttributeSchema = yup.object({
  params: yup.object({
    uid: yup.string().uuid().required(),
  }),
});
