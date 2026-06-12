import type { ExternalOpenApiVersion } from "./types";
import { asRecord } from "./normalize-common";

export function detectOpenApiVersion(document: unknown): ExternalOpenApiVersion {
  const record = asRecord(document);

  if (!record) {
    throw new Error("Document must be an object");
  }

  if (record.swagger === "2.0") {
    return "swagger2";
  }

  if (typeof record.openapi === "string" && record.openapi.startsWith("3.")) {
    return "openapi3";
  }

  throw new Error("Only Swagger 2.0 and OpenAPI 3.x are supported");
}
