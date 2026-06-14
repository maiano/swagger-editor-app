import type { ProxyInput } from "./proxy-input";
import type { ProxyResult } from "./proxy-result";
import { sanitizeProxyHeaders } from "./sanitize-proxy-headers";
import { validateTargetUrl } from "./validate-target-url";

const PROXY_TIMEOUT_MS = 15_000;
const MAX_RESPONSE_BYTES = 1_000_000;
const BODYLESS_METHODS = new Set(["get", "head"]);

export async function executeProxyRequest(input: ProxyInput): Promise<ProxyResult> {
  const targetUrl = await validateTargetUrl(input.resolvedUrl);
  const controller = new AbortController();
  const startedAt = performance.now();
  const timeoutId = setTimeout(() => controller.abort(), PROXY_TIMEOUT_MS);
  const requestBody = createRequestBody(input);

  try {
    const response = await fetch(targetUrl, {
      method: input.method.toUpperCase(),
      headers: sanitizeProxyHeaders(input.headers),
      body: requestBody,
      redirect: "manual",
      signal: controller.signal,
    });
    const collectedBody = await collectResponseBody(response);

    return {
      ok: true,
      response: {
        status: response.status,
        statusText: response.statusText,
        headers: collectResponseHeaders(response.headers),
        body: collectedBody.body,
        durationMs: Math.round(performance.now() - startedAt),
        truncated: collectedBody.truncated,
      },
      analytics: {
        requestSizeBytes: getBodySizeBytes(requestBody),
        responseSizeBytes: collectedBody.sizeBytes,
      },
    };
  } catch (error) {
    if (isAbortError(error)) {
      return {
        ok: false,
        error: {
          type: "timeout",
          message: "Proxy request timed out",
        },
      };
    }

    return {
      ok: false,
      error: {
        type: "network_error",
        message: "Proxy request failed",
      },
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

function createRequestBody(input: ProxyInput): string | undefined {
  if (BODYLESS_METHODS.has(input.method) || input.body === undefined) {
    return undefined;
  }

  return typeof input.body === "string" ? input.body : JSON.stringify(input.body);
}

async function collectResponseBody(response: Response): Promise<{
  body: string;
  sizeBytes: number;
  truncated: boolean;
}> {
  if (!response.body) {
    return {
      body: "",
      sizeBytes: 0,
      truncated: false,
    };
  }

  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let sizeBytes = 0;
  let truncated = false;

  while (true) {
    const { done, value } = await reader.read();

    if (done) {
      break;
    }

    const remainingBytes = MAX_RESPONSE_BYTES - sizeBytes;

    if (value.byteLength > remainingBytes) {
      chunks.push(value.slice(0, Math.max(remainingBytes, 0)));
      sizeBytes = MAX_RESPONSE_BYTES;
      truncated = true;
      break;
    }

    chunks.push(value);
    sizeBytes += value.byteLength;
  }

  await reader.cancel().catch(() => undefined);

  return {
    body: new TextDecoder().decode(concatChunks(chunks, sizeBytes)),
    sizeBytes,
    truncated,
  };
}

function concatChunks(chunks: Uint8Array[], sizeBytes: number): Uint8Array {
  const result = new Uint8Array(sizeBytes);
  let offset = 0;

  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.byteLength;
  }

  return result;
}

function collectResponseHeaders(headers: Headers): Record<string, string> {
  return Object.fromEntries(headers.entries());
}

function getBodySizeBytes(body: string | undefined): number {
  return body ? new TextEncoder().encode(body).byteLength : 0;
}

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError";
}
