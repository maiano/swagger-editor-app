import { shellEscape } from "@/shared/lib/shell-escape";

import { buildRequestBody } from "./build-request-body";
import { buildRequestHeaders } from "./build-request-headers";
import type { RequestModel } from "./request-model";

export function buildCurlCommand(request: RequestModel): string {
  const lines = ["curl \\"];
  const body = buildRequestBody({
    method: request.method,
    body: request.body,
    contentType: request.requestContentType,
  });
  const headers = buildRequestHeaders({
    headers: request.headers,
    hasBody: body !== undefined,
    requestContentType: request.requestContentType,
    responseContentType: request.responseContentType,
  });

  lines.push(`  -X ${request.method.toUpperCase()} \\`);
  lines.push(`  ${shellEscape(request.resolvedUrl)} \\`);

  for (const [name, value] of headers) {
    lines.push(`  -H ${shellEscape(`${name}: ${value}`)} \\`);
  }

  if (body !== undefined) {
    lines.push(`  ${getBodyFlag(request.requestContentType)} ${shellEscape(body)} \\`);
  }

  return lines
    .map((line, index) => (index === lines.length - 1 ? line.replace(/ \\$/, "") : line))
    .join("\n");
}

function getBodyFlag(contentType: string | undefined): string {
  return isJsonContentType(contentType) ? "--data-raw" : "--data";
}

function isJsonContentType(contentType: string | undefined): boolean {
  return contentType?.toLowerCase().includes("json") ?? false;
}
