import axios from 'axios';
import { FHIR } from '../../config';
import { logger } from '../../logger';

const { url: fhirUrl, username: fhirUsername, password: fhirPassword } = FHIR;

export async function createEncounter(encounter: fhir4.Encounter) {
  try {
    const res = await axios.post(`${fhirUrl}/Encounter`, encounter, {
      auth: {
        username: fhirUsername,
        password: fhirPassword,
      },
    });

    return { status: res.status, data: res.data };
  } catch (error: any) {
    logger.error(error);
    return { status: error.status, data: error.data };
  }
}
