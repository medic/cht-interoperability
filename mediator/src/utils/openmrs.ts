import { OPENMRS } from '../../config';
import axios from 'axios';
import { logger } from '../../logger';

const axiosOptions = {
  auth: {
    username: OPENMRS.username,
    password: OPENMRS.password,
  },
  timeout: OPENMRS.timeout
};

export async function getOpenMRSPatientResource(patientId: string) {
  return await axios.get(
    `${OPENMRS.url}/Patient/?identifier=${patientId}`,
    axiosOptions
  );
}

export async function getOpenMRSResourcesSince(lastUpdated: Date, resourceType: string) {
  try {
    let url = `${OPENMRS.url}/${resourceType}/?_lastUpdated=gt${lastUpdated.toISOString()}`;
    // for encounters, include related resources
    if (resourceType === 'Encounter') {
      url = url + '&_revinclude=Observation:encounter&_include=Encounter:patient';
    }
    const res = await axios.get(url, axiosOptions);
    return { status: res.status, data: res.data };
  } catch (error: any) {
    logger.error(error);
    return { status: error.status, data: error.data };
  }
}

export async function createOpenMRSResource(doc: fhir4.Resource) {
  try {
    const res = await axios.post(`${OPENMRS.url}/${doc.resourceType}`, doc, axiosOptions);
    return { status: res.status, data: res.data };
  } catch (error: any) {
    logger.error(error);
    return { status: error.status, data: error.data };
  }
}

export async function updateOpenMRSResource(doc: fhir4.Resource) {
  try {
    const res = await axios.post(`${OPENMRS.url}/${doc.resourceType}/${doc.id}`, doc, axiosOptions);
    return { status: res.status, data: res.data };
  } catch (error: any) {
    logger.error(error);
    return { status: error.status, data: error.data };
  }
}
