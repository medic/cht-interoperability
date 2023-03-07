import joi from "joi";


export const createPatientSchema = joi.object({
  parent: joi.any().optional(),
  type: joi.string().optional(),
  name: joi.string().required(),
  _id: joi.string().required(),
  id: joi.string().optional(),
  sex: joi.string().trim().valid('male', 'female', 'other', 'unkown').required(),
  // validate expecting YYYY-MM-DD
  date_of_birth: joi.string().regex(new RegExp("[0-9]{4}-[0-9]{2}-[0-9]{2}")).required(),
});
