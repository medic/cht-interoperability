import { OrganizationSchema } from '../organization';
import { OrganizationFactory } from './utils';

describe('OrganizationSchema', () => {
  it('accepts valid organization resource', async () => {
    const data = OrganizationFactory.build();

    const res = await OrganizationSchema.validateAsync(data);

    expect(res.name).toStrictEqual(data.name);
    expect(res.endpoint).toStrictEqual(data.endpoint);
  });

  it('rejects invalid organization resource', () => {
    const data = OrganizationFactory.build();

    expect(
      OrganizationSchema.validateAsync({ ...data, name: [] })
    ).rejects.not.toBeNull();

    expect(
      OrganizationSchema.validateAsync({ ...data, endpoint: [] })
    ).rejects.not.toBeNull();

    expect(
      OrganizationSchema.validateAsync({
        ...data,
        endpoint: [{ type: 'Endpoint', identifier: undefined }],
      })
    ).rejects.not.toBeNull();
  });
});
