import { EncounterSchema } from "../encounter";
import { EncounterFactory } from "./utils";

describe("EncounterSchema", () => {
  it("accepss valid encounter resource", async () => {
    const data = EncounterFactory.build();

    const res = await EncounterSchema.validateAsync(data);

    expect(res.identifier).toStrictEqual(data.identifier);
    expect(res.status).toBe(data.status);
    expect(res.class).toBe(data.class);
    expect(res.type).toBe(data.type);
    expect(res.subject).toBe(data.subject);
    expect(res.participant).toBe(data.participant);
  });

  it("doesn't accept invalid encounter resource", async () => {
    const data = EncounterFactory.build();

    expect(
      EncounterSchema.validateAsync({ ...data, identifier: [] })
    ).rejects.not.toBeNull();
    expect(
      EncounterSchema.validateAsync({ ...data, status: undefined })
    ).rejects.not.toBeNull();
    expect(
      EncounterSchema.validateAsync({ ...data, class: undefined })
    ).rejects.not.toBeNull();
    expect(
      EncounterSchema.validateAsync({ ...data, type: [] })
    ).rejects.not.toBeNull();
    expect(
      EncounterSchema.validateAsync({ ...data, subject: undefined })
    ).rejects.not.toBeNull();
    expect(
      EncounterSchema.validateAsync({ ...data, participant: [] })
    ).rejects.not.toBeNull();
  });
});
