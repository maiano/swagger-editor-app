import SwaggerParser from "@apidevtools/swagger-parser";
import type { OpenAPI } from "openapi-types";

import { getOpenApiErrorMessage, OpenApiParseError } from "./errors";
import { isPlainObject } from "./normalize-common";

export interface PrepareExternalOpenApiSuccess {
  ok: true;
  document: OpenAPI.Document;
}

export interface PrepareExternalOpenApiFailure {
  ok: false;
  error: string;
}

export type PrepareExternalOpenApiDocumentResult =
  | PrepareExternalOpenApiSuccess
  | PrepareExternalOpenApiFailure;

export async function validateAndDereferenceOpenApiDocument(
  value: unknown
): Promise<OpenAPI.Document> {
  if (!isPlainObject(value)) {
    throw new OpenApiParseError("OpenAPI document must be an object");
  }

  const parser = new SwaggerParser();
  const document = value as OpenAPI.Document;
  const options = {
    resolve: {
      external: false,
    },
    dereference: {
      circular: "ignore",
    },
  } as const;

  await parser.validate(document, options);

  return parser.dereference(document, options);
}

export async function prepareExternalOpenApiDocument(
  value: unknown
): Promise<PrepareExternalOpenApiDocumentResult> {
  try {
    const document = await validateAndDereferenceOpenApiDocument(value);

    return {
      ok: true,
      document,
    };
  } catch (error) {
    return {
      ok: false,
      error: getOpenApiErrorMessage(error),
    };
  }
}
