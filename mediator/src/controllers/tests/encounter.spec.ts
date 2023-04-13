import axios from "axios";
import { createEncounter } from "../encounter";
import { logger } from "../../../logger";

jest.mock("axios");
jest.mock("../../../logger")
const mockAxios = axios as jest.Mocked<typeof axios>;

describe("Encounter controllers", () => {
  const encounter: fhir5.Encounter = {
    resourceType: "Encounter",
    status: "planned",
  };

  describe("createEncounter", () => {
    it("should create an encounter in the FHIR server", async () => {
      const data = { status: 201, data: { id: "123" } };

      mockAxios.post = jest.fn().mockResolvedValue(data);

      const res = await createEncounter(encounter);

      expect(mockAxios.post).toHaveBeenCalled();
      expect(mockAxios.post.mock.calls[0][1]).toEqual(encounter);
      expect(res.status).toEqual(data.status);
      expect(res.data).toEqual(data.data);
      expect(logger.error).not.toBeCalled();
    });

    it("should return an error if the FHIR server returns an error", async () => {
      const data = { status: 400, data: { message: "Bad request" } };

      mockAxios.post = jest.fn().mockRejectedValue(data);

      const res = await createEncounter(encounter);

      expect(mockAxios.post).toHaveBeenCalled();
      expect(mockAxios.post.mock.calls[0][1]).toEqual(encounter);
      expect(res.status).toEqual(400);
      expect(res.data).toEqual(data.data);
      expect(logger.error).toBeCalledTimes(1);
    });
  });
});
