import { logger } from '../../logger';
import { syncPatients, syncEncounters } from '../utils/openmrs_sync';
import { addListeners, removeListeners } from '../utils/openmrs-listener';
import { SYNC_PERIOD } from '../../config';

export async function sync() {
  try {
    let now = Date.now();
    let syncPeriod = parseInt(SYNC_PERIOD, 10) * 1000; // Convert seconds to milliseconds
    let startTime = new Date(now - syncPeriod);

    await syncPatients(startTime);
    await syncEncounters(startTime);
    return { status: 200, data: { message: `OpenMRS sync completed successfully`} };
  } catch(error: any) {
    logger.error(error);
    return { status: 500, data: { message: `Error during OpenMRS Sync`} };
  }
}

export async function startListeners() {
  try {
    addListeners();
    return { status: 200, data: { message: 'OpenMRS listeners started successfully' } };
  } catch (error: any) {
    logger.error(error);
    return { status: 500, data: { message: 'Error starting OpenMRS listeners' } };
  }
}

export async function stopListeners() {
  try {
    removeListeners();
    return { status: 200, data: { message: 'OpenMRS listeners stopped successfully' } };
  } catch (error: any) {
    logger.error(error);
    return { status: 500, data: { message: 'Error stopping OpenMRS listeners' } };
  }
}
