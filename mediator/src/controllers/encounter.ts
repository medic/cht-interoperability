import axios from 'axios';
import { FHIR } from '../../config';
import { logger } from '../../logger';

const { url: fhirUrl, username: fhirUsername, password: fhirPassword } = FHIR;

export interface CHTEncounterDoc {
  patient_id: string;
};

export async function createEncounter(encounter: fhir5.Encounter) {
  try {
    const res = await axios.post(`${fhirUrl}/Encounter`, encounter, { auth: {
      username: fhirUsername,
      password: fhirPassword,
    }});
    return { status: res.status, encounter: res.data };
  } catch (error: any) {
    logger.error(error);

    if (!error.status) {
      return { status: 400, encounter: { message: error.message } };
    }

    return { status: error.status, encounter: error.data };
  }
}
