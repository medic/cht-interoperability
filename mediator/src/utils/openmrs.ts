import { OPENMRS } from '../../config';
import axios from 'axios';
import { logger } from '../../logger';
import https from 'https';

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

export async function getOpenMRSPatientResource(patientId: string) {
  return await axios.get(
    `${OPENMRS.url}/Patient/?identifier=${patientId}`,
    axiosOptions
  );
}

export async function getOpenMRSResourcesSince(lastUpdated: Date, resourceType: string) {
  try {
    let nextUrl = `${OPENMRS.url}/${resourceType}/?_lastUpdated=gt${lastUpdated.toISOString()}`;
    let results: fhir4.Resource[] = [];
    // for encounters, include related resources
    if (resourceType === 'Encounter') {
      nextUrl = nextUrl + '&_revinclude=Observation:encounter&_include=Encounter:patient';
    }

    while (nextUrl) {
      const res = await axios.get(nextUrl, axiosOptions);

      if (res.data.entry){
        results = results.concat(res.data.entry.map((entry: any) => entry.resource));
      }

      const nextLink = res.data.link && res.data.link.find((link: any) => link.relation === 'next');
      nextUrl = nextLink ? nextLink.url : null;
      if (nextUrl) {
        const qs = nextUrl.split('?')[1];
        nextUrl = `${OPENMRS.url}/?${qs}`;
      }
    }
    return { status: 200, data: results };
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
