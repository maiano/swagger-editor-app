import { describe, expect, it } from "vitest";

import type { RequestAnalyticsRecord } from "./request-analytics-record";
import {
  SupabaseRequestAnalyticsRepository,
  type SupabaseRequestAnalyticsClient,
  type SupabaseRequestAnalyticsRow,
} from "./supabase-request-analytics-repository";

function createRecord(overrides: Partial<RequestAnalyticsRecord> = {}): RequestAnalyticsRecord {
  return {
    id: "record-1",
    userId: "user-1",
    endpointId: "GET /pets",
    method: "get",
    path: "/pets",
    resolvedUrl: "https://api.example.com/pets",
    statusCode: 200,
    durationMs: 42,
    requestSizeBytes: 0,
    responseSizeBytes: 2,
    errorDetails: null,
    createdAt: "2026-06-20T10:00:00.000Z",
    ...overrides,
  };
}

describe("SupabaseRequestAnalyticsRepository", () => {
  it("inserts analytics records using database column names", async () => {
    const table = new FakeRequestAnalyticsTable();
    const repository = new SupabaseRequestAnalyticsRepository(createClient(table));

    await repository.recordRequestAnalytics(createRecord());

    expect(table.insertedRow).toEqual({
      id: "record-1",
      user_id: "user-1",
      endpoint_id: "GET /pets",
      method: "get",
      path: "/pets",
      resolved_url: "https://api.example.com/pets",
      status_code: 200,
      duration_ms: 42,
      request_size_bytes: 0,
      response_size_bytes: 2,
      error_details: null,
      created_at: "2026-06-20T10:00:00.000Z",
    });
  });

  it("loads paginated history and maps rows back to domain records", async () => {
    const table = new FakeRequestAnalyticsTable([
      {
        id: "record-2",
        user_id: "user-1",
        endpoint_id: null,
        method: "post",
        path: "/pets",
        resolved_url: "https://api.example.com/pets",
        status_code: 201,
        duration_ms: 60,
        request_size_bytes: 12,
        response_size_bytes: 20,
        error_details: null,
        created_at: "2026-06-20T11:00:00.000Z",
      },
    ]);
    table.count = 12;
    const repository = new SupabaseRequestAnalyticsRepository(createClient(table));

    await expect(
      repository.getRequestHistoryPage("user-1", { page: 2, limit: 5 })
    ).resolves.toEqual({
      rows: [
        {
          id: "record-2",
          userId: "user-1",
          endpointId: null,
          method: "post",
          path: "/pets",
          resolvedUrl: "https://api.example.com/pets",
          statusCode: 201,
          durationMs: 60,
          requestSizeBytes: 12,
          responseSizeBytes: 20,
          errorDetails: null,
          createdAt: "2026-06-20T11:00:00.000Z",
        },
      ],
      pagination: {
        page: 2,
        limit: 5,
        total: 12,
        totalPages: 3,
        hasNextPage: true,
        hasPreviousPage: true,
      },
    });
    expect(table.selectedColumns).toBe("*");
    expect(table.selectedCount).toBe("exact");
    expect(table.eqFilter).toEqual(["user_id", "user-1"]);
    expect(table.orderBy).toEqual(["created_at", { ascending: false }]);
    expect(table.rangeBounds).toEqual([5, 9]);
  });

  it("throws readable errors for failed inserts", async () => {
    const table = new FakeRequestAnalyticsTable();
    table.insertError = { message: "permission denied" };
    const repository = new SupabaseRequestAnalyticsRepository(createClient(table));

    await expect(repository.recordRequestAnalytics(createRecord())).rejects.toThrow(
      "Failed to record request analytics: permission denied"
    );
  });

  it("returns pagination metadata for out of range history pages", async () => {
    const table = new FakeRequestAnalyticsTable();
    table.selectError = { message: "Requested range not satisfiable" };
    table.count = 12;
    const repository = new SupabaseRequestAnalyticsRepository(createClient(table));

    await expect(
      repository.getRequestHistoryPage("user-1", { page: 999, limit: 5 })
    ).resolves.toEqual({
      rows: [],
      pagination: {
        page: 999,
        limit: 5,
        total: 12,
        totalPages: 3,
        hasNextPage: false,
        hasPreviousPage: true,
      },
    });
    expect(table.limitCount).toBe(1);
  });
});

function createClient(table: FakeRequestAnalyticsTable): SupabaseRequestAnalyticsClient {
  return {
    from(name) {
      expect(name).toBe("request_analytics");
      return table;
    },
  };
}

class FakeRequestAnalyticsTable {
  insertedRow: unknown = null;
  insertError: { message: string } | null = null;
  selectedColumns: string | null = null;
  selectedCount: string | null = null;
  eqFilter: [string, string] | null = null;
  orderBy: [string, { ascending: false }] | null = null;
  rangeBounds: [number, number] | null = null;
  limitCount: number | null = null;
  count = 0;
  selectError: { message: string } | null = null;

  constructor(private readonly rows: SupabaseRequestAnalyticsRow[] = []) {}

  async insert(row: unknown) {
    this.insertedRow = row;

    return {
      error: this.insertError,
    };
  }

  select(columns: string, options: { count: "exact" }) {
    this.selectedColumns = columns;
    this.selectedCount = options.count;

    return this;
  }

  eq(column: "user_id", value: string) {
    this.eqFilter = [column, value];

    return this;
  }

  order(column: "created_at", options: { ascending: false }) {
    this.orderBy = [column, options];

    return this;
  }

  async range(from: number, to: number) {
    this.rangeBounds = [from, to];

    return {
      data: this.rows,
      error: this.selectError,
      count: this.count,
    };
  }

  async limit(count: number) {
    this.limitCount = count;

    return {
      data: this.rows.slice(0, count),
      error: null,
      count: this.count,
    };
  }
}
