import type { HttpMethod } from "./types";

const BODYLESS_METHODS = new Set<HttpMethod>(["get", "head"]);

export function buildRequestBody({
  method,
  body,
  contentType,
}: {
  method: HttpMethod;
  body: unknown;
  contentType?: string;
}): string | undefined {
  if (BODYLESS_METHODS.has(method) || body === undefined || body === null) {
    return undefined;
  }

  if (isJsonContentType(contentType)) {
    return serializeJsonBody(body);
  }

  return typeof body === "string" ? body : JSON.stringify(body);
}

function serializeJsonBody(body: unknown): string {
  if (typeof body !== "string") {
    return JSON.stringify(body, null, 2);
  }

  try {
    return JSON.stringify(JSON.parse(body), null, 2);
  } catch {
    return body;
  }
}

function isJsonContentType(contentType: string | undefined): boolean {
  return contentType?.toLowerCase().includes("json") ?? false;
}
