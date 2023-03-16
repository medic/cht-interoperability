import { createServiceRequest } from "../controllers/service-request";
import request from "supertest";
import app from "../../";

jest.mock("../controllers/service-request");

describe("POST /service-request", () => {
  it("calls handler for valid incoming request", async () => {
    (createServiceRequest as any).mockResolvedValueOnce({
      data: {},
      status: 201,
    });

    const data = {
      patient_id: "PATIENT_ID",
      callback_url: "https://callback.medic.org",
    };

    const res = await request(app).post("/service-request").send(data);

    expect(res.status).toBe(201);
    expect(res.body).toEqual({});
    expect(createServiceRequest).toHaveBeenCalledWith(data);
    expect(createServiceRequest).toHaveBeenCalled();
    expect(createServiceRequest).toMatchSnapshot();
  });

  it("returns a bad request error for invalid incoming request", async () => {
    (createServiceRequest as any).mockResolvedValueOnce({
      data: {},
      status: 201,
    });

    const data = {
      patient_id: "PATIENT_ID",
      callback_url: "INVALID_CALLBACK_URL",
    };

    const res = await request(app).post("/service-request").send(data);

    expect(res.status).toBe(400);
    expect(res.body).toMatchSnapshot();
    expect(createServiceRequest).not.toHaveBeenCalled();
  });
});
