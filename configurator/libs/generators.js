const {generateClientPassword, generateUserPassword} = require('../utils');

const CLIENT_ROLES = ['interop'];

async function generateClient (password) {
  const {passwordSalt, passwordHash, passwordAlgorithm} =
    await generateClientPassword(password);

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
    await generateUserPassword(password);

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

async function generateOpenMRSChannel (host, port, username, password, type) {
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
    type: type,
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
        type: type,
        status: 'enabled',
        forwardAuthHeader: false,
        name: 'OpenMRS',
        secured: false,
        host: host,
        port: port,
        path: '',
        pathTransform: 's/openmrs/openmrs\/ws\/fhir2\/R4/g',
        primary: true,
        username: username,
        password: password
      }
    ],
    requestBody: true,
    responseBody: true,
    rewriteUrlsConfig: [],
    name: 'OpenMRS',
    description: 'OpenMRS',
    urlPattern: '^/openmrs/.*$',
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
  generateHapiFihrChannel,
  generateOpenMRSChannel
};
