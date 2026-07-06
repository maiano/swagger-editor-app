import { stringify as stringifyYaml } from "yaml";

import { parseSchemaText } from "./parse-schema-text";
import type { SchemaFormat } from "./types";

export function convertSchemaText(text: string, targetFormat: SchemaFormat): string {
  const parsed = parseSchemaText(text);

  if (targetFormat === "json") {
    return `${JSON.stringify(parsed.value, null, 2)}\n`;
  }

  return stringifyYaml(parsed.value);
}
