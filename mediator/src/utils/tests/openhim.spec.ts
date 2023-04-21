import { logger } from '../../../logger';
import { registerMediatorCallback } from '../openhim';

jest.mock('../../../logger');

describe('registerMediatorCallback', () => {
  it('logs to the console when called without an error', () => {
    registerMediatorCallback();

    expect(logger.info).toHaveBeenCalled();
  });

  it('throws an error if an error was passed', () => {
    expect(() =>
      registerMediatorCallback('ERROR')
    ).toThrowErrorMatchingInlineSnapshot(
      `"Mediator Registration Failed: Reason ERROR"`
    );
  });
});
