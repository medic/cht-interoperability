import joi from 'joi';

export const createEncounterSchema = joi.object({
  patient_id: joi.string().required(),
});