const joi = require('joi');

const createServiceSchema = joi.object({
  patientId: joi.string().guid().required(),
  callbackURL: joi.string().uri().required(),
});

module.exports = {
  createServiceSchema,
};
