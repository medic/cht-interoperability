import {
  mockGetFHIRPatientResource,
  mockGetFHIROrgEndpointResource,
  mockCreateFHIRSubscriptionResource,
  mockCreateChtRecord,
  mockDeleteFhirSubscription,
} from './utils';
import { createServiceRequest } from '../service-request';
import { ServiceRequestFactory } from '../../middlewares/schemas/tests/utils';

jest.mock('axios');
jest.mock('../../../logger');

describe('ServiceRequest controllers', () => {
  const request: fhir4.ServiceRequest = ServiceRequestFactory.build();

  describe('createServiceRequest', () => {
    it('creates a new subscriptions resource on fhir and cht record', async () => {
      const recordRes = { status: 201, data: { success: true } };
      const patientRes = { status: 201, data: { resourceType: 'Patient' } };
      const endpointRes = { status: 201, data: { resourceType: 'Endpoint' } };
      const subscriptionRes = {
        status: 201,
        data: { resourceType: 'Subscription' },
      };

      mockGetFHIRPatientResource.mockResolvedValueOnce(patientRes as any);
      mockGetFHIROrgEndpointResource.mockResolvedValueOnce(endpointRes as any);
      mockCreateFHIRSubscriptionResource.mockResolvedValueOnce(
        subscriptionRes as any
      );
      mockCreateChtRecord.mockResolvedValueOnce(recordRes as any);
      mockDeleteFhirSubscription.mockResolvedValueOnce({} as any);

      const res = await createServiceRequest(request);

      expect(res.status).toBe(subscriptionRes.status);
      expect(res.data).toBe(subscriptionRes.data);
    });

    it('returns default status and data when not provided in error', async () => {
      const patientRes = { message: 'message' };

      mockGetFHIRPatientResource.mockRejectedValueOnce(patientRes);

      const res = await createServiceRequest(request);

      expect(res.status).toBe(500);
      expect(res.data.message).toBe(patientRes.message);
    });


    it('returns status and data of any axios error', async () => {
      const patientRes = { status: 200, data: { resourceType: 'Patient' } };

      mockGetFHIRPatientResource.mockRejectedValueOnce(patientRes);

      const res = await createServiceRequest(request);

      expect(res.status).toBe(patientRes.status);
      expect(res.data).toBe(patientRes.data);
    });

    it('deletes fhir subscription resource if cht record creation fails', async () => {
      const recordRes = { status: 200, data: { success: false } };
      const patientRes = { status: 200, data: { resourceType: 'Patient' } };
      const endpointRes = { status: 200, data: { resourceType: 'Endpoint' } };
      const subscriptionRes = {
        status: 201,
        data: { resourceType: 'Subscription' },
      };

      mockGetFHIRPatientResource.mockResolvedValueOnce(patientRes as any);
      mockGetFHIROrgEndpointResource.mockResolvedValueOnce(endpointRes as any);
      mockCreateFHIRSubscriptionResource.mockResolvedValueOnce(
        subscriptionRes as any
      );
      mockCreateChtRecord.mockResolvedValueOnce(recordRes as any);
      mockDeleteFhirSubscription.mockResolvedValueOnce({} as any);

      const res = await createServiceRequest(request);

      expect(res.status).toBe(500);
      expect(res.data.message).toMatchInlineSnapshot(
        `"Unable to create the follow up task"`
      );
    });
  });
});
