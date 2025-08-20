import * as dotenv from 'dotenv';
dotenv.config();

export const PORT = process.env.PORT || 6000;

export const OPENHIM = {
  username: getEnvironmentVariable('OPENHIM_USERNAME', 'interop@openhim.org'),
  password: getEnvironmentVariable('OPENHIM_PASSWORD', 'interop-password'),
  apiURL: getEnvironmentVariable('OPENHIM_API_URL', 'https://openhim-core:8080'),
  trustSelfSigned: true,
};

export const FHIR = {
  url: getEnvironmentVariable('FHIR_URL', 'http://openhim-core:5001/fhir'),
  username: getEnvironmentVariable('FHIR_USERNAME', 'interop-client'),
  password: getEnvironmentVariable('FHIR_PASSWORD', 'interop-password'),
};

export const CHT = {
  url: getEnvironmentVariable('CHT_URL', 'https://nginx'),
  username: getEnvironmentVariable('CHT_USERNAME', 'admin'),
  password: getEnvironmentVariable('CHT_PASSWORD', 'password'),
};

export const OPENIMIS = {
  baseUrl: getEnvironmentVariable('OPENIMIS_API_URL', 'http://localhost:5000'),
  username: getEnvironmentVariable('OPENIMIS_USERNAME', 'admin'),
  password: getEnvironmentVariable('OPENIMIS_PASSWORD', 'password'),
  endpoints: {
    login: '/api/api_fhir_r4/login/',
    subscription: '/api/api_fhir_r4/Subscription/',
    communication: '/api/api_fhir_r4/Communication/',
  },
  chtCallbackEndpoint: getEnvironmentVariable('CHT_OPENIMIS_CALLBACK_ENDPOINT', '/api/openimis/callback'),
};

function getEnvironmentVariable(env: string, def: string) {
  if (process.env.NODE_ENV === 'test') {
    return def;
  }
  
  return process.env[env] || def;
}
