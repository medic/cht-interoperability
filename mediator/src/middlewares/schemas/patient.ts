import joi from "joi";

export const PatientSchema = joi.object({
  identifier: joi
    .array()
    .items(
      joi.object({
        system: joi.string().valid("cht").required(),
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
        given: joi.string().required(),
      })
    )
    .min(1)
    .required(),
  gender: joi.string().required(),
  birthDate: joi.string().required(),
});
