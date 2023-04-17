import request from "supertest";
import app from "../../..";
import { createPatient } from "../../controllers/patient";
import { PatientFactory } from "./utils";

jest.mock("../../controllers/patient");

describe("POST /patient", () => {
  it("accepts incoming request with valid patient resource", async () => {
    (createPatient as any).mockResolvedValueOnce({
      data: {},
      status: 201,
    });

    const data = PatientFactory.build();

    console.log("Data", data);

    const res = await request(app).post("/patient").send(data);

    console.log(res.body);

    expect(res.status).toBe(201);
    expect(res.body).toEqual({});
    expect(createPatient).toHaveBeenCalledWith(data);
    expect(createPatient).toHaveBeenCalled();
    expect(createPatient).toHaveBeenCalledWith(data);
  });

  it("doesn't accept incoming request with invalid patient resource", async () => {
    const data = PatientFactory.build({ birthDate: "INVALID_BIRTH_DATE" });

    const res = await request(app).post("/patient").send(data);

    expect(res.status).toBe(400);
    expect(res.body.valid).toBe(false);
    expect(res.body.message).toMatchInlineSnapshot(`""Patient.birthDate" Invalid date format for value "INVALID_BIRTH_DATE""`);
    expect(createPatient).not.toHaveBeenCalled();
  });
});
