import { PatientSchema } from '../patient';
import { PatientFactory } from './fhir-resource-factories';

describe('PatientSchema', () => {
  it('accepts valid patient resource', async () => {
    const data = PatientFactory.build();

    const res = await PatientSchema.validateAsync(data);

    expect(res.name).toStrictEqual(data.name);
    expect(res.identifier).toStrictEqual(data.identifier);
    expect(res.gender).toBe(data.gender);
    expect(res.birthDate).toBe(data.birthDate);
  });

  it('doesn\'t accept invalid patient resource', async () => {
    const data = PatientFactory.build();

    expect(
      PatientSchema.validateAsync({ ...data, gender: undefined })
    ).rejects.not.toBeNull();
    expect(
      PatientSchema.validateAsync({ ...data, identifier: [] })
    ).rejects.not.toBeNull();
    expect(
      PatientSchema.validateAsync({ ...data, name: [] })
    ).rejects.not.toBeNull();
    expect(
      PatientSchema.validateAsync({ ...data, birthDate: '' })
    ).rejects.not.toBeNull();
  });
});
