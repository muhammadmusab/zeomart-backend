import * as yup from "yup";

export const urlValidation = yup
  .string()
  .matches(
    /((https?):\/\/)?(www.)?[a-z0-9]+(\.[a-z]{2,}){1,3}(#?\/?[a-zA-Z0-9#]+)*\/?(\?[a-zA-Z0-9-_]+=[a-zA-Z0-9-%]+&?)?$/,
    "Enter correct url!"
  );

export const mediaObject = yup.object({
  url: yup.string().required(),
  width: yup.string(),
  height: yup.string(),
  size: yup.string().required(),
  mime: yup.string().required(),
  name: yup.string().required(),
});
