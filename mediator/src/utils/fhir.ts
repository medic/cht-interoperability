import { Fhir } from 'fhir';
import { FHIR } from '../../config';
import axios from 'axios';
import { logger } from '../../logger';

export const VALID_GENDERS = ['male', 'female', 'other', 'unknown'] as const;

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
  patientId: string,
  callbackUrl: string
) {
  const res = generateFHIRSubscriptionResource(patientId, callbackUrl);
  return await axios.post(`${FHIR.url}/Subscription`, res, axiosOptions);
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

export async function getFHIRPatients(lastUpdated: Date) {
  return await axios.get(
    `${FHIR.url}/Patient/?_lastUpdated=gt${lastUpdated.toISOString()}`,
    axiosOptions
  );
}

export function copyIdToNamedIdentifier(resource: fhir4.Patient, fromIDType: fhir4.CodeableConcept){
  const identifier: fhir4.Identifier = {
    type: fromIDType,
    value: resource.id
  };
  resource.identifier?.push(identifier);
  return resource;
}

export function getIdType(resource: fhir4.Patient, idType: fhir4.CodeableConcept): string{
  return resource.identifier?.find((id: any) => id?.type.text == idType.text)?.value || '';
}

export function addId(resource: fhir4.Patient, idType: fhir4.CodeableConcept, value: string){
  const identifier: fhir4.Identifier = {
    type: idType,
    value: value
  };
  resource.identifier?.push(identifier);
  return resource;
}

export async function getFHIRLocation(locationId: string) {
  return await axios.get(
    `${FHIR.url}/Patient/?identifier=${locationId}`,
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

export async function updateFhirResource(doc: fhir4.Resource) {
  try {
    const res = await axios.put(`${FHIR.url}/${doc.resourceType}/${doc.id}`, doc, {
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

export async function getFhirResourcesSince(lastUpdated: Date, resourceType: string) {
  return await axios.get(
    `${FHIR.url}/${resourceType}/?_lastUpdated=gt${lastUpdated.toISOString()}`,
    axiosOptions
  );
}
