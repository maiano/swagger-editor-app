"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

import type { OpenApiDocument } from "@/entities/openapi-document/model";
import { detectSchemaFormat, type SchemaFormat } from "@/entities/schema/model";

import type { OpenApiWorkspaceStatus, OpenApiWorkspaceValue } from "./openapi-workspace.types";

const INITIAL_SCHEMA = `openapi: 3.0.0
info:
  title: Pets
  version: 1.0.0
servers:
  - url: https://api.example.com
paths:
  /pets:
    get:
      summary: List pets
      parameters:
        - name: limit
          in: query
          schema:
            type: integer
            default: 10
      responses:
        "200":
          description: OK
    post:
      summary: Create pet
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - name
              properties:
                name:
                  type: string
      responses:
        "201":
          description: Created
`;

const OpenApiWorkspaceContext = createContext<OpenApiWorkspaceValue | null>(null);

interface OpenApiWorkspaceProviderProps {
  children: ReactNode;
  initialSchemaText?: string;
}

export function OpenApiWorkspaceProvider({
  children,
  initialSchemaText = INITIAL_SCHEMA,
}: OpenApiWorkspaceProviderProps) {
  const [schemaText, setSchemaTextState] = useState(initialSchemaText);
  const [schemaFormat, setSchemaFormat] = useState<SchemaFormat>(
    detectSchemaFormat(initialSchemaText)
  );
  const [status, setStatus] = useState<OpenApiWorkspaceStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [document, setDocument] = useState<OpenApiDocument | null>(null);
  const [selectedEndpointId, setSelectedEndpointId] = useState<string | null>(null);

  function setSchemaText(value: string) {
    setSchemaTextState(value);
    setSchemaFormat(detectSchemaFormat(value));
  }

  const selectedEndpoint =
    document?.endpoints.find((endpoint) => endpoint.id === selectedEndpointId) ?? null;

  const value = useMemo(
    () => ({
      schemaText,
      schemaFormat,
      status,
      error,
      document,
      selectedEndpointId,
      selectedEndpoint,
      setSchemaText,
      setSchemaFormat,
      setStatus,
      setError,
      setDocument,
      setSelectedEndpointId,
    }),
    [schemaText, schemaFormat, status, error, document, selectedEndpointId, selectedEndpoint]
  );

  return (
    <OpenApiWorkspaceContext.Provider value={value}>{children}</OpenApiWorkspaceContext.Provider>
  );
}

export function useOpenApiWorkspace() {
  const value = useContext(OpenApiWorkspaceContext);

  if (!value) {
    throw new Error("useOpenApiWorkspace must be used inside OpenApiWorkspaceProvider");
  }

  return value;
}
