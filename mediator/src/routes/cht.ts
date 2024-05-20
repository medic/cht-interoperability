import { Router } from 'express';
import { requestHandler } from '../utils/request';
import { createFhirResource, updateFhirResource, getFHIRPatientResource } from '../utils/fhir';
import { addId } from '../utils/fhir';
import { getPatientUUIDFromSourceId } from '../utils/cht';
import { buildFhirObservationFromCht, buildFhirEncounterFromCht, buildFhirPatientFromCht } from '../mappers/cht';
import { chtPatientIdentifierType, chtDocumentIdentifierType } from '../mappers/cht';

const router = Router();

const resourceType = 'Patient';

router.post(
  '/patient',
  requestHandler(async (req) => {
    // hack for sms forms: if source_id but not _id,
    // first get patient id from source
    if (req.body.doc.source_id){
      req.body.doc._id = await getPatientUUIDFromSourceId(req.body.source_id);
    }

    const fhirPatient = buildFhirPatientFromCht(req.body.doc);
    // create or update in the FHIR Server
    // note that either way, its a PUT with the id from the patient doc
    return updateFhirResource({ ...fhirPatient, resourceType: 'Patient' });
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
    addId(fhirPatient, chtPatientIdentifierType, chtFormDoc.patient_id);

    // now, we need to get the actual patient doc from cht...
    const patient_uuid = await getPatientUUIDFromSourceId(chtFormDoc._id);
    addId(fhirPatient, chtDocumentIdentifierType, patient_uuid);

    return updateFhirResource({ ...fhirPatient, resourceType: 'Patient' });
  })
);

router.post(
  '/encounter',
  requestHandler(async (req) => {
    const chtReport = req.body;
    const fhirEncounter = buildFhirEncounterFromCht(chtReport);

    const bundle: fhir4.Bundle = {
      resourceType: 'Bundle',
      type: 'collection',
      entry: [fhirEncounter]
    }

    for (const entry of req.body.observations) {
      if (entry.valueCode || entry.valueString || entry.valueDateTime) {
        const observation = buildFhirObservationFromCht(chtReport, fhirEncounter, entry);
        bundle.entry?.push(observation);
      }
    }
    return createFhirResource(bundle);
  })
);
export default router;
