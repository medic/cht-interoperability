import { logger } from "../../logger";

export const registerMediatorCallback = (err?: string): void => {
  if (err) {
    throw new Error(`Mediator Registration Failed: Reason ${err}`);
  }

  logger.info('Successfully registered mediator.');
};
