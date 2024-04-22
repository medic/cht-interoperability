import { Router } from 'express';
import { createFhirResource, updateFhirResource, getFHIRPatientResource } from '../utils/fhir';
import { copyIdToNamedIdentifier, getIdType, addId } from '../utils/fhir';
import { buildChtPatientFromFhir, getPatientUUIDFromSourceId } from '../utils/cht';
import { medicIdentifierType, chtIdentifierType } from '../utils/cht';
import { requestHandler } from '../utils/request';
import { buildOpenMRSVisit, buildOpenMRSVisitNote, buildOpenMRSObservation, buildOpenMRSPatient } from '../utils/openmrs';
import { createOpenMRSResource, updateOpenMRSResource, getOpenMRSPatientResource } from '../utils/openmrs';
import { openMRSIdentifierType } from '../utils/openmrs';

const router = Router();

router.post(
  '/encounter',
  requestHandler(async (req) => {
    const patient_response = await getOpenMRSPatientResource(req.body.patient_uuid);

    if (patient_response.status != 200) {
      return { status: 500, data: { error: 'Error getting patient' } };
    } else if (!patient_response.data?.entry || patient_response.data.entry.length === 0) {
      return { status: 400, data: { error: 'Patient not found' } };
    }

    const patient_id = patient_response.data.entry[0].resource?.id;

    if (!patient_id) {
      return { status: 400, data: { error: 'Patient ID is null or undefined' } };
    }

    const openMRSVisit = buildOpenMRSVisit(patient_id, req.body.reported_date);
    var enc_response = await createOpenMRSResource({ ...openMRSVisit, resourceType: 'Encounter' });

    if (enc_response.status != 200 && enc_response.status != 201) {
      return { status: 400, data: { error: 'Error saving Visit Encounter' } };
    }

    const openMRSVisitNote = buildOpenMRSVisitNote(patient_id, req.body.reported_date, enc_response.data.id);
    enc_response = await createOpenMRSResource({ ...openMRSVisitNote, resourceType: 'Encounter' });

    if (enc_response.status != 200 && enc_response.status != 201) {
      return { status: 400, data: { error: 'Error saving Visit Note' } };
    }

    const encounter_id = enc_response.data.id;
    for (const entry of req.body.observations) {
      if (entry.valueCode || entry.valueString || entry.valueDateTime) {
        const openMRSObservation = buildOpenMRSObservation(patient_id, encounter_id, entry);
        const obsResponse = createOpenMRSResource({ ...openMRSObservation, resourceType: 'Observation' });
      }
    }
    return { status: 201, data: {}};
  })
);

async function createOrUpdateOpenMRS(fhirPatient: fhir4.Patient) {
  if (getIdType(fhirPatient, openMRSIdentifierType)) {
    return { status: 201, data: { message: `Updates are not supported`} };
    //return updateOpenMRSResource({ ...fhirPatient, resourceType: 'Patient' });
  } else {
    var response = await createOpenMRSResource({ ...fhirPatient, resourceType: 'Patient' });
    if (response.status != 200 && response.status != 201) {
      return { status: 500, data: { message: `OpenMRS responded with ${response.status}`} };
    }

    // its in openMRS, merge IDs and push it back to the fhir Server
    copyIdToNamedIdentifier(response.data, fhirPatient, openMRSIdentifierType);
    return updateFhirResource({ ...fhirPatient, resourceType: 'Patient' });
  }
}

router.post(
  '/patient',
  requestHandler(async (req) => {
    // hack for sms forms: if source_id but not _id,
    // first get patient id from source
    if (req.body.doc.source_id){
      req.body.doc._id = await getPatientUUIDFromSourceId(req.body.source_id);
    }

    // TODO: build FhirPatient here, openmrsify later!
    var fhirPatient = buildOpenMRSPatient(req.body.doc);
    const chtPatientDoc = req.body.doc;

    const response = await getFHIRPatientResource(chtPatientDoc._id);
    if (response.status != 200) {
      return { status: 500, data: { message: `FHIR responded with ${response.status}`} };
    }

    if (response.data.total == 0) {
      // if we don't have the fhir resource yet, create it here
      // note it might already exist without doc id
      const response2 = await createFhirResource({ ...fhirPatient, resourceType: 'Patient' });
      if (response2.status != 200 && response2.status != 201) {
        return { status: 500, data: { message: `FHIR responded with ${response2.status}`} };
      }
      fhirPatient = response2.data;
    } else {
      return { status: 201, data: { message: `Updates not supported`} };
    }

    return createOrUpdateOpenMRS(fhirPatient)
  })
);

router.post(
  '/patient_ids',
  requestHandler(async (req) => {
    const chtFormDoc = req.body.doc;

    // first, get the existing patient from fhir server
    var response = await getFHIRPatientResource(chtFormDoc.openmrs_patient_uuid);

    if (response.status != 200) {
      return { status: 500, data: { message: `FHIR responded with ${response.status}`} };
    } else if (response.data.total == 0){
      return { status: 404, data: { message: `Patient not found`} };
    }

    const fhirPatient = response.data.entry[0].resource;
    addId(fhirPatient, medicIdentifierType, chtFormDoc.patient_id);

    // now, we need to get the actual patient doc from cht...
    const patient_uuid = await getPatientUUIDFromSourceId(chtFormDoc._id);
    addId(fhirPatient, chtIdentifierType, patient_uuid);

    const update_response = await updateFhirResource({ ...fhirPatient, resourceType: 'Patient' });
    if (update_response.status != 200 && update_response.status != 201) {
      return { status: 500, data: { message: `FHIR responded with ${update_response.status}`} };
    }

    //change id to openmrs for update. maybe should fetch from openmrs again?
    fhirPatient.id = getIdType(fhirPatient, openMRSIdentifierType);
    return updateOpenMRSResource({ ...fhirPatient, resourceType: 'Patient' });
  })
);

export default router;
