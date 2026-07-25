import { afterEach, describe, expect, it, vi } from "vitest";

import type { RequestAnalyticsRepository } from "@/server/analytics/request-analytics-repository";
import { ProxyValidationError } from "@/server/proxy/proxy-errors";
import type { ProxyResult } from "@/server/proxy/proxy-result";
import type { User } from "@supabase/supabase-js";

import { createProxyPostHandler } from "./route";

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
    const response = await createTestProxyPostHandler()(
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
    const response = await createTestProxyPostHandler()(
      createProxyRequest(createValidProxyInput({ method: "trace" }))
    );

    await expect(response.json()).resolves.toMatchObject({
      ok: false,
      error: {
        type: "invalid_payload",
      },
    });
    expect(response.status).toBe(400);
  });

  it("returns 400 for blocked target URLs", async () => {
    const response = await createTestProxyPostHandler({
      executeProxyRequest: async () => {
        throw new ProxyValidationError("Private network targets are not allowed");
      },
    })(createProxyRequest(createValidProxyInput({ resolvedUrl: "http://127.0.0.1:3000" })));

    await expect(response.json()).resolves.toMatchObject({
      ok: false,
      error: {
        type: "blocked_url",
      },
    });
    expect(response.status).toBe(400);
  });

  it("returns proxy result for valid payloads", async () => {
    const response = await createTestProxyPostHandler()(
      createProxyRequest(createValidProxyInput())
    );

    await expect(response.json()).resolves.toMatchObject({
      ok: true,
      response: {
        status: 200,
        body: "ok",
      },
    });
    expect(response.status).toBe(200);
  });

  it("does not create analytics repository for anonymous users", async () => {
    const createAnalyticsRepository = vi.fn();

    const response = await createTestProxyPostHandler({
      getUser: async () => null,
      createAnalyticsRepository,
    })(createProxyRequest(createValidProxyInput()));

    expect(response.status).toBe(200);
    expect(createAnalyticsRepository).not.toHaveBeenCalled();
  });

  it("records analytics for authenticated users", async () => {
    const repository = createRepositoryMock();

    const response = await createTestProxyPostHandler({
      getUser: async () => ({ id: "user-1" }) as User,
      createAnalyticsRepository: async () => repository,
    })(createProxyRequest(createValidProxyInput()));

    expect(response.status).toBe(200);
    expect(repository.recordRequestAnalytics).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "user-1",
        method: "get",
        path: "/users",
        resolvedUrl: "https://93.184.216.34/users",
        statusCode: 200,
      })
    );
  });

  it("keeps proxy response successful when analytics recording fails", async () => {
    const repository = createRepositoryMock();
    vi.mocked(repository.recordRequestAnalytics).mockRejectedValue(new Error("database is down"));

    const response = await createTestProxyPostHandler({
      getUser: async () => ({ id: "user-1" }) as User,
      createAnalyticsRepository: async () => repository,
    })(createProxyRequest(createValidProxyInput()));

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

function createTestProxyPostHandler(
  overrides: Partial<Parameters<typeof createProxyPostHandler>[0]> = {}
) {
  return createProxyPostHandler({
    getUser: async () => null,
    executeProxyRequest: async () => createProxyResult(),
    createAnalyticsRepository: async () => createRepositoryMock(),
    ...overrides,
  });
}

function createProxyResult(): ProxyResult {
  return {
    ok: true,
    response: {
      status: 200,
      statusText: "OK",
      headers: {},
      body: "ok",
      durationMs: 12,
      truncated: false,
    },
    analytics: {
      requestSizeBytes: 0,
      responseSizeBytes: 2,
    },
  };
}

function createRepositoryMock(): RequestAnalyticsRepository {
  return {
    recordRequestAnalytics: vi.fn().mockResolvedValue(undefined),
    getRequestHistoryPage: vi.fn(),
  };
}
