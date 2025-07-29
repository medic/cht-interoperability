import joi from 'joi';

export const VALID_SYSTEM =
  'http://terminology.hl7.org/CodeSystem/endpoint-connection-type';
export const VALID_CODE = 'hl7-fhir-rest';

const EndpointCodingSchema = joi.object({
  system: joi.string().valid(VALID_SYSTEM).required(),
  code: joi.string().valid(VALID_CODE).required(),
}).unknown(true);

export const EndpointSchema = joi.object({
  connectionType: EndpointCodingSchema.required(),
  identifier: joi.array().items(joi.object({
    system: joi.string().uri(),
    value: joi.string(),
  }).unknown(true)).min(1).required(),
}).unknown(true);


// --- General FHIR Data Type Schemas (Used within ClaimResponse) ---

const CodingSchema = joi.object({
  system: joi.string().uri(),
  version: joi.string(),
  code: joi.string(),
  display: joi.string(),
  userSelected: joi.boolean(),
}).unknown(true);

const CodeableConceptSchema = joi.object({
  coding: joi.array().items(CodingSchema),
  text: joi.string(),
}).unknown(true);

const ReferenceSchema = joi.object({
  reference: joi.string(),
  type: joi.string().uri(),
  identifier: joi.object({
    system: joi.string().uri(),
    value: joi.string(),
  }).unknown(true),
  display: joi.string(),
}).unknown(true);

const IdentifierSchema = joi.object({
  use: joi.string().valid('usual', 'official', 'temp', 'secondary', 'old'),
  type: CodeableConceptSchema,
  system: joi.string().uri(),
  value: joi.string(),
  period: joi.object({
    start: joi.string().isoDate(),
    end: joi.string().isoDate(),
  }).unknown(true),
  assigner: ReferenceSchema,
}).unknown(true);

const MoneySchema = joi.object({
  value: joi.number(),
  // ADJUSTMENT: Relaxed currency validation to allow symbols like "$"
  currency: joi.string(),
}).unknown(true);

const PeriodSchema = joi.object({
  start: joi.string().isoDate(),
  end: joi.string().isoDate(),
}).unknown(true);


// --- ClaimResponse Specific Nested Schemas ---

const ClaimResponseAdjudicationSchema = joi.object({
  category: CodeableConceptSchema.required(),
  reason: CodeableConceptSchema,
  amount: MoneySchema,
  value: joi.number(),
}).unknown(true);

const ClaimResponseItemSubDetailSchema = joi.object({
  subDetailSequence: joi.number().integer().min(1).required(),
  noteNumber: joi.array().items(joi.number().integer().min(1)),
  adjudication: joi.array().items(ClaimResponseAdjudicationSchema),
}).unknown(true);

const ClaimResponseItemDetailSchema = joi.object({
  detailSequence: joi.number().integer().min(1).required(),
  noteNumber: joi.array().items(joi.number().integer().min(1)),
  adjudication: joi.array().items(ClaimResponseAdjudicationSchema),
  subDetail: joi.array().items(ClaimResponseItemSubDetailSchema),
}).unknown(true);

const ClaimResponseItemSchema = joi.object({
  itemSequence: joi.number().integer().min(1).required(),
  noteNumber: joi.array().items(joi.number().integer().min(1)),
  adjudication: joi.array().items(ClaimResponseAdjudicationSchema).required(),
  detail: joi.array().items(ClaimResponseItemDetailSchema),
}).unknown(true);

const ClaimResponseAddItemSchema = joi.object({
  itemSequence: joi.array().items(joi.number().integer().min(1)),
  productOrService: CodeableConceptSchema.required(),
  modifier: joi.array().items(CodeableConceptSchema),
  programCode: joi.array().items(CodeableConceptSchema),
  servicedDate: joi.string().isoDate(),
  servicedPeriod: PeriodSchema,
  location: joi.alternatives().try(
    CodeableConceptSchema,
    ReferenceSchema
  ),
  quantity: joi.object({
    value: joi.number(),
    unit: joi.string(),
  }).unknown(true),
  unitPrice: MoneySchema,
  factor: joi.number(),
  net: MoneySchema,
  bodySite: CodeableConceptSchema,
  subSite: joi.array().items(CodeableConceptSchema),
  noteNumber: joi.array().items(joi.number().integer().min(1)),
  adjudication: joi.array().items(ClaimResponseAdjudicationSchema).required(),
}).unknown(true);

const ClaimResponseTotalSchema = joi.object({
  category: CodeableConceptSchema.required(),
  amount: MoneySchema.required(),
}).unknown(true);

const ClaimResponsePaymentSchema = joi.object({
  type: CodeableConceptSchema.required(),
  adjustment: MoneySchema,
  adjustmentReason: CodeableConceptSchema,
  date: joi.string().isoDate(),
  amount: MoneySchema.required(),
  identifier: IdentifierSchema,
}).unknown(true);

const ClaimResponseProcessNoteSchema = joi.object({
  number: joi.number().integer().min(1),
  type: CodingSchema,
  text: joi.string().required(),
  language: CodeableConceptSchema,
}).unknown(true);

const ClaimResponseInsuranceSchema = joi.object({
  sequence: joi.number().integer().min(1).required(),
  focal: joi.boolean().required(),
  coverage: ReferenceSchema.required(),
  businessArrangement: joi.string(),
  claimResponse: ReferenceSchema,
}).unknown(true);

const ClaimResponseErrorSchema = joi.object({
  itemSequence: joi.number().integer().min(1),
  detailSequence: joi.number().integer().min(1),
  subDetailSequence: joi.number().integer().min(1),
  code: CodeableConceptSchema.required(),
}).unknown(true);


// --- Main ClaimResponse Resource Schema ---
export const ClaimResponseSchema = joi.object({
  resourceType: joi.string().valid('ClaimResponse').required(),
  id: joi.string(),
  meta: joi.object({
    versionId: joi.string(),
    lastUpdated: joi.string().isoDate(),
    profile: joi.array().items(joi.string().uri()),
  }).unknown(true),
  implicitRules: joi.string().uri(),
  language: joi.string(),
  text: joi.object({
    status: joi.string().valid('generated', 'extensions', 'additional', 'empty'),
    div: joi.string(),
  }).unknown(true),
  contained: joi.array().items(joi.object()),
  extension: joi.array().items(joi.object()),
  modifierExtension: joi.array().items(joi.object()),

  identifier: joi.array().items(IdentifierSchema),
  status: joi.string().valid(
    'active', 'cancelled', 'draft', 'entered-in-error'
  ).required(),
  type: CodeableConceptSchema.required(),
  subType: CodeableConceptSchema,
  use: joi.string().valid(
    'claim', 'preauthorization', 'predetermination'
  ).required(),
  patient: ReferenceSchema.required(),
  created: joi.string().isoDate().required(),
  insurer: ReferenceSchema.required(),
  requestor: ReferenceSchema,
  request: ReferenceSchema,
  // ADJUSTMENT: Changed outcome to accept a string
  outcome: joi.string().required(),
  disposition: joi.string(),
  preAuthRef: joi.string(),
  preAuthPeriod: PeriodSchema,
  payeeType: CodeableConceptSchema,
  item: joi.array().items(ClaimResponseItemSchema),
  addItem: joi.array().items(ClaimResponseAddItemSchema),
  adjudication: joi.array().items(ClaimResponseAdjudicationSchema),
  total: joi.array().items(ClaimResponseTotalSchema),
  payment: ClaimResponsePaymentSchema,
  formCode: CodeableConceptSchema,
  processNote: joi.array().items(ClaimResponseProcessNoteSchema),
  communicationRequest: joi.array().items(ReferenceSchema),
  insurance: joi.array().items(ClaimResponseInsuranceSchema),
  error: joi.array().items(ClaimResponseErrorSchema),
}).unknown(true);
