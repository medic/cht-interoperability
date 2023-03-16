import joi from 'joi';


export const createPatientSchema = joi.object({
  parent: joi.any().optional(),
  type: joi.string().optional(),
  name: joi.string().required(),
  _id: joi.string().required(),
  id: joi.string().optional(),
  sex: joi.string().trim().valid('male', 'female', 'other', 'unkown').required(),
  // validate expecting YYYY-MM-DD
  date_of_birth: joi
    .string()
    .regex(/((?:19|20)\d\d)-(0?[1-9]|1[012])-([12][0-9]|3[01]|0?[1-9])/)
    .required()
    .messages({
      'object.regex': 'Invalid date expecting YYYY-MM-DD',
      'string.pattern.base': 'Invalid date expecting YYYY-MM-DD'
    })
});
