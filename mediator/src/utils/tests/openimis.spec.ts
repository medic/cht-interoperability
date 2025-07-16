import { login, subscribe } from '../openimis';

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
      const res = await subscribe();

      expect(res).toBeDefined();
      expect(res?.resourceType).toEqual('Subscription');
      expect(res?.id).toBeDefined();
      expect(res?.criteria).toEqual('Claim');
    });
  });
});
