import axios from 'axios';
import { CHT } from '../../config';
import { generateBasicAuthUrl } from './url';
import https from 'https';
import path from 'path';
import { buildChtPatientFromFhir, buildChtRecordFromObservations } from '../mappers/cht';
import { logger } from '../../logger';

type CouchDBQuery = {
    selector: Record<string, any>;
    fields?: string[];
};

function getOptions(){
  const options = {
    httpsAgent: new https.Agent({
      rejectUnauthorized: false,
    }),
    timeout: CHT.timeout
  };
  return options;
}

export async function createChtRecord(patientId: string) {
  const record = {
    _meta: {
      form: 'interop_follow_up',
    },
    patient_uuid: patientId,
  };

  const chtApiUrl = generateChtRecordsApiUrl(CHT.url, CHT.username, CHT.password);

  try {
    const res = await axios.post(chtApiUrl, record, getOptions());
    return { status: res?.status, data: res?.data };
  } catch (error: any) {
    logger.error(error);
    return { status: error.status, data: error.data };
  }
}

async function getLocation(fhirPatient: fhir4.Patient) {
  // first, extract address value; is fchv area available?
  const addresses = fhirPatient.address?.[0]?.extension?.[0]?.extension;
  let addressKey = "http://fhir.openmrs.org/ext/address#address4"
  let addressValue = addresses?.find((ext: any) => ext.url === addressKey)?.valueString;

  if (!addressValue) {
    // no fchv area, use next highest address
    addressKey = "http://fhir.openmrs.org/ext/address#address5"
    addressValue = addresses?.find((ext: any) => ext.url === addressKey)?.valueString;

    // still no... return nothing
    if (!addressValue) {
      return '';
    }
  }

  // does the name have a place id included?
  const regex = /\[(\d+)\]/;
  const match = addressValue.match(regex);

  // if so, return it and we're done
  if (match) {
    return match[1];
  } else {
    // if not, query by name
    const query: CouchDBQuery = {
      selector: {
        type: "contact",
        name: addressValue
      },
      fields: ['place_id']
    }
    const location = await queryCht(query);

    // edge cases can result in more than one location, get first matching
    // if not found by name, no more we can do, give up
    if (!location.data?.docs || location.data.docs.length == 0){
      return '';
    } else {
      return location.data.docs[0].place_id;
    }
  }
}

export async function getPatientUUIDFromSourceId(source_id: string) {
  const query: CouchDBQuery = {
    selector: {
      source_id: source_id,
      type: "person"
    },
    fields: [ "_id" ]
  }

  const patient = await queryCht(query);
  if ( patient.data.docs && patient.data.docs.length > 0 ){
    return patient.data.docs[0]._id;
  } else {
    return ''
  }
}

export async function createChtPatient(fhirPatient: fhir4.Patient) {
  const cht_patient = buildChtPatientFromFhir(fhirPatient);

  cht_patient._meta = { form: "openmrs_patient" }

  const location_id = await getLocation(fhirPatient);
  cht_patient.location_id = location_id;

  return chtRecordsApi(cht_patient);
}

export async function chtRecordFromObservations(patient: fhir4.Patient, observations: fhir4.Observation[]) {
  const record = buildChtRecordFromObservations(patient, observations);
  return chtRecordsApi(record);
}

export async function chtRecordsApi(doc: any) {
  const chtApiUrl = generateChtRecordsApiUrl(CHT.url, CHT.username, CHT.password);
  try {
    const res = await axios.post(chtApiUrl, doc, getOptions());
    return { status: res?.status, data: res?.data };
  } catch (error: any) {
    logger.error(error);
    return { status: error.status, data: error.data };
  }
}

export async function getChtDocumentById(doc_id: string) {
  const chtApiUrl = generateChtDBUrl(CHT.url, CHT.username, CHT.password);
  try {
    const res = await axios.get(path.join(chtApiUrl, doc_id), getOptions());
    return { status: res?.status, data: res?.data };
  } catch (error: any) {
    logger.error(error);
    return { status: error.status, data: error.data };
  }
}

export async function queryCht(query: any) {
  const chtApiUrl = generateChtDBUrl(CHT.url, CHT.username, CHT.password);
  try {
    const res = await axios.post(path.join(chtApiUrl, '_find'), query, getOptions());
    return { status: res?.status, data: res?.data };
  } catch (error: any) {
    logger.error(error);
    return { status: error.status, data: error.data };
  }
}

export const generateChtRecordsApiUrl = (chtUrl: string, username: string, password: string) => {
  const endpoint = generateBasicAuthUrl(chtUrl, username, password);
  return path.join(endpoint, '/api/v2/records');
};

export const generateChtDBUrl = (chtUrl: string, username: string, password: string) => {
  const endpoint = generateBasicAuthUrl(chtUrl, username, password);
  return path.join(endpoint, '/medic/');
};
