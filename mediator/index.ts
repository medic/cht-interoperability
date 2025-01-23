import express, {Request, Response} from 'express';
import { mediatorConfig } from './config/mediator';
import { openMRSMediatorConfig } from './config/openmrs_mediator';
import { logger } from './logger';
import bodyParser from 'body-parser';
import {PORT, OPENHIM, OPENMRS} from './config';
import patientRoutes from './src/routes/patient';
import serviceRequestRoutes from './src/routes/service-request';
import encounterRoutes from './src/routes/encounter';
import organizationRoutes from './src/routes/organization';
import endpointRoutes from './src/routes/endpoint';
import chtRoutes from './src/routes/cht';
import openMRSRoutes from './src/routes/openmrs';
import { registerMediatorCallback, registerOpenMRSMediatorCallback } from './src/utils/openhim';
import os from 'os';

const {registerMediator} = require('openhim-mediator-utils');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.get('/', (_: Request, res: Response) => {
  const osUptime = os.uptime();
  const processUptime = process.uptime();
  res.send({status: 'success', osuptime: osUptime, processuptime: processUptime});
});

// routes for valid fhir resources
app.use('/patient', patientRoutes);
app.use('/service-request', serviceRequestRoutes);
app.use('/encounter', encounterRoutes);
app.use('/organization', organizationRoutes);
app.use('/endpoint', endpointRoutes);

// routes for CHT docs
app.use('/cht', chtRoutes);

// routes for OpenMRS
app.use('/openmrs', openMRSRoutes);

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    logger.info(`Server listening on port ${PORT}`);
  });
  
  // TODO => inject the 'port' and 'http scheme' into 'mediatorConfig'  
  registerMediator(OPENHIM, mediatorConfig, registerMediatorCallback);

  // if OPENMRS is specified, register its mediator
  if (OPENMRS.url) {
    registerMediator(OPENHIM, openMRSMediatorConfig, registerOpenMRSMediatorCallback);
  }
}

export default app;
