import { describe, expect, it, vi } from "vitest";

import type { ProxyInput } from "@/server/proxy/proxy-input";
import type { ProxyResult } from "@/server/proxy/proxy-result";

import { NoopRequestAnalyticsRepository } from "./noop-request-analytics-repository";
import { recordRequestAnalytics } from "./record-request-analytics";
import type { RequestAnalyticsRepository } from "./request-analytics-repository";

const input: ProxyInput = {
  endpointId: "GET /pets",
  method: "get",
  path: "/pets",
  resolvedUrl: "https://api.example.com/pets",
  headers: {},
  query: {},
  pathParams: {},
  cookies: {},
};

const result: ProxyResult = {
  ok: true,
  response: {
    status: 200,
    statusText: "OK",
    headers: {},
    body: "[]",
    durationMs: 30,
    truncated: false,
  },
  analytics: {
    requestSizeBytes: 0,
    responseSizeBytes: 2,
  },
};

describe("recordRequestAnalytics", () => {
  it("does not write analytics for anonymous users", async () => {
    const repository = createRepositoryMock();

    await recordRequestAnalytics({
      repository,
      userId: null,
      input,
      result,
    });

    expect(repository.recordRequestAnalytics).not.toHaveBeenCalled();
  });

  it("writes analytics for authenticated users", async () => {
    const repository = createRepositoryMock();

    await recordRequestAnalytics({
      repository,
      userId: "user-1",
      input,
      result,
    });

    expect(repository.recordRequestAnalytics).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "user-1",
        method: "get",
        path: "/pets",
        resolvedUrl: "https://api.example.com/pets",
        statusCode: 200,
        durationMs: 30,
      })
    );
  });

  it("noop repository returns an empty paginated page", async () => {
    const repository = new NoopRequestAnalyticsRepository();

    await expect(
      repository.getRequestHistoryPage("user-1", { page: 2, limit: 10 })
    ).resolves.toEqual({
      rows: [],
      pagination: {
        page: 2,
        limit: 10,
        total: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    });
  });
});

function createRepositoryMock(): RequestAnalyticsRepository {
  return {
    recordRequestAnalytics: vi.fn().mockResolvedValue(undefined),
    getRequestHistoryPage: vi.fn(),
  };
}
