import joi from 'joi';
import { CodeableConceptSchema, CodeableReferenceSchema, CodeSchema, DateSchema, IdentifierSchema, IFHIRCodeableConcept, IFHIRIdentifier, PeriodSchema, ReferenceSchema } from './types';

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
  class: joi.array().items(CodeableConceptSchema),
  priority: CodeableConceptSchema,
  type: joi.array().items(CodeableConceptSchema),
  serviceType: CodeableReferenceSchema,
  subject: ReferenceSchema,
  subjectStatus: CodeableConceptSchema,
  episodeOfCare: joi.array().items(ReferenceSchema),
  basedOn: joi.array().items(ReferenceSchema),
  careTeam: joi.array().items(ReferenceSchema),
  partOf: ReferenceSchema,
  serviceProvider: ReferenceSchema,
  participants: joi.array().items(ParticipantSchema),
  appointment: joi.array().items(ReferenceSchema),
  virtualService: joi.array().items(VirtualServiceDetailSchema),
  actualPeriod: PeriodSchema,
  plannedStartDate: DateSchema,
  plannedEndDate: DateSchema,
  length: DurationSchema,
  reason: joi.array().items(ReasonSchema),
  diagnosis: joi.array().items(DiagnosisSchema),
  account: joi.array().items(ReferenceSchema),
  dietPreference: joi.array().items(CodeableConceptSchema),
  specialArrangement: joi.array().items(CodeableConceptSchema),
  specialCourtesy: joi.array().items(CodeableConceptSchema),
  admission: joi.array().items(AdmissionSchema),
  location: joi.array().items(LocationSchema),
});

