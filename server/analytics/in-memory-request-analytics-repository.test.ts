import { describe, expect, it } from "vitest";

import { InMemoryRequestAnalyticsRepository } from "./in-memory-request-analytics-repository";
import type { RequestAnalyticsRecord } from "./request-analytics-record";

function createRecord(overrides: Partial<RequestAnalyticsRecord>): RequestAnalyticsRecord {
  return {
    id: "record-1",
    userId: "user-1",
    endpointId: "GET /pets",
    method: "get",
    path: "/pets",
    resolvedUrl: "https://api.example.com/pets",
    statusCode: 200,
    durationMs: 10,
    requestSizeBytes: 0,
    responseSizeBytes: 2,
    errorDetails: null,
    createdAt: "2026-06-19T10:00:00.000Z",
    ...overrides,
  };
}

describe("InMemoryRequestAnalyticsRepository", () => {
  it("returns only requested user records newest first", async () => {
    const repository = new InMemoryRequestAnalyticsRepository();

    await repository.recordRequestAnalytics(
      createRecord({ id: "old", createdAt: "2026-06-19T10:00:00.000Z" })
    );
    await repository.recordRequestAnalytics(
      createRecord({ id: "other-user", userId: "user-2", createdAt: "2026-06-19T12:00:00.000Z" })
    );
    await repository.recordRequestAnalytics(
      createRecord({ id: "new", createdAt: "2026-06-19T11:00:00.000Z" })
    );

    await expect(repository.getRequestHistoryPage("user-1")).resolves.toMatchObject({
      rows: [{ id: "new" }, { id: "old" }],
      pagination: {
        page: 1,
        limit: 50,
        total: 2,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    });
  });

  it("paginates records with explicit limit", async () => {
    const repository = new InMemoryRequestAnalyticsRepository();

    await repository.recordRequestAnalytics(
      createRecord({ id: "first", createdAt: "2026-06-19T12:00:00.000Z" })
    );
    await repository.recordRequestAnalytics(
      createRecord({ id: "second", createdAt: "2026-06-19T11:00:00.000Z" })
    );
    await repository.recordRequestAnalytics(
      createRecord({ id: "third", createdAt: "2026-06-19T10:00:00.000Z" })
    );

    await expect(
      repository.getRequestHistoryPage("user-1", { page: 2, limit: 2 })
    ).resolves.toMatchObject({
      rows: [{ id: "third" }],
      pagination: {
        page: 2,
        limit: 2,
        total: 3,
        totalPages: 2,
        hasNextPage: false,
        hasPreviousPage: true,
      },
    });
  });

  it("caps unsafe limits", async () => {
    const repository = new InMemoryRequestAnalyticsRepository();

    await expect(repository.getRequestHistoryPage("user-1", { limit: 500 })).resolves.toMatchObject(
      {
        pagination: {
          limit: 100,
        },
      }
    );
  });
});
