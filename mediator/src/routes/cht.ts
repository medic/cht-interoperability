import { Router } from 'express';
import { PatientSchema } from '../middlewares/schemas/patient';
import { requestHandler } from '../utils/request';
import { createFhirResource, updateFhirResource, copyIdToNamedIdentifier, getIdType } from '../utils/fhir';
import { createChtPatient, chtRecordFromObservations, chtIdentifierType } from '../utils/cht';
import { openMRSIdentifierType } from '../utils/openmrs';

const router = Router();

const resourceType = 'Patient';

router.post(
  '/patient',
  requestHandler(async (req) => {
    const openMRSPatient = req.body;

    copyIdToNamedIdentifier(openMRSPatient, openMRSPatient, openMRSIdentifierType);
    var response = await createFhirResource({ ...openMRSPatient, resourceType: 'Patient' });

    if (response.status != 200 && response.status != 201){
      return { status: 500, data: { message: `FHIR responded with ${response.status}`} };
    }

    // TODO: move this to some kind of observer thing
    const fhirPatient = response.data;
    response = await createChtPatient(openMRSPatient);
    if (response.status != 200 && response.status != 201){
      return { status: 500, data: { message: `FHIR responded with ${response.status}`} };
    }

    return response;
  })
);

router.post(
  '/encounter',
  requestHandler(async (req) => {
    // request should include a patient
    const bundle = req.body;
    const openMRSPatient = bundle.entry.find((entry: any) => entry.resource.resourceType === 'Patient')?.resource;
    const cht_id = getIdType(openMRSPatient, chtIdentifierType);
    return chtRecordFromObservations(cht_id, req.body)
  })
);

export default router;
