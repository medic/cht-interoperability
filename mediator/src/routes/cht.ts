import { Router } from 'express';
import { requestHandler } from '../utils/request';
import { logger } from '../../logger';
import { convertChtClaimToFhirCommunication } from '../mappers/openIMIS-interop/claims_communication_mapper';
import axios from 'axios';
import { login } from '../utils/openimis';
import { OPENIMIS } from '../../config';

const router = Router();

router.post('/', requestHandler(async req => {
  try {
    const chtFeedbackPayload = req.body;
    logger.debug('Received CHT feedback payload:', chtFeedbackPayload);

    const communicationPayload = convertChtClaimToFhirCommunication(chtFeedbackPayload);
    logger.debug('Converted CHT feedback to OpenIMIS communication payload:', communicationPayload);

    const loginRes = await login();
    const token = loginRes?.token;

    const res = await axios.post(
      `${OPENIMIS.baseUrl}${OPENIMIS.endpoints.communication}`,
      communicationPayload, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
    logger.debug('CHT feedback processed successfully:');
    logger.debug(`Status: ${res.status} - ${res.statusText}`);
    logger.debug(`Data: ${JSON.stringify(res.data)}`);

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
