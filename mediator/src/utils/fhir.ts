import { Fhir } from 'fhir';
import { FHIR } from '../../config';
import axios from 'axios';
import { logger } from '../../logger';

export const VALID_GENDERS = ['male', 'female', 'other', 'unknown'] as const;

/**
 * Interface for the Subscription Channel object.
 */
interface SubscriptionChannel {
  type: string;
  endpoint: string;
  header: string[];
}

/**
 * Interface for the FHIR Subscription resource.
 */
export interface Subscription {
  resourceType: string;
  status: string;
  end?: string; // ISO 8601 format, e.g., "2029-12-31T23:59:59Z"
  reason: string;
  criteria: string;
  channel: SubscriptionChannel;
}

const axiosOptions = {
  auth: {
    username: FHIR.username,
    password: FHIR.password,
  },
};

const fhir = new Fhir();

export function validateFhirResource(resourceType: string) {
  return function wrapper(data: any) {
    return fhir.validate({ ...data, resourceType });
  };
}

export function generateFHIRSubscriptionResource(
  patientId: string,
  callbackUrl: string
) {
  if (!patientId) {
    throw new Error(
      `Invalid patient id was expecting type of 'string' or 'number' but received '${typeof patientId}'`
    );
  } else if (!callbackUrl) {
    throw new Error(
      `Invalid 'callbackUrl' was expecting type of 'string' but recieved '${typeof callbackUrl}'`
    );
  }

  const FHIRSubscriptionResource = {
    resourceType: 'Subscription',
    id: patientId,
    status: 'requested',
    reason: 'Follow up request for patient',
    criteria: `Encounter?identifier=${patientId}`,
    channel: {
      type: 'rest-hook',
      endpoint: callbackUrl,
      payload: 'application/fhir+json',
      header: ['Content-Type: application/fhir+json'],
    },
  };

  return FHIRSubscriptionResource;
}

export async function createFHIRSubscriptionResource(
  url: string,
  subscriptionPayload: Subscription,
  headers: Record<string, unknown> = axiosOptions,
) {
  return await axios.post(url, subscriptionPayload, headers);
}

export async function getFHIROrgEndpointResource(id: string) {
  const res = await axios.get(
    `${FHIR.url}/Organization/?identifier=${id}`,
    axiosOptions
  );

  if (!res.data.entry) {
    const error: any = new Error('Organization not found');
    error.status = 404;
    throw error;
  }

  const entry = res.data.entry[0];
  if (!entry) {
    const error: any = new Error('Organization not found');
    error.status = 404;
    throw error;
  }

  const organization = entry.resource;
  const endpoints = organization.endpoint;

  if (!endpoints) {
    const error: any = new Error('Organization has no endpoint attached');
    error.status = 400;
    throw error;
  }

  const endpointRef = endpoints[0];

  if (!endpointRef) {
    const error: any = new Error('Organization has no endpoint attached');
    error.status = 400;
    throw error;
  }

  const endpointId = endpointRef.reference.replace('Endpoint/', '');

  return await axios.get(`${FHIR.url}/Endpoint/${endpointId}`, axiosOptions);
}

export async function getFHIRPatientResource(patientId: string) {
  return await axios.get(
    `${FHIR.url}/Patient/?identifier=${patientId}`,
    axiosOptions
  );
}

export async function deleteFhirSubscription(id?: string) {
  return await axios.delete(`${FHIR.url}/Subscription/${id}`, axiosOptions);
}

export async function createFhirResource(doc: fhir4.Resource) {
  try {
    const res = await axios.post(`${FHIR.url}/${doc.resourceType}`, doc, {
      auth: {
        username: FHIR.username,
        password: FHIR.password,
      },
    });

    return { status: res.status, data: res.data };
  } catch (error: any) {
    logger.error(error);
    return { status: error.status, data: error.data };
  }
}
