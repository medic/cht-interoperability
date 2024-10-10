import request from 'supertest';
import app from '../../..';
import * as openmrs_sync from '../../utils/openmrs_sync';
import axios from 'axios';

jest.mock('axios');

describe('GET /openmrs/sync', () => {
  it('calls syncPatients and syncEncouners', async () => {
    jest.spyOn(openmrs_sync, 'syncPatients').mockImplementation(async (startTime) => {
    });

    jest.spyOn(openmrs_sync, 'syncEncounters').mockImplementation(async (startTime) => {
    });

    const res = await request(app).get('/openmrs/sync').send();

    expect(res.status).toBe(200);

    expect(openmrs_sync.syncPatients).toHaveBeenCalled();
    expect(openmrs_sync.syncEncounters).toHaveBeenCalled();
  });

  it('returns 500 if syncPatients throws an error', async () => {
    jest.spyOn(openmrs_sync, 'syncPatients').mockImplementation(async (startTime) => {
      throw new Error('Sync Failed');
    });

    const res = await request(app).get('/openmrs/sync').send();

    expect(res.status).toBe(500);

    expect(openmrs_sync.syncPatients).toHaveBeenCalled();
  });
});
