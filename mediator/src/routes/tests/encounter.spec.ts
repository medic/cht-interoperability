import request from 'supertest';
import app from '../../..';
import { EncounterFactory } from '../../middlewares/schemas/tests/utils';
import { createEncounter } from '../../controllers/encounter';

jest.mock('../../controllers/encounter');

describe('POST /encounter', () => {
  it('accepst incoming request with valid encounter resource', async () => {
    (createEncounter as any).mockResolvedValueOnce({
      data: {},
      status: 201,
    });

    const data = EncounterFactory.build();

    const res = await request(app).post('/encounter').send(data);

    expect(res.status).toBe(201);
    expect(res.body).toEqual({});
    expect(createEncounter).toHaveBeenCalledWith({
      ...data,
      resourceType: 'Encounter',
    });
    expect(createEncounter).toHaveBeenCalled();
  });

  it('doesn\'t accept incoming request with invalid encounter resource', async () => {
    const data = EncounterFactory.build({ status: 'wrong_status' });

    const res = await request(app).post('/encounter').send(data);

    expect(res.status).toBe(400);
    expect(res.body.message).toMatchInlineSnapshot(`""Encounter.status" Code "wrong_status" not found in value set"`);
    expect(createEncounter).not.toHaveBeenCalled();
  });
});
