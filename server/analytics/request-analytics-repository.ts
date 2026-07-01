import type { RequestAnalyticsRecord } from "./request-analytics-record";
import type { RequestHistoryPage, RequestHistoryPageParams } from "./request-history-page";

export interface RequestAnalyticsRepository {
  recordRequestAnalytics(record: RequestAnalyticsRecord): Promise<void>;
  getRequestHistoryPage(
    userId: string,
    params?: RequestHistoryPageParams
  ): Promise<RequestHistoryPage>;
}
