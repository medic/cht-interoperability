import request from 'supertest';
import app from '../../..';
import { OrganizationFactory } from '../../middlewares/schemas/tests/fhir-resource-factories';
import * as fhir from '../../utils/fhir';

describe('POST /organization', () => {
  it('accepts incoming request with valid organization resource', async () => {
    jest.spyOn(fhir, 'createFhirResource').mockResolvedValueOnce({
      data: {},
      status: 201,
    });

    const data = OrganizationFactory.build();

    const res = await request(app).post('/organization').send(data);

    expect(res.status).toBe(201);
    expect(res.body).toEqual({});
    expect(fhir.createFhirResource).toHaveBeenCalledWith({
      ...data,
      resourceType: 'Organization',
    });
    expect(fhir.createFhirResource).toHaveBeenCalled();
  });

  it('doesn\'t accept incoming request with invalid organization resource', async () => {
    const data = OrganizationFactory.build({ name: undefined });

    const res = await request(app).post('/organization').send(data);

    expect(res.status).toBe(400);
    expect(res.body.message).toMatchInlineSnapshot(`""name" is required"`);
    expect(fhir.createFhirResource).not.toHaveBeenCalled();
  });
});
