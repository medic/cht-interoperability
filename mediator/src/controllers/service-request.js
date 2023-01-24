const axios = require('axios');
const {FHIR} = require('../../config');
const {url: fhirUrl, password: fhirPassword, username: fhirUsername} = FHIR;
const logger = require('../../logger');

async function createServiceRequest(request) {
  try {
    const {patientId} = request;

    const options = {
      auth: {
        username: fhirUsername,
        password: fhirPassword,
      }
    };

    const res = await axios.get(`${fhirUrl}/Patient/${patientId}`, options);

    if (res.status !== 200) {
      return {status: res.status, data: res.data};
    }

    // todo => @njogz to add task creation process.

    return {status: res.status, data: res.data};
  } catch ({response: res}) {
    logger.error(JSON.stringify(res.data, null, 4));
    return {status: res.status, data: res.data};
  }
}

module.exports = {
  createServiceRequest,
};
