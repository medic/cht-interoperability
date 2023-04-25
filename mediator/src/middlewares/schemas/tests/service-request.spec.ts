import { ServiceRequestSchema } from '../service-request';
import { ServiceRequestFactory } from './fhir-resource-factories';

describe('ServiceRequestSchema', () => {
  it('accepts valid service request values', async () => {
    const data = ServiceRequestFactory.build();

    const res = await ServiceRequestSchema.validateAsync(data);

    expect(res).toStrictEqual(data);
  });

  it('rejects invalid service request resource', () => {
    const data = ServiceRequestFactory.build();

    expect(
      ServiceRequestSchema.validateAsync({ ...data, requester: undefined })
    ).rejects.not.toBeNull();

    expect(
      ServiceRequestSchema.validateAsync({
        ...data,
        requester: { reference: 'Wrong/ID' },
      })
    ).rejects.not.toBeNull();

    expect(
      ServiceRequestSchema.validateAsync({
        ...data,
        subject: { reference: 'Wrong/ID' },
      })
    ).rejects.not.toBeNull();

    expect(
      ServiceRequestSchema.validateAsync({
        ...data,
        subject: undefined,
      })
    ).rejects.not.toBeNull();

    expect(
      ServiceRequestSchema.validateAsync({ ...data, intent: undefined })
    ).rejects.not.toBeNull();
  });
});
