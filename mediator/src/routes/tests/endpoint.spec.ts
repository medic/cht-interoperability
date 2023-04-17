import request from "supertest";
import app from "../../..";
import { EndpointFactory as EndpointFactoryBase } from "../../middlewares/schemas/tests/utils";
import { createEndpoint } from "../../controllers/endpoint";

jest.mock("../../controllers/endpoint");

const EndpointFactory = EndpointFactoryBase.attr("status", "active")
  .attr("address", "https://callback.com")
  .attr("payloadType", [{ text: "application/json" }]);

describe("POST /endpoint", () => {
  it("accepst incoming request with valid endpoint resource", async () => {
    (createEndpoint as any).mockResolvedValueOnce({
      data: {},
      status: 201,
    });

    const data = EndpointFactory.build();

    const res = await request(app).post("/endpoint").send(data);

    expect(res.status).toBe(201);
    expect(res.body).toEqual({});
    expect(createEndpoint).toHaveBeenCalledWith({
      ...data,
      resourceType: "Endpoint",
    });
    expect(createEndpoint).toHaveBeenCalled();
  });

  it("doesn't accept incoming request with invalid endpoint resource", async () => {
    const data = EndpointFactory.build({ status: "wrong_status" });

    const res = await request(app).post("/endpoint").send(data);

    expect(res.status).toBe(400);
    expect(res.body.message).toMatchInlineSnapshot(
      `""Endpoint.status" Code "wrong_status" not found in value set"`
    );
    expect(createEndpoint).not.toHaveBeenCalled();
  });
});
