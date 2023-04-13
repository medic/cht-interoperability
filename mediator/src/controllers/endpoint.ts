import axios from "axios";
import { FHIR } from "../../config";
import { logger } from "../../logger";

const { url: fhirUrl, username, password } = FHIR;

export async function createEndpoint(endpoint: fhir5.Endpoint) {
  try {
    return await axios.post(`${fhirUrl}/Endpoint`, endpoint, {
      auth: { username, password },
    });
  } catch (error: any) {
    logger.error(error);
    return { status: error.status, data: { message: error.data } };
  }
}
