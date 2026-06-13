import { shellEscape } from "@/shared/lib/shell-escape";

import type { RequestModel } from "./request-model";

export function buildCurlCommand(request: RequestModel): string {
  const parts = ["curl", "-X", shellEscape(request.method.toUpperCase())];

  for (const [name, value] of Object.entries(request.headers)) {
    if (!name || !value) {
      continue;
    }

    parts.push("-H", shellEscape(`${name}: ${value}`));
  }

  const body = serializeRequestBody(request.body);

  if (body !== undefined) {
    if (!hasHeader(request.headers, "content-type")) {
      parts.push("-H", shellEscape("Content-Type: application/json"));
    }

    parts.push("--data", shellEscape(body));
  }

  parts.push(shellEscape(request.resolvedUrl));

  return parts.join(" \\\n  ");
}

function serializeRequestBody(body: unknown): string | undefined {
  if (body === undefined || body === null) {
    return undefined;
  }

  return typeof body === "string" ? body : JSON.stringify(body);
}

function hasHeader(headers: Record<string, string>, headerName: string): boolean {
  const normalizedHeaderName = headerName.toLowerCase();

  return Object.keys(headers).some((name) => name.toLowerCase() === normalizedHeaderName);
}
