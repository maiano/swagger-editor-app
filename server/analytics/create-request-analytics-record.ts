import { randomUUID } from "node:crypto";

import type { ProxyInput } from "@/server/proxy/proxy-input";
import type { ProxyResult } from "@/server/proxy/proxy-result";

import type { RequestAnalyticsRecord } from "./request-analytics-record";

interface CreateRequestAnalyticsRecordOptions {
  userId: string | null;
  input: ProxyInput;
  result: ProxyResult;
  now?: Date;
  id?: string;
  fallbackDurationMs?: number;
}

export function createRequestAnalyticsRecord({
  userId,
  input,
  result,
  now = new Date(),
  id = randomUUID(),
  fallbackDurationMs = 0,
}: CreateRequestAnalyticsRecordOptions): RequestAnalyticsRecord | null {
  if (!userId) {
    return null;
  }

  return {
    id,
    userId,
    endpointId: input.endpointId || null,
    method: input.method,
    path: input.path,
    resolvedUrl: input.resolvedUrl,
    statusCode: result.response?.status ?? null,
    durationMs: result.response?.durationMs ?? fallbackDurationMs,
    requestSizeBytes: result.analytics?.requestSizeBytes ?? 0,
    responseSizeBytes: result.analytics?.responseSizeBytes ?? 0,
    errorDetails: result.error ? `${result.error.type}: ${result.error.message}` : null,
    createdAt: now.toISOString(),
  };
}
