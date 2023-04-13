import axios from "axios";
import { FHIR } from "../../config";
import { logger } from "../../logger";

const { url: fhirUrl, username: fhirUsername, password: fhirPassword } = FHIR;

export interface CHTEncounterDoc {
  patient_id: string;
}

export async function createEncounter(encounter: fhir5.Encounter) {
  try {
    return await axios.post(`${fhirUrl}/Encounter`, encounter, {
      auth: {
        username: fhirUsername,
        password: fhirPassword,
      },
    });
  } catch (error: any) {
    logger.error(error);
    return { status: error.status, data: error.data };
  }
}
