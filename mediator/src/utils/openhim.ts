import { logger } from '../../logger';
import { addListeners } from './openmrs-listener';

export const registerOpenMRSMediatorCallback = (err?: string): void => {
  if (err) {
    throw new Error(`OpenMRS Mediator Registration Failed: Reason ${err}`);
  }

  logger.info('Successfully registered OpenMRS mediator.');
  addListeners();
};

export const registerMediatorCallback = (err?: string): void => {
  if (err) {
    throw new Error(`Mediator Registration Failed: Reason ${err}`);
  }

  logger.info('Successfully registered mediator.');
};
