import joi from "joi";

const createPatientSchema = joi.object({
  name: joi.string().optional(),
  _id: joi.string().optional(),
  sex: joi.string().optional(),
  birthDate: joi.string().optional(),
});

module.exports = {
  createPatientSchema,
};
