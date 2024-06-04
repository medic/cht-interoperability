import { getIdType, copyIdToNamedIdentifier } from '../utils/fhir';
import { openMRSIdentifierType } from './openmrs';

export const chtDocumentIdentifierType: fhir4.CodeableConcept = {
  text: 'CHT Document ID'
}

export const chtPatientIdentifierType: fhir4.CodeableConcept = {
  text: 'CHT Patient ID'
}

const chwVisitType: fhir4.CodeableConcept = {
  text: "Communtiy Health Worker Visit",
}

const homeHealthEncounterClass: fhir4.CodeableConcept = {
  text: 'HH',
  coding : [{
    system: "http://terminology.hl7.org/CodeSystem/v3-ActCode",
    code: "HH"
  }]
}

export function buildChtPatientFromFhir(fhirPatient: fhir4.Patient): any {
  const name = fhirPatient.name?.[0];
  const given = name?.given ? name?.given : '';

  const tc = fhirPatient.telecom?.[0];

  const now = new Date().getTime();
  const birthDate = Date.parse(fhirPatient.birthDate || '');
  const age_in_days = Math.floor((now - birthDate) / (1000 * 60 * 60 * 24));

  const updateObject = {
    patient_name: `${given} ${name?.family}`,
    phone_number: tc?.value,
    sex: fhirPatient.gender,
    age_in_days: age_in_days,
    external_id: fhirPatient.id
  };

  return updateObject;
}

export function buildFhirPatientFromCht(chtPatient: any): fhir4.Patient {
  const nameParts = chtPatient.name.split(" ");
  const familyName = nameParts.pop() || "";
  const givenNames = nameParts;

  const name: fhir4.HumanName = {
    family: familyName,
    given: givenNames,
  };

  const chtPatientId: fhir4.Identifier = {
    type: chtPatientIdentifierType,
    value: chtPatient.patient_id,
    use: 'official'
  };

  const phone: fhir4.ContactPoint = {
    value: chtPatient.phone
  };

  const patient: fhir4.Patient = {
    resourceType: 'Patient',
    name: [name],
    birthDate: chtPatient.date_of_birth,
    id: chtPatient._id,
    identifier: [chtPatientId],
    gender: chtPatient.sex,
    telecom: [phone]
  };

  copyIdToNamedIdentifier(patient, patient, chtDocumentIdentifierType);

  return patient;
}

export function buildFhirEncounterFromCht(chtReport: any): fhir4.Encounter {
  const patientRef: fhir4.Reference = {
	  reference: `Patient/${chtReport.patient_uuid}`,
    type: "Patient"
  };

  const encounter: fhir4.Encounter = {
    resourceType: 'Encounter',
    id: chtReport.id,
    status: 'unknown',
    type: [chwVisitType],
    class:  homeHealthEncounterClass,
    subject: patientRef,
    period: {
      start: new Date(chtReport.reported_date).toISOString(),
      end: new Date(chtReport.reported_date + 1000*60*10).toISOString()
    }
  }

  copyIdToNamedIdentifier(encounter, encounter, chtDocumentIdentifierType);

  return encounter
}

export function buildFhirObservationFromCht(patient_id: string, encounter: fhir4.Encounter, entry: any): fhir4.Observation {
  const patientRef: fhir4.Reference = {
	  reference: `Patient/${patient_id}`,
    type: "Patient"
  };

  const encounterRef: fhir4.Reference = {
	  reference: `Encounter/${encounter.id}`,
    type: "Encounter"
  };

  const now = new Date().toISOString();

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
    effectiveDateTime: encounter.period?.start,
    issued: now
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

export function buildChtRecordFromObservations(patient: fhir4.Patient, observations: fhir4.Observation[]) {
  const patientId = getIdType(patient, chtDocumentIdentifierType);

  const record: any = {
    _meta: {
      form: "openmrs_anc"
    },
    patient_id: patientId
  }

  observations.forEach((observation: fhir4.Observation) => {
    if ( observation?.code?.coding && observation.code.coding.length > 0){
      const code = observation.code.coding[0].code?.toLowerCase() || '';
      if (observation.valueCodeableConcept) {
        record[code] = observation.valueCodeableConcept.text;
      } else if (observation.valueDateTime) {
        record[code] = observation.valueDateTime.split('T')[0];
      }
    }
  });

  return record;
}
