import axios from 'axios';
import { CHT } from '../../config';
import { generateBasicAuthUrl } from './url';
import https from 'https';

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

export const generateChtRecordsApiUrl = (chtUrl: string, username: string, password: string) => {
  const endpoint = generateBasicAuthUrl(chtUrl, username, password);

  return new URL('/api/v2/records', endpoint).toString();
};
