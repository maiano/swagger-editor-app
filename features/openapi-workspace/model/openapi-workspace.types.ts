import type { OpenApiDocument, OpenApiEndpoint } from "@/entities/openapi-document/model";
import type { SchemaFormat } from "@/entities/schema/model";

export type OpenApiWorkspaceStatus = "idle" | "validating" | "valid" | "invalid";

export interface OpenApiWorkspaceState {
  schemaText: string;
  schemaFormat: SchemaFormat;
  status: OpenApiWorkspaceStatus;
  error: string | null;
  document: OpenApiDocument | null;
  selectedEndpointId: string | null;
}

export interface OpenApiWorkspaceValue extends OpenApiWorkspaceState {
  selectedEndpoint: OpenApiEndpoint | null;
  setSchemaText: (value: string) => void;
  setSchemaFormat: (value: SchemaFormat) => void;
  setStatus: (value: OpenApiWorkspaceStatus) => void;
  setError: (value: string | null) => void;
  setDocument: (value: OpenApiDocument | null) => void;
  setSelectedEndpointId: (value: string | null) => void;
}
