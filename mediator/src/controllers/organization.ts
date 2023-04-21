import axios from 'axios';
import { FHIR } from '../../config';
import { logger } from '../../logger';

const { url: fhirUrl, username, password } = FHIR;

export async function createOrganization(organization: fhir4.Organization) {
  try {
    const res = await axios.post(`${fhirUrl}/Organization`, organization, {
      auth: { username, password },
    });

    return { status: res.status, data: res.data };
  } catch (error: any) {
    logger.error(error);
    return { status: error.status, data: { message: error.data } };
  }
}
