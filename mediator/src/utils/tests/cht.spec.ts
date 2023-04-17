import { createChtRecord, generateChtRecordsApiUrl } from "../cht";
import axios from "axios";

jest.mock("axios");

const mockAxios = axios as jest.Mocked<typeof axios>;

describe("CHT Utils", () => {
  describe("createChtRecord", () => {
    it("creates a new cht record", async () => {
      const patientId = "PATIENT_ID";

      const data = { status: 201, data: {} };
      mockAxios.post.mockResolvedValueOnce(data);

      const res = await createChtRecord(patientId);

      expect(res.status).toBe(data.status);
      expect(res.data).toStrictEqual(data.data);
      expect(mockAxios.post.mock.calls[0][0]).toContain("/api/v2/records");

      const record: any = mockAxios.post.mock.calls[0][1];
      expect(record.patient_uuid).toBe(patientId);
    });
  });

  describe("generateChtRecordsApiUrl", () => {
    it("generates a new cht record url", () => {
      const url = "https://cht:8000";
      const username = "username";
      const password = "password";
      const res = generateChtRecordsApiUrl(url, username, password);

      expect(res).toContain("cht");
      expect(res).toContain("8000");
      expect(res).toContain(`${username}:${password}`);
    });
  });
});
