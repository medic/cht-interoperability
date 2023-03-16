import axios from "axios";
import { generateFHIRPatientResource, IPatient } from "../utils/fhir";
import { FHIR } from "../../config";
import { logger } from "../../logger";

const { url: fhirUrl, username: fhirUsername, password: fhirPassword } = FHIR;

export async function createPatient(CHTpatientDoc: IPatient) {
  try {
    const FHIRPatientResource = generateFHIRPatientResource(CHTpatientDoc);
    const res = await axios.post(`${fhirUrl}/Patient`, FHIRPatientResource, {
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
