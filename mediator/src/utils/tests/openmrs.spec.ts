import axios from 'axios';
import { createOpenMRSResource, updateOpenMRSResource, getOpenMRSResourcesSince } from '../openmrs';
import { logger } from '../../../logger';
import { OPENMRS } from '../../../config';

jest.mock('axios');
jest.mock('../../../logger');

describe('OpenMRS utility functions', () => {
  const mockAxiosGet = axios.get as jest.Mock;
  const mockAxiosPost = axios.post as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createOpenMRSResource', () => {
    it('should create a new OpenMRS resource', async () => {
      const mockResource = { id: '456', resourceType: 'Patient' };
      const mockResponse = { status: 201, data: mockResource };
      mockAxiosPost.mockResolvedValue(mockResponse);

      const result = await createOpenMRSResource(mockResource);

      expect(mockAxiosPost).toHaveBeenCalledWith(
        `${OPENMRS.url}/Patient`,
        mockResource,
        expect.anything() // axiosOptions
      );
      expect(result).toEqual({ status: 201, data: mockResource });
    });

    it('should handle errors when creating a resource', async () => {
      const mockResource = { id: '456', resourceType: 'Patient' };
      const mockError = {
        response: { status: 500, data: 'Internal Server Error' }
      };
      mockAxiosPost.mockRejectedValue(mockError);

      const result = await createOpenMRSResource(mockResource);

      expect(logger.error).toHaveBeenCalledWith(mockError);
      expect(result).toEqual({
        status: mockError.response.status,
        data: mockError.response.data
      });
    });
  });

  describe('updateOpenMRSResource', () => {
    it('should update an existing OpenMRS resource', async () => {
      const mockResource = { id: '456', resourceType: 'Patient' };
      const mockResponse = { status: 200, data: mockResource };
      mockAxiosPost.mockResolvedValue(mockResponse);

      const result = await updateOpenMRSResource(mockResource);

      expect(mockAxiosPost).toHaveBeenCalledWith(
        `${OPENMRS.url}/Patient/456`,
        mockResource,
        expect.anything() // axiosOptions
      );
      expect(result).toEqual({ status: 200, data: mockResource });
    });

    it('should handle errors when updating a resource', async () => {
      const mockResource = { id: '456', resourceType: 'Patient' };
      const mockError = {
        response: { status: 500, data: 'Internal Server Error' }
      };
      mockAxiosPost.mockRejectedValue(mockError);

      const result = await updateOpenMRSResource(mockResource);

      expect(logger.error).toHaveBeenCalledWith(mockError);
      expect(result).toEqual({
        status: mockError.response.status,
        data: mockError.response.data
      });
    });
  });
});
