import express, {Request, Response} from 'express';
import { mediatorConfig } from './config/mediator';
import { logger } from './logger';
import bodyParser from 'body-parser';
import {PORT, OPENHIM} from './config';
import patientRoutes from './src/routes/patient';
import serviceRequestRoutes from './src/routes/service-request';
import encounterRoutes from './src/routes/encounter';
import organizationRoutes from './src/routes/organization';
import endpointRoutes from './src/routes/endpoint';
import { registerMediatorCallback } from './src/utils/openhim';
import os from 'os';

const {registerMediator} = require('openhim-mediator-utils');

const app = express();
const uptime = os.uptime();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.get('*', (_: Request, res: Response) => {
  res.send({status: 'success', uptime});
});

app.use('/patient', patientRoutes);
app.use('/service-request', serviceRequestRoutes);
app.use('/encounter', encounterRoutes);
app.use('/organization', organizationRoutes);
app.use('/endpoint', endpointRoutes);

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => logger.info(`Server listening on port ${PORT}`));
  
  // TODO => inject the 'port' and 'http scheme' into 'mediatorConfig'  
  registerMediator(OPENHIM, mediatorConfig, registerMediatorCallback);
}

export default app;
