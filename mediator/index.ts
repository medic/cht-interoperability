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
import chtRoutes from './src/routes/cht';
import { registerMediatorCallback } from './src/utils/openhim';
import { syncPatients, syncEncounters } from './src/utils/openmrs_sync'
import os from 'os';

const {registerMediator} = require('openhim-mediator-utils');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.get('*', (_: Request, res: Response) => {
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

// routes for cht docs
app.use('/cht', chtRoutes);

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => logger.info(`Server listening on port ${PORT}`));
  
  // TODO => inject the 'port' and 'http scheme' into 'mediatorConfig'  
  registerMediator(OPENHIM, mediatorConfig, registerMediatorCallback);

  // start patient and ecnounter sync in the background
  setInterval(async () => {
    try {
      await syncPatients();
      await syncEncounters();
    } catch (error: any) {
      logger.error(error);
    }
  }, Number(process.env.SYNC_INTERVAL || (1000 * 60)));
}

export default app;
