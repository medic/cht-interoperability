import joi from 'joi';

const createServiceSchema = joi.object({
  patientId: joi.number().required()
});

module.exports = {
  createServiceSchema,
};
