import { sync, startListeners, stopListeners } from '../openmrs';
import * as openmrsSync from '../../utils/openmrs_sync';
import * as openmrsListener from '../../utils/openmrs-listener';
import { logger } from '../../../logger';
import { SYNC_PERIOD } from '../../../config';

jest.mock('../../../logger');
jest.mock('../../utils/openmrs_sync');
jest.mock('../../utils/openmrs-listener');

describe('OpenMRS Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('sync', () => {
    it('syncs patients and encounters successfully', async () => {
      const syncPatientsSpy = jest.spyOn(openmrsSync, 'syncPatients').mockResolvedValueOnce();
      const syncEncountersSpy = jest.spyOn(openmrsSync, 'syncEncounters').mockResolvedValueOnce();

      const result = await sync();

      // Verify sync period calculation
      const expectedStartTime = new Date(Date.now() - parseInt(SYNC_PERIOD, 10) * 1000);
      expect(syncPatientsSpy).toHaveBeenCalledWith(expect.any(Date));
      expect(syncEncountersSpy).toHaveBeenCalledWith(expect.any(Date));

      // Verify the timestamps are within 1 second of expected
      const patientCallTime = syncPatientsSpy.mock.calls[0][0] as Date;
      const encounterCallTime = syncEncountersSpy.mock.calls[0][0] as Date;
      expect(Math.abs(patientCallTime.getTime() - expectedStartTime.getTime())).toBeLessThan(1000);
      expect(Math.abs(encounterCallTime.getTime() - expectedStartTime.getTime())).toBeLessThan(1000);

      expect(result).toEqual({
        status: 200,
        data: { message: 'OpenMRS sync completed successfully' }
      });
    });

    it('handles sync errors', async () => {
      const error = new Error('Sync failed');
      jest.spyOn(openmrsSync, 'syncPatients').mockRejectedValueOnce(error);

      const result = await sync();

      expect(logger.error).toHaveBeenCalledWith(error);
      expect(result).toEqual({
        status: 500,
        data: { message: 'Error during OpenMRS Sync' }
      });
    });
  });

  describe('startListeners', () => {
    it('starts listeners successfully', async () => {
      const addListenersSpy = jest.spyOn(openmrsListener, 'addListeners');

      const result = await startListeners();

      expect(addListenersSpy).toHaveBeenCalled();
      expect(result).toEqual({
        status: 200,
        data: { message: 'OpenMRS listeners started successfully' }
      });
    });

    it('handles listener start errors', async () => {
      const error = new Error('Failed to start listeners');
      jest.spyOn(openmrsListener, 'addListeners').mockImplementationOnce(() => {
        throw error;
      });

      const result = await startListeners();

      expect(logger.error).toHaveBeenCalledWith(error);
      expect(result).toEqual({
        status: 500,
        data: { message: 'Error starting OpenMRS listeners' }
      });
    });
  });

  describe('stopListeners', () => {
    it('stops listeners successfully', async () => {
      const removeListenersSpy = jest.spyOn(openmrsListener, 'removeListeners');

      const result = await stopListeners();

      expect(removeListenersSpy).toHaveBeenCalled();
      expect(result).toEqual({
        status: 200,
        data: { message: 'OpenMRS listeners stopped successfully' }
      });
    });

    it('handles listener stop errors', async () => {
      const error = new Error('Failed to stop listeners');
      jest.spyOn(openmrsListener, 'removeListeners').mockImplementationOnce(() => {
        throw error;
      });

      const result = await stopListeners();

      expect(logger.error).toHaveBeenCalledWith(error);
      expect(result).toEqual({
        status: 500,
        data: { message: 'Error stopping OpenMRS listeners' }
      });
    });
  });
});
