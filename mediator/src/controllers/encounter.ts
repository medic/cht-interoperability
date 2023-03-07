import axios from 'axios';
import { FHIR } from '../../config';
import { logger } from '../../logger';
const { url: fhirUrl, username: fhirUsername, password: fhirPassword } = FHIR;

export async function createEncounter(CHTencounterDoc: any) {
  try {
    const FHIRencounterResource = generateFHIREncounterResource(CHTencounterDoc);
    const res = await axios.post(`${fhirUrl}/Encounter`, FHIRencounterResource, { auth: {
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
