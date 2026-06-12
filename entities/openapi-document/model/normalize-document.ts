import { detectOpenApiVersion } from "./detect-openapi-version";
import { normalizeOpenApi3 } from "./normalize-openapi3";
import { normalizeSwagger2 } from "./normalize-swagger2";
import type { OpenApiDocument } from "./types";

export function normalizeDocument(document: unknown): OpenApiDocument {
  const version = detectOpenApiVersion(document);

  if (version === "swagger2") {
    return normalizeSwagger2(document);
  }

  return normalizeOpenApi3(document);
}
