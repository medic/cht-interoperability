import joi from 'joi';

export const createServiceSchema = joi.object({
  patient_id: joi.number().required(),
  callbackURL: joi.string().uri().required(),
});
