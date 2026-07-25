import type { RequestAnalyticsRecord } from "./request-analytics-record";
import type { RequestAnalyticsRepository } from "./request-analytics-repository";
import {
  createHistoryPagination,
  normalizeHistoryPageParams,
  type RequestHistoryPage,
  type RequestHistoryPageParams,
} from "./request-history-page";

interface SupabaseErrorLike {
  message: string;
}

interface SupabaseMutationResult {
  error: SupabaseErrorLike | null;
}

interface SupabaseSelectResult<Row> {
  data: Row[] | null;
  error: SupabaseErrorLike | null;
  count: number | null;
}

interface SupabaseRequestAnalyticsSelectQuery {
  eq(column: "user_id", value: string): SupabaseRequestAnalyticsSelectQuery;
  order(column: "created_at", options: { ascending: false }): SupabaseRequestAnalyticsSelectQuery;
  range(from: number, to: number): PromiseLike<SupabaseSelectResult<SupabaseRequestAnalyticsRow>>;
  limit(count: number): PromiseLike<SupabaseSelectResult<SupabaseRequestAnalyticsRow>>;
}

interface SupabaseRequestAnalyticsTable {
  insert(row: SupabaseRequestAnalyticsInsert): PromiseLike<SupabaseMutationResult>;
  select(columns: string, options: { count: "exact" }): SupabaseRequestAnalyticsSelectQuery;
}

export interface SupabaseRequestAnalyticsClient {
  from(table: "request_analytics"): SupabaseRequestAnalyticsTable;
}

export interface SupabaseRequestAnalyticsRow {
  id: string;
  user_id: string;
  endpoint_id: string | null;
  method: string;
  path: string;
  resolved_url: string;
  status_code: number | null;
  duration_ms: number;
  request_size_bytes: number;
  response_size_bytes: number;
  error_details: string | null;
  created_at: string;
}

export type SupabaseRequestAnalyticsInsert = SupabaseRequestAnalyticsRow;

export class SupabaseRequestAnalyticsRepository implements RequestAnalyticsRepository {
  constructor(private readonly client: SupabaseRequestAnalyticsClient) {}

  async recordRequestAnalytics(record: RequestAnalyticsRecord): Promise<void> {
    const { error } = await this.client
      .from("request_analytics")
      .insert(toSupabaseRequestAnalyticsInsert(record));

    if (error) {
      throw new Error(`Failed to record request analytics: ${error.message}`);
    }
  }

  async getRequestHistoryPage(
    userId: string,
    params?: RequestHistoryPageParams
  ): Promise<RequestHistoryPage> {
    const { page, limit, offset } = normalizeHistoryPageParams(params);
    const { data, error, count } = await this.client
      .from("request_analytics")
      .select("*", { count: "exact" })
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      if (isRangeNotSatisfiableError(error)) {
        return this.getOutOfRangeHistoryPage(userId, { page, limit });
      }

      throw new Error(`Failed to load request history: ${error.message}`);
    }

    const total = count ?? 0;

    return {
      rows: (data ?? []).map(fromSupabaseRequestAnalyticsRow),
      pagination: createHistoryPagination({
        page,
        limit,
        total,
      }),
    };
  }

  private async getOutOfRangeHistoryPage(
    userId: string,
    params: { page: number; limit: number }
  ): Promise<RequestHistoryPage> {
    const { error, count } = await this.client
      .from("request_analytics")
      .select("*", { count: "exact" })
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1);

    if (error) {
      throw new Error(`Failed to load request history: ${error.message}`);
    }

    return {
      rows: [],
      pagination: createHistoryPagination({
        page: params.page,
        limit: params.limit,
        total: count ?? 0,
      }),
    };
  }
}

function isRangeNotSatisfiableError(error: SupabaseErrorLike): boolean {
  return error.message.toLowerCase().includes("requested range not satisfiable");
}

function toSupabaseRequestAnalyticsInsert(
  record: RequestAnalyticsRecord
): SupabaseRequestAnalyticsInsert {
  return {
    id: record.id,
    user_id: record.userId,
    endpoint_id: record.endpointId,
    method: record.method,
    path: record.path,
    resolved_url: record.resolvedUrl,
    status_code: record.statusCode,
    duration_ms: record.durationMs,
    request_size_bytes: record.requestSizeBytes,
    response_size_bytes: record.responseSizeBytes,
    error_details: record.errorDetails,
    created_at: record.createdAt,
  };
}

function fromSupabaseRequestAnalyticsRow(row: SupabaseRequestAnalyticsRow): RequestAnalyticsRecord {
  return {
    id: row.id,
    userId: row.user_id,
    endpointId: row.endpoint_id,
    method: row.method,
    path: row.path,
    resolvedUrl: row.resolved_url,
    statusCode: row.status_code,
    durationMs: row.duration_ms,
    requestSizeBytes: row.request_size_bytes,
    responseSizeBytes: row.response_size_bytes,
    errorDetails: row.error_details,
    createdAt: row.created_at,
  };
}
