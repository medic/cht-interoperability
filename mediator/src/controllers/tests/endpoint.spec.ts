import axios from "axios";
import { logger } from "../../../logger";
import { createEndpoint } from "../endpoint";

jest.mock("../../../logger");
jest.mock("axios");
const mockAxios = axios as jest.Mocked<typeof axios>;

describe("Endpoint controllers", () => {
  const endpoint: fhir5.Endpoint = {
    resourceType: "Endpoint",
    address: "",
    connectionType: [],
    status: "active",
  };

  describe("createEndpoint", () => {
    it("creates a endpoint when given a valid endpoint resource", async () => {
      const data = { status: 200, data: {} };

      mockAxios.post.mockResolvedValueOnce(data);

      const res = await createEndpoint(endpoint);

      expect(res.data).toBe(data.data);
      expect(res.status).toEqual(data.status);
      expect(mockAxios.post).toHaveBeenCalled();
      expect(mockAxios.post).toMatchSnapshot();
      expect(logger.error).not.toHaveBeenCalled();
    });

    it("resolves error when the endpoint creation fails", async () => {
      const data = { status: 400, data: {} };

      mockAxios.post.mockRejectedValueOnce(data);

      const res = await createEndpoint(endpoint);

      expect(res.status).toBe(data.status);
      expect(logger.error).toHaveBeenCalled();
      expect(mockAxios.post).toHaveBeenCalled();
      expect(res.data).toBe(res.data);
    });
  });
});
