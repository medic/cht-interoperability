import request from 'supertest';
import app from '../../..';
import { PatientFactory } from '../../middlewares/schemas/tests/fhir-resource-factories';
import * as fhir from '../../utils/fhir';

describe('POST /patient', () => {
  it('accepts incoming request with valid patient resource', async () => {
    jest.spyOn(fhir, 'createFhirResource').mockResolvedValueOnce({
      data: {},
      status: 201,
    });

    const data = PatientFactory.build();

    const res = await request(app).post('/patient').send(data);

    expect(res.status).toBe(201);
    expect(res.body).toEqual({});
    expect(fhir.createFhirResource).toHaveBeenCalled();
  });

  // TODO: reenable when validating fhir resource after mapping
  it.skip('doesn\'t accept incoming request with invalid patient resource', async () => {
    const data = PatientFactory.build({ birthDate: 'INVALID_BIRTH_DATE' });

    const res = await request(app).post('/patient').send(data);

    expect(res.status).toBe(400);
    expect(res.body.valid).toBe(false);
    expect(res.body.message).toMatchInlineSnapshot(
      `""Patient.birthDate" Invalid date format for value "INVALID_BIRTH_DATE""`
    );
    expect(fhir.createFhirResource).not.toHaveBeenCalled();
  });
});
