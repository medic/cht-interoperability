import { EndpointSchema } from '../endpoint';
import { EndpointFactory } from './fhir-resource-factories';

describe('EndpointSchema', () => {
  it('accepts valid endpoint resource', async () => {
    const data = EndpointFactory.build();

    const res = await EndpointSchema.validateAsync(data);

    expect(res.connectionType).toStrictEqual(data.connectionType);
  });

  it('rejects invalid endpoint resource', () => {
    const dataWithInvalidSystem = EndpointFactory.build();
    dataWithInvalidSystem.connectionType.system = 'INVALID_SYSTEM';

    const dataWithInvalidCode = EndpointFactory.build();
    dataWithInvalidCode.connectionType.code = 'INVALID_CODE';

    expect(
      EndpointSchema.validateAsync(dataWithInvalidSystem)
    ).rejects.not.toBeNull();
    expect(
      EndpointSchema.validateAsync(dataWithInvalidCode)
    ).rejects.not.toBeNull();

    expect(EndpointSchema.validateAsync({})).rejects.not.toBeNull();
  });
});
