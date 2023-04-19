import request from "supertest";
import app from "../../..";
import { OrganizationFactory } from "../../middlewares/schemas/tests/utils";
import { createOrganization } from "../../controllers/organization";

jest.mock("../../controllers/organization");

describe("POST /organization", () => {
  it("accepst incoming request with valid organization resource", async () => {
    (createOrganization as any).mockResolvedValueOnce({
      data: {},
      status: 201,
    });

    const data = OrganizationFactory.build();

    const res = await request(app).post("/organization").send(data);

    expect(res.status).toBe(201);
    expect(res.body).toEqual({});
    expect(createOrganization).toHaveBeenCalledWith({
      ...data,
      resourceType: "Organization",
    });
    expect(createOrganization).toHaveBeenCalled();
  });

  it("doesn't accept incoming request with invalid organization resource", async () => {
    const data = OrganizationFactory.build({ name: undefined });

    const res = await request(app).post("/organization").send(data);

    expect(res.status).toBe(400);
    expect(res.body.message).toMatchInlineSnapshot(`""name" is required"`);
    expect(createOrganization).not.toHaveBeenCalled();
  });
});