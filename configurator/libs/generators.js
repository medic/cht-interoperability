const {generatePassword} = require('../utils');

const CLIENT_ROLES = ['interop'];

async function generateClient (password) {
  const {passwordSalt, passwordHash, passwordAlgorithm} =
    await generatePassword(password);

  return {
    clientID: 'interop-client',
    name: 'Interoperability Client',
    roles: CLIENT_ROLES,
    passwordAlgorithm,
    passwordSalt,
    passwordHash
  };
}

async function generateUser (password) {
  const {passwordSalt, passwordHash, passwordAlgorithm} =
    await generatePassword(password);

  return {
    groups: [
      'admin'
    ],
    firstname: 'Interop',
    surname: 'User',
    email: 'interop@openhim.org',
    passwordAlgorithm,
    passwordHash,
    passwordSalt
  };
}

async function generateHapiFihrChannel () {
  return {
    methods: [
      'GET',
      'POST',
      'DELETE',
      'PUT',
      'OPTIONS',
      'HEAD',
      'TRACE',
      'CONNECT',
      'PATCH'
    ],
    type: 'http',
    allow: CLIENT_ROLES,
    whitelist: [],
    authType: 'private',
    matchContentTypes: [],
    properties: [],
    txViewAcl: [],
    txViewFullAcl: [],
    txRerunAcl: [],
    status: 'enabled',
    rewriteUrls: false,
    addAutoRewriteRules: true,
    autoRetryEnabled: false,
    autoRetryPeriodMinutes: 60,
    routes: [
      {
        type: 'http',
        status: 'enabled',
        forwardAuthHeader: false,
        name: 'FHIR Server',
        secured: false,
        host: 'hapi-fhir',
        port: 8080,
        path: '',
        pathTransform: '',
        primary: true,
        username: '',
        password: ''
      }
    ],
    requestBody: true,
    responseBody: true,
    rewriteUrlsConfig: [],
    name: 'FHIR Server',
    description: 'A FHIR server (HAPI FHIR)',
    urlPattern: '^/fhir/.*$',
    priority: 1,
    matchContentRegex: null,
    matchContentXpath: null,
    matchContentValue: null,
    matchContentJson: null,
    pollingSchedule: null,
    tcpHost: null,
    tcpPort: null,
    alerts: []
  };
}

module.exports = {
  generateClient,
  generateUser,
  generateHapiFihrChannel
};
