export function generateFHIREncounterResource(encounter: any) {
  const FHIREncounterResource = {
    resourceType: 'Encounter',
    identifier: [],
    status: 'finished',
    class: 'outpatient',
    subject: encounter.patient_id,
    period: {
      start: encounter.reported_date,
      end: encounter.reported_date
    },
    participant: {
      
    }
