import { createServiceRequest } from '../../controllers/service-request';
import request from 'supertest';
import app from '../../..';
import { ServiceRequestFactory } from '../../middlewares/schemas/tests/utils';

jest.mock('../../controllers/service-request');

describe('POST /service-request', () => {
  it('accepts incoming request with valid service request resource', async () => {
    (createServiceRequest as any).mockResolvedValueOnce({
      data: {},
      status: 201,
    });

    const data = ServiceRequestFactory.build();
    data.status = 'active';

    const res = await request(app).post('/service-request').send(data);

    expect(res.status).toBe(201);
    expect(res.body).toEqual({});
    expect(createServiceRequest).toHaveBeenCalledWith({
      ...data,
      resourceType: 'ServiceRequest',
    });
    expect(createServiceRequest).toHaveBeenCalled();
  });

  it('doesn\'t accept incoming request with invalid service request resource', async () => {
    const data = ServiceRequestFactory.build({ request: undefined });

    const res = await request(app).post('/service-request').send(data);

    expect(res.status).toBe(400);
    expect(res.body.message).toMatchInlineSnapshot(`""ServiceRequest.status" Missing property"`);
    expect(createServiceRequest).not.toHaveBeenCalled();
  });
});
