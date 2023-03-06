import axios from 'axios';
import {generateFHIRPatientResource} from '../utils/patient';
import {FHIR} from '../../config';
import {logger} from '../../logger';
const {url: fhirUrl, username: fhirUsername, password: fhirPassword} = FHIR;

export async function createPatient(CHTpatientDoc: any) {
  try {
    const FHIRPatientResource = generateFHIRPatientResource(CHTpatientDoc);
    const res = await axios.post(`${fhirUrl}/Patient`, FHIRPatientResource, {auth: {
      username: fhirUsername,
      password: fhirPassword,
    }});
    return {status: res.status, patient: res.data};
  } catch (error: any) {
    logger.error(error);

    if (!error.status) {
      return {status: 400, patient: {message: error.message}};
    }

    return {status: error.status, patient: error.data};
  }
}
