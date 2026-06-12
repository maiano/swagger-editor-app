import { describe, expect, it } from "vitest";

import { detectOpenApiVersion } from "./detect-openapi-version";

describe("detectOpenApiVersion", () => {
  it("detects Swagger 2.0 documents", () => {
    expect(detectOpenApiVersion({ swagger: "2.0" })).toBe("swagger2");
  });

  it("detects OpenAPI 3.x documents", () => {
    expect(detectOpenApiVersion({ openapi: "3.1.0" })).toBe("openapi3");
  });

  it("rejects arrays as documents", () => {
    expect(() => detectOpenApiVersion([])).toThrow("Document must be an object");
  });
});
