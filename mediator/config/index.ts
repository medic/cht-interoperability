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
  timeout: Number(getEnvironmentVariable('REQUEST_TIMEOUT', '5000'))
};

export const CHT = {
  url: getEnvironmentVariable('CHT_URL', 'https://nginx'),
  username: getEnvironmentVariable('CHT_USERNAME', 'admin'),
  password: getEnvironmentVariable('CHT_PASSWORD', 'password'),
  timeout: Number(getEnvironmentVariable('REQUEST_TIMEOUT', '5000'))
};

export const OPENMRS = {
  url: getEnvironmentVariable('OPENMRS_CHANNEL_URL', 'http://openhim-core:5001/openmrs'),
  username: getEnvironmentVariable('OPENMRS_CHANNEL_USERNAME', 'interop-client'),
  password: getEnvironmentVariable('OPENMRS_CHANNEL_PASSWORD', 'interop-password'),
  timeout: Number(getEnvironmentVariable('REQUEST_TIMEOUT', '5000'))
};

// hard code sync interval to 1 minute because it is hard coded in mediator config
export const SYNC_INTERVAL = '60';
// how far back shoudl the sync look for new resources
export const SYNC_PERIOD = getEnvironmentVariable('SYNC_PERIOD', '3600');

function getEnvironmentVariable(env: string, def: string) {
  if (process.env.NODE_ENV === 'test') {
    return def;
  }
  
  return process.env[env] || def;
}
