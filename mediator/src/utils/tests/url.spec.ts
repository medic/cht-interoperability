import { generateBasicAuthUrl, generateChtRecordsApiUrl } from "../url";

describe("generateChtRecordsApiUrl", () => {
  it("returns an basic auth cht url and path to records", () => {
    const endpoint = "https://cht.medic.org"
    const username = "username"
    const password = "password"

    const api = generateChtRecordsApiUrl(endpoint, username, password);

    expect(api).toBe("https:/username:password@cht.medic.org/api/v2/records")
  })
})

describe("generateBasicAuthUrl", () => {
  it("adds basic auth to an endpoint", () => {
    const endpoint = "https://google.com"
    const username = "username"
    const password = "password"

    const api = generateBasicAuthUrl(endpoint, username, password);

    expect(api).toBe("https://username:password@google.com/")
  })

  it("adds basic auth to endpoint with port", () => {
    const endpoint = "https://google.com:5000"
    const username = "username"
    const password = "password"

    const api = generateBasicAuthUrl(endpoint, username, password);

    expect(api).toBe("https://username:password@google.com:5000/")
  })

  it("add basic auth to endpoint with path", () => {
    const endpoint = "https://google.com/testing"
    const username = "username"
    const password = "password"

    const api = generateBasicAuthUrl(endpoint, username, password);

    expect(api).toBe("https://username:password@google.com/testing")
  })

  it("throws an error if the username is invalid or undefined", () => {
    const invalidUsername = undefined as any;
    const password = "password";
    const endpoint = "https://google.com";

    expect(() => generateBasicAuthUrl(endpoint, invalidUsername, password)).toThrowErrorMatchingSnapshot();
  })

  it("throws an error if the password is invalid or undefined", () => {
    const username = "username";
    const invalidPassword = undefined as any;
    const endpoint = "https://google.com";

    expect(() => generateBasicAuthUrl(endpoint, username, invalidPassword)).toThrowErrorMatchingSnapshot();
  })

  it("throws an error if the endpoint is undefined", () => {
    const username = "username";
    const password = "password";
    const invalidEndpoint = undefined as any;

    expect(() => generateBasicAuthUrl(invalidEndpoint, username, password)).toThrowErrorMatchingSnapshot();
  })
})
