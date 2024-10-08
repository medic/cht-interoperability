import { logger } from '../../logger';
import { syncPatients, syncEncounters } from '../utils/openmrs_sync'

export async function sync() {
  try {
    const startTime = new Date();
    startTime.setHours(startTime.getHours() - 1);
    await syncPatients(startTime);
    await syncEncounters(startTime);
    return { status: 200, data: { message: `OpenMRS sync completed successfully`} };
  } catch(error: any) {
    logger.error(error);
    return { status: 500, data: { message: `Error during OpenMRS Sync`} };
  }
}
