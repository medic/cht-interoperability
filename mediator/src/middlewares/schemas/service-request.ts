import joi from "joi";

export const ServiceRequestSchema = joi.object({
  intent: joi.string().required(),
  subject: joi
    .object({
      type: "Patient",
      identifier: joi.string().required(),
    })
    .required(),
  requester: joi.object({
    type: "Organization",
    identifier: joi.string().required(),
  }),
});
