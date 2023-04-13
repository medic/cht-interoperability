import { logger } from "../../logger";
import { createChtRecord } from "../utils/cht";
import {
  getFHIRPatientResource,
  getFHIROrgEndpointResource,
  createFHIRSubscriptionResource,
  deleteFhirSubscription,
} from "../utils/fhir";

/**
 * Subject - Patient (Required)
 * Performer - CHW (Optional)
 * Requester - Organization (Required)
 */
export async function createServiceRequest(request: fhir5.ServiceRequest) {
  let subId: string | undefined;

  try {
    const patientId = request.subject.identifier as string;
    const patientRes = await getFHIRPatientResource(patientId);

    if (patientRes.status !== 200) {
      return { status: patientRes.status, data: patientRes.data };
    }

    const orgId = request.requester?.identifier as string;
    const endpoint = await getFHIROrgEndpointResource(orgId);

    if (!endpoint) {
      await deleteFhirSubscription(subId);
      return {
        status: 400,
        data: { message: "unable to retreive organization's endpoint" },
      };
    }

    // Generate subscription resource
    const subRes = await createFHIRSubscriptionResource(patientId, endpoint.address);

    if (subRes.status !== 201) {
      return { status: subRes.status, data: subRes.data };
    }

    subId = subRes.data.id;

    // Call the CHT API to set up the follow up task
    const recRes = await createChtRecord(patientId);

    if (recRes.data.success !== true) {
      await deleteFhirSubscription(subId);
      return {
        status: 500,
        data: { message: "Unable to create the follow up task" },
      };
    }

    return { status: subRes.status, data: subRes.data };
  } catch (error: any) {
    logger.error(`Error: ${error}`);

    if (subId) {
      await deleteFhirSubscription(subId);
    }

    return { status: error.status || 500, data: { message: error.message } };
  }
}
