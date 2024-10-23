import { createChtFollowUpRecord } from '../../utils/cht';
import {
  getFHIROrgEndpointResource,
  getFHIRPatientResource,
  deleteFhirSubscription,
  createFHIRSubscriptionResource,
} from '../../utils/fhir';
import { queryCht } from '../../utils/cht';

jest.mock('../../utils/fhir');
jest.mock('../../utils/cht');

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
export const mockCreateChtRecord = createChtFollowUpRecord as jest.MockedFn<
  typeof createChtFollowUpRecord
>;
export const mockQueryCht = queryCht as jest.MockedFn<
  typeof queryCht
>;
