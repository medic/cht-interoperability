import joi from "joi";

export const dateSchema = joi
  .string()
  .regex(
    new RegExp(
      `([0-9]([0-9]([0-9][1-9]|[1-9]0)|[1-9]00)|[1-9]000)(-(0[1-9]|1[0-2])(-(0[1-9]|[1-2][0-9]|3[0-1])(T([01][0-9]|2[0-3]):[0-5][0-9]:([0-5][0-9]|60)(\.[0-9]{1,9})?)?)?(Z|(\+|-)((0[0-9]|1[0-3]):[0-5][0-9]|14:00)?)?)?`
    )
  )
  .messages({
    "object.regex": "Invalid date expecting YYYY-MM-DD",
    "string.pattern.base": "Invalid date expecting YYYY-MM-DD",
  });

export const codeSchema = joi.string().regex(new RegExp(`[^\s]+( [^\s]+)*`));

export const codingSchema = joi.object({
  system: joi.string().regex(new RegExp("S*")),
  version: joi.string(),
  code: codeSchema,
  display: joi.string(),
  userSelected: joi.boolean(),
});

export const codeableConceptSchema = joi.object({
  coding: codingSchema,
  text: joi.string(),
});

export const periodSchema = joi.object({
  start: dateSchema,
  end: dateSchema,
});

export const identifierSchema = joi.object({
  use: codeSchema.valid("usual", "official", "temp", "secondary", "old"),
  type: codeableConceptSchema,
  system: joi.string().required(),
  value: joi.string().required(),
  period: periodSchema,
  assigner: joi.string(),
});

export const humanNameSchema = joi.object({
  use: codeSchema.valid("usual", "official", "temp", "nickname", "anonymous", "old", "maiden"),
  text: joi.string(),
  family: joi.string(),
  given: joi.string(),
  prefix: joi.string(),
  suffix: joi.string(),
  period: joi.string(),
})

export const contactPointSchema = joi.object({
  system: codeSchema.valid("phone", "fax", "email", "pager", "url", "sms", "other"),
  value: joi.string(),
  use: codeSchema.valid("home", "work", "temp", "old", "mobile"),
  rank: joi.number().positive(),
  period: periodSchema,
})

export const addressSchema = joi.object({
  use: codeSchema.valid("home", "work", "temp", "old", "billing"),
  type: codeSchema.valid("postal", "physical", "both"),
  text: joi.string(),
  line: joi.string(),
  city: joi.string(),
  district: joi.string(),
  state: joi.string(),
  postalCode: joi.string(),
  country: joi.string(),
  period: periodSchema,
})


export const attachmentSchema = joi.object({
  contentType: codeSchema.required(),
  language: codeSchema.required(),
  data: codeSchema.base64(),
  url: joi.string().uri(),
  size: joi.number().integer(),
  hash: joi.string().base64(),
  title: joi.string(),
  creation: dateSchema,
  height: joi.number().positive(),
  width: joi.number().positive(),
  frames: joi.number().positive(),
  duration: joi.number(),
  pages: joi.number().positive(),
})







