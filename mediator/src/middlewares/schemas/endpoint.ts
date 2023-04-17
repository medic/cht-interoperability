import joi from "joi";

export const VALID_SYSTEM =
  "http://terminology.hl7.org/CodeSystem/endpoint-connection-type";
export const VALID_CODE = "hl7-fhir-rest";

const CodingSchema = joi.object({
  coding: joi.array().items(
    joi.object({
      system: joi.string().valid(VALID_SYSTEM).required(),
      code: joi.string().valid(VALID_CODE).required(),
    })
  ),
});

export const EndpointSchema = joi.object({
  connectionType: joi.array().items(CodingSchema).length(1).required(),
});
