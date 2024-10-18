import { OPENMRS } from '../../config';
import axios from 'axios';
import { logger } from '../../logger';
import https from 'https';
import { getResourcesSince } from './fhir';

const axiosOptions = {
  auth: {
    username: OPENMRS.username,
    password: OPENMRS.password,
  },
  httpsAgent: new https.Agent({
    rejectUnauthorized: false,
  }),
  timeout: OPENMRS.timeout
};

export async function getOpenMRSResourcesSince(lastUpdated: Date, resourceType: string) {
  return getResourcesSince(OPENMRS.url, lastUpdated, resourceType);
}

export async function createOpenMRSResource(doc: fhir4.Resource) {
  try {
    const res = await axios.post(`${OPENMRS.url}/${doc.resourceType}`, doc, axiosOptions);
    return { status: res.status, data: res.data };
  } catch (error: any) {
    logger.error(error);
    return { status: error.response?.status, data: error.response?.data };
  }
}

export async function updateOpenMRSResource(doc: fhir4.Resource) {
  try {
    const res = await axios.post(`${OPENMRS.url}/${doc.resourceType}/${doc.id}`, doc, axiosOptions);
    return { status: res.status, data: res.data };
  } catch (error: any) {
    logger.error(error);
    return { status: error.response?.status, data: error.response?.data };
  }
}
