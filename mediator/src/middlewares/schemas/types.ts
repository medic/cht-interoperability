import joi from "joi";
import { VALID_GENDERS } from "../../utils/fhir";

export const DateSchema = joi
  .string()
  .regex(new RegExp("((?:19|20)dd)-(0?[1-9]|1[012])-([12][0-9]|3[01]|0?[1-9])"))
  .messages({
    "object.regex": "Invalid date expecting YYYY-MM-DD",
    "string.pattern.base": "Invalid date expecting YYYY-MM-DD",
  });

export const CodeSchema = joi.string().regex(new RegExp("[^s]+( [^s]+)*`"));

export interface IFHIRCoding {
  system?: string;
  version?: string;
  code?: string;
  display?: string;
  userSelected?: boolean;
}

export const CodingSchema = joi.object({
  system: joi.string().regex(new RegExp("S*")),
  version: joi.string(),
  code: CodeSchema,
  display: joi.string(),
  userSelected: joi.boolean(),
});

export interface IFHIRCodeableConcept {
  coding?: string;
  text?: string;
}

export const CodeableConceptSchema = joi.object({
  coding: CodingSchema,
  text: joi.string(),
});

export interface IFHIRPeriod {
  start?: string;
  end?: string;
}

export const PeriodSchema = joi.object({
  start: DateSchema,
  end: DateSchema,
});

export interface IFHIRIdentifier {
  user?: "usual" | "official" | "temp" | "secondary" | "old";
  type?: IFHIRCodeableConcept;
  system: string;
  value: string;
  period?: IFHIRPeriod;
  assigner?: string;
}

export const IdentifierSchema = joi.object({
  use: CodeSchema.valid("usual", "official", "temp", "secondary", "old"),
  type: CodeableConceptSchema,
  system: joi.string().required(),
  value: joi.string().required(),
  period: PeriodSchema,
  assigner: joi.string(),
});

export interface IFHIRHumanName {
  use?:
    | "usual"
    | "official"
    | "temp"
    | "nickname"
    | "anonymous"
    | "old"
    | "maiden";
  text?: string;
  family?: string;
  given?: string;
  prefix?: string;
  suffix?: string;
  period?: string;
}

export const HumanNameSchema = joi.object({
  use: CodeSchema.valid(
    "usual",
    "official",
    "temp",
    "nickname",
    "anonymous",
    "old",
    "maiden"
  ),
  text: joi.string(),
  family: joi.string(),
  given: joi.string(),
  prefix: joi.string(),
  suffix: joi.string(),
  period: joi.string(),
});

export interface IFHIRContactPoint {
  system?: "phone" | "fax" | "email" | "pager" | "url" | "sms" | "other";
  value?: string;
  use?: "home" | "work" | "temp" | "old" | "mobile";
  rank: number;
  period: IFHIRPeriod;
}

export const ContactPointSchema = joi.object({
  system: CodeSchema.valid(
    "phone",
    "fax",
    "email",
    "pager",
    "url",
    "sms",
    "other"
  ),
  value: joi.string(),
  use: CodeSchema.valid("home", "work", "temp", "old", "mobile"),
  rank: joi.number().positive(),
  period: PeriodSchema,
});

export interface IFHIRAddress {
  use?: "home" | "work" | "temp" | "old" | "billing";
  type?: "postal" | "physical" | "both";
  text?: string;
  line?: string;
  city?: string;
  district?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  period?: IFHIRPeriod;
}

export const AddressSchema = joi.object({
  use: CodeSchema.valid("home", "work", "temp", "old", "billing"),
  type: CodeSchema.valid("postal", "physical", "both"),
  text: joi.string(),
  line: joi.string(),
  city: joi.string(),
  district: joi.string(),
  state: joi.string(),
  postalCode: joi.string(),
  country: joi.string(),
  period: PeriodSchema,
});

export interface IFHIRAttachment {
  contentType: string;
  language: string;
  data?: string;
  url?: string;
  size?: number;
  hash?: string;
  title?: string;
  creation?: string;
  height?: number;
  width?: number;
  frames?: number;
  duration?: number;
  pages?: number;
}

export const AttachmentSchema = joi.object({
  contentType: CodeSchema.required(),
  language: CodeSchema.required(),
  data: CodeSchema.base64(),
  url: joi.string().uri(),
  size: joi.number().integer(),
  hash: joi.string().base64(),
  title: joi.string(),
  creation: DateSchema,
  height: joi.number().positive(),
  width: joi.number().positive(),
  frames: joi.number().positive(),
  duration: joi.number(),
  pages: joi.number().positive(),
});

export interface IFHIRReference {
  reference?: string;
  type?: string;
  identifier?: IFHIRIdentifier;
  display?: string;
}

export const ReferenceSchema = joi.object({
  reference: joi.string(),
  type: joi.string(),
  identifier: IdentifierSchema,
  display: joi.string(),
});

export interface IFHIRExtendedContactDetail {
  purpose?: IFHIRCodeableConcept;
  name?: IFHIRHumanName;
  telecom?: IFHIRContactPoint;
  address?: IFHIRAddress;
  organization?: IFHIRReference;
  period?: IFHIRPeriod;
}

export const ExtendedContactDetailSchema = joi.object({
  purpose: CodeableConceptSchema,
  name: joi.array().items(HumanNameSchema),
  telecom: joi.array().items(ContactPointSchema),
  address: AddressSchema,
  period: PeriodSchema,
});

export interface IFHIRQualification {
  identifier?: IFHIRIdentifier[];
  code: IFHIRCodeableConcept;
  period: IFHIRPeriod;
}

export const QualificationSchema = joi.object({
  identifier: joi.array().items(IdentifierSchema).min(1),
  code: CodeableConceptSchema,
  period: PeriodSchema,
});

export interface IFHIROrganization {
  identifier?: IFHIRIdentifier[];
  active?: boolean;
  type?: IFHIRCodeableConcept[];
  name?: string;
  alias?: string[];
  description?: string[];
  contact?: IFHIRExtendedContactDetail[];
  partOf?: IFHIRReference;
  endpoint?: IFHIRReference;
  qualification?: IFHIRQualification;
}

export const OrganizationSchema = joi.object({
  identifier: joi.array().items(IdentifierSchema),
  active: joi.boolean(),
  type: joi.array().items(CodeableConceptSchema),
  name: joi.string(),
  alias: joi.array().items(joi.string()),
  description: joi.string(),
  contact: ExtendedContactDetailSchema,
});

export interface IFHIRContact {
  relationship: IFHIRCodeableConcept[];
  name: IFHIRHumanName[];
  telecom: IFHIRContactPoint[];
  address: IFHIRAddress[];
  gender: typeof VALID_GENDERS[number];
  organization: IFHIRReference;
  period: IFHIRPeriod;
}

export const ContactSchema = joi.object({
  relationship: joi.array().items(CodeableConceptSchema),
  name: joi.array().items(HumanNameSchema),
  telecom: joi.array().items(ContactPointSchema),
  address: joi.array().items(AddressSchema),
  gender: joi
    .string()
    .valid(...VALID_GENDERS)
    .required(),
  organization: ReferenceSchema,
  period: PeriodSchema,
});

export interface IFHIRLink {
  other: IFHIRReference;
  type: "replaced-by" | "replices" | "refer" | "seealso";
}

export const LinkSchema = joi.object({
  other: ReferenceSchema,
  type: CodeSchema.valid("replaced-by", "replices", "refer", "seealso"),
});

export interface IFHIRCommunication {
  language: IFHIRCodeableConcept;
  preferred: boolean;
}

export const CommunicationSchema = joi.object({
  language: CodeableConceptSchema.required(),
  preferred: joi.boolean(),
});

export interface IFHIRCodeableReference {
  concept: IFHIRCodeableConcept,
  reference: IFHIRReference,
}

export const CodeableReferenceSchema = joi.object({
  concept: CodeableConceptSchema,
  reference: ReferenceSchema,
})

export interface IFHIRClassHistory {
  class: IFHIRCoding,
  period: IFHIRPeriod,
}

export const ClassHistorySchema = joi.object({
  class: CodingSchema.valid("inpatient", "outpatient", "ambulatory", "emergency"),
  period: PeriodSchema,
});

export interface IFHIRParticipant {
  type: IFHIRCodeableConcept,
  period: IFHIRPeriod,
  individual: IFHIRReference,
}

export const ParticipantSchema = joi.object({
  type: CodeableConceptSchema,
  period: PeriodSchema,
  individual: ReferenceSchema,
});


interface IFHIRStatusHistory {
  status: typeof STATUS[number],
  period: IFHIRPeriod,
}

const StatusHistorySchema = joi.object({
  status: joi.array().items(CodeSchema.valid(...STATUS)).required(),
  period: PeriodSchema.required(),
})

