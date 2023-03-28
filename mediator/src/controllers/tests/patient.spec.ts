import axios from "axios";
import { logger } from "../../../logger";
import { IPatient } from "../../utils/fhir";
import { createPatient } from "../patient";

jest.mock("../../../logger");
jest.mock("axios");

const patient: IPatient = {
  _id: "456",
  name: "John Doe",
  sex: "male",
  date_of_birth: "2000-01-01",
};

describe("createPatient", () => {
  it("creates a patient when given a valid patient resource", async () => {
    const data = { status: 200, data: {} };
    (axios.post as any).mockResolvedValueOnce(data)

    const res = await createPatient(patient as any);

    expect(res.data).toBe(data.data);
    expect(res.status).toEqual(data.status);
    expect(axios.post).toHaveBeenCalled();
    expect(axios.post).toMatchSnapshot();
    expect(logger.error).not.toHaveBeenCalled();
  });

  it("fails to create a patient when given an invalid patient resource", async () => {
    const patient = {} as IPatient

    const data = { status: 200, data: {} };
    (axios.post as any).mockResolvedValueOnce(patient) as any

    const res = await createPatient(patient as any);

    expect(res.status).toBe(400);
    expect(logger.error).toHaveBeenCalled();
    expect(axios.post).not.toHaveBeenCalled();
    expect(res.data).toMatchSnapshot();
  });

  it("return the right status code if the request FHIR creation request fails", async () => {
    const data = { status: 500, data: {} };
    axios.post = jest.fn(() => Promise.reject(data)) as any

    const res = await createPatient(patient as any);

    expect(res.status).toBe(data.status);
    expect(res.data).toMatchSnapshot();
    expect(axios.post).toHaveBeenCalled();
    expect(logger.error).toHaveBeenCalled();
  });
})
