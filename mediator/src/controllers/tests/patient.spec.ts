import axios from "axios";
import { logger } from "../../../logger";
import { createPatient } from "../patient";

jest.mock("../../../logger");
jest.mock("axios");
const mockAxios = axios as jest.Mocked<typeof axios>;

describe("Patient controllers", () => {
  const patient: fhir5.Patient = {
    resourceType: "Patient"
  };

  describe("createPatient", () => {
    it("creates a patient when given a valid patient resource", async () => {
      const data = { status: 200, data: {} };

      mockAxios.post.mockResolvedValueOnce(data);

      const res = await createPatient(patient);

      expect(res.data).toBe(data.data);
      expect(res.status).toEqual(data.status);
      expect(mockAxios.post).toHaveBeenCalled();
      expect(mockAxios.post).toMatchSnapshot();
      expect(logger.error).not.toHaveBeenCalled();
    });

    it("handles error when the patient creation fails", async () => {
      const data = { status: 400, data: {} };

      mockAxios.post.mockRejectedValueOnce(data);

      const res = await createPatient(patient);

      expect(res.status).toBe(data.status);
      expect(logger.error).toHaveBeenCalled();
      expect(mockAxios.post).toHaveBeenCalled();
      expect(res.data).toBe(res.data);
    });
  });
});
