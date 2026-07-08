import { afterEach, describe, expect, it, vi } from "vitest";

import { executeProxyRequest } from "./execute-proxy-request";
import type { ProxyInput } from "./proxy-input";

function createProxyInput(overrides: Partial<ProxyInput> = {}): ProxyInput {
  return {
    endpointId: "get:/users",
    method: "get",
    path: "/users",
    resolvedUrl: "https://93.184.216.34/users",
    headers: {},
    query: {},
    pathParams: {},
    cookies: {},
    ...overrides,
  };
}

describe("executeProxyRequest", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("executes request with sanitized headers and manual redirects", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response("created", {
        status: 201,
        statusText: "Created",
        headers: {
          "content-type": "text/plain",
        },
      })
    );

    const result = await executeProxyRequest(
      createProxyInput({
        method: "post",
        headers: {
          authorization: "Bearer token",
          cookie: "session=internal",
          "sec-fetch-site": "same-origin",
          "x-request-id": "abc",
        },
        body: "payload",
      })
    );

    expect(fetchMock).toHaveBeenCalledWith(
      new URL("https://93.184.216.34/users"),
      expect.objectContaining({
        method: "POST",
        headers: {
          authorization: "Bearer token",
          "x-request-id": "abc",
        },
        body: "payload",
        redirect: "manual",
      })
    );
    expect(result).toMatchObject({
      ok: true,
      response: {
        status: 201,
        statusText: "Created",
        body: "created",
        truncated: false,
      },
      analytics: {
        requestSizeBytes: 7,
        responseSizeBytes: 7,
      },
    });
  });

  it("adds generated JSON headers when request body and media types are known", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("created"));

    await executeProxyRequest(
      createProxyInput({
        method: "post",
        requestContentType: "application/json",
        responseContentType: "application/json",
        body: {
          name: "doggie",
        },
      })
    );

    expect(fetchMock).toHaveBeenCalledWith(
      expect.any(URL),
      expect.objectContaining({
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: "doggie" }, null, 2),
      })
    );
  });

  it("lets user headers override generated proxy headers", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("created"));

    await executeProxyRequest(
      createProxyInput({
        method: "post",
        requestContentType: "application/json",
        responseContentType: "application/json",
        headers: {
          accept: "application/problem+json",
          "content-type": "application/vnd.api+json",
        },
        body: "{}",
      })
    );

    expect(fetchMock).toHaveBeenCalledWith(
      expect.any(URL),
      expect.objectContaining({
        headers: {
          accept: "application/problem+json",
          "content-type": "application/vnd.api+json",
        },
      })
    );
  });

  it("does not send request body for GET and HEAD", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(null));

    await executeProxyRequest(
      createProxyInput({
        requestContentType: "application/json",
        responseContentType: "application/json",
        body: "ignored",
      })
    );

    expect(fetchMock).toHaveBeenCalledWith(
      expect.any(URL),
      expect.objectContaining({
        method: "GET",
        headers: {
          Accept: "application/json",
        },
        body: undefined,
      })
    );
  });

  it("returns structured network errors", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("connection failed"));

    await expect(executeProxyRequest(createProxyInput())).resolves.toMatchObject({
      ok: false,
      error: {
        type: "network_error",
      },
    });
  });

  it("truncates large responses", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("x".repeat(1_000_001)));

    await expect(executeProxyRequest(createProxyInput())).resolves.toMatchObject({
      ok: true,
      response: {
        truncated: true,
      },
      analytics: {
        responseSizeBytes: 1_000_000,
      },
    });
  });
});
