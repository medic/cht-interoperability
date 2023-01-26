const axios = require('axios');
const {FHIR} = require('../../config');
const {url: fhirUrl, password: fhirPassword, username: fhirUsername} = FHIR;
const logger = require('../../logger');
const{generateFHIRSubscriptionResource} = require('../utils/subscription');

async function createServiceRequest(request) {
  try {
    const {patientId, callbackURL} = request;

    const options = {
      auth: {
        username: fhirUsername,
        password: fhirPassword,
      }
    };

    const res = await axios.get(`${fhirUrl}/Patient/?identifier=${patientId}`, options);

    if (res.status !== 200) {
      return {status: res.status, data: res.data};
    }

    // generate subscription resource
    const FHITSubscriptionResource = generateFHIRSubscriptionResource(patientId, callbackURL);
    const subscriptionRes = await axios.post(`${fhirUrl}/Subscription`, FHITSubscriptionResource, options);

    logger.info(JSON.stringify(subscriptionRes.data, null, 4));


    return {status: res.status};
  } catch (err) {
    logger.error(`Error: ${err}`);
    console.log(err);
    return {status: 500};
  }
}

module.exports = {
  createServiceRequest,
};
