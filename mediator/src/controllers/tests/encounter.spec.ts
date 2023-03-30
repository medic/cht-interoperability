import axios from 'axios';
import { createEncounter } from '../encounter';

describe('Encounter controller', () => {
  const encounterResource = {
    resourceType: 'Encounter',
    identifier: [
      {
        use: 'official',
        value: '123'
      }
    ],
    status: 'finished',
    class: 'outpatient',
    type: [
      { text: 'Community health worker visit' }
    ],
    subject: '123',
    participant: [
      {
        type: [
          { text: 'Community health worker' }
        ]
      }
    ]
  };
  jest.mock('axios');
  jest.mock(('../../utils/encounter'), () => ({
    generateFHIREncounterResource: jest.fn(() => encounterResource)
  }));
  it('should create an encounter in the FHIR server', async () => {
    const mockAxios = axios as jest.Mocked<typeof axios>;
    mockAxios.post = jest.fn().mockResolvedValue({ status: 201, data: { id: '123' } });
    const encounter = await createEncounter({ patient_id: '123' });
    expect(mockAxios.post).toHaveBeenCalled();
    expect(mockAxios.post.mock.calls[0][1]).toEqual(encounterResource);
    expect(encounter).toEqual({ status: 201, encounter: { id: '123' } });
  });

  it('should return an error if the FHIR server returns an error', async () => {
    const mockAxios = axios as jest.Mocked<typeof axios>;
    mockAxios.post = jest.fn().mockRejectedValue({ status: 400, data: { message: 'Bad request' } });
    const encounter = await createEncounter({ patient_id: '123' });
    expect(mockAxios.post).toHaveBeenCalled();
    expect(mockAxios.post.mock.calls[0][1]).toEqual(encounterResource);
    expect(encounter).toEqual({ status: 400, encounter: { message: 'Bad request' } });
  });
});
