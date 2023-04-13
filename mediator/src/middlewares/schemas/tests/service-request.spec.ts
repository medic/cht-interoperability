import { ServiceRequestSchema } from "../service-request";

describe("createServiceSchema", () => {
  it("accepts valid values", async () => {
    const data = {
      patient_id: "PATIENT_ID",
      callback_url: "https://google.com/",
    };

    expect(ServiceRequestSchema.validateAsync(data)).resolves.toMatchSnapshot();
  });

  it("rejects data with valid 'callback_url'", () => {
    const data = {
      patient_id: "PATIENT_ID",
      callback_url: "INVALID_URL",
    };

    expect(ServiceRequestSchema.validateAsync(data)).rejects.toMatchSnapshot();
  });

  it("rejects data with invalid 'patient_id' ", () => {
    const data = {
      patient_id: undefined,
      callback_url: "https://google.com",
    };

    expect(ServiceRequestSchema.validateAsync(data)).rejects.toMatchSnapshot();
  });
});
