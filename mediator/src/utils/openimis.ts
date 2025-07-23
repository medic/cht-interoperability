import { CHT, OPENIMIS } from '../../config';
import axios from 'axios';
import { Subscription } from 'fhir/r4';

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
    console.warn(`Invalid subscriberEndpoint provided: ${callbackEndpoint}. Please ensure it's a valid URL.`);

    throw new Error('Invalid subscriber Endpoint');
  }

  // The header array contains a stringified JSON object.
  // Note: FHIR headers are typically key-value pairs, but the example shows a single stringified JSON.
  // We will adhere to the example's format.
  const headers: string[] = ['{"Content-Type": "application/json", "Accept": "application/json"}'];

  return {
    resourceType: 'Subscription',
    status: 'active',
    end: endDate,
    reason,
    criteria,
    channel: {
      type: 'rest-hook', endpoint: callbackEndpoint, header: headers
    }
  };
};
