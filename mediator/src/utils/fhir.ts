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
  timeout: FHIR.timeout
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
  try {
    const res = await axios.get(
      `${FHIR.url}/Patient/?identifier=${patientId}`,
      axiosOptions
    );
    return { status: res?.status, data: res?.data };
  } catch (error: any) {
    logger.error(error);
    return { status: error.response?.status, data: error.response?.data };
  }
}

export function addSourceMeta(resource: fhir4.Resource, source: string) {
  resource.meta = resource.meta || {};
  resource.meta['source'] = source;
}

export function copyIdToNamedIdentifier(fromResource: any, toResource: fhir4.Patient | fhir4.Encounter, fromIdType: fhir4.CodeableConcept){
  const identifier: fhir4.Identifier = {
    type: fromIdType,
    value: fromResource.id,
    use: "secondary"
  };
  toResource.identifier = toResource.identifier || [];
  const sameIdType = (id: any) => (id.type.text === fromIdType.text)
  if (!toResource.identifier?.some(sameIdType)) {
    toResource.identifier?.push(identifier);
  }
  return toResource;
}

export function getIdType(resource: fhir4.Patient | fhir4.Encounter, idType: fhir4.CodeableConcept): string{
  return resource?.identifier?.find((id: any) => id?.type?.text == idType.text)?.value || '';
}

export function addId(resource: fhir4.Patient | fhir4.Encounter, idType: fhir4.CodeableConcept, value: string){
  const identifier: fhir4.Identifier = {
    type: idType,
    value: value
  };
  resource.identifier?.push(identifier);
  return resource;
}

export function replaceReference(resource: any, referenceKey: string, referred: fhir4.Resource) {
  const newReference: fhir4.Reference = {
    reference: `${referred.resourceType}/${referred.id}`,
    type: referred.resourceType
  }
  resource[referenceKey] = newReference;
}

export async function deleteFhirSubscription(id?: string) {
  return await axios.delete(`${FHIR.url}/Subscription/${id}`, axiosOptions);
}

export async function createFhirResource(doc: fhir4.Resource) {
  try {
    const res = await axios.post(`${FHIR.url}/${doc.resourceType}`, doc, axiosOptions);
    return { status: res?.status, data: res?.data };
  } catch (error: any) {
    logger.error(error);
    return { status: error.response?.status, data: error.response?.data };
  }
}

export async function updateFhirResource(doc: fhir4.Resource) {
  try {
    const res = await axios.put(`${FHIR.url}/${doc.resourceType}/${doc.id}`, doc, axiosOptions); 
    return { status: res?.status, data: res?.data };
  } catch (error: any) {
    logger.error(error);
    return { status: error.response?.status, data: error.response?.data };
  }
}

export async function getFhirResourcesSince(lastUpdated: Date, resourceType: string) {
  return getResourcesSince(FHIR.url, lastUpdated, resourceType);
}

/*
 * get the "next" url from a fhir paginated response and a base url
*/
function getNextUrl(url: string, pagination: any) {
  let nextUrl = '';
  const nextLink = pagination.link?.find((link: any) => link.relation === 'next');
  if (nextLink?.url) {
    const qs = nextLink.url.split('?')[1];
    nextUrl = `${url}/?${qs}`;
  }
  return nextUrl;
}

/*
 * Gets the full url for a resource type, given base url
 * For some resource types, it is usefult o get related resources
 * This function returns the full url including include clauses
 * currently it is only for encounters, to include observations
 * and the subject patient
*/
function getResourceUrl(baseUrl: string, lastUpdated: Date, resourceType: string) {
  let url = `${baseUrl}/${resourceType}/?_lastUpdated=gt${lastUpdated.toISOString()}`;
  // for encounters, include related resources
  if (resourceType === 'Encounter') {
    url = url + '&_revinclude=Observation:encounter&_include=Encounter:patient';
  }
  return url
}

/*
 * get resources of a given type from url, where lastUpdated is > the given data
 * if results are paginated, goes through all pages
*/
export async function getResourcesSince(url: string, lastUpdated: Date, resourceType: string) {
  try {
    let results: fhir4.Resource[] = [];
    let nextUrl = getResourceUrl(url, lastUpdated, resourceType);

    while (nextUrl) {
      const res = await axios.get(nextUrl, axiosOptions);

      if (res.data.entry){
        results = results.concat(res.data.entry.map((entry: any) => entry.resource));
      }

      nextUrl = getNextUrl(url, res.data);
    }
    return { status: 200, data: results };
  } catch (error: any) {
    logger.error(error);
    return { status: error.response?.status, data: error.response?.data };
  }
}

export async function getFhirResource(id: string, resourceType: string) {
  try {
    const res = await axios.get(
      `${FHIR.url}/${resourceType}/${id}`,
      axiosOptions
    );
    return { status: res?.status, data: res?.data };
  } catch (error: any) {
    logger.error(error);
    return { status: error.response?.status, data: error.response?.data };
  }
}
