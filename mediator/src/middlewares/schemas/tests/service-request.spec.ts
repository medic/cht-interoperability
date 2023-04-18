import { ServiceRequestSchema } from "../service-request";
import { ServiceRequestFactory } from "./utils";

describe("ServiceRequestSchema", () => {
  it("accepts valid service request values", async () => {
    const data = ServiceRequestFactory.build();

    const res = await ServiceRequestSchema.validateAsync(data);

    expect(res).toStrictEqual(data);
  });

  it("rejects invalid service request resource", () => {
    const data = ServiceRequestFactory.build();

    expect(
      ServiceRequestSchema.validateAsync({ ...data, requester: data.requester[0] })
    ).rejects.not.toBeNull();

    expect(
      ServiceRequestSchema.validateAsync({
        ...data,
        request: { ...data.requester[0], type: "Wrong" },
      })
    ).rejects.not.toBeNull();

    expect(
      ServiceRequestSchema.validateAsync({
        ...data,
        subject: { type: "Wrong", id: data.subject.id },
      })
    ).rejects.not.toBeNull();

    expect(
      ServiceRequestSchema.validateAsync({
        ...data,
        subject: { id: data.subject.id, type: undefined },
      })
    ).rejects.not.toBeNull();

    expect(
      ServiceRequestSchema.validateAsync({ ...data, intent: undefined })
    ).rejects.not.toBeNull();
  });
});
