import { logger } from '../../logger';
import { syncPatients, syncEncounters } from '../utils/openmrs_sync'
import { SYNC_PERIOD } from '../../config'

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
