import axios from "axios";
import { logger } from "../../../logger";
import { createOrganization } from "../organization";
import { OrganizationFactory } from "../../middlewares/schemas/tests/utils";

jest.mock("../../../logger");
jest.mock("axios");
const mockAxios = axios as jest.Mocked<typeof axios>;

describe("Organization controllers", () => {
  const organization: fhir4.Organization = OrganizationFactory.build();

  describe("createOrganization", () => {
    it("creates a organization when given a valid organization resource", async () => {
      const data = { status: 200, data: {} };

      mockAxios.post.mockResolvedValueOnce(data);

      const res = await createOrganization(organization);

      expect(res.data).toBe(data.data);
      expect(res.status).toEqual(data.status);
      expect(mockAxios.post).toHaveBeenCalled();
      expect(mockAxios.post.mock.calls[0][0]).toContain("/fhir/Organization");
      expect(mockAxios.post.mock.calls[0][1]).toStrictEqual(organization);
      expect(logger.error).not.toHaveBeenCalled();
    });

    it("resolves error when the organization creation fails", async () => {
      const data = { status: 400, data: {} };

      mockAxios.post.mockRejectedValueOnce(data);

      const res = await createOrganization(organization);

      expect(res.status).toBe(data.status);
      expect(logger.error).toHaveBeenCalled();
      expect(mockAxios.post).toHaveBeenCalled();
      expect(res.data).toBe(res.data);
    });
  });
});
