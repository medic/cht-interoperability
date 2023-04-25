import { logger } from '../../logger';
import { createChtRecord } from '../utils/cht';
import {
  getFHIRPatientResource,
  getFHIROrgEndpointResource,
  createFHIRSubscriptionResource,
  deleteFhirSubscription,
} from '../utils/fhir';

export async function createServiceRequest(request: fhir4.ServiceRequest) {
  try {
    const patientId = (request.subject as any).reference.replace('Patient/', '');
    // Check if patient exists - axios throws error for non 200
    await getFHIRPatientResource(patientId);

    const orgId = (request.requester as any).reference.replace('Organization/', '');
    const endpointRes = await getFHIROrgEndpointResource(orgId);

    // This creates a subscription for the organization in FHIR to respond to an encounter in the future.
    const url = endpointRes.data.address;
    const subRes = await createFHIRSubscriptionResource(patientId, url);
    
    const recRes = await createChtRecord(patientId);

    if (recRes.data.success !== true) {
      await deleteFhirSubscription(subRes.data.id);
      return {
        status: 500,
        data: { message: 'Unable to create the follow up task' },
      };
    }

    return { status: subRes.status, data: subRes.data };
  } catch (error: any) {
    logger.error(`Error: ${error}`);

    const res: any = {};
    res.status = error.status || 500;
    res.data = error.data || { message: error.message };

    return res;
  }
}
