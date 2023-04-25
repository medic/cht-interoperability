import axios from 'axios';
import { FHIR } from '../../config';
import { logger } from '../../logger';

export async function createOrganization(organization: fhir4.Organization) {
  try {
    const res = await axios.post(`${FHIR.url}/Organization`, organization, {
      auth: { username: FHIR.username, password: FHIR.password },
    });

    return { status: res.status, data: res.data };
  } catch (error: any) {
    logger.error(error);
    return { status: error.status, data: { message: error.data } };
  }
}
