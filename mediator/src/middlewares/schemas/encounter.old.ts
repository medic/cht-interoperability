import joi from 'joi';
import { ClassHistorySchema, CodeableConceptSchema, CodeableReferenceSchema, CodeSchema, CodingSchema, DateSchema, IdentifierSchema, IFHIRCodeableConcept, IFHIRCoding, IFHIRIdentifier, IFHIRPeriod, ParticipantSchema, PeriodSchema, ReferenceSchema } from './types';

export const createEncounterSchema = joi.object({
  patient_id: joi.string().required(),
});

const STATUS = ["planned", "in-progress", "on-hold", "discharged", "completed", "cancelled", "discontinued", "entered-in-error", "unknown"] as const;

export interface IFHIREncounter {
  identifier: IFHIRIdentifier[];
  status: typeof STATUS[number];
  class: IFHIRCodeableConcept,
}




export const EncounterSchema = joi.object({
  identifier: joi.array().items(IdentifierSchema),
  status: CodeSchema.valid(...STATUS).required(),
  statusHistory: StatusHistorySchema,
  class: CodingSchema.required(),
  classHistory: joi.array().items(ClassHistorySchema),
  type: joi.array().items(CodeableConceptSchema),
  serviceType: CodeableReferenceSchema,
  priority: CodeableConceptSchema,
  subject: ReferenceSchema,
  episodeOfCare: joi.array().items(ReferenceSchema),
  basedOn: joi.array().items(ReferenceSchema),
  participants: joi.array().items(ParticipantSchema),
  appointment: joi.array().items(ReferenceSchema),
  period: PeriodSchema,
  length: joi.string(),
  reasonCode: joi.array().items(CodeableConceptSchema),
  reasonReference: joi.array().items(ReferenceSchema),
  reason: joi.array().items(ReasonSchema),
  diagnosis: joi.array().items(DiagnosisSchema),
  account: joi.array().items(ReferenceSchema),
  hospitalization: HospitalizationSchema,
  location: joi.array().items(LocationSchema),
  serviceProvider: ReferenceSchema,
  partOf: ReferenceSchema,
});

