import joi from 'joi';

const RequesterSchema = joi.object({
  reference: joi.string().regex(/Organization\/\S+/),
});

export const ServiceRequestSchema = joi.object({
  intent: joi.string().required(),
  subject: joi
    .object({
      reference: joi.string().regex(/Patient\/\S+/),
    })
    .required(),
  requester: RequesterSchema.required(),
});
