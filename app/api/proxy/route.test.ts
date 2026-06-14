import { afterEach, describe, expect, it, vi } from "vitest";

import { POST } from "./route";

function createProxyRequest(body: unknown): Request {
  return new Request("http://localhost/api/proxy", {
    method: "POST",
    body: JSON.stringify(body),
    headers: {
      "content-type": "application/json",
    },
  });
}

function createValidProxyInput(overrides: Record<string, unknown> = {}) {
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

describe("/api/proxy", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns 400 for invalid JSON", async () => {
    const response = await POST(
      new Request("http://localhost/api/proxy", {
        method: "POST",
        body: "{",
        headers: {
          "content-type": "application/json",
        },
      })
    );

    await expect(response.json()).resolves.toMatchObject({
      ok: false,
      error: {
        type: "invalid_payload",
      },
    });
    expect(response.status).toBe(400);
  });

  it("returns 400 for invalid proxy payload", async () => {
    const response = await POST(createProxyRequest(createValidProxyInput({ method: "trace" })));

    await expect(response.json()).resolves.toMatchObject({
      ok: false,
      error: {
        type: "invalid_payload",
      },
    });
    expect(response.status).toBe(400);
  });

  it("returns 400 for blocked target URLs", async () => {
    const response = await POST(
      createProxyRequest(createValidProxyInput({ resolvedUrl: "http://127.0.0.1:3000" }))
    );

    await expect(response.json()).resolves.toMatchObject({
      ok: false,
      error: {
        type: "blocked_url",
      },
    });
    expect(response.status).toBe(400);
  });

  it("returns proxy result for valid payloads", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("ok", { status: 200 }));

    const response = await POST(createProxyRequest(createValidProxyInput()));

    await expect(response.json()).resolves.toMatchObject({
      ok: true,
      response: {
        status: 200,
        body: "ok",
      },
    });
    expect(response.status).toBe(200);
  });
});
