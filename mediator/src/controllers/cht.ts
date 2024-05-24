import {
  createFhirResource,
  updateFhirResource,
  getFHIRPatientResource,
  addId
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

  const fhirPatient = buildFhirPatientFromCht(chtPatientDoc.doc);
  // create or update in the FHIR Server
  // note that either way, its a PUT with the id from the patient doc
  return updateFhirResource({ ...fhirPatient, resourceType: 'Patient' });
}

export async function updatePatientIds(chtFormDoc: any) {
  // first, get the existing patient from fhir server
  const response = await getFHIRPatientResource(chtFormDoc.openmrs_patient_uuid);

  if (response.status != 200) {
    return { status: 500, data: { message: `FHIR responded with ${response.status}`} };
  } else if (response.data.total == 0){
    return { status: 404, data: { message: `Patient not found`} };
  }

  const fhirPatient = response.data.entry[0].resource;
  addId(fhirPatient, chtPatientIdentifierType, chtFormDoc.patient_id);

  // now, we need to get the actual patient doc from cht...
  const patient_uuid = await getPatientUUIDFromSourceId(chtFormDoc._id);
  addId(fhirPatient, chtDocumentIdentifierType, patient_uuid);

  return updateFhirResource({ ...fhirPatient, resourceType: 'Patient' });
}

export async function createEncounter(chtReport: any) {
  const fhirEncounter = buildFhirEncounterFromCht(chtReport);

  const bundle: fhir4.Bundle = {
    resourceType: 'Bundle',
    type: 'collection',
    entry: [fhirEncounter]
  }

  for (const entry of chtReport.observations) {
    if (entry.valueCode || entry.valueString || entry.valueDateTime) {
      const observation = buildFhirObservationFromCht(chtReport.patient_uuid, fhirEncounter, entry);
      bundle.entry?.push(observation);
    }
  }
  return createFhirResource(bundle);
}
