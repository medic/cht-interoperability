import axios from 'axios';
import { CHT } from '../../config';
import { generateBasicAuthUrl } from './url';
import https from 'https';
import path from 'path';
import { logger } from '../../logger';
import { openMRSIdentifierType } from './openmrs';
import { getIdType } from './fhir';

type CouchDBQuery = {
    selector: Record<string, any>;
    fields?: string[];
};

export const chtIdentifierType: fhir4.CodeableConcept = {
  text: 'CHT ID'
}

export const medicIdentifierType: fhir4.CodeableConcept = {
  text: 'Medic ID'
}

function getOptions(){
  const options = {
    httpsAgent: new https.Agent({
      rejectUnauthorized: false,
    }),
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

  return await axios.post(chtApiUrl, record, getOptions());
}

async function getLocation(fhirPatient: fhir4.Patient) {
  // first, extract address value; is fchv area available?
  const addresses = fhirPatient.address?.[0]?.extension?.[0]?.extension;
  var addressKey = "http://fhir.openmrs.org/ext/address#address4"
  var addressValue = addresses?.find((ext: any) => ext.url === addressKey)?.valueString;

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
  return patient.data.docs[0]._id;
}

export async function createChtPatient(fhirPatient: fhir4.Patient) {
  const cht_patient = buildChtPatientFromFhir(fhirPatient);

  cht_patient._meta = { form: "openmrs_patient" }

  const location_id = await getLocation(fhirPatient);
  cht_patient.location_id = location_id;

  return chtRecordsApi(cht_patient);
}

export async function chtRecordFromObservations(patient_id: string, observations: any) {
  const record: any = {
    _meta: {
      form: "openmrs_anc"
    },
    patient_id: patient_id
  }

  for (const entry of observations.entry) {
    if (entry.resource.resourceType == 'Observation') {
      const code:string = entry.resource.code.coding[0].code;
      if (entry.resource.valueCodeableConcept) {
        record[code.toLowerCase()] = entry.resource.valueCodeableConcept.text;
      } else if (entry.resource.valueDateTime) {
        record[code.toLowerCase()] = entry.resource.valueDateTime.split('T')[0];
      }
    }
  }

  return chtRecordsApi(record);
}

export function buildChtPatientFromFhir(fhirPatient: fhir4.Patient): any {
  const name = fhirPatient.name?.[0];
  const given = name?.given ? name?.given : '';

  const tc = fhirPatient.telecom?.[0];

  const now = new Date().getTime();
  const birthDate = Date.parse(fhirPatient.birthDate || '');
  const age_in_days = Math.floor((now - birthDate) / (1000 * 60 * 60 * 24));

  const updateObject = {
    patient_name: `${given} ${name?.family}`,
    phone_number: tc?.value,
    sex: fhirPatient.gender,
    age_in_days: age_in_days,
    //TODO: decouple from openmrs
    openmrs_patient_uuid: fhirPatient.id,
    openmrs_id: getIdType(fhirPatient, openMRSIdentifierType)
  };

  return updateObject;
}

export async function updateChtDocument(doc: any, update_object: any) {
  const chtApiUrl = generateChtDBUrl(CHT.url, CHT.username, CHT.password);
  const updated_doc = { ...doc, ...update_object }
  return await axios.put(path.join(chtApiUrl, doc._id), updated_doc, getOptions());
}

export async function chtRecordsApi(doc: any) {
  const chtApiUrl = generateChtRecordsApiUrl(CHT.url, CHT.username, CHT.password);
  return await axios.post(chtApiUrl, doc, getOptions());
}

export async function getChtDocumentById(doc_id: string) {
  const chtApiUrl = generateChtDBUrl(CHT.url, CHT.username, CHT.password);
  return await axios.get(path.join(chtApiUrl, doc_id), getOptions());
}

export async function queryCht(query: any) {
  const chtApiUrl = generateChtDBUrl(CHT.url, CHT.username, CHT.password);
  return await axios.post(path.join(chtApiUrl, '_find'), query, getOptions());
}

export const generateChtRecordsApiUrl = (chtUrl: string, username: string, password: string) => {
  const endpoint = generateBasicAuthUrl(chtUrl, username, password);
  return path.join(endpoint, '/api/v2/records');
};

export const generateChtDBUrl = (chtUrl: string, username: string, password: string) => {
  const endpoint = generateBasicAuthUrl(chtUrl, username, password);
  return path.join(endpoint, '/medic/');
};
