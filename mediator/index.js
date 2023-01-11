const { PORT, OPENHIM } = require('./config');
const express = require('express');
const { registerMediator } = require('openhim-mediator-utils');
const mediatorConfig = require('./mediator-config.json');

const app = express();

app.all('*', (_, res) => {
  res.send({ status: 'successful' });
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

registerMediator(OPENHIM, mediatorConfig, err => {
  if (err) {
    throw new Error(`Failed to register mediator, Check your mediator configuration. ${err}`);
  }

  console.log('Successfully registered mediator.');
});
