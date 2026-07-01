import type { RequestAnalyticsRecord } from "./request-analytics-record";

export const DEFAULT_HISTORY_LIMIT = 50;
export const MAX_HISTORY_LIMIT = 100;

export interface RequestHistoryPageParams {
  page?: number;
  limit?: number;
}

export interface RequestHistoryPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface RequestHistoryPage {
  rows: RequestAnalyticsRecord[];
  pagination: RequestHistoryPagination;
}

export function normalizeHistoryPageParams(params: RequestHistoryPageParams = {}) {
  const page = normalizePositiveInteger(params.page, 1);
  const limit = Math.min(
    normalizePositiveInteger(params.limit, DEFAULT_HISTORY_LIMIT),
    MAX_HISTORY_LIMIT
  );

  return {
    page,
    limit,
    offset: (page - 1) * limit,
  };
}

export function createHistoryPagination({
  page,
  limit,
  total,
}: {
  page: number;
  limit: number;
  total: number;
}): RequestHistoryPagination {
  const totalPages = Math.ceil(total / limit);

  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1 && totalPages > 0,
  };
}

function normalizePositiveInteger(value: number | undefined, fallback: number): number {
  if (!Number.isInteger(value) || value === undefined || value < 1) {
    return fallback;
  }

  return value;
}
