import type { HttpMethod } from "./types";

export interface RequestModel {
  endpointId: string;
  method: HttpMethod;
  path: string;
  resolvedUrl: string;
  headers: Record<string, string>;
  query: Record<string, string>;
  pathParams: Record<string, string>;
  cookies: Record<string, string>;
  requestContentType?: string;
  responseContentType?: string;
  body?: unknown;
}
