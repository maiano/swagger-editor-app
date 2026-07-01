import type { RequestAnalyticsRecord } from "./request-analytics-record";
import type { RequestAnalyticsRepository } from "./request-analytics-repository";
import {
  createHistoryPagination,
  normalizeHistoryPageParams,
  type RequestHistoryPage,
  type RequestHistoryPageParams,
} from "./request-history-page";

export class InMemoryRequestAnalyticsRepository implements RequestAnalyticsRepository {
  private records: RequestAnalyticsRecord[] = [];

  async recordRequestAnalytics(record: RequestAnalyticsRecord): Promise<void> {
    this.records.push(record);
  }

  async getRequestHistoryPage(
    userId: string,
    params?: RequestHistoryPageParams
  ): Promise<RequestHistoryPage> {
    const { page, limit, offset } = normalizeHistoryPageParams(params);
    const userRecords = this.records
      .filter((record) => record.userId === userId)
      .toSorted(compareNewestFirst);

    return {
      rows: userRecords.slice(offset, offset + limit),
      pagination: createHistoryPagination({
        page,
        limit,
        total: userRecords.length,
      }),
    };
  }
}

function compareNewestFirst(left: RequestAnalyticsRecord, right: RequestAnalyticsRecord): number {
  const createdAtDiff = right.createdAt.localeCompare(left.createdAt);

  if (createdAtDiff !== 0) {
    return createdAtDiff;
  }

  return right.id.localeCompare(left.id);
}
