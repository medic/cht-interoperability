const url = require('url');

function requestHandler(handler) {
  return  (req, res) => {
    handler(req)
    .then(({status, data}) => {
      res.status(status).send(data);
    });
  };
}

function generateApiUrl(chtUrl, username, password) {
  const parsedUrl = url.parse(chtUrl);
  const {protocol, hostname, port} = parsedUrl;
  const apiURL = `${protocol}//${username}:${password}@${hostname}/api/v2/records`;

  return apiURL;
}

module.exports = {
  requestHandler,
  generateApiUrl,
};
