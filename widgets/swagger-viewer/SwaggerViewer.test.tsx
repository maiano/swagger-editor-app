import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { OpenApiDocument, OpenApiEndpoint } from "@/entities/openapi-document/model";
import type { OpenApiWorkspaceValue } from "@/features/openapi-workspace/model";

import { SwaggerViewer } from "./SwaggerViewer";
import messages from "../../messages/en.json";

const setSelectedEndpointIdMock = vi.fn();
let workspaceValue: OpenApiWorkspaceValue;

vi.mock("@/features/openapi-workspace/model", () => ({
  useOpenApiWorkspace: () => workspaceValue,
}));

const selectedEndpoint: OpenApiEndpoint = {
  id: "GET /pets",
  operationId: "listPets",
  method: "get",
  path: "/pets",
  summary: "List pets",
  description: "Returns pets",
  tags: ["pets"],
  serverUrl: "https://api.example.com",
  deprecated: true,
  parameters: [
    {
      name: "limit",
      in: "query",
      required: false,
      description: "Maximum number of pets",
      schema: {
        type: "integer",
      },
    },
  ],
  requestBody: {
    required: false,
    content: {
      "application/json": {
        schema: {
          type: "object",
        },
        example: {
          name: "Rex",
        },
      },
    },
  },
  responses: [
    {
      statusCode: "200",
      description: "OK",
      content: {
        "application/json": {
          schema: {
            type: "array",
          },
          examples: {
            sample: [{ id: 1 }],
          },
        },
      },
    },
    {
      statusCode: "404",
      description: "Not found",
    },
  ],
};

const document: OpenApiDocument = {
  sourceVersion: "openapi3",
  title: "Pets API",
  version: "1.0.0",
  servers: [{ url: "https://api.example.com" }],
  endpoints: [
    selectedEndpoint,
    {
      ...selectedEndpoint,
      id: "POST /pets",
      method: "post",
      summary: "Create pet",
    },
  ],
};

function createWorkspaceValue(
  overrides: Partial<OpenApiWorkspaceValue> = {}
): OpenApiWorkspaceValue {
  return {
    schemaText: "",
    schemaFormat: "yaml",
    status: "valid",
    error: null,
    document,
    selectedEndpointId: selectedEndpoint.id,
    selectedEndpoint,
    requestDraftsByEndpointId: {},
    isAuthenticated: false,
    setSchemaText: vi.fn(),
    setSchemaFormat: vi.fn(),
    setStatus: vi.fn(),
    setError: vi.fn(),
    setDocument: vi.fn(),
    setSelectedEndpointId: setSelectedEndpointIdMock,
    setRequestDraft: vi.fn(),
    ...overrides,
  };
}

describe("SwaggerViewer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    workspaceValue = createWorkspaceValue();
  });

  it("renders empty viewer state before validation", () => {
    workspaceValue = createWorkspaceValue({
      document: null,
      selectedEndpoint: null,
      selectedEndpointId: null,
    });

    renderSwaggerViewer();

    expect(screen.getByText("Viewer")).toBeTruthy();
    expect(
      screen.getByText("Validate a Swagger/OpenAPI schema to inspect endpoints.")
    ).toBeTruthy();
  });

  it("renders grouped endpoints and selected endpoint details", () => {
    renderSwaggerViewer();

    expect(screen.getByText("Pets API")).toBeTruthy();
    expect(screen.getByText("v1.0.0 · 2 endpoints")).toBeTruthy();
    expect(screen.getByRole("button", { name: /get/i })).toBeTruthy();
    expect(screen.getByRole("button", { name: /post/i })).toBeTruthy();
    expect(screen.getByText("Deprecated")).toBeTruthy();
    expect(screen.getByText("Returns pets")).toBeTruthy();
    expect(screen.getByText("Maximum number of pets")).toBeTruthy();
    expect(screen.getByText(/"type": "object"/)).toBeTruthy();
    expect(screen.getByText(/"type": "array"/)).toBeTruthy();
    expect(screen.getByText("404")).toBeTruthy();
    expect(screen.getByText("No content schema.")).toBeTruthy();
  });

  it("selects an endpoint from the list", async () => {
    renderSwaggerViewer();

    await userEvent.click(screen.getByRole("button", { name: /create pet/i }));

    expect(setSelectedEndpointIdMock).toHaveBeenCalledWith("POST /pets");
  });

  it("renders no endpoints state", () => {
    workspaceValue = createWorkspaceValue({
      document: {
        ...document,
        endpoints: [],
      },
      selectedEndpoint: null,
      selectedEndpointId: null,
    });

    renderSwaggerViewer();

    expect(screen.getByText("No endpoints found in this schema.")).toBeTruthy();
  });
});

function renderSwaggerViewer() {
  render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <SwaggerViewer />
    </NextIntlClientProvider>
  );
}
