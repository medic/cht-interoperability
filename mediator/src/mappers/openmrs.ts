import { randomUUID } from 'crypto';

interface OpenMRSIdentifier extends fhir4.Identifier {
  id: string //uuid
}

interface OpenMRSHumanName extends fhir4.HumanName {
  id: string //uuid
}

export const openMRSIdentifierType: fhir4.CodeableConcept = {
  text: 'OpenMRS Patient UUID'
}

const visitNoteType: fhir4.CodeableConcept = {
  text: "Visit Note",
  coding: [{
    system: "http://fhir.openmrs.org/code-system/encounter-type",
    code: "d7151f82-c1f3-4152-a605-2f9ea7414a79",
    display: "Visit Note"
  }]
}

const visitType: fhir4.CodeableConcept = {
  text: "Home Visit",
  coding: [{
    system: "http://fhir.openmrs.org/code-system/visit-type",
    code: "d66e9fe0-7d51-4801-a550-5d462ad1c944",
    display: "Home Visit",
  }]
}

/*
Build an OpenMRS Visit w/ Visit Note
From a fhir Encounter
One CHT encounter will become 2 OpenMRS Encounters
*/
export function buildOpenMRSVisit(fhirEncounter: fhir4.Encounter): fhir4.Encounter[] {
  const openMRSVisit = fhirEncounter;
  openMRSVisit.type = [visitType]
  //openMRSVisit.subject.reference = `Patient/${patient_id}`

  const visitRef: fhir4.Reference = {
	  reference: `Encounter/${openMRSVisit.id}`,
    type: "Encounter"
  };
  const openMRSVisitNote: fhir4.Encounter = {
    ...openMRSVisit,
    id: randomUUID(),
    type: [visitNoteType],
    partOf: visitRef
  }

  return [openMRSVisit, openMRSVisitNote];
}

/*
Build an observation that opnemrs will accept from a FHIR Observation
This means swapping refreneces, which may not be the same in both servers
*/
export function buildOpenMRSObservation(fhirObservation: fhir4.Observation, patientId: string, encounterId: string) : fhir4.Observation {
  if (fhirObservation.subject) { // to satisfy type checker, subject is not optional
    fhirObservation.subject.reference = `Patient/${patientId}`
  }
  if (fhirObservation.encounter) { // to satisfy type checker, encounter is not optional
    fhirObservation.encounter.reference = `Encounter/${encounterId}`
  }
  return fhirObservation;
}

/*
Build a patient that OpenMRS will accept from a FHIR Patient
The only difference is that name and identifiers need uuids
*/
export function buildOpenMRSPatient(fhirPatient: fhir4.Patient): fhir4.Patient {
  function addId(resource: any) {
    if ( resource.id ){
      return resource;
    } else {
      return { ...resource, id: randomUUID() };
    }
  }
  fhirPatient.name = fhirPatient.name?.map(addId);
  fhirPatient.identifier = fhirPatient.identifier?.map(addId);
  return fhirPatient;
}

