export type ProxyErrorCode = "invalid_payload" | "blocked_url" | "timeout" | "network_error";

export interface ProxyResult {
  ok: boolean;
  response?: {
    status: number;
    statusText?: string;
    headers: Record<string, string>;
    body: string;
    durationMs: number;
    truncated: boolean;
  };
  error?: {
    type: ProxyErrorCode;
    message: string;
  };
  analytics?: {
    requestSizeBytes: number;
    responseSizeBytes: number;
  };
}
