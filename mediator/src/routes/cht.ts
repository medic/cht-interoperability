import { Router } from 'express';
import { requestHandler } from '../utils/request';
import { logger } from '../../logger';
import { convertChtClaimToFhirCommunication } from '../mappers/openIMIS-interop/claims_communication_mapper';
import axios from 'axios';
import { login } from '../utils/openimis';
import { Fhir } from 'fhir';

const router = Router();
const fhir = new Fhir();

router.post('/', requestHandler(async req => {
  try {
    const chtFeedbackPayload = req.body;

    console.log('Received CHT feedback payload:', chtFeedbackPayload);

    const communicationPayload = convertChtClaimToFhirCommunication(chtFeedbackPayload);
    console.log('Converted FHIR Communication payload:', communicationPayload);

    const loginRes = await login();
    console.log('loginRes', loginRes);
    const token = loginRes?.token;

    const res = await axios.post('https://openimis.s2.openimis.org/api/api_fhir_r4/Communication/', communicationPayload, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/fhir+json'
      }
    });

    console.log('Response from OpenIMIS:', res);

    return {
      status: res.status, data: {
        message: res.statusText, communication: communicationPayload
      }
    };
  } catch (error) {
    logger.error('Error processing CHT feedback:', error);
    return {
      status: 500, data: {
        message: 'Failed to process CHT feedback', error: error instanceof Error ? error.message : 'Unknown error'
      }
    };
  }
}));

export default router;
