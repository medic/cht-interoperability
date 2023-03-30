import { logger } from "../../../logger";
import { registerMediatorCallback } from "../openhim";

jest.mock("../../../logger");

describe("registerMediatorCallback", () => {
  it("logs if there isn't any error", () => {
    registerMediatorCallback();

    expect(logger.info).toHaveBeenCalled();
  });

  it("throws an error if an error string is passed in", () => {
    expect(() =>
      registerMediatorCallback("ERROR")
    ).toThrowErrorMatchingSnapshot();
  });
});
