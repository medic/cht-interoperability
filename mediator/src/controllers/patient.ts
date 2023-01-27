const axios = require('axios');
const {genereateFHIRPatientResource} = require('../utils/patient');
const {FHIR} = require('../../config');
const logger = require('../../logger');
const {url: fhirUrl, username: fhirUsername, password: fhirPassword} = FHIR;

export async function createPatient(CHTpatientDoc: any) {
  try {
    const FHITPatientResource = genereateFHIRPatientResource(CHTpatientDoc);
    const res = await axios.post(`${fhirUrl}/Patient`, FHITPatientResource, {auth: {
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
