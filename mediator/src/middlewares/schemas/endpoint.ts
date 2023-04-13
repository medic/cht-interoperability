import joi from "joi";

const VALID_SYSTEM =
  "http://terminology.hl7.org/CodeSystem/endpoint-connection-type";
const VALID_CODE = "hl7-fhir-rest";

export const EndpointSchema = joi.object({
  connectionType: joi.array().items(
    joi.object({
      coding: joi.array().items(
        joi.object({
          system: joi.string().valid(VALID_SYSTEM).required(),
          code: joi.string().valid(VALID_CODE).required(),
        })
      ),
    })
  ),
});
