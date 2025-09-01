const dotenv = require('dotenv');
const path = require('path');

const isDocker = process.env.DOCKER_ENV === 'true';

if (!isDocker) {
  const envPath = path.resolve(__dirname, '../../.env');
  const res = dotenv.config({ path: envPath });

  if (res.error) {
    throw new Error(`Error loading .env file at ${ envPath }: ${ res.error }`);
  }
}

const getEnv = (key) => {
  const value = process.env[key];
  if (!value || value.trim() === '') {
    throw new Error(
      `Missing required environment variable: ${key}`
    );
  }
  return value.trim();
};

const OPENHIM_API_URL = getEnv('OPENHIM_API_URL');
const OPENHIM_API_USERNAME = getEnv('OPENHIM_ROOT_USERNAME');
const OPENHIM_API_PASSWORD = getEnv('OPENHIM_ROOT_PASSWORD');
const OPENHIM_CLIENT_PASSWORD = getEnv('OPENHIM_CLIENT_PASSWORD');
const OPENHIM_USER_PASSWORD = getEnv('OPENHIM_USER_PASSWORD');

module.exports = {
  OPENHIM_API_URL,
  OPENHIM_API_USERNAME,
  OPENHIM_API_PASSWORD,
  OPENHIM_CLIENT_PASSWORD,
  OPENHIM_USER_PASSWORD,
};
