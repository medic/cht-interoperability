import { randomUUID } from 'crypto';

interface OpenMRSIdentifier extends fhir4.Identifier {
  id: string //uuid
}

interface OpenMRSHumanName extends fhir4.HumanName {
  id: string //uuid
}

const phoneIdentifierType: fhir4.CodeableConcept = {
  text: 'Phone Number'
}

const chtIdentifierType: fhir4.CodeableConcept = {
  text: 'CHT ID'
}

const medicIdentifierType: fhir4.CodeableConcept = {
  text: 'Medic ID'
}

const noteEncounterType: fhir4.CodeableConcept = {
  text: "Visit Note",
  coding: [{
    system: "http://fhir.openmrs.org/code-system/encounter-type",
    code: "d7151f82-c1f3-4152-a605-2f9ea7414a79",
    display: "Visit Note"
  }]
}

const chwEncounterType: fhir4.CodeableConcept = {
  text: "Community Health Worker Visit",
  coding: [{
    system: "http://fhir.openmrs.org/code-system/visit-type",
    code: "479a14c9-fd05-4399-8e3d-fed3f8c654c",
    display: "Community Health Worker Visit",
  }]
}

const homeEncounterType: fhir4.CodeableConcept = {
  text: "Home Visit",
  coding: [{
    system: "http://fhir.openmrs.org/code-system/visit-type",
    code: "d66e9fe0-7d51-4801-a550-5d462ad1c944",
    display: "Home Visit",
  }]
}

const homeHealthEncounterClass: fhir4.CodeableConcept = {
  text: 'HH',
  coding : [{
    system: "http://terminology.hl7.org/CodeSystem/v3-ActCode",
    code: "HH"
  }]
}

export function buildOpenMRSVisit(patient_id: string, reported_date: number) : fhir4.Encounter {
  const visit = buildOpenMRSEncounter(patient_id, reported_date, homeEncounterType);
  return visit;
}

export function buildOpenMRSVisitNote(patient_id: string, reported_date: number, visit_id: string): fhir4.Encounter {
  const visitNote = buildOpenMRSEncounter(patient_id, reported_date, noteEncounterType);
  const visitRef: fhir4.Reference = {
	  reference: `Encounter/${visit_id}`,
    type: "Encounter"
  };
  visitNote.partOf = visitRef;
  return visitNote;
}

export function buildOpenMRSEncounter(patient_id: string, reported_date: number, visitType: fhir4.CodeableConcept): fhir4.Encounter {
  const patientRef: fhir4.Reference = {
	  reference: `Patient/${patient_id}`,
    type: "Patient"
  };

  const openMRSEncounter: fhir4.Encounter = {
    resourceType: 'Encounter',
    id: randomUUID(),
    status: 'unknown',
    class: homeHealthEncounterClass,
    type: [visitType],
    subject: patientRef,
    period: {
      start: new Date(reported_date).toISOString(),
      end: new Date(reported_date + 1000*60*10).toISOString()
    }
  }

  return openMRSEncounter
}


export function buildOpenMRSObservation(patient_id: string, encounter_id: string, entry: any): fhir4.Observation {
  const patientRef: fhir4.Reference = {
	  reference: `Patient/${patient_id}`,
    type: "Patient"
  };

  const encounterRef: fhir4.Reference = {
	  reference: `Encounter/${encounter_id}`,
    type: "Encounter"
  };

  const observation: fhir4.Observation = {
    resourceType: "Observation",
    subject: patientRef,
    encounter: encounterRef,
    status: "final",
    code: {
      coding: [{
          code: entry.code,
      }],
    },
    effectiveDateTime: "2024-03-31T12:26:27+00:00",
    issued: "2024-03-31T12:26:28.000+00:00",
  };

  if ('valueCode' in entry){
    observation.valueCodeableConcept = {
      coding: [{
        code: entry['valueCode']
      }]
    };
  } else if ('valueDateTime' in entry){
    observation.valueDateTime = entry['valueDateTime'];
  } else if ('valueString' in entry){
    observation.valueString = entry['valueString'];
  }

  return observation;
}

export function buildOpenMRSPatient(chtPatient: Record<string, any>): fhir4.Patient {
  const nameParts = chtPatient.name.split(" ");
  const familyName = nameParts.pop() || "";
  const givenNames = nameParts;

  const name: OpenMRSHumanName = {
    family: familyName,
    given: givenNames,
    id: randomUUID(),
  };

  const phoneIdentifier: OpenMRSIdentifier = {
    id: randomUUID(),
    type: phoneIdentifierType,
    value: chtPatient.phone,
    use: 'usual'
  };

  const medicIdentifier: OpenMRSIdentifier = {
    id: randomUUID(),
    type: medicIdentifierType,
    value: chtPatient.patient_id,
    system: 'cht',
    use: 'official'
  };

  const chtIdentifier: OpenMRSIdentifier = {
    id: randomUUID(),
    type: chtIdentifierType,
    value: chtPatient._id,
    system: 'cht',
    use: 'official'
  };

  const patient: fhir4.Patient = {
    resourceType: 'Patient',
    name: [name],
    birthDate: chtPatient.birthDate,
    id: chtPatient._id,
    identifier: [phoneIdentifier, chtIdentifier, medicIdentifier],
    gender: chtPatient.gender
  };

  return patient;
}
