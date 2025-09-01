import * as dotenv from 'dotenv';
import path from 'path';

const isDocker = process.env.DOCKER_ENV === 'true';

if (!isDocker) {
  const envPath = path.resolve(__dirname, '../../.env');
  const res = dotenv.config({
    path: envPath
  });
  if (res.error) {
    throw new Error(`Error loading .env file at ${envPath}: ${res.error}`);
  }
}

export const PORT = getEnvironmentVariable('PORT');

export const OPENHIM = {
  username: getEnvironmentVariable('OPENHIM_USERNAME'),
  password: getEnvironmentVariable('OPENHIM_PASSWORD'),
  apiURL: getEnvironmentVariable('OPENHIM_API_URL'),
  trustSelfSigned: true,
};

export const FHIR = {
  url: getEnvironmentVariable('FHIR_URL'),
  username: getEnvironmentVariable('FHIR_USERNAME'),
  password: getEnvironmentVariable('FHIR_PASSWORD'),
};

export const CHT = {
  url: getEnvironmentVariable('CHT_URL'),
  username: getEnvironmentVariable('CHT_USERNAME'),
  password: getEnvironmentVariable('CHT_PASSWORD'),
};

function getEnvironmentVariable(env: string) {
  const value = process.env[env];
  if (typeof value === 'undefined' || value === '') {
    throw new Error(`Missing required environment variable: ${env}`);
  }
  return value;
}
