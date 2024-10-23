import { logger } from '../../../logger';
import {
	EncounterFactory,
	PatientFactory
} from '../../middlewares/schemas/tests/fhir-resource-factories';
import {
  createFHIRSubscriptionResource,
  createFhirResource,
  deleteFhirSubscription,
  generateFHIRSubscriptionResource,
  getFHIROrgEndpointResource,
  getFHIRPatientResource,
  getFhirResourcesSince,
  addId
} from '../fhir';
import axios from 'axios';
import { FHIR } from '../../../config';

jest.mock('axios');
jest.mock('../../../logger');

const mockAxios = axios as jest.Mocked<typeof axios>;

describe('FHIR Utils', () => {
  describe('generateFHIRSubscriptionResource', () => {
    const patientId = 'PATIENT_ID';
    const callbackUrl = 'CALLBACK_URL';

    it('generates a subscription resource when passed valid \'patientId\' and \'callbackUrl\'', () => {
      const resource = generateFHIRSubscriptionResource(patientId, callbackUrl);

      expect(resource).toEqual({
        resourceType: 'Subscription',
        id: patientId,
        status: 'requested',
        reason: 'Follow up request for patient',
        criteria: `Encounter?identifier=${patientId}`,
        channel: {
          type: 'rest-hook',
          endpoint: callbackUrl,
          payload: 'application/fhir+json',
          header: ['Content-Type: application/fhir+json'],
        },
      });
    });

    it('doesn\'t generate subscription when given an invalid \'patientId\'', () => {
      expect(() =>
        generateFHIRSubscriptionResource(undefined as any, callbackUrl)
      ).toThrowErrorMatchingInlineSnapshot(
        `"Invalid patient id was expecting type of 'string' or 'number' but received 'undefined'"`
      );
    });

    it('doesn\'t generate subscription when given an invalid \'callbackUrl\'', () => {
      expect(() =>
        generateFHIRSubscriptionResource(patientId, undefined as any)
      ).toThrowErrorMatchingInlineSnapshot(
        `"Invalid 'callbackUrl' was expecting type of 'string' but recieved 'undefined'"`
      );
    });
  });

  describe('createFHIRSubscriptionResource', () => {
    it('generates a fhir resource with the \'callbackUrl\' and \'patientId\'', async () => {
      const patientId = 'patientId';
      const callbackUrl = 'callbackUrl';
      const mockRes = { status: 200, data: {} };

      mockAxios.post.mockResolvedValueOnce(mockRes);

      const res = await createFHIRSubscriptionResource(patientId, callbackUrl);

      const postData: any = mockAxios.post.mock.calls[0][1];

      expect(res.status).toBe(mockRes.status);
      expect(res.data).toBe(mockRes.data);
      expect(postData.id).toBe(patientId);
      expect(postData.criteria).toContain(patientId);
      expect(postData.channel.endpoint).toBe(callbackUrl);
      expect(mockAxios.post).toHaveBeenCalledTimes(1);
    });
  });

  describe('getFHIROrganizationResource', () => {
    const mockOrg = {
      entry: [
        {
          resource: {
            endpoint: [{ reference: 'Endpoint/value' }],
          },
        },
      ],
    };

    it('retrieves the fhir organization endpoint resource when given valid orgId', async () => {
      const id = 'orgId';
      const mockRes = { status: 200, data: {} };

      mockAxios.get.mockResolvedValueOnce({ ...mockRes, data: mockOrg });
      mockAxios.get.mockResolvedValueOnce(mockRes);

      const res = await getFHIROrgEndpointResource(id);

      const endpointId =
        mockOrg.entry[0].resource.endpoint[0].reference.replace(
          'Endpoint/',
          ''
        );
      expect(res.status).toBe(mockRes.status);
      expect(res.data).toBe(mockRes.data);
      expect(mockAxios.get.mock.calls[0][0]).toContain(id);
      expect(mockAxios.get.mock.calls[1][0]).toContain(endpointId);
      expect(mockAxios.get).toHaveBeenCalledTimes(2);
    });

    it('doesn\'t retrieve the fhir organization with not found', async () => {
      const id = 'orgId';
      const mockRes = { status: 200, data: {} };

      mockAxios.get.mockResolvedValueOnce({
        ...mockRes,
        data: {
          entry: [{ resource: {} }],
        },
      });

      expect(getFHIROrgEndpointResource(id)).rejects.toMatchInlineSnapshot(
        `[Error: Organization has no endpoint attached]`
      );

      mockAxios.get.mockResolvedValueOnce({
        ...mockRes,
        data: {
          entry: [{ resource: { endpoint: [] } }],
        },
      });

      expect(getFHIROrgEndpointResource(id)).rejects.toMatchInlineSnapshot(
        `[Error: Organization has no endpoint attached]`
      );

      mockAxios.get.mockResolvedValueOnce({
        ...mockRes,
        data: {
          entry: [],
        },
      });

      expect(getFHIROrgEndpointResource(id)).rejects.toMatchInlineSnapshot(
        `[Error: Organization not found]`
      );

      mockAxios.get.mockResolvedValueOnce({
        ...mockRes,
        data: {},
      });

      expect(getFHIROrgEndpointResource(id)).rejects.toMatchInlineSnapshot(
        `[Error: Organization not found]`
      );
    });
  });

  describe('getFHIRPatientResource', () => {
    it('retreives a fhir patient resource', async () => {
      const patientId = 'patientId';
      mockAxios.get.mockResolvedValue({ status: 200, data: {} });

      const res = await getFHIRPatientResource(patientId);

      expect(res.data).toStrictEqual({});
      expect(res.status).toBe(200);
    });
  });

  describe('deleteFhirSubscription', () => {
    it('retreives a fhir subscription resource', async () => {
      const subId = 'subId';
      mockAxios.delete.mockResolvedValue({ status: 200, data: {} });

      const res = await deleteFhirSubscription(subId);

      expect(mockAxios.delete.mock.calls[0][0]).toContain(subId);
      expect(res.data).toStrictEqual({});
      expect(res.status).toBe(200);
    });
  });

  describe('createFhirResource', () => {
    const encounter: fhir4.Resource = EncounterFactory.build();
    const resourceType = 'Encounter';

    it('should make a call to the appropraite fhir endpoint', async () => {
      const data = { status: 201, data: { id: '123' } };

      mockAxios.post = jest.fn().mockResolvedValue(data);

      const res = await createFhirResource({...encounter, resourceType});

      expect(mockAxios.post).toHaveBeenCalled();
      expect(mockAxios.post.mock.calls[0][0]).toContain(resourceType);
      expect(mockAxios.post.mock.calls[0][1]).toEqual({...encounter, resourceType});
      expect(res.status).toEqual(data.status);
      expect(res.data).toEqual(data.data);
      expect(logger.error).not.toBeCalled();
    });

    it('should return an error if the FHIR server returns an error', async () => {
      const data = {
        response: { status: 400, data: { message: 'Bad request' } }
      };

      mockAxios.post = jest.fn().mockRejectedValue(data);

      const res = await createFhirResource({...encounter, resourceType});

      expect(mockAxios.post).toHaveBeenCalled();
      expect(mockAxios.post.mock.calls[0][0]).toContain(resourceType);
      expect(mockAxios.post.mock.calls[0][1]).toEqual({...encounter, resourceType});
      expect(res.status).toEqual(400);
      expect(res.data).toEqual(data.response.data);
      expect(logger.error).toBeCalledTimes(1);
    });
  });

  describe('addIds', () => {
    it('should add ids to a fhir patient', () => {
      const patient = PatientFactory.build();
      const idType = { coding: [{ code: 'OpenMRS ID' }] };
      const value = '12345';

      const result = addId(patient, idType, value);

      expect(result.identifier).toBeDefined();
      // patient has one idenditifer already, so afterwards, should be 2
      expect(result.identifier?.length).toBe(2);
      // and the one we are checking is the second one
      expect(result.identifier?.[1]).toEqual({
        type: idType,
        value: value
      });
    });
  });

  describe('getFhirResourcesSince', () => {
    it('should fetch FHIR resources successfully', async () => {
      const lastUpdated = new Date('2023-01-01T00:00:00Z');
      const resourceType = 'Patient';
      const mockResponse = {
        data: {
          entry: [
            { resource: { id: '123', resourceType: 'Patient' } }
          ],
          link: []
        }
      };
      mockAxios.get.mockResolvedValue(mockResponse);

      const result = await getFhirResourcesSince(lastUpdated, resourceType);

      expect(mockAxios.get).toHaveBeenCalledWith(
        `${FHIR.url}/Patient/?_lastUpdated=gt2023-01-01T00:00:00.000Z`,
        expect.anything() // axiosOptions
      );
      expect(result.status).toBe(200);
      expect(result.data).toEqual([{ id: '123', resourceType: 'Patient' }]);
    });

    it('should include related resources for encounters', async () => {
      const lastUpdated = new Date('2023-01-01T00:00:00Z');
      const resourceType = 'Encounter';
      const mockResponse = {
        data: {
          entry: [
            { resource: { id: 'enc-123', resourceType: 'Encounter' } }
          ],
          link: []
        }
      };
      mockAxios.get.mockResolvedValue(mockResponse);

      const result = await getFhirResourcesSince(lastUpdated, resourceType);

      expect(mockAxios.get).toHaveBeenCalledWith(
        `${FHIR.url}/Encounter/?_lastUpdated=gt2023-01-01T00:00:00.000Z&_revinclude=Observation:encounter&_include=Encounter:patient`,
        expect.anything() // axiosOptions
      );
      expect(result.status).toBe(200);
      expect(result.data).toEqual([{ id: 'enc-123', resourceType: 'Encounter' }]);
    });

    it('should handle pagination', async () => {
      const lastUpdated = new Date('2023-01-01T00:00:00Z');
      const resourceType = 'Patient';
      const mockFirstPageResponse = {
        data: {
          entry: [
            { resource: { id: '123', resourceType: 'Patient' } }
          ],
          link: [
            { relation: 'next', url: `${FHIR.url}/Patient/?page=2` }
          ]
        }
      };
      const mockSecondPageResponse = {
        data: {
          entry: [
            { resource: { id: '124', resourceType: 'Patient' } }
          ],
          link: []
        }
      };
      mockAxios.get
      .mockResolvedValueOnce(mockFirstPageResponse)
      .mockResolvedValueOnce(mockSecondPageResponse);

      const result = await getFhirResourcesSince(lastUpdated, resourceType);

      expect(mockAxios.get).toHaveBeenCalledTimes(2);
      expect(result.status).toBe(200);
      expect(result.data).toEqual([
        { id: '123', resourceType: 'Patient' },
        { id: '124', resourceType: 'Patient' }
      ]);
    });

    it('should return an error if the request fails', async () => {
      const lastUpdated = new Date('2023-01-01T00:00:00Z');
      const resourceType = 'Patient';
      const mockError = {
        response: {
          status: 500,
          data: 'Internal Server Error'
        }
      };
      mockAxios.get.mockRejectedValue(mockError);

      const result = await getFhirResourcesSince(lastUpdated, resourceType);

      expect(logger.error).toHaveBeenCalledWith(mockError);
      expect(result.status).toBe(500);
      expect(result.data).toBe('Internal Server Error');
    });
  });
});
