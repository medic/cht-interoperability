import {Request, Response} from 'express';
import { mediatorConfig } from './mediator-config';
import { logger } from './logger';
import express from 'express';
import bodyParser from 'body-parser';
import {PORT, OPENHIM} from './config';
import patientRoutes from './src/routes/patient';
import serviceRequestRoutes from './src/routes/service-request';
import encounterRoutes from './src/routes/encounter';

const {registerMediator} = require('openhim-mediator-utils');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.get('*', (_: Request, res: Response) => {
  res.send({status: 'success'});
});

app.use('/patient', patientRoutes);
app.use('/service-request', serviceRequestRoutes);
app.use('/encounter', encounterRoutes);

app.listen(PORT, () => logger.info(`Server listening on port ${PORT}`));

// TODO => inject the 'port' and 'http scheme' into 'mediatorConfig'

const registerMediatorCallback = (err: string): void => {
  if (err) {
    throw new Error(`Mediator Registration Failed: Reason ${err}`);
  }

  logger.info('Successfully registered mediator.');
};

registerMediator(OPENHIM, mediatorConfig, registerMediatorCallback);
