import joi from "joi";

const EndpointReferenceSchema = joi.object({
  type: "Endpoint",
  identifier: joi.string().required(),
});

export const OrganizationSchema = joi.object({
  name: joi.array().length(1).required(),
  endpoint: joi.array().items(EndpointReferenceSchema).length(1).required(),
});
