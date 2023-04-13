import { createChtRecord } from "../../utils/cht";
import {
  getFHIROrgEndpointResource,
  getFHIRPatientResource,
  deleteFhirSubscription,
  createFHIRSubscriptionResource,
} from "../../utils/fhir";

jest.mock("../../utils/fhir");
jest.mock("../../utils/cht");

export const mockGetFHIROrgEndpointResource =
  getFHIROrgEndpointResource as jest.MockedFn<
    typeof getFHIROrgEndpointResource
  >;
export const mockGetFHIRPatientResource =
  getFHIRPatientResource as jest.MockedFn<typeof getFHIRPatientResource>;
export const mockDeleteFhirSubscription =
  deleteFhirSubscription as jest.MockedFn<typeof deleteFhirSubscription>;
export const mockCreateFHIRSubscriptionResource =
  createFHIRSubscriptionResource as jest.MockedFn<
    typeof createFHIRSubscriptionResource
  >;
export const mockCreateChtRecord = createChtRecord as jest.MockedFn<
  typeof createChtRecord
>;
