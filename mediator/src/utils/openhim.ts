import { logger } from '../../logger';
import { registerOpenMRSListeners } from './openmrs-listener';

export const registerOpenMRSMediatorCallback = (err?: string): void => {
  if (err) {
    throw new Error(`OpenMRS Mediator Registration Failed: Reason ${err}`);
  }

  logger.info('Successfully registered OpenMRS mediator.');
  registerOpenMRSListeners();
};

export const registerMediatorCallback = (err?: string): void => {
  if (err) {
    throw new Error(`Mediator Registration Failed: Reason ${err}`);
  }

  logger.info('Successfully registered mediator.');
};
