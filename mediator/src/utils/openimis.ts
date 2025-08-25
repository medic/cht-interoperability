import { CHT, FHIR, OPENIMIS } from '../../config';
import axios from 'axios';
import { ClaimResponse, Subscription } from 'fhir/r4';
import { logger } from '../../logger';
import { createChtOpenImisRecord } from './cht';
import { addOpenIMISId, getContactDocumentByPhone, PatientInfo } from './db';
import NepaliDate from 'nepali-datetime';

interface LoginResponse {
  token: string;
  exp: number;
}

export const login = async (username = '', password = ''): Promise<LoginResponse | null> => {
  const url = `${OPENIMIS.baseUrl}${OPENIMIS.endpoints.login}`;

  try {
    const response = await axios.post<LoginResponse>(url, {
      username: username || OPENIMIS.username, password: password || OPENIMIS.password
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    return response.data;
  } catch (error) {
    logger.error('Error logging in to OpenIMIS:', error);
    return null;
  }
};

/**
 * Generates a FHIR Subscription resource payload for OpenIMIS.
 *
 * @param callbackEndpoint The URL where the subscription notifications will be sent.
 * @param criteria The resource type to subscribe to
 * @param reason A human-readable string describing the reason of subscription
 * @param endDate The end date for the subscription in ISO 8601 format (e.g., "2029-12-31T23:59:59Z").
 * Defaults to "2029-12-31T23:59:59Z" if not provided.
 * @returns A JSON object representing the FHIR Subscription resource.
 */
export const createFhirSubscriptionPayload = (
  callbackEndpoint: string,
  criteria: string,
  reason: string,
  endDate = '2029-12-31T23:59:59Z'
): Subscription => {
  try {
    // NOTE: add additional validation if possible
    new URL(`${CHT.url}${callbackEndpoint}`);
  } catch (error) {
    logger.warn(`Invalid subscriberEndpoint provided: ${callbackEndpoint}. Please ensure it's a valid URL.`);

    throw new Error('Invalid subscriber Endpoint');
  }

  const basicAuthHeader = Buffer.from(`${FHIR.username}:${FHIR.password}`).toString('base64');
  // The header array contains a stringified JSON object.
  // Note: FHIR headers are typically key-value pairs, but the example shows a single stringified JSON.
  // We will adhere to the example's format.
  const headerObject = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': `Basic ${basicAuthHeader}`
  };
  const headers: string[] = [JSON.stringify(headerObject)];

  return {
    resourceType: 'Subscription',
    status: 'active',
    end: endDate,
    reason,
    criteria,
    channel: {
      type: 'rest-hook',
      endpoint: callbackEndpoint,
      header: headers
    }
  };
};

export const getOpenImisPatientId = (claimResponse: ClaimResponse) => {
  // Extract patient ID from patient.reference (e.g., "Patient/{id}")
  let openImisPatientId: string | undefined;
  if (claimResponse.patient?.reference) {
    const parts = claimResponse.patient.reference.split('/');
    openImisPatientId = parts.length > 1 ? parts[1] : parts[0];
  }


  return openImisPatientId;
};

export const createPerson = async (claimResponse: ClaimResponse, phone: string) => {
  // TODO: use the patient ID from the claimResponse to fetch the patient details
  // from OpenIMIS API and create a person in CHT.
  // For now, we will generate a random phone number and create a patient in CHT
  const record = {
    _meta: {
      form: 'N',
      from: '+9779841171819',
    },
    age_in_years: 22,
    patient_phone: phone,
    patient_name: generateRandomString(10)
  };
  return await createChtOpenImisRecord(record);
};

const generateRandomString = (
  length = 10,
  characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
): string => {
  let result = '';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
};

const pushClaimToCht = async (claimResponse: ClaimResponse, patient: any) => {
  // process claim date
  const claimDate = NepaliDate.parseEnglishDate(
    claimResponse.created,
    'YYYY-MM-DD'
  );
  const [year, month, day] = claimDate.format('YYYY-MM-DD').split('-');

  // process claim identifier to get the code
  const codeIdentifier = claimResponse?.identifier?.find(
    (id) => id?.type?.coding?.[0]?.code === 'Code'
  );
  const claimId = codeIdentifier?.value;

  const record = {
    _meta: {
      form: 'OP',
      from: '+9779841171819',
    },
    patient_id: patient.patient_id,
    op_claim_id: claimId,
    op_claim_uuid: claimResponse.id,
    op_year: year,
    op_month: month,
    op_day: day,
    op_date: claimDate.getTime()
  };

  return await createChtOpenImisRecord(record);
};

export const processClaimResponse = async (claimResponse: ClaimResponse) => {
  const openImisPatientId = getOpenImisPatientId(claimResponse);

  if (!openImisPatientId) {
    return {
      status: 400,
      data: {
        message: 'Patient ID not found in claim response',
        error: 'Invalid claim response format'
      }
    };
  }

  const phone = '+9779808' + Math.floor(100000 + Math.random() * 900000);
  const createPatientResponse = await createPerson(claimResponse, phone);

  if (createPatientResponse.errors) {
    return {
      status: createPatientResponse.status,
      data: createPatientResponse.errors
    };
  }

  try {
    const patient: any = await getContactDocumentByPhone(phone);
    if (!patient?.phone) {
      throw new Error('Patient not found with the provided phone number');
    }
    
    const patient_info = { 'phone_number': patient.phone, 'openimis_id': openImisPatientId } as PatientInfo;
    await addOpenIMISId(patient_info);
    await pushClaimToCht(claimResponse, patient);

    return {
      status: 201,
      data: {
        message: 'Patient\'s claim created successfully',
        patientId: patient._id,
        openimis_id: patient.openimis_id
      }
    };
  } catch (error: any) {
    logger.error('Error creating patient in CHT:', error);
    
    return {
      status: 500,
      data: {
        message: 'Failed to create patient\'s claim in CHT',
        error: 'Internal Server Error',
      }
    };
  }
};
