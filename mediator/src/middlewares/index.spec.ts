import Joi from "joi";
import { validateBodyAgainst } from ".";

describe("validateBodyAgainst", () => {
  const schema = Joi.object({ name: Joi.string().required() }).required();
  let mockRes: any = {};

  beforeEach(() => {
    mockRes.send = jest.fn();
    mockRes.status = jest.fn(() => mockRes);
  })

  it("validates the request and passes control over to the next function", async () => {
    const mockReq = {body: { name: "John Doe"}};
    const mockNext = jest.fn();

    const handler = validateBodyAgainst(schema)
    await handler(mockReq as any, mockRes as any, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(mockRes.send).not.toHaveBeenCalled();
    expect(mockRes.status).not.toHaveBeenCalled();
  })

  it("fails to validate when given a non schema as input", async () => {
    const mockReq = {body: { name: "John Doe"}};
    const mockNext = jest.fn();

    const handler = validateBodyAgainst(undefined)
    expect(() => handler(mockReq as any, mockRes as any, mockNext)).toThrowErrorMatchingSnapshot();
  })

  it("sends and error and a 400 status code when the request body is bad", async () => {
    const mockReq = {body: { }};
    const mockNext = jest.fn();

    const handler = validateBodyAgainst(schema)
    await handler(mockReq as any, mockRes as any, mockNext);

    expect(mockNext).not.toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalled();
    expect(mockRes.send).toHaveBeenCalled();
    expect(mockRes.send).toMatchSnapshot();
  })
})
