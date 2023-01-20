const axios = require('axios');
const { genereateFHIRPatientResource } = require('../utils/patient');
const FHIR_ROOT_URL = 'http://openhim-core:5001/fhir';

async function createPatient(CHTpatientDoc) {
  const FHITPatientResource = genereateFHIRPatientResource(CHTpatientDoc);

  try {
    const res = await axios.post(`${FHIR_ROOT_URL}/Patient`, FHITPatientResource, { auth: {
      username: 'interop-client',
      password: 'interop-password'
    }});
    return {status: res.status, patient: res.data}
  } catch (error) {
    console.error(error);
    return {status: error.status, patient: error.data}
  }
}

module.exports = {
  createPatient
};
