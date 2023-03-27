import joi from 'joi';

export const EncounterSchema = joi.object({
  identifier: joi.array().min(1).required(),
  status: joi.string().required(),
  class: joi.string().required(),
  type: joi.array().min(1).required(),
  subject: joi.string().required(),
  participant: joi.string().min(1).required(),
});

