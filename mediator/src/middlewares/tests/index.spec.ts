import Joi from "joi";
import { validateBodyAgainst } from "..";
import { Factory } from "rosie";
import { randomUUID } from "crypto";
import { validateFhirResource } from "../../utils/fhir";

const RequestFactory = Factory.define("req").attr("body", { gender: "female" });

describe("validateBodyAgainst", () => {
  const schema = Joi.object({ gender: Joi.string().required() }).required();
  const mockRes: any = {};
  const mockReq: any = RequestFactory.build();

  beforeEach(() => {
    mockRes.send = jest.fn();
    mockRes.status = jest.fn(() => mockRes);
  });

  it("validates the request and passes control over to the next function [custom schema]", async () => {
    const mockNext = jest.fn();

    const handler = await validateBodyAgainst(schema);
    await handler(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(mockRes.send).not.toHaveBeenCalled();
    expect(mockRes.status).not.toHaveBeenCalled();
  });

  it("validates the request and passes control over to the next function [fhir schema]", async () => {
    const mockNext = jest.fn();

    const handler = await validateBodyAgainst(validateFhirResource("Patient"));
    await handler(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(mockRes.send).not.toHaveBeenCalled();
    expect(mockRes.status).not.toHaveBeenCalled();
  });

  it("doesn't to validate when given an invalid request body [custom schema]", async () => {
    const mockNext = jest.fn();

    const handler = await validateBodyAgainst(undefined);
    expect(
      handler(mockReq as any, mockRes as any, mockNext)
    ).rejects.toMatchInlineSnapshot(
      `[TypeError: Cannot read properties of undefined (reading 'validateAsync')]`
    );
  });

  it("sends and error and a 400 status code when the request body is bad [custom schema]", async () => {
    const mockReq = { body: {} };
    const mockNext = jest.fn();

    const handler = await validateBodyAgainst(schema);
    await handler(mockReq as any, mockRes as any, mockNext);

    expect(mockNext).not.toHaveBeenCalled();
    expect(mockRes.status.mock.calls[0][0]).toBe(400);
    expect(mockRes.send.mock.calls[0][0]).toStrictEqual({
      message: '"gender" is required',
      valid: false,
    });
  });

  it("sends and error and a 400 status code when the request body is bad [fhir schema]", async () => {
    const mockReq = { body: { gender: "wrong" } };
    const mockNext = jest.fn();

    const handler = await validateBodyAgainst(validateFhirResource("Patient"));
    await handler(mockReq as any, mockRes as any, mockNext);

    expect(mockNext).not.toHaveBeenCalled();
    expect(mockRes.status.mock.calls[0][0]).toBe(400);
    expect(mockRes.send.mock.calls[0][0]).toStrictEqual({
      message: '"Patient.gender" Code "wrong" not found in value set',
      valid: false,
    });
  });
});
