import joi from "joi";

const createPatientSchema = joi.object({
  parent: joi.any().optional(),
  type: joi.string().optional(),
  name: joi.string().required(),
  _id: joi.string().required(),
  id: joi.string().optional(),
  sex: joi.string().trim().valid('male', 'female', 'other', 'unkown').required(),
  // eslint-disable-next-line camelcase
  date_of_birth: joi.string().optional(),
});

module.exports = {
  createPatientSchema,
};
