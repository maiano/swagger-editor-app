export interface RequestAnalyticsRecord {
  id: string;
  userId: string;
  endpointId: string | null;
  method: string;
  path: string;
  resolvedUrl: string;
  statusCode: number | null;
  durationMs: number;
  requestSizeBytes: number;
  responseSizeBytes: number;
  errorDetails: string | null;
  createdAt: string;
}
