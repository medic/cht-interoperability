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

module.exports = {
  fetch,
  generatePassword
};
