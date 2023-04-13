import axios from "axios";
import { logger } from "../../../logger";
import { createServiceRequest } from "../service-request";

jest.mock("axios");
jest.mock("../../../logger");

describe("createServiceRequest", () => {
  it("creates a service request when given valid request document", async () => {
    const request = { patient_id: "PATIENT_ID", callback_url: "CALLBACK_URL" };

    const fhirRes = { status: 201, data: { id: "SUBSCRIPTION_ID" } };
    const chtRes = { status: 200, data: { success: true } };
    (axios.post as any)
      .mockResolvedValueOnce(fhirRes)
      .mockResolvedValue(chtRes);

    const patient = { status: 200, data: {} };
    (axios.get as any).mockResolvedValueOnce(patient);

    const res = await createServiceRequest(request as any);

    expect(res.status).toBe(fhirRes.status);
    expect(res.data).toEqual(fhirRes.data);
    expect(axios.post).toHaveBeenCalledTimes(2);
    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(axios.get).toMatchSnapshot();
    expect(axios.post).toMatchSnapshot();
  });

  it("returns the status code of the failed susbscription creation request", async () => {
    const request = { patient_id: "PATIENT_ID", callback_url: "CALLBACK_URL" };

    const fhirRes = { status: 400, data: { id: "SUBSCRIPTION_ID" } };
    (axios.post as any).mockResolvedValueOnce(fhirRes);

    const patient = { status: 200, data: {} };
    (axios.get as any).mockResolvedValueOnce(patient);

    const res = await createServiceRequest(request as any);

    expect(res.status).toBe(fhirRes.status);
    expect(res.data).toEqual(fhirRes.data);
    expect(axios.post).toHaveBeenCalledTimes(1);
    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(axios.get).toMatchSnapshot();
    expect(axios.post).toMatchSnapshot();
  });

  it("returns a 500 status code if record creation on cht fails", async () => {
    const request = { patient_id: "PATIENT_ID", callback_url: "CALLBACK_URL" };

    const fhirRes = { status: 201, data: { id: "SUBSCRIPTION_ID" } };
    const chtRes = { status: 400, data: { success: false } };
    (axios.post as any)
      .mockResolvedValueOnce(fhirRes)
      .mockResolvedValue(chtRes);
      
    (axios.delete as any).mockResolvedValue({});

    const patient = { status: 200, data: {} };
    (axios.get as any).mockResolvedValueOnce(patient);

    const res = await createServiceRequest(request as any);

    expect(res.status).toBe(500);
    expect(res.data).toMatchSnapshot();
    expect(axios.post).toHaveBeenCalledTimes(2);
    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(axios.get).toMatchSnapshot();
    expect(axios.post).toMatchSnapshot();
  });

  it("returns status code and server error when fhir fails to get patient resource", async () => {
    const request = { patient_id: "PATIENT_ID", callback_url: "CALLBACK_URL" };
    const patient = { status: 404, data: { message: "" } };
    (axios.get as any).mockResolvedValueOnce(patient);

    const res = await createServiceRequest(request as any);

    expect(res.status).toBe(patient.status);
    expect(res.data).toEqual(patient.data);
    expect(axios.get).toHaveBeenCalled();
    expect(axios.post).not.toHaveBeenCalled();
    expect(logger.error).not.toHaveBeenCalled();
  });

  it("returns status code and error when server fails to create a subscription", async () => {
    const request = { patient_id: "PATIENT_ID", callback_url: "CALLBACK_URL" };

    const fhirRes = { status: 400, data: { id: "SUBSCRIPTION_ID" } };
    (axios.post as any).mockRejectedValueOnce(fhirRes);

    const patient = { status: 200, data: {} };
    (axios.get as any).mockResolvedValueOnce(patient);

    const res = await createServiceRequest({
      resourceType: "ServiceRequest",
      intent: "proposal",
      status: "draft",
      subject: {
        "reference": "Reference/"
      }
    });

    expect(res.status).toBe(500);
    expect(res.data).toMatchSnapshot();
    expect(axios.post).toHaveBeenCalledTimes(1);
    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(axios.get).toMatchSnapshot();
    expect(axios.post).toMatchSnapshot();
    expect(logger.error).toHaveBeenCalled();
  });

  it("returns status code and error message when give an invalid service request", async () => {
    const request = {};

    const patient = { status: 200, data: {} };
    (axios.get as any).mockResolvedValueOnce(patient);

    const res = await createServiceRequest(request as any);

    expect(res.status).toBe(400);
    expect(res.data).toMatchSnapshot();
    expect(axios.post).not.toHaveBeenCalled();
    expect(axios.get).toHaveBeenCalled();
    expect(logger.error).toHaveBeenCalled();
  });

  it("deletes the subscription is cht responds with success as false", async () => {
    const request = { patient_id: "PATIENT_ID", callback_url: "CALLBACK_URL" };

    const fhirRes = { status: 201, data: { id: "SUBSCRIPTION_ID" } };
    const chtRes = { status: 200, data: { success: false } };
    (axios.post as any)
      .mockResolvedValueOnce(fhirRes)
      .mockResolvedValue(chtRes);
    (axios.delete as any) 
      .mockResolvedValue({ status: 200, data: {} })

    const patient = { status: 200, data: {} };
    (axios.get as any).mockResolvedValueOnce(patient);

    const res = await createServiceRequest(request as any);

    expect(res.status).toBe(500);
    expect(res.data).toMatchInlineSnapshot(`
{
  "message": "unable to create the follow up task",
}
`);
    expect(axios.post).toHaveBeenCalledTimes(2);
    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(axios.get).toMatchSnapshot();
    expect(axios.post).toMatchSnapshot();
  });

  it("deletes subscription if cht request throws an error", async () => {
    const request = { patient_id: "PATIENT_ID", callback_url: "CALLBACK_URL" };

    const fhirRes = { status: 201, data: { id: "SUBSCRIPTION_ID" } };
    const chtRes = { status: 200, data: { success: false } };
    (axios.post as any)
      .mockResolvedValueOnce(fhirRes)
      .mockRejectedValueOnce(chtRes);
    (axios.delete as any) 
      .mockResolvedValue({ status: 200, data: {} })

    const patient = { status: 200, data: {} };
    (axios.get as any).mockResolvedValueOnce(patient);

    const res = await createServiceRequest(request as any);

    expect(res.status).toBe(500);
    expect(res.data).toMatchInlineSnapshot(`
{
  "message": undefined,
}
`);
    expect(axios.post).toHaveBeenCalledTimes(2);
    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(axios.get).toMatchSnapshot();
    expect(axios.post).toMatchSnapshot();
  });
});
