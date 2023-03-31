import { generateFHIREncounterResource } from '../encounter';

describe('Encounter utils', () => {
  it('should generate a FHIR encounter resource', () => {
    const encounter = {
      patient_id: '123'
    };
    const FHIRResource = generateFHIREncounterResource(encounter);
    expect(FHIRResource).toEqual({
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
    });
  });
});
