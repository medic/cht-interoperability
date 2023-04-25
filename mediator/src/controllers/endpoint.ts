import axios from 'axios';
import { FHIR } from '../../config';
import { logger } from '../../logger';

export async function createEndpoint(endpoint: fhir4.Endpoint) {
  try {
    const res = await axios.post(`${FHIR.url}/Endpoint`, endpoint, {
      auth: { username: FHIR.username, password: FHIR.password },
    });

    return { data: res.data, status: res.status };
  } catch (error: any) {
    logger.error(error);
    return { status: error.status, data: { message: error.data } };
  }
}
