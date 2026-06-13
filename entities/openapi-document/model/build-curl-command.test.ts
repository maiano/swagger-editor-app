import { describe, expect, it } from "vitest";

import { buildCurlCommand } from "./build-curl-command";
import type { RequestModel } from "./request-model";

describe("buildCurlCommand", () => {
  it("escapes URL, headers, and body for POSIX shells", () => {
    const request = {
      endpointId: "POST /pets",
      method: "post",
      path: "/pets",
      resolvedUrl: "https://api.example.com/pets?name=John's dog",
      headers: {
        Authorization: "Bearer user's-token",
      },
      query: {},
      pathParams: {},
      cookies: {},
      body: {
        name: "John's test",
      },
    } satisfies RequestModel;

    expect(buildCurlCommand(request)).toContain(`'{"name":"John'"'"'s test"}'`);
    expect(buildCurlCommand(request)).toContain(
      "'https://api.example.com/pets?name=John'\"'\"'s dog'"
    );
    expect(buildCurlCommand(request)).toContain("'Authorization: Bearer user'\"'\"'s-token'");
  });

  it("adds JSON content type when body exists and header is missing", () => {
    const request = {
      endpointId: "POST /pets",
      method: "post",
      path: "/pets",
      resolvedUrl: "https://api.example.com/pets",
      headers: {},
      query: {},
      pathParams: {},
      cookies: {},
      body: { name: "doggie" },
    } satisfies RequestModel;

    expect(buildCurlCommand(request)).toContain("-H");
    expect(buildCurlCommand(request)).toContain("'Content-Type: application/json'");
  });
});
