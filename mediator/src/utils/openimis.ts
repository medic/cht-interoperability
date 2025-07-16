import { OPENIMIS, CHT } from '../../config';
import axios from 'axios';

interface LoginResponse {
  token: string;
  exp: number;
}

/**
 * Interface for the Subscription Channel object.
 */
interface SubscriptionChannel {
  type: 'rest-hook';
  endpoint: string;
  header: string[];
}

/**
 * Interface for the FHIR Subscription resource.
 */
interface Subscription {
  resourceType: 'Subscription';
  status: 'active';
  end: string; // ISO 8601 format, e.g., "2029-12-31T23:59:59Z"
  reason: string;
  criteria: string;
  channel: SubscriptionChannel;
}

/**
 * Interface for the expected response from the FHIR Subscription creation.
 * FHIR resources typically have an 'id' and 'meta' on creation.
 */
interface SubscriptionResponse {
  resourceType: string;
  id: string;
  meta?: {
    versionId?: string; lastUpdated?: string;
  };
  // Include other properties you expect in the successful response,
  // such as the full subscription resource that was created/returned
  [key: string]: any; // Allow for other dynamic properties
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

export const subscribe = async (): Promise<SubscriptionResponse | null> => {
  // NOTE: not sure where to store the token for now
  // so doing a login everytime for now
  const loginRes = await login();

  if (!loginRes) {
    throw new Error('Could not login');
  }

  const subscriptionPayload = createFhirSubscriptionPayload(OPENIMIS.chtCallbackEndpoint);

  try {
    const response = await axios.post(`${OPENIMIS.baseUrl}${OPENIMIS.endpoints.subscription}`, subscriptionPayload, {
      headers: {
        'Authorization': `Bearer ${loginRes.token}`, 'Content-Type': 'application/json'
      }
    });

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        'Failed to create FHIR Subscription:', error.response?.status, error.response?.data || error.message
      );
    } else {
      console.error('An unexpected error occurred while creating FHIR Subscription:', error);
    }
    return null;
  }
};

/**
 * Generates a FHIR Subscription resource payload.
 *
 * @param chtCallbackEndpoint The URL where the subscription notifications will be sent.
 * @param endDate The end date for the subscription in ISO 8601 format (e.g., "2029-12-31T23:59:59Z").
 * Defaults to "2029-12-31T23:59:59Z" if not provided.
 * @returns A JSON object representing the FHIR Subscription resource.
 */
const createFhirSubscriptionPayload = (chtCallbackEndpoint: string, endDate = '2029-12-31T23:59:59Z'): Subscription => {
  try {
    // NOTE: add additional validation if possible
    new URL(`${CHT.url}${chtCallbackEndpoint}`);
  } catch (error) {
    console.warn(`Invalid subscriberEndpoint provided: ${chtCallbackEndpoint}. Please ensure it's a valid URL.`);

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
    reason: 'Notify on new Claims',
    criteria: 'Claim',
    channel: {
      type: 'rest-hook', endpoint: chtCallbackEndpoint, header: headers
    }
  };
};
