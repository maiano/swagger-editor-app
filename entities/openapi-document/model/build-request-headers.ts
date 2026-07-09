const HEADER_ORDER = ["accept", "authorization", "content-type"];

export interface BuildRequestHeadersInput {
  headers: Record<string, string>;
  hasBody: boolean;
  requestContentType?: string;
  responseContentType?: string;
}

export function buildRequestHeaders({
  headers,
  hasBody,
  requestContentType,
  responseContentType,
}: BuildRequestHeadersInput): Array<readonly [name: string, value: string]> {
  const normalizedHeaders = new Map<string, { name: string; value: string }>();

  if (responseContentType) {
    setHeader(normalizedHeaders, "Accept", responseContentType);
  }

  if (hasBody && requestContentType) {
    setHeader(normalizedHeaders, "Content-Type", requestContentType);
  }

  for (const [name, value] of Object.entries(headers)) {
    setHeader(normalizedHeaders, name, value);
  }

  return Array.from(normalizedHeaders.values())
    .sort(compareHeaders)
    .map(({ name, value }) => [name, value] as const);
}

function setHeader(
  headers: Map<string, { name: string; value: string }>,
  name: string,
  value: string
) {
  const normalizedName = name.trim();
  const normalizedValue = value.trim();

  if (!normalizedName || !normalizedValue) {
    return;
  }

  headers.set(normalizedName.toLowerCase(), {
    name: normalizedName,
    value: normalizedValue,
  });
}

function compareHeaders(
  first: { name: string; value: string },
  second: { name: string; value: string }
): number {
  const firstName = first.name.toLowerCase();
  const secondName = second.name.toLowerCase();
  const firstIndex = HEADER_ORDER.indexOf(firstName);
  const secondIndex = HEADER_ORDER.indexOf(secondName);

  if (firstIndex !== -1 || secondIndex !== -1) {
    return getHeaderOrder(firstIndex) - getHeaderOrder(secondIndex);
  }

  return firstName.localeCompare(secondName);
}

function getHeaderOrder(index: number): number {
  return index === -1 ? HEADER_ORDER.length : index;
}
