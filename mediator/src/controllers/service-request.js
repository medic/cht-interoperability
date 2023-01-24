const axios = require('axios');
const {FHIR} = require('../../config');
const {url: fhirUrl, password: fhirPassword, username: fhirUsername} = FHIR;

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

    // todo => @ngoz to add task creation process.

    return {status: res.status, data: res.data};
  } catch ({response: res}) {
    // todo => replace with a logger.
    console.log(res.data);
    return {status: res.status, data: res.data};
  }
}

module.exports = {
  createServiceRequest,
};
