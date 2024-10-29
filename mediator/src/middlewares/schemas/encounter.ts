import joi from 'joi';

export const EncounterSchema = joi.object({
  resourceType: joi.string(),
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
    .length(1)
    .required(),
  status: joi.string().required(),
  class: joi.required(),
  type: joi.array().length(1).required(),
  subject: joi.required(),
  participant: joi.array().length(1).required(),
  period: joi.object({
    start: joi.string(),
    end: joi.string()
  })
});
