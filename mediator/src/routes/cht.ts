import { Router } from 'express';
import { requestHandler } from '../utils/request';
import { createPatient, updatePatientIds, createEncounter } from '../controllers/cht'
import { syncPatients, syncEncountersAndObservations} from '../utils/openmrs_sync'

const router = Router();

const resourceType = 'Patient';

router.post(
  '/patient',
  requestHandler((req) => createPatient(req.body))
);

router.post(
  '/patient_ids',
  requestHandler((req) => updatePatientIds(req.body.doc))
);

router.post(
  '/encounter',
  requestHandler((req) => createEncounter(req.body))
);

router.post(
  '/sync',
  requestHandler(async (req) => {
    await syncPatients();
    syncEncountersAndObservations();
    return { status: 200, data: {}};
  })
);

export default router;
