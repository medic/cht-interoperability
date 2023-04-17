import joi from "joi";

const RequesterSchema = joi.object({
  type: "Organization",
  identifier: joi.string().required(),
});

export const ServiceRequestSchema = joi.object({
  intent: joi.string().required(),
  subject: joi
    .object({
      type: "Patient",
      identifier: joi.string().required(),
    })
    .required(),
  requester: joi.array().items(RequesterSchema).length(1).required(),
});
