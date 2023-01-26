const axios = require('axios');
const {genereateFHIRPatientResource} = require('../utils/patient');
const {FHIR} = require('../../config');
const logger = require('../../logger');
const {url: fhirUrl, username: fhirUsername, password: fhirPassword} = FHIR;

async function createPatient(CHTpatientDoc) {
  const FHIRPatientResource = genereateFHIRPatientResource(CHTpatientDoc);

  try {
    const res = await axios.post(`${fhirUrl}/Patient`, FHIRPatientResource, {auth: {
      username: fhirUsername,
      password: fhirPassword,
    }});
    return {status: res.status, patient: res.data};
  } catch (error) {
    logger.error(error);
    return {status: error.status, patient: error.data};
  }
}

module.exports = {
  createPatient
};
