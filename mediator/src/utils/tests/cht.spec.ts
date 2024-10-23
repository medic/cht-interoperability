import {
  createChtFollowUpRecord,
  generateChtRecordsApiUrl,
  getLocationFromOpenMRSPatient,
  queryCht } from '../cht';
import axios from 'axios';
import { logger } from '../../../logger';
import { OpenMRSPatientFactory } from '../../middlewares/schemas/tests/openmrs-resource-factories';
import { mockQueryCht } from '../../controllers/tests/utils';

jest.mock('axios');
jest.mock('../../../logger');

const mockAxios = axios as jest.Mocked<typeof axios>;

describe('CHT Utils', () => {
  describe('createChtFollowUpRecord', () => {
    it('creates a new cht record', async () => {
      const patientId = 'PATIENT_ID';

      const data = { status: 201, data: {} };
      mockAxios.post.mockResolvedValueOnce(data);

      const res = await createChtFollowUpRecord(patientId);

      expect(res.status).toBe(data.status);
      expect(res.data).toStrictEqual(data.data);
      expect(mockAxios.post.mock.calls[0][0]).toContain('/api/v2/records');

      const record: any = mockAxios.post.mock.calls[0][1];
      expect(record.patient_uuid).toBe(patientId);
    });
  });

  describe('generateChtRecordsApiUrl', () => {
    it('generates a new cht record url', () => {
      const url = 'https://cht:8000';
      const username = 'username';
      const password = 'password';
      const res = generateChtRecordsApiUrl(url, username, password);

      expect(res).toContain('cht');
      expect(res).toContain('8000');
      expect(res).toContain(`${username}:${password}`);
    });
  });

  describe('getLocationFromOpenMRSPatient', () => {
    it('should return place ID if address contains place ID', async () => {
      const fhirPatient = OpenMRSPatientFactory.build({}, {
        addressKey: 'address4',
        addressValue: 'FCHV Area [12345]'
      });

      const result = await getLocationFromOpenMRSPatient(fhirPatient as any);

      expect(result).toBe('12345');
    });

    it('should return an empty string if no address or place ID is found', async () => {
      const fhirPatient = OpenMRSPatientFactory.build({}, {
        addressKey: 'address4',
        addressValue: 'Unknown Area'
      });

      mockQueryCht.mockResolvedValue({ status: 200, data: { docs: [] } }); // Simulating no result from the query

      const result = await getLocationFromOpenMRSPatient(fhirPatient as any);

      expect(result).toBe('');
    });

    it('should return address5 if address4 is not available', async () => {
      const fhirPatient = OpenMRSPatientFactory.build({}, {
        addressKey: 'address5',
        addressValue: 'Health Center [54321]'
      });

      const result = await getLocationFromOpenMRSPatient(fhirPatient as any);

      expect(result).toBe('54321');
    });

    it('should handle error cases by returning an empty string when query fails', async () => {
      const fhirPatient = OpenMRSPatientFactory.build({}, {
        addressKey: 'address4',
        addressValue: 'Unknown Location'
      });

      mockQueryCht.mockRejectedValue(new Error('Database query failed'));

      const result = await getLocationFromOpenMRSPatient(fhirPatient as any);

      expect(result).toBe('');
    });
  });

  describe('queryCHT', () => {
    it('should return data when the query is successful', async () => {
      const mockQuery = { selector: { type: 'contact' } };
      const mockResponse = { status: 200, data: { docs: [{ place_id: '12345' }] } };

      mockAxios.post.mockResolvedValue(mockResponse); // Simulate a successful response

      const result = await queryCht(mockQuery);

      expect(mockAxios.post).toHaveBeenCalledWith(expect.stringContaining('_find'), mockQuery, expect.anything());
      expect(result).toEqual(mockResponse);
    });

    it('should log an error and return error.response.data when the query fails', async () => {
      const mockQuery = { selector: { type: 'contact' } };
      const mockError = {
        response: { status: 500, data: 'Internal Server Error' }
      }

      mockAxios.post.mockRejectedValue(mockError); // Simulate an error response
      const loggerErrorSpy = jest.spyOn(logger, 'error'); // Spy on the logger's error method

      const result = await queryCht(mockQuery);

      expect(loggerErrorSpy).toHaveBeenCalledWith(mockError);
      expect(result).toEqual({
        status: mockError.response.status,
        data: mockError.response.data
      });
    });
  });
});
