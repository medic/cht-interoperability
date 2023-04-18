import joi from "joi";

const EndpointReferenceSchema = joi.object({
  reference: joi.string().regex(/Endpoint\/\S+/).required(),
});

// todo => add the requirement for an identifier
export const OrganizationSchema = joi.object({
  name: joi.array().length(1).required(),
  endpoint: joi.array().items(EndpointReferenceSchema).length(1).required(),
});
