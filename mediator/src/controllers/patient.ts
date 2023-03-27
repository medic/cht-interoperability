import axios from "axios";
import { FHIR } from "../../config";
import { logger } from "../../logger";

const { url: fhirUrl, username: fhirUsername, password: fhirPassword } = FHIR;

export async function createPatient(patient: fhir5.Patient) {
  try {
    const res = await axios.post(`${fhirUrl}/Patient`, patient, {
      auth: {
        username: fhirUsername,
        password: fhirPassword,
      },
    });
    return { status: res.status, data: res.data };
  } catch (error: any) {
    logger.error(error);

    if (!error.status) {
      return { status: 400, data: { message: error.message } };
    }

    return { status: error.status, data: { message: error.data } };
  }
}
