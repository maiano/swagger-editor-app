export type HttpMethod = "get" | "post" | "put" | "patch" | "delete" | "head" | "options";

export type OpenApiParameterLocation = "path" | "query" | "header" | "cookie";

export interface OpenApiDocument {
  title: string;
  version: string;
  servers: OpenApiServer[];
  endpoints: OpenApiEndpoint[];
}

export interface OpenApiServer {
  url: string;
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
}

export interface OpenApiParameter {
  name: string;
  in: OpenApiParameterLocation;
  required: boolean;
  description?: string;
  schema?: unknown;
  example?: unknown;
}

export interface OpenApiRequestBody {
  required: boolean;
  content: Record<string, OpenApiMediaType>;
}

export interface OpenApiMediaType {
  schema?: unknown;
  example?: unknown;
  examples?: Record<string, unknown>;
}

export interface OpenApiResponse {
  statusCode: string;
  description?: string;
  content?: Record<string, OpenApiMediaType>;
}
