const joi = require('joi');

const createTaskSchema = joi.object({
  patientId: joi.number().required()
});

module.exports = {
  createTaskSchema,
};
