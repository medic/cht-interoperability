import axios from "axios";
import { logger } from "../../logger";
import { FHIR, CHT } from "../../config";
import { generateFHIRSubscriptionResource } from "../utils/subscription";
import { generateApiUrl } from "../utils/service-request";
import https from "https";

const { url: fhirUrl, password: fhirPassword, username: fhirUsername } = FHIR;

type ServiceRequest = {
  patient_id: string;
  callback_url: string;
};

async function createServiceRequest(request: ServiceRequest) {
  try {
    const { patient_id: patientId, callback_url } = request;

    let options: Record<string, any> = {
      auth: {
        username: fhirUsername,
        password: fhirPassword,
      },
    };

    const res = await axios.get(`${fhirUrl}/Patient/?identifier=${patientId}`, options);

    if (res.status !== 200) {
      return { status: res.status, data: res.data };
    }

    // generate subscription resource
    const FHIRSubscriptionResource = generateFHIRSubscriptionResource(
      patientId,
      callback_url
    );
    const subscriptionRes = await axios.post(
      `${fhirUrl}/Subscription`,
      FHIRSubscriptionResource,
      options
    );

    if (subscriptionRes.status !== 201) {
      return { status: subscriptionRes.status, data: subscriptionRes.data };
    }

    // call the CHT API to set up the follow up task
    const chtApiUrl = generateApiUrl(CHT.url, CHT.username, CHT.password);
    options = {
      httpsAgent: new https.Agent({
        rejectUnauthorized: false,
      }),
    };
    
    const body = {
      _meta: {
        form: "interop_follow_up",
      },
      patient_uuid: patientId,
    };
    
    const chtRes = await axios.post(chtApiUrl, body, options);

    if (chtRes.data.success !== true) {
      // TODO: delete the subscription
      return { status: 500, data: { message: "unable to create the follow up task"} };
    }

    logger.info(JSON.stringify(chtRes.data, null, 4));

    return { status: res.status };
  } catch (err) {
    logger.error(`Error: ${err}`);
    return { status: 500 };
  }
}

module.exports = {
  createServiceRequest,
};
