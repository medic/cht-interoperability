import { generateBasicAuthUrl } from '../url';

describe('generateBasicAuthUrl', () => {
  it('adds basic auth to an endpoint', () => {
    const endpoint = 'https://google.com';
    const username = 'username';
    const password = 'password';

    const api = generateBasicAuthUrl(endpoint, username, password);

    expect(api).toBe('https://username:password@google.com/');
  });

  it('adds basic auth to endpoint with port', () => {
    const endpoint = 'https://google.com:5000';
    const username = 'username';
    const password = 'password';

    const api = generateBasicAuthUrl(endpoint, username, password);

    expect(api).toBe('https://username:password@google.com:5000/');
  });

  it('add basic auth to endpoint with path', () => {
    const endpoint = 'https://google.com/testing';
    const username = 'username';
    const password = 'password';

    const api = generateBasicAuthUrl(endpoint, username, password);

    expect(api).toBe('https://username:password@google.com/testing');
  });

  it('throws an error if the username is invalid or undefined', () => {
    const invalidUsername = undefined as any;
    const password = 'password';
    const endpoint = 'https://google.com';

    expect(() =>
      generateBasicAuthUrl(endpoint, invalidUsername, password)
    ).toThrowErrorMatchingInlineSnapshot(`"Invalid username and password"`);
  });

  it('throws an error if the password is invalid or undefined', () => {
    const username = 'username';
    const invalidPassword = undefined as any;
    const endpoint = 'https://google.com';

    expect(() =>
      generateBasicAuthUrl(endpoint, username, invalidPassword)
    ).toThrowErrorMatchingInlineSnapshot(`"Invalid username and password"`);
  });

  it('throws an error if the endpoint is undefined', () => {
    const username = 'username';
    const password = 'password';
    const invalidEndpoint = undefined as any;

    expect(() =>
      generateBasicAuthUrl(invalidEndpoint, username, password)
    ).toThrowErrorMatchingInlineSnapshot(
      `"The "url" argument must be of type string. Received undefined"`
    );
  });
});
