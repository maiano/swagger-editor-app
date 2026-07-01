import type { ProxyInput } from "@/server/proxy/proxy-input";
import type { ProxyResult } from "@/server/proxy/proxy-result";

import { createRequestAnalyticsRecord } from "./create-request-analytics-record";
import type { RequestAnalyticsRepository } from "./request-analytics-repository";

interface RecordRequestAnalyticsParams {
  repository: RequestAnalyticsRepository;
  userId: string | null;
  input: ProxyInput;
  result: ProxyResult;
}

export async function recordRequestAnalytics({
  repository,
  userId,
  input,
  result,
}: RecordRequestAnalyticsParams): Promise<void> {
  const record = createRequestAnalyticsRecord({
    userId,
    input,
    result,
  });

  if (!record) {
    return;
  }

  await repository.recordRequestAnalytics(record);
}
