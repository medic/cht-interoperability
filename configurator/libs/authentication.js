const crypto = require('crypto');
const {
  OPENHIM_API_USERNAME,
  OPENHIM_API_PASSWORD,
  OPENHIM_API_URL,
} = require('../config');
const {fetch} = require('../utils');

// authenticate the username is valid
const authenticate = async (options) => {
    const response = await fetch(`${options.apiURL}/authenticate/${options.username}`);

    if (!response.ok) {
      new Error(`User ${options.username} not found when authenticating with core API`);
    }

    return response.json();
};

// Generate the relevant auth headers
const generateAuthHeaders = async (options) => {
  const authDetails = await authenticate(options);

  const {salt} = authDetails;
  const now = new Date();

  // create passhash
  let shasum = crypto.createHash('sha512');
  shasum.update(salt + options.password);
  const passhash = shasum.digest('hex');

  // create token
  shasum = crypto.createHash('sha512');
  shasum.update(passhash + salt + now);
  const token = shasum.digest('hex');

  // define request headers with auth credentials
  return {
    'auth-username': options.username,
    'auth-ts': now,
    'auth-salt': salt,
    'auth-token': token
  };
};

function generateApiOptions (endpoint) {
  return {
    apiURL: OPENHIM_API_URL,
    apiEndpoint: endpoint,
    username: OPENHIM_API_USERNAME,
    password: OPENHIM_API_PASSWORD,
    rejectUnauthorized: false
  };
}

module.exports = {
  generateAuthHeaders,
  authenticate,
  generateApiOptions
};
