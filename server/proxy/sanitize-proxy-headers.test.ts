import { describe, expect, it } from "vitest";

import { sanitizeProxyHeaders } from "./sanitize-proxy-headers";

describe("sanitizeProxyHeaders", () => {
  it("removes hop-by-hop, cookie and sec headers", () => {
    expect(
      sanitizeProxyHeaders({
        authorization: "Bearer token",
        host: "example.com",
        connection: "keep-alive",
        "content-length": "10",
        cookie: "session=internal",
        "sec-fetch-site": "same-origin",
        "x-request-id": "abc",
      })
    ).toEqual({
      authorization: "Bearer token",
      "x-request-id": "abc",
    });
  });
});
