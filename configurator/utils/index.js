const nodeFetch = require('node-fetch');
const https = require('https');
const crypto = require('crypto');

const fetch = (url, options = {}) => {
  const httpsAgent = new https.Agent({rejectUnauthorized: false,});
  return nodeFetch(url, {...options, agent: httpsAgent});
};

const generatePassword = (password) => {
  return new Promise((resolve) => {
    const passwordSalt = crypto.randomBytes(16);
    const salt = passwordSalt.toString('hex');
    const algorithm = 'sha512';

    const shasum = crypto.createHash(algorithm);
    shasum.update(salt);
    shasum.update(password);
    const passwordHash = shasum.digest('hex');

    resolve({
      passwordSalt: salt,
      passwordHash,
      passwordAlgorithm: algorithm
    });
  });
};

module.exports = {
  fetch,
  generatePassword
};
