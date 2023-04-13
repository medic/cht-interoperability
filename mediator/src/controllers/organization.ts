import axios from "axios";
import { FHIR } from "../../config";
import { logger } from "../../logger";

const { url: fhirUrl, username, password } = FHIR;

export async function createOrganization(organization: fhir5.Organization) {
  try {
    return await axios.post(`${fhirUrl}/Organization`, organization, {
      auth: { username, password },
    });
  } catch (error: any) {
    logger.error(error);
    return { status: error.status, data: { message: error.data } };
  }
}
