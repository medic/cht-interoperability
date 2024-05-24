require('dotenv/config');

const OPENHIM_API_HOSTNAME = process.env.OPENHIM_API_HOSTNAME || 'openhim-core';
const OPENHIM_API_PASSWORD =
  process.env.OPENHIM_PASSWORD || 'openhim-password';
const OPENHIM_API_PORT = process.env.OPENHIM_API_PORT || 8080;
const OPENHIM_API_USERNAME =
  process.env.OPENHIM_USERNAME || 'root@openhim.org';
const OPENHIM_CLIENT_PASSWORD = process.env.OPENHIM_CLIENT_PASSWORD || 'interop-password';
const OPENHIM_USER_PASSWORD = process.env.OPENHIM_USER_PASSWORD || 'interop-password';

const OPENMRS_HOST = process.env.OPENMRS || 'openmrs';
const OPENMRS_PORT = process.env.OPENMRS_PORT || 8090;
const OPENMRS_USERNAME =
  process.env.OPENMRS_USERNAME || 'admin';
const OPENMRS_PASSWORD = 
  process.env.OPENMRS_PASSWORD || 'Admin123';
const OPENMRS_PROTOCOL = process.env.OPENMRS_PROTOCOL || 'http'

module.exports = {
  OPENHIM_API_HOSTNAME,
  OPENHIM_API_PASSWORD,
  OPENHIM_API_PORT,
  OPENHIM_API_USERNAME,
  OPENHIM_CLIENT_PASSWORD,
  OPENHIM_USER_PASSWORD,

  OPENMRS_HOST,
  OPENMRS_PORT,
  OPENMRS_USERNAME,
  OPENMRS_PASSWORD,
  OPENMRS_PROTOCOL
};
