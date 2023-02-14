import {logger} from '../../logger';

const axios = require('axios');
const {FHIR} = require('../../config');
const {url: fhirUrl, password: fhirPassword, username: fhirUsername} = FHIR;

type ServiceRequest = {
  patient_id: string;
};

async function createServiceRequest(request: ServiceRequest) {
  try {
    const {patient_id: patientId} = request;

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
  } catch (err) {
    logger.error(JSON.stringify(err, null, 4));
    return {status: 500, data: err};
  }
}

module.exports = {
  createServiceRequest,
};
