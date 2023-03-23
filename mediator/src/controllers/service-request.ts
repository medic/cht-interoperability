import axios from "axios";
import { logger } from "../../logger";
import { FHIR, CHT } from "../../config";
import { generateFHIRSubscriptionResource } from "../utils/fhir";
import https from "https";
import { generateChtRecordsApiUrl } from "../utils/url";

const { url: fhirUrl, password: fhirPassword, username: fhirUsername } = FHIR;

interface IServiceRequest {
  patient_id: string;
  callback_url: string;
}

export async function createServiceRequest(request: IServiceRequest) {
  let subscriptionId: string | undefined;

  try {
    const { patient_id: patientId, callback_url: callbackUrl } = request;

    const patientRes = await getFHIRPatientResource(patientId);

    if (patientRes.status !== 200) {
      return { status: patientRes.status, data: patientRes.data };
    }

    // generate subscription resource
    const subRes = await createFHIRSubscriptionResource(patientId, callbackUrl);

    if (subRes.status !== 201) {
      return { status: subRes.status, data: subRes.data };
    }

    subscriptionId = subRes.data.id;

    // call the CHT API to set up the follow up task
    const recRes = await createChtRecord(patientId);

    if (recRes.data.success !== true) {
      await deleteFhirSubscription(subscriptionId);
      return {
        status: 500,
        data: { message: "unable to create the follow up task" },
      };
    }

    logger.info(JSON.stringify(recRes.data, null, 4));
    return { status: subRes.status, data: subRes.data };
  } catch (error: any) {
    logger.error(`Error: ${error}`);

    if (!error.status) {
      return { status: 400, data: { message: error.message } };
    }

    if (subscriptionId) {
      await deleteFhirSubscription(subscriptionId);
    }

    return { status: 500, data: { message: error.message } };
  }
}

/* Internal Functions */

async function createChtRecord(patientId: string) {
  const record = {
    _meta: {
      form: "interop_follow_up",
    },
    patient_uuid: patientId,
  };

  const options = {
    httpsAgent: new https.Agent({
      rejectUnauthorized: false,
    }),
  };

  const chtApiUrl = generateChtRecordsApiUrl(
    CHT.url,
    CHT.username,
    CHT.password
  );

  return await axios.post(chtApiUrl, record, options);
}

async function createFHIRSubscriptionResource(
  patientId: string,
  callbackUrl: string
) {
  const options = {
    auth: {
      username: fhirUsername,
      password: fhirPassword,
    },
  };
  const FHIRSubscriptionResource = generateFHIRSubscriptionResource(
    patientId,
    callbackUrl
  );
  return await axios.post(
    `${fhirUrl}/Subscription`,
    FHIRSubscriptionResource,
    options
  );
}

async function getFHIRPatientResource(patientId: string) {
  const options = {
    auth: {
      username: fhirUsername,
      password: fhirPassword,
    },
  };
  return await axios.get(
    `${fhirUrl}/Patient/?identifier=${patientId}`,
    options
  );
}

async function deleteFhirSubscription(id?: string) {
  const options = {
    auth: {
      username: fhirUsername,
      password: fhirPassword,
    },
  };
  return await axios
    .delete(`${fhirUrl}/Subscription/${id}`, options)
    .catch(logger.err);
}
