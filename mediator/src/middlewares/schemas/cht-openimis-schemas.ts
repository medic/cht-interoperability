import joi from 'joi';

export const ChtClaimsFeedbackSchema = joi.object({
  care_rendered: joi.string().required(),
  payment_asked: joi.string().required(),
  drug_prescribed: joi.string().required(),
  drug_received: joi.string().required(),
  assessment_rating: joi.string().required(),
  claimUUID: joi.string().required(),
  insureeUUID: joi.string().required()
});

