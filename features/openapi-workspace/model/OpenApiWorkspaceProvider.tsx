"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

import type { OpenApiDocument } from "@/entities/openapi-document/model";
import { detectSchemaFormat, type SchemaFormat } from "@/entities/schema/model";

import type {
  OpenApiWorkspaceStatus,
  OpenApiWorkspaceValue,
  RequestDraft,
} from "./openapi-workspace.types";

const INITIAL_SCHEMA = `openapi: 3.0.3

info:
  title: DummyJSON Lite
  version: 1.0.0
  description: |
    Small OpenAPI schema for demonstrating the Swagger Editor App.
    Based on the public DummyJSON API.

servers:
  - url: https://dummyjson.com

tags:
  - name: products

paths:
  /products:
    get:
      tags:
        - products
      summary: Get products
      operationId: getProducts
      responses:
        "200":
          description: Product list
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ProductList"

  /products/add:
    post:
      tags:
        - products
      summary: Create product
      operationId: createProduct
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/NewProduct"
            example:
              title: BMW Pencil
              description: A demo product.
              category: stationery
              price: 9.99
      responses:
        "200":
          description: Product created
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Product"

  /products/{id}:
    get:
      tags:
        - products
      summary: Get product by id
      operationId: getProduct
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: integer
            example: 1
      responses:
        "200":
          description: Product
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Product"

        "404":
          description: Product not found

components:
  schemas:
    ProductList:
      type: object
      properties:
        products:
          type: array
          items:
            $ref: "#/components/schemas/Product"
        total:
          type: integer
          example: 194
        skip:
          type: integer
          example: 0
        limit:
          type: integer
          example: 30

    Product:
      type: object
      required:
        - id
        - title
      properties:
        id:
          type: integer
          example: 1

        title:
          type: string
          example: iPhone 15

        description:
          type: string
          example: Latest Apple smartphone.

        category:
          type: string
          example: smartphones

        price:
          type: number
          example: 999.99

        stock:
          type: integer
          example: 15

    NewProduct:
      type: object
      required:
        - title
      properties:
        title:
          type: string
          example: iPhone 15

        description:
          type: string
          example: Latest Apple smartphone.

        category:
          type: string
          example: smartphones

        price:
          type: number
          example: 999.99
`;

const OpenApiWorkspaceContext = createContext<OpenApiWorkspaceValue | null>(null);

interface OpenApiWorkspaceProviderProps {
  children: ReactNode;
  initialSchemaText?: string;
  isAuthenticated?: boolean;
}

export function OpenApiWorkspaceProvider({
  children,
  initialSchemaText = INITIAL_SCHEMA,
  isAuthenticated = false,
}: OpenApiWorkspaceProviderProps) {
  const [schemaText, setSchemaTextState] = useState(initialSchemaText);
  const [schemaFormat, setSchemaFormat] = useState<SchemaFormat>(
    detectSchemaFormat(initialSchemaText)
  );
  const [status, setStatus] = useState<OpenApiWorkspaceStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [document, setDocument] = useState<OpenApiDocument | null>(null);
  const [selectedEndpointId, setSelectedEndpointId] = useState<string | null>(null);
  const [requestDraftsByEndpointId, setRequestDraftsByEndpointId] = useState<
    Record<string, RequestDraft>
  >({});

  function setSchemaText(value: string) {
    setSchemaTextState(value);
    setSchemaFormat(detectSchemaFormat(value));
  }

  const selectedEndpoint =
    document?.endpoints.find((endpoint) => endpoint.id === selectedEndpointId) ?? null;

  function setRequestDraft(endpointId: string, value: RequestDraft) {
    setRequestDraftsByEndpointId((drafts) => ({
      ...drafts,
      [endpointId]: value,
    }));
  }

  const value = useMemo(
    () => ({
      schemaText,
      schemaFormat,
      status,
      error,
      document,
      selectedEndpointId,
      requestDraftsByEndpointId,
      selectedEndpoint,
      isAuthenticated,
      setSchemaText,
      setSchemaFormat,
      setStatus,
      setError,
      setDocument,
      setSelectedEndpointId,
      setRequestDraft,
    }),
    [
      schemaText,
      schemaFormat,
      status,
      error,
      document,
      selectedEndpointId,
      requestDraftsByEndpointId,
      selectedEndpoint,
      isAuthenticated,
    ]
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
