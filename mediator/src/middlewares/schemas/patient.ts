import joi from 'joi';

export const PatientSchema = joi.object({
  id: joi.string().uuid(),
  identifier: joi
    .array()
    .items(
      joi.object({
        type: joi.object({
          text: joi.string()
        }),
        system: joi.string().valid('cht').required(),
        value: joi.string().uuid().required(),
      })
    )
    .min(1)
    .required(),
  name: joi
    .array()
    .items(
      joi.object({
        family: joi.string().required(),
        given: joi.array().length(1).required(),
      })
    )
    .min(1)
    .required(),
  gender: joi.string().required(),
  birthDate: joi.string().required(),
});
