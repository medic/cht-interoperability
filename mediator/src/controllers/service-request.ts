import { logger } from '../../logger';
import { createChtFollowUpRecord } from '../utils/cht';
import {
  getFHIRPatientResource,
  getFHIROrgEndpointResource,
  createFHIRSubscriptionResource,
  deleteFhirSubscription,
} from '../utils/fhir';
import { Response } from '../utils/request';

export async function createServiceRequest(request: fhir4.ServiceRequest) {
  try {
    const patientId = (request.subject as any).reference.replace('Patient/', '');
    // Check if patient exists - axios throws error for non 200
    await getFHIRPatientResource(patientId);

    const orgId = (request.requester as any).reference.replace('Organization/', '');
    const endpointRes = await getFHIROrgEndpointResource(orgId);

    // Create a subscription for the Organization in FHIR to respond to an Encounter in the future
    const url = endpointRes.data.address;
    const subscriptionRes = await createFHIRSubscriptionResource(patientId, url);
    
    const recordRes = await createChtFollowUpRecord(patientId);

    if (recordRes.data.success !== true) {
      await deleteFhirSubscription(subscriptionRes.data.id);
      return {
        status: 500,
        data: { message: 'Unable to create the follow up task' },
      };
    }

    return { status: subscriptionRes.status, data: subscriptionRes.data };
  } catch (error: any) {
    logger.error(`Error: ${error}`);

    const res = {} as Response;
    res.status = error.status || 500;
    res.data = error.data || { message: error.message };

    return res;
  }
}
