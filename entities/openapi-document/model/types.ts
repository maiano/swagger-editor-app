export type HttpMethod = "get" | "post" | "put" | "patch" | "delete" | "head" | "options";

export type OpenApiParameterLocation = "path" | "query" | "header" | "cookie";

export type ExternalOpenApiVersion = "swagger2" | "openapi3";

export type JsonSchemaLike = unknown;

export type OpenApiExampleValue = unknown;

export interface OpenApiDocument {
  sourceVersion: ExternalOpenApiVersion;
  title: string;
  version: string;
  description?: string;
  servers: OpenApiServer[];
  endpoints: OpenApiEndpoint[];
}

export interface OpenApiServer {
  url: string;
  description?: string;
  variables?: Record<string, OpenApiServerVariable>;
}

export interface OpenApiServerVariable {
  default: string;
  enum?: string[];
  description?: string;
}

export interface OpenApiEndpoint {
  id: string;
  operationId?: string;
  method: HttpMethod;
  path: string;
  summary?: string;
  description?: string;
  tags: string[];
  parameters: OpenApiParameter[];
  requestBody?: OpenApiRequestBody;
  responses: OpenApiResponse[];
  serverUrl?: string;
  deprecated?: boolean;
}

export interface OpenApiParameter {
  name: string;
  in: OpenApiParameterLocation;
  required: boolean;
  description?: string;
  schema?: JsonSchemaLike;
  example?: OpenApiExampleValue;
}

export interface OpenApiRequestBody {
  required: boolean;
  content: Record<string, OpenApiMediaType>;
}

export interface OpenApiMediaType {
  schema?: JsonSchemaLike;
  example?: OpenApiExampleValue;
  examples?: Record<string, OpenApiExampleValue>;
}

export interface OpenApiResponse {
  statusCode: string;
  description?: string;
  content?: Record<string, OpenApiMediaType>;
}
