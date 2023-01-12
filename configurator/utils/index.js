const request = require('request');

const fetch = (options) => {
  return Promise(function (reject, resolve) {
    return request(options, (error, response, body) => {
      if (error) {
        return reject(error);
      }

      resolve({
        statusCode: response.statusCode,
        metadata: response,
        body
      });
    });
  });
};

module.exports = {
  fetch
};
