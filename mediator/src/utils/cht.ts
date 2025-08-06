import axios from 'axios';
import { CHT } from '../../config';
import { generateBasicAuthUrl } from './url';
import https from 'https';
import path from 'path';
import qs from 'qs';
import { logger } from '../../logger';

export const getOptions = () => ({
  httpsAgent: new https.Agent({
    rejectUnauthorized: false,
  }),
  timeout: 10000, // 10 seconds timeout
});

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

export async function createChtOpenImisRecord(patientId: string) {
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

export const generateChtRecordsApiUrl = (chtUrl: string, username: string, password: string) => {
  const endpoint = generateBasicAuthUrl(chtUrl, username, password);
  return path.join(endpoint, '/api/v2/records');
};

export async function pushRecordToChtApi(from: string, message: string) {
  // URL encode the data using qs
  const urlencodedData: string = qs.stringify({ from, message });
  // Construct the server URL
  const chtApiUrl: string = generateChtRecordsApiUrl(CHT.url, CHT.username, CHT.password);

  try {
    // Send a POST request to the CHT API with URL-encoded data
    const res = await axios.post(chtApiUrl, urlencodedData, {
      ...getOptions(),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    return { status: res.status, data: res.data };
  } catch (error: any) {
    logger.error(error);
    return {
      status: error.response?.status || 500,
      data: error.response?.data ||
        { message: 'Internal Server Error' }
    };
  }
}
