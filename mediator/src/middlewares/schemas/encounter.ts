import joi from "joi";

export const EncounterSchema = joi.object({
  identifier: joi
    .array()
    .items(
      joi.object({
        system: joi.string().valid("cht").required(),
        value: joi.string().uuid().required(),
      })
    )
    .length(1)
    .required(),
  status: joi.object().required(),
  class: joi.array().length(1).required(),
  type: joi.array().length(1).required(),
  subject: joi.array().length(1).required(),
  participant: joi.array().length(1).required(),
});
