import axios from 'axios';
import { FHIR } from '../../config';
import { logger } from '../../logger';


export async function createPatient(patient: fhir4.Patient) {
  try {
    const res = await axios.post(`${FHIR.url}/Patient`, patient, {
      auth: {
        username: FHIR.username,
        password: FHIR.password,
      },
    });
    return { status: res.status, data: res.data };
  } catch (error: any) {
    logger.error(error);
    return { status: error.status, data: error.data };
  }
}
