export class OpenApiParseError extends Error {
  constructor(
    message: string,
    public override readonly cause?: unknown
  ) {
    super(message);
    this.name = "OpenApiParseError";
  }
}

export function getOpenApiErrorMessage(error: unknown): string {
  if (error instanceof OpenApiParseError) {
    return error.message;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Invalid OpenAPI document";
}
