import request from 'supertest';
import app from '../../..';
import { ChtPatientFactory, ChtPregnancyForm } from '../../middlewares/schemas/tests/cht-request-factories';
import * as fhir from '../../utils/fhir';

describe('POST /cht/patient', () => {
  it('accepts incoming request with valid patient resource', async () => {
    jest.spyOn(fhir, 'updateFhirResource').mockResolvedValueOnce({
      data: {},
      status: 200,
    });

    const data = ChtPatientFactory.build();

    const res = await request(app).post('/cht/patient').send(data);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({});

    /*
    expect(fhir.createFhirResource).toHaveBeenCalledWith({
      ...data,
      resourceType: 'Patient',
    });
    */
    expect(fhir.updateFhirResource).toHaveBeenCalled();
  });

  it('accepts incoming request with valid form', async () => {
    jest.spyOn(fhir, 'createFhirResource').mockResolvedValueOnce({
      data: {},
      status: 200,
    });

    const data = ChtPregnancyForm.build();

    const res = await request(app).post('/cht/encounter').send(data);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({});
    /*
    expect(fhir.createFhirResource).toHaveBeenCalledWith({
      ...data,
      resourceType: 'Patient',
    });
    */
    expect(fhir.createFhirResource).toHaveBeenCalled();
  });
});
