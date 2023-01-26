import joi from 'joi';

const createServiceSchema = joi.object({
  patient_id: joi.number().required()
});

module.exports = {
  createServiceSchema,
};
