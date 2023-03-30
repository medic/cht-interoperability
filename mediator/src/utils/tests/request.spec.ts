import { Request, Response } from "express";
import { RequestHandler, requestHandler } from "../request";

describe("requestHandler", () => {
  it("forwards the request and returns the right 'statusCode' and 'response'", async () => {
    const data = { status: 200, data: { success: true } };
    const mockHandler = jest.fn(async () => data);

    const handler = requestHandler((mockHandler as any) as RequestHandler)

    const req = {} as any as Request;
    const res = {} as any as Response;
    res.send = jest.fn((_: any) => null as any);
    res.status = jest.fn((_: any) => res);
    await handler(req, res);

    expect(mockHandler).toHaveBeenCalledWith(req);
    expect(res.send).toHaveBeenCalledWith(data.data);
    expect(res.send).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(data.status);
    expect(res.status).toHaveBeenCalledTimes(1);
  })

  it("returns '200' when 'status' isn't present in handler response", async () => {
    const defaultStatusCode = 200;
    const data = {};
    const mockHandler = jest.fn(async () => data);

    const handler = requestHandler((mockHandler as any) as RequestHandler)

    const req = {} as any as Request;
    const res = {} as any as Response;
    res.send = jest.fn((_: any) => null as any);
    res.status = jest.fn((_: any) => res);
    await handler(req, res);

    expect(mockHandler).toHaveBeenCalledWith(req);
    expect(res.status).toHaveBeenCalledWith(defaultStatusCode);
    expect(res.status).toHaveBeenCalledTimes(1);
  })

  it("returns an empty body when 'data' isn't present in handler response", async () => {
    const data = {};
    const mockHandler = jest.fn(async () => data);

    const handler = requestHandler((mockHandler as any) as RequestHandler)

    const req = {} as any as Request;
    const res = {} as any as Response;
    res.send = jest.fn((_: any) => null as any);
    res.status = jest.fn((_: any) => res);
    await handler(req, res);

    expect(mockHandler).toHaveBeenCalledWith(req);
    expect(res.send).toHaveBeenCalledWith(undefined);
    expect(res.send).toHaveBeenCalledTimes(1);
  })
})
