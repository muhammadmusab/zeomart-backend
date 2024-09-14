import * as yup from "yup";

export const createFilterSchema = yup.object({
  body: yup.object({
    title: yup.string().required(),
    type: yup.string().required(),
    additionalTitle: yup.string(),
    options: yup
      .array()
      .of(
        yup.object().shape({
          label: yup.string().required(),
          value: yup.mixed().required(),
        })
      )
      .required()
      .when("type", {
        is: "range",
        then(schema) {
          return schema.max(2);
        },
      }),

    categories: yup.array(yup.string().uuid().required()).required(),
  }),
});
export const updateFilterSchema = yup.object({
  body: yup.object({
    title: yup.string(),
    type: yup.string(),
    additionalTitle: yup.string(),
    options: yup
      .array()
      .of(
        yup.object().shape({
          label: yup.string().required(),
          value: yup.mixed().required(),
        })
      )
      .when("type", {
        is: "range",
        then(schema) {
          return schema.max(2);
        },
      }),

    categories: yup.array(yup.string().uuid().required()).required(),
  }),
  params: yup.object({
    uid: yup.string().uuid().required(),
  }),
});

export const deleteFilterSchema = yup.object({
  params: yup.object({
    uid: yup.string().uuid().required(),
  }),
});
export const getFilterSchema = yup.object({
  params: yup.object({
    uid: yup.string().uuid().required(),
  }),
});

export const listFilterSchema = yup.object({
  query: yup.object({
    filter: yup.string().uuid().required(),
  }),
});
