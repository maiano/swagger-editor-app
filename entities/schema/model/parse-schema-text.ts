import { parse as parseYaml } from "yaml";

import { OpenApiParseError } from "@/entities/openapi-document/model/errors";

import { detectSchemaFormat } from "./detect-format";
import type { ParsedSchemaText } from "./types";

export function parseSchemaText(text: string): ParsedSchemaText {
  const format = detectSchemaFormat(text);

  if (format === "json") {
    try {
      return {
        format,
        value: JSON.parse(text),
      };
    } catch (error) {
      throw new OpenApiParseError("Invalid JSON schema text", error);
    }
  }

  try {
    return {
      format,
      value: parseYaml(text),
    };
  } catch (error) {
    throw new OpenApiParseError("Invalid YAML schema text", error);
  }
}
