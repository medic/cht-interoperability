const crypto = require('crypto');
const request = require('request');
const {
  OPENHIM_API_USERNAME, OPENHIM_API_PASSWORD,
  OPENHIM_API_HOSTNAME, OPENHIM_API_PORT
} = require('../config/api');

// authenticate the username is valid
const authenticate = async (options) => {
  return new Promise((resolve, reject) => {
    // authenticate the username
    const reqOptions = {
      url: `${options.apiURL}/authenticate/${options.username}`,
      rejectUnauthorized: options.rejectUnauthorized
    };

    request.get(reqOptions, (err, resp, body) => {
      if (err) {
        return reject(err);
      }
      // if user isn't found
      if (resp.statusCode !== 200) {
        return reject(
          new Error(`User ${options.username} not found when authenticating with core API`));
      }
      try {
        body = JSON.parse(body);
        resolve(body);
      } catch (err) {
        reject(err);
      }
    });
  });
};

// Generate the relevant auth headers
const genAuthHeaders = async (options) => {
  const authDetails = await authenticate(options);

  const salt = authDetails.salt;
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
    apiURL: `https://${OPENHIM_API_HOSTNAME}:${OPENHIM_API_PORT}`,
    apiEndpoint: endpoint,
    username: OPENHIM_API_USERNAME,
    password: OPENHIM_API_PASSWORD,
    rejectUnauthorized: false
  };
}

module.exports = {
  genAuthHeaders,
  authenticate,
  generateApiOptions
};
