import axios from 'axios';
import { FHIR } from '../../config';
import { logger } from '../../logger';

export async function createEncounter(encounter: fhir4.Encounter) {
  try {
    const res = await axios.post(`${FHIR.url}/Encounter`, encounter, {
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
