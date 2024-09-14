import * as yup from "yup";

export const createBrandSchema = yup.object({
  body: yup
    .object({
      title: yup.string().required(),
    })
    .required(),
});
export const updateBrandSchema = yup.object({
  body: yup
    .object({
      title: yup.string().required(),
    })
    .required(),
  params: yup.object({
    uid: yup.string().uuid().required(), //uuid of the Brand
  }),
});

export const deleteBrandSchema = yup.object({
  params: yup.object({
    uid: yup.string().uuid().required(), //uuid of the Brand
  }),
});
export const getBrandSchema = yup.object({
  params: yup.object({
    uid: yup.string().uuid().required(),
  }),
});
