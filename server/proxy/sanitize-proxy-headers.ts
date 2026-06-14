const BLOCKED_HEADER_NAMES = new Set([
  "host",
  "connection",
  "content-length",
  "transfer-encoding",
  "upgrade",
  "proxy-authorization",
  "proxy-authenticate",
  "cookie",
  "set-cookie",
]);

export function sanitizeProxyHeaders(headers: Record<string, string>): Record<string, string> {
  const sanitizedHeaders: Record<string, string> = {};

  for (const [name, value] of Object.entries(headers)) {
    const normalizedName = name.toLowerCase();

    if (BLOCKED_HEADER_NAMES.has(normalizedName) || normalizedName.startsWith("sec-")) {
      continue;
    }

    sanitizedHeaders[name] = value;
  }

  return sanitizedHeaders;
}
