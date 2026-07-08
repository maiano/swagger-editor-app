import { describe, expect, it } from "vitest";

import { buildCurlCommand } from "./build-curl-command";
import type { RequestModel } from "./request-model";

function createRequest(overrides: Partial<RequestModel> = {}): RequestModel {
  return {
    endpointId: "GET /pets",
    method: "get",
    path: "/pets",
    resolvedUrl: "https://api.example.com/pets",
    headers: {},
    query: {},
    pathParams: {},
    cookies: {},
    ...overrides,
  };
}

describe("buildCurlCommand", () => {
  it("uses data-raw for JSON request bodies", () => {
    const command = buildCurlCommand(
      createRequest({
        method: "post",
        requestContentType: "application/json",
        body: { name: "doggie" },
      })
    );

    expect(command).toContain("--data-raw");
    expect(command).not.toContain("--data \\\n");
  });

  it("includes JSON content type when JSON body exists", () => {
    const command = buildCurlCommand(
      createRequest({
        method: "post",
        requestContentType: "application/json",
        body: { name: "doggie" },
      })
    );

    expect(command).toContain("-H 'Content-Type: application/json'");
  });

  it("includes Accept when response content type is known", () => {
    const command = buildCurlCommand(
      createRequest({
        responseContentType: "application/json",
      })
    );

    expect(command).toContain("-H 'Accept: application/json'");
  });

  it("does not include Content-Type for GET requests without body", () => {
    const command = buildCurlCommand(
      createRequest({
        requestContentType: "application/json",
      })
    );

    expect(command).not.toContain("Content-Type");
  });

  it("keeps encoded query params in the URL", () => {
    const command = buildCurlCommand(
      createRequest({
        resolvedUrl: "https://api.example.com/pets?status=available&name=John+Doe",
        query: {
          status: "available",
          name: "John Doe",
        },
      })
    );

    expect(command).toContain("'https://api.example.com/pets?status=available&name=John+Doe'");
    expect(command).not.toContain("--get");
    expect(command).not.toContain("--data-urlencode");
  });

  it("uses substituted path params in the URL", () => {
    const command = buildCurlCommand(
      createRequest({
        endpointId: "GET /pets/{petId}",
        path: "/pets/{petId}",
        resolvedUrl: "https://api.example.com/pets/10",
        pathParams: {
          petId: "10",
        },
      })
    );

    expect(command).toContain("'https://api.example.com/pets/10'");
    expect(command).not.toContain("{petId}");
  });

  it("omits empty headers", () => {
    const command = buildCurlCommand(
      createRequest({
        headers: {
          Authorization: "",
          "X-Trace-Id": "trace-1",
        },
      })
    );

    expect(command).not.toContain("Authorization");
    expect(command).toContain("-H 'X-Trace-Id: trace-1'");
  });

  it("orders headers in a stable way", () => {
    const command = buildCurlCommand(
      createRequest({
        method: "post",
        requestContentType: "application/json",
        responseContentType: "application/json",
        headers: {
          "X-Zeta": "z",
          Authorization: "Bearer token",
          "X-Alpha": "a",
        },
        body: { name: "doggie" },
      })
    );

    expect(command).toMatch(
      /Accept: application\/json[\s\S]+Authorization: Bearer token[\s\S]+Content-Type: application\/json[\s\S]+X-Alpha: a[\s\S]+X-Zeta: z/
    );
  });

  it("lets user headers override generated headers case-insensitively", () => {
    const command = buildCurlCommand(
      createRequest({
        requestContentType: "application/json",
        responseContentType: "application/json",
        headers: {
          accept: "application/problem+json",
          "content-type": "application/vnd.api+json",
        },
        body: { name: "doggie" },
      })
    );

    expect(command).toContain("-H 'accept: application/problem+json'");
    expect(command).toContain("-H 'content-type: application/vnd.api+json'");
    expect(command).not.toContain("Accept: application/json");
    expect(command).not.toContain("Content-Type: application/json");
  });

  it("pretty-prints and escapes JSON body with apostrophes", () => {
    const command = buildCurlCommand(
      createRequest({
        method: "post",
        requestContentType: "application/json",
        body: {
          name: "John's test",
        },
      })
    );

    expect(command).toContain(`"name": "John'"'"'s test"`);
  });

  it("escapes URL and header values for POSIX shells", () => {
    const command = buildCurlCommand(
      createRequest({
        resolvedUrl: "https://api.example.com/pets?name=John's dog",
        headers: {
          Authorization: "Bearer user's-token",
        },
      })
    );

    expect(command).toContain("'https://api.example.com/pets?name=John'\"'\"'s dog'");
    expect(command).toContain("'Authorization: Bearer user'\"'\"'s-token'");
  });
});
