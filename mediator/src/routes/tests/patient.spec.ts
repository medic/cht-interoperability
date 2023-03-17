import request from "supertest";
import app from "../../..";
import { createPatient } from "../../controllers/patient";

jest.mock("../controllers/patient");

describe("POST /patient", () => {
  it("calls handler for valid incoming request", async () => {
    (createPatient as any).mockResolvedValueOnce({
      data: {},
      status: 201,
    });

    const data = {
      name: "John Doe",
      _id: "JOHN_DOE_ID",
      id: "OPTIONAL",
      sex: "male",
      date_of_birth: "2000-01-01",
      parent: "OPTIONAL",
      type: "OPTIONAL",
    };

    const res = await request(app).post("/patient").send(data);

    expect(res.status).toBe(201);
    expect(res.body).toEqual({});
    expect(createPatient).toHaveBeenCalledWith(data);
    expect(createPatient).toHaveBeenCalled();
    expect(createPatient).toMatchSnapshot();
  });

  it("returns a bad request error for invalid incoming request", async () => {
    (createPatient as any).mockResolvedValueOnce({
      data: {},
      status: 201,
    });

    const data = {
      name: "John Doe",
      _id: "JOHN_DOE_ID",
      id: "OPTIONAL",
      sex: "male",
      date_of_birth: "WRONG_DATE",
      parent: "OPTIONAL",
      type: "OPTIONAL",
    };

    const res = await request(app).post("/patient").send(data);

    expect(res.status).toBe(400);
    expect(res.body).toMatchSnapshot();
    expect(createPatient).not.toHaveBeenCalled();
  });
});
