import * as dotenv from 'dotenv';
dotenv.config();

export const PORT = process.env.PORT || 6000;

export const OPENHIM = {
  username: getEnvironmentVariable(process.env.OPENHIM_USERNAME, 'interop@openhim.org'),
  password: getEnvironmentVariable(process.env.OPENHIM_PASSWORD, 'interop-password'),
  apiURL: getEnvironmentVariable(process.env.OPENHIM_API_URL, 'https://openhim-core:8080'),
  trustSelfSigned: true,
};

export const FHIR = {
  url: getEnvironmentVariable(process.env.FHIR_URL, 'http://openhim-core:5001/fhir'),
  username: getEnvironmentVariable(process.env.FHIR_USERNAME, 'interop-client'),
  password: getEnvironmentVariable(process.env.FHIR_PASSWORD, 'interop-password'),
};

export const CHT = {
  url: getEnvironmentVariable(process.env.CHT_URL, 'https://nginx'),
  username: getEnvironmentVariable(process.env.CHT_USERNAME, 'admin'),
  password: getEnvironmentVariable(process.env.CHT_PASSWORD, 'password'),
};


function getEnvironmentVariable(env: string | undefined, def: string) {
  if (process.env.NODE_ENV === 'test') {
    return def;
  }
  
  return process.env[env as string] || def;
}
