import { CHTEncounterDoc } from '../controllers/encounter';

export function generateFHIREncounterResource(encounter: CHTEncounterDoc) {
  const FHIREncounterResource = {
    resourceType: 'Encounter',
    identifier: [
      {
        use: 'official',
        value: encounter.patient_id
      }
    ],
    status: 'finished',
    class: 'outpatient',
    type: [
      { text: 'Community health worker visit' }
    ],
    subject: encounter.patient_id,
    participant: [
      {
        type: [
          { text: 'Community health worker' }
        ]
      }
    ]
  };

  return FHIREncounterResource;
}
