module.exports = {
  ROLES: process.env.OPENHIM_CLIENT_ROLES.split(',') || ['interoperability'],
  CLIENT_ID: process.env.OPENHIM_CLIENT_ID || 'medic-interop-client',
  NAME: process.env.OPENHIM_CLIENT_NAME || 'Interoperability Client'
};
