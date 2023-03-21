require('dotenv/config');

const OPENHIM_API_HOSTNAME = process.env.OPENHIM_API_HOSTNAME || 'openhim-core';
const OPENHIM_API_PASSWORD =
  process.env.OPENHIM_PASSWORD || 'openhim-password';
const OPENHIM_API_PORT = process.env.OPENHIM_API_PORT || 8080;
const OPENHIM_API_USERNAME =
  process.env.OPENHIM_USERNAME || 'root@openhim.org';
const OPENHIM_CLIENT_PASSWORD = process.env.OPENHIM_CLIENT_PASSWORD || 'interop-password';
const OPENHIM_USER_PASSWORD = process.env.OPENHIM_USER_PASSWORD || 'interop-password';

module.exports = {
  OPENHIM_API_HOSTNAME,
  OPENHIM_API_PASSWORD,
  OPENHIM_API_PORT,
  OPENHIM_API_USERNAME,
  OPENHIM_CLIENT_PASSWORD,
  OPENHIM_USER_PASSWORD
};
