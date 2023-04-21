import axios from 'axios';
import { CHT } from '../../config';
import { generateBasicAuthUrl } from './url';
import https from 'https';
import path from 'path';

const { username, password, url } = CHT;

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

  const chtApiUrl = generateChtRecordsApiUrl(url, username, password);

  return await axios.post(chtApiUrl, record, options);
}

export const generateChtRecordsApiUrl = (chtUrl: string, username: string, password: string) => {
  const endpoint = generateBasicAuthUrl(chtUrl, username, password);
  return path.join(endpoint, '/api/v2/records');
};
