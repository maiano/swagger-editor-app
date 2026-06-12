import type { SchemaFormat } from "./types";

export function detectSchemaFormat(text: string): SchemaFormat {
  const trimmed = text.trimStart();

  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    return "json";
  }

  return "yaml";
}
