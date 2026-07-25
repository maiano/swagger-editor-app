import { parseSchemaText } from "@/entities/schema/model";
import type { SchemaFormat } from "@/entities/schema/model";

import { detectOpenApiVersion } from "./detect-openapi-version";
import { getOpenApiErrorMessage } from "./errors";
import { normalizeDocument } from "./normalize-document";
import { validateAndDereferenceOpenApiDocument } from "./openapi-parser";
import type { OpenApiDocument } from "./types";

export interface ParseOpenApiSchemaSuccess {
  ok: true;
  format: SchemaFormat;
  rawDocument: unknown;
  validatedDocument: unknown;
  document: OpenApiDocument;
}

export interface ParseOpenApiSchemaFailure {
  ok: false;
  error: string;
}

export type ParseOpenApiSchemaResult = ParseOpenApiSchemaSuccess | ParseOpenApiSchemaFailure;

export async function parseOpenApiSchema(text: string): Promise<ParseOpenApiSchemaResult> {
  try {
    const parsed = parseSchemaText(text);

    detectOpenApiVersion(parsed.value);

    const validatedDocument = await validateAndDereferenceOpenApiDocument(parsed.value);
    const document = normalizeDocument(validatedDocument);

    return {
      ok: true,
      format: parsed.format,
      rawDocument: parsed.value,
      validatedDocument,
      document,
    };
  } catch (error) {
    return {
      ok: false,
      error: getOpenApiErrorMessage(error),
    };
  }
}
