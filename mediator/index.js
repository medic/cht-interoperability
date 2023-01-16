const {PORT, OPENHIM} = require('./config');
const express = require('express');
const {registerMediator} = require('openhim-mediator-utils');
const mediatorConfig = require('./mediator-config.json');

const app = express();

app.get('*', (_, res) => {
  res.send({status: 'success'});
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

// TODO => inject the 'port' and 'http scheme' into 'mediatorConfig'

registerMediator(OPENHIM, mediatorConfig, err => {
  if (err) {
    throw new Error(`Mediator Registration Failed: Reason ${err}`);
  }

  console.log('Successfully registered mediator.');
});
