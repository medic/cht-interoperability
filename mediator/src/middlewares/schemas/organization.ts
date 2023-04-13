import joi from "joi";

export const OrganizationSchema = joi.object({
  name: joi.string().required(),
  endpoint: joi
    .array()
    .items(
      joi.object({
        type: "Endpoint",
        identifier: joi.string().required(),
      })
    )
    .required(),
});
