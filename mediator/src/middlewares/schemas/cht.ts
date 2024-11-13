import joi from 'joi';

export const ChtPatientSchema = joi.object({
  doc: joi.object({
    _id: joi.string().uuid().required(),
    name: joi.string().required(),
    phone: joi.string().required(),
    date_of_birth: joi.string().required(),
    sex: joi.string().required(),
    patient_id: joi.string().required()
  }).required()
});

export const ChtPatientIdsSchema = joi.object({
  doc: joi.object({
    patient_id: joi.string().required(),
    external_id: joi.string().required()
  })
});

export const ValueTypeSchema = joi.object({
  code: joi.string().required(),
  valueString: joi.string(),
  valueCode: joi.string(),
  valueBoolean: joi.boolean(),
  valueInteger: joi.number().integer(),
  valueDateTime: joi.string().isoDate(),
  valueTime: joi.string().regex(/^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d(\.\d{1,3})?)?$/),  // matches HH:mm[:ss[.SSS]]
  valueQuantity: joi.object({
    value: joi.number().required(),
    unit: joi.string().required(),
    system: joi.string().uri().optional(),
    code: joi.string().optional()
  })
}).or('valueString', 'valueCode', 'valueBoolean', 'valueInteger', 'valueDateTime', 'valueTime', 'valueQuantity');

export const ChtEncounterFormSchema = joi.object({
  patient_uuid: joi.string().required(),
  reported_date: joi.number().required(), //timestamp
  observations: joi.array().items(ValueTypeSchema).optional()
});
