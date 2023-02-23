import joi from 'joi';

export const createServiceSchema = joi.object({
  patient_id: joi.string().required(),
  callback_url: joi.string().uri().required(),
});
