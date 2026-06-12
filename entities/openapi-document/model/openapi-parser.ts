import SwaggerParser from "@apidevtools/swagger-parser";
import type { OpenAPI } from "openapi-types";

export interface ValidateOpenApiSuccess {
  ok: true;
  document: OpenAPI.Document;
}

export interface ValidateOpenApiFailure {
  ok: false;
  error: string;
}

export type ValidateOpenApiDocumentResult = ValidateOpenApiSuccess | ValidateOpenApiFailure;

function isObjectLike(value: unknown): value is object {
  return typeof value === "object" && value !== null;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Invalid OpenAPI document";
}

export async function validateOpenApiDocument(
  value: unknown
): Promise<ValidateOpenApiDocumentResult> {
  if (!isObjectLike(value)) {
    return {
      ok: false,
      error: "Invalid OpenAPI document",
    };
  }

  try {
    const document = await SwaggerParser.validate(value as OpenAPI.Document, {
      resolve: {
        external: false,
      },
    });

    return {
      ok: true,
      document,
    };
  } catch (error) {
    return {
      ok: false,
      error: getErrorMessage(error),
    };
  }
}
