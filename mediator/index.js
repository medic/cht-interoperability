const express = require('express');
const bodyParser = require('body-parser');
const {PORT, OPENHIM} = require('./config');
const {registerMediator} = require('openhim-mediator-utils');
const mediatorConfig = require('./mediator-config.json');
const patientRoutes = require('./src/routes/patient');
const serviceRequestRoutes = require('./src/routes/service-request');
const logger = require('./logger');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.get('*', (_, res) => {
  res.send({status: 'success'});
});

app.use('/patient', patientRoutes);
app.use('/service-request', serviceRequestRoutes);

app.listen(PORT, () => logger.info(`Server listening on port ${PORT}`));

// TODO => inject the 'port' and 'http scheme' into 'mediatorConfig'

registerMediator(OPENHIM, mediatorConfig, err => {
  if (err) {
    throw new Error(`Mediator Registration Failed: Reason ${err}`);
  }

  logger.info('Successfully registered mediator.');
});
