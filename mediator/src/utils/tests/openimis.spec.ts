import { createFhirSubscriptionPayload, login } from '../openimis';
import { createFHIRSubscriptionResource } from '../fhir';
import { OPENIMIS } from '../../../config';

// NOTE: these tests contain actual calls to DB and other endpoints
// this will be mocked later on
describe('OpenIMIS', () => {
  describe('login', () => {
    it('should login with correct credentials', async () => {
      const res = await login();

      expect(res?.token).toBeDefined();
      expect(res?.exp).toBeDefined();
    });

    it('should not login with incorrect credentials', async () => {
      const res = await login('wrong username', 'wrong password');

      expect(res).toBe(null);
    });
  });

  describe('subscribe', () => {
    it('should subscribe to Claim resource', async () => {
      const url = `${OPENIMIS.baseUrl}${OPENIMIS.endpoints.subscription}`;
      const payload = createFhirSubscriptionPayload(OPENIMIS.chtCallbackEndpoint, 'Claim', 'Notify on new Claims');
      const loginRes = await login();
      const token = loginRes?.token;
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json'
        }
      };
      const res = await createFHIRSubscriptionResource(url, payload, config);
      const resData = await res.data;

      expect(res).toBeDefined();
      expect(resData?.resourceType).toEqual('Subscription');
      expect(resData?.id).toBeDefined();
      expect(resData?.criteria).toEqual('Claim');
    });
  });
});
