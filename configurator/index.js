const {OPENHIM_USER_PASSWORD, OPENHIM_CLIENT_PASSWORD} = require('./config');
const {generateApiOptions, generateAuthHeaders} = require('./libs/authentication');
const {generateUser, generateClient, generateHapiFihrChannel} = require('./libs/generators');
const {fetch} = require('./utils');
const logger = require('./logger');

async function handleConfiguration () {
  const metadata = {
    Users: [],
    Clients: [],
    Channels: [],
    Mediators: [],
    ContactGroups: []
  };

  metadata.Users.push(await generateUser(OPENHIM_USER_PASSWORD));
  metadata.Clients.push(await generateClient(OPENHIM_CLIENT_PASSWORD));
  metadata.Channels.push(await generateHapiFihrChannel());

  const data = JSON.stringify(metadata);
  const apiOptions = generateApiOptions('/metadata');
  const headers = await generateAuthHeaders(apiOptions);

  const {apiURL, apiEndpoint} = apiOptions;
  const url = `${apiURL}${apiEndpoint}`;

  const response = await fetch(url, {
    body: data,
    method: 'POST',
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    }
  });

  if (response.status !== 201) {
    logger.error('Failed to setup OpenHIM Server.');
    throw new Error(JSON.stringify(response, null, 4));
  }

  logger.info('OpenHIM Server setup was successful');
}

handleConfiguration();
