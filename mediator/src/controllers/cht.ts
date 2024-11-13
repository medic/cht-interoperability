import {
  addId,
  createFhirResource,
  getFhirResourceByIdentifier,
  getFHIRPatientResource,
  replaceReference,
  updateFhirResource
} from '../utils/fhir';
import {
  buildFhirObservationFromCht,
  buildFhirEncounterFromCht,
  buildFhirPatientFromCht,
  chtPatientIdentifierType,
  chtDocumentIdentifierType
} from '../mappers/cht';
import { getPatientUUIDFromSourceId } from '../utils/cht';

export async function createPatient(chtPatientDoc: any) {
  // hack for sms forms: if source_id but not _id,
  // first get patient id from source
  if (chtPatientDoc.doc.source_id){
    chtPatientDoc.doc._id = await getPatientUUIDFromSourceId(chtPatientDoc.source_id);
  }

  //check if patient already exists
  const patient = await getFhirResourceByIdentifier(chtPatientDoc.doc.patient_id, 'Patient');
  if (patient?.data?.total > 0){
    return { status: 200, data: { message: `Patient with the same patient_id already exists`} };
  }

  const fhirPatient = buildFhirPatientFromCht(chtPatientDoc.doc);
  return updateFhirResource({ ...fhirPatient, resourceType: 'Patient' });
}

export async function updatePatientIds(chtFormDoc: any) {
  // first, get the existing patient from fhir server
  const response = await getFHIRPatientResource(chtFormDoc.doc.external_id);

  if (response.status != 200) {
    return { status: 500, data: { message: `FHIR responded with ${response.status}`} };
  } else if (response.data.total == 0){
    // in case the patient is not found, return 200 to prevent retries
    return { status: 200, data: { message: `Patient not found`} };
  }

  const fhirPatient = response.data.entry[0].resource;
  addId(fhirPatient, chtPatientIdentifierType, chtFormDoc.doc.patient_id);

  // now, we need to get the actual patient doc from cht...
  const patient_uuid = await getPatientUUIDFromSourceId(chtFormDoc.doc._id);
  if (patient_uuid){
    addId(fhirPatient, chtDocumentIdentifierType, patient_uuid);
    return updateFhirResource({ ...fhirPatient, resourceType: 'Patient' });
  } else {
    // in case the patient is not found, return 200 to prevent retries
    return { status: 200, data: { message: `Patient not found`} };
  }
}

export async function createEncounter(chtReport: any) {
  const fhirEncounter = buildFhirEncounterFromCht(chtReport);

  const patientResponse = await getFHIRPatientResource(chtReport.patient_uuid);
  if (patientResponse.status != 200){
    // any error, just return it to caller
    return patientResponse;
  } else if (patientResponse.data.total == 0) {
    // in case the patient is not found, return 200 to prevent retries
    return { status: 200, data: { message: `Patient not found`} };
  }

  const patient = patientResponse.data.entry[0].resource as fhir4.Patient;
  replaceReference(fhirEncounter, 'subject', patient);
  const response = await updateFhirResource(fhirEncounter);

  if (response.status != 200 && response.status != 201){
    // in case of an error from fhir server, return it to caller
    return response;
  }

  for (const entry of chtReport.observations) {
    const observation = buildFhirObservationFromCht(chtReport.patient_uuid, fhirEncounter, entry);
    createFhirResource(observation);
  }

  return { status: 200, data: {} };
}
