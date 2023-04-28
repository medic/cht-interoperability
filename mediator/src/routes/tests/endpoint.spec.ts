import request from 'supertest';
import app from '../../..';
import { EndpointFactory as EndpointFactoryBase } from '../../middlewares/schemas/tests/fhir-resource-factories';
import * as fhir from '../../utils/fhir';

const EndpointFactory = EndpointFactoryBase.attr('status', 'active')
  .attr('address', 'https://callback.com')
  .attr('payloadType', [{ text: 'application/json' }]);

describe('POST /endpoint', () => {
  it('accepts incoming request with valid endpoint resource', async () => {
    jest.spyOn(fhir, 'createFhirResource').mockResolvedValueOnce({
      data: {},
      status: 201,
    });

    const data = EndpointFactory.build();

    const res = await request(app).post('/endpoint').send(data);

    expect(res.status).toBe(201);
    expect(res.body).toEqual({});
    expect(fhir.createFhirResource).toHaveBeenCalledWith({
      ...data,
      resourceType: 'Endpoint',
    });
    expect(fhir.createFhirResource).toHaveBeenCalled();
  });

  it('doesn\'t accept incoming request with invalid endpoint resource', async () => {
    const data = EndpointFactory.build({ status: 'wrong_status' });

    const res = await request(app).post('/endpoint').send(data);

    expect(res.status).toBe(400);
    expect(res.body.message).toMatchInlineSnapshot(
      `""Endpoint.status" Code "wrong_status" not found in value set"`
    );
    expect(fhir.createFhirResource).not.toHaveBeenCalled();
  });
});
