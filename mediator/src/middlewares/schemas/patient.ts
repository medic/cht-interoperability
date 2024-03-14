import joi from 'joi';

export const PatientSchema = joi.object({
  id: joi.string().uuid().required(),
  name: joi.string().required(),
  gender: joi.string().required(),
  birthDate: joi.string().required(),
  phone: joi.string().required(),
});
