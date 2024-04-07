import axios from 'axios';
import { CHT } from '../../config';
import { generateBasicAuthUrl } from './url';
import https from 'https';
import path from 'path';
import { logger } from '../../logger';

export async function createChtRecord(patientId: string) {
  const record = {
    _meta: {
      form: 'interop_follow_up',
    },
    patient_uuid: patientId,
  };
  const options = {
    httpsAgent: new https.Agent({
      rejectUnauthorized: false,
    }),
  };

  const chtApiUrl = generateChtRecordsApiUrl(CHT.url, CHT.username, CHT.password);

  return await axios.post(chtApiUrl, record, options);
}

export async function createChtPatient(fhirPatient: fhir4.Patient) {
  const options = {
    httpsAgent: new https.Agent({
      rejectUnauthorized: false,
    }),
  };

  const name = fhirPatient.name?.[0]
  const given = name?.given ? name?.given : ''
  const tc = fhirPatient.telecom?.[0]
  const record = {
    _meta: {
      form: "N"
    },
    age_in_years: 22,
    patient_phone: tc?.value,
    patient_name: `${given} ${name?.family}`,
    gender: fhirPatient.gender,
    location_id: "65985"
  }

  const chtApiUrl = generateChtRecordsApiUrl(CHT.url, CHT.username, CHT.password);

  return await axios.post(chtApiUrl, record, options);
}

export async function chtRecordFromObservations(patient_id: string, observations: any) {
  const options = {
    httpsAgent: new https.Agent({
      rejectUnauthorized: false,
    }),
  };

  const record: any = {
    _meta: {
      form: "openmrs_anc"
    },
    patient_id: patient_id
  }

  for (const entry of observations.entry) {
    const code:string = entry.resource.code.coding[0].code;
    if (entry.resource.valueCodeableConcept) {
      record[code] = entry.resource.valueCodeableConcept.text;
    } else if (entry.resource.valueDateTime) {
      record[code] = entry.resource.valueDateTime;
    }
  }

  const chtApiUrl = generateChtRecordsApiUrl(CHT.url, CHT.username, CHT.password);

  return await axios.post(chtApiUrl, record, options);
}

export const generateChtRecordsApiUrl = (chtUrl: string, username: string, password: string) => {
  const endpoint = generateBasicAuthUrl(chtUrl, username, password);
  return path.join(endpoint, '/api/v2/records');
};
