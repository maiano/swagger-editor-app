import type { RequestAnalyticsRepository } from "./request-analytics-repository";
import type { RequestHistoryPage, RequestHistoryPageParams } from "./request-history-page";
import { createHistoryPagination, normalizeHistoryPageParams } from "./request-history-page";

export class NoopRequestAnalyticsRepository implements RequestAnalyticsRepository {
  async recordRequestAnalytics(): Promise<void> {
    return;
  }

  async getRequestHistoryPage(
    _userId: string,
    params?: RequestHistoryPageParams
  ): Promise<RequestHistoryPage> {
    const { page, limit } = normalizeHistoryPageParams(params);

    return {
      rows: [],
      pagination: createHistoryPagination({
        page,
        limit,
        total: 0,
      }),
    };
  }
}
