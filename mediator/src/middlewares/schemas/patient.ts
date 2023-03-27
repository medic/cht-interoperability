import joi from "joi";

export const PatientSchema = joi.object({
  id: joi.string().required(),
  identifier: joi.array().items().min(1).required(),
  name: joi.array().min(1).required(),
  gender: joi.string().required(),
  birthDate: joi.string().required(),
});
