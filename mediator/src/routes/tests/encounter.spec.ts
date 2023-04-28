import request from 'supertest';
import app from '../../..';
import { EncounterFactory } from '../../middlewares/schemas/tests/fhir-resource-factories';
import * as fhir from '../../utils/fhir';

describe('POST /encounter', () => {
  it('accepts incoming request with valid encounter resource', async () => {
    jest.spyOn(fhir, 'createFhirResource').mockResolvedValueOnce({
      data: {},
      status: 201,
    });

    const data = EncounterFactory.build();

    const res = await request(app).post('/encounter').send(data);

    expect(res.status).toBe(201);
    expect(res.body).toEqual({});
    expect(fhir.createFhirResource).toHaveBeenCalledWith({
      ...data,
      resourceType: 'Encounter',
    });
    expect(fhir.createFhirResource).toHaveBeenCalled();
  });

  it('doesn\'t accept incoming request with invalid encounter resource', async () => {
    const data = EncounterFactory.build({ status: 'wrong_status' });

    const res = await request(app).post('/encounter').send(data);

    expect(res.status).toBe(400);
    expect(res.body.message).toMatchInlineSnapshot(`""Encounter.status" Code "wrong_status" not found in value set"`);
    expect(fhir.createFhirResource).not.toHaveBeenCalled();
  });
});
