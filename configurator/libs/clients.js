const {genAuthHeaders, generateApiOptions} = require('./auth');
const crypto = require('crypto');
const {fetch} = require('../utils');

const genClientPassword = (password) => {
  return new Promise((resolve) => {
    const passwordSalt = crypto.randomBytes(16);
    const algorithm = 'sha512';

    // create passhash
    const shasum = crypto.createHash(algorithm);
    shasum.update(password);
    shasum.update(passwordSalt.toString('hex'));
    const passwordHash = shasum.digest('hex');

    resolve({
      passwordSalt: passwordSalt.toString('hex'),
      passwordHash,
      passwordAlgorithm: algorithm
    });
  });
};

async function createClient (clientId, name, password, roles) {
  const apiOptions = generateApiOptions('/clients');

  const {passwordSalt, passwordHash, passwordAlgorithm} =
    await genClientPassword(password);

  const data = {
    clientID: clientId,
    name,
    roles,
    passwordAlgorithm,
    passwordSalt,
    passwordHash
  };

  const headers = await genAuthHeaders(apiOptions);

  const {apiURL, apiEndpoint, rejectUnauthorized} = apiOptions;

  const options = {
    method: 'POST',
    url: `${apiURL}${apiEndpoint}`,
    rejectUnauthorized,
    headers,
    body: JSON.stringify(data),
    json: true
  };

  return fetch(options);
}

async function getClient (clientId) {
  const apiOptions = generateApiOptions('/clients/' + clientId);
  const headers = await genAuthHeaders(apiOptions);
  const {apiURL, apiEndpoint, rejectUnauthorized} = apiOptions;

  const options = {
    method: 'GET',
    url: `${apiURL}${apiEndpoint}`,
    rejectUnauthorized,
    headers
  };

  return fetch(options);
}

async function updateClient (clientId, newPassword, newRoles = undefined) {
  const apiOptions = generateApiOptions('/clients/' + clientId);
  const headers = await genAuthHeaders(apiOptions);

  const {passwordSalt, passwordHash, passwordAlgorithm} = await genClientPassword(newPassword);
  const {apiURL, apiEndpoint, rejectUnauthorized} = apiOptions;

  const data = {
    roles: newRoles,
    clientID: clientId,
    passwordAlgorithm,
    passwordSalt,
    passwordHash
  };

  const options = {
    method: 'PUT',
    url: `${apiURL}${apiEndpoint}`,
    rejectUnauthorized,
    headers,
    body: JSON.stringify(data),
    json: true
  };

  return fetch(options);
}

async function deleteClient (clientId) {
  const apiOptions = generateApiOptions('/clients/' + clientId);
  const headers = await genAuthHeaders(apiOptions);

  const {apiURL, apiEndpoint, rejectUnauthorized} = apiOptions;

  const options = {
    method: 'DELETE',
    url: `${apiURL}${apiEndpoint}`,
    rejectUnauthorized,
    headers
  };

  return fetch(options);
}

module.exports = {
  createClient,
  getClient,
  deleteClient,
  updateClient
};
