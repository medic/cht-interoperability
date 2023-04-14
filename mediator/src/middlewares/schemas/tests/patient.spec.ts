import { PatientSchema } from "../patient";
import { PatientFactory } from "./utils";

describe("PatientSchema", () => {
  it("accepts valid patient resource", async () => {
    const data = PatientFactory.build();

    const res = await PatientSchema.validateAsync(data);

    expect(res.id).toBe(data.id);
    expect(res.name).toBe(res.name);
    expect(res.identifier).toBe(res.identifier);
    expect(res.gender).toBe(res.gender);
    expect(res.birthDate).toBe(res.birthDate);
  });

  it("doesn't accept invalid patient resource", async () => {
    let data = PatientFactory.build();
    
    expect(
      PatientSchema.validateAsync({ ...data, gender: undefined })
    ).rejects.not.toBeNull();
    expect(
      PatientSchema.validateAsync({ ...data, id: undefined })
    ).rejects.not.toBeNull();
    expect(
      PatientSchema.validateAsync({ ...data, identifier: [] })
    ).rejects.not.toBeNull();
    expect(
      PatientSchema.validateAsync({ ...data, name: [] })
    ).rejects.not.toBeNull();
    expect(
      PatientSchema.validateAsync({ ...data, birthDate: "" })
    ).rejects.not.toBeNull();
  });
});
