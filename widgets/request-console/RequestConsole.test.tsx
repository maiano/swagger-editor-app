import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { OpenApiDocument, OpenApiEndpoint } from "@/entities/openapi-document/model";
import type { OpenApiWorkspaceValue, RequestDraft } from "@/features/openapi-workspace/model";

import { RequestConsole } from "./RequestConsole";

const setRequestDraftMock = vi.fn();
let workspaceValue: OpenApiWorkspaceValue;

vi.mock("@/features/openapi-workspace/model", () => ({
  useOpenApiWorkspace: () => workspaceValue,
}));

const selectedEndpoint: OpenApiEndpoint = {
  id: "GET /pet/{petId}",
  method: "get",
  path: "/pet/{petId}",
  summary: "Find pet by ID",
  tags: ["pet"],
  parameters: [
    {
      name: "petId",
      in: "path",
      required: true,
      description: "ID of pet to return",
      schema: {
        type: "integer",
        format: "int64",
      },
    },
  ],
  responses: [
    {
      statusCode: "200",
      description: "successful operation",
    },
  ],
  serverUrl: "https://petstore3.swagger.io/api/v3",
};

const document: OpenApiDocument = {
  sourceVersion: "openapi3",
  title: "Petstore",
  version: "1.0.0",
  servers: [{ url: "https://petstore3.swagger.io/api/v3" }],
  endpoints: [selectedEndpoint],
};

function createWorkspaceValue(draft: RequestDraft): OpenApiWorkspaceValue {
  return {
    schemaText: "",
    schemaFormat: "yaml",
    status: "valid",
    error: null,
    document,
    selectedEndpointId: selectedEndpoint.id,
    selectedEndpoint,
    requestDraftsByEndpointId: {
      [selectedEndpoint.id]: draft,
    },
    isAuthenticated: true,
    setSchemaText: vi.fn(),
    setSchemaFormat: vi.fn(),
    setStatus: vi.fn(),
    setError: vi.fn(),
    setDocument: vi.fn(),
    setSelectedEndpointId: vi.fn(),
    setRequestDraft: setRequestDraftMock,
  };
}

function createDraft(overrides: Partial<RequestDraft> = {}): RequestDraft {
  return {
    pathParams: {
      petId: "10",
    },
    query: {},
    headers: {},
    bodyText: "",
    ...overrides,
  };
}

describe("RequestConsole execution", () => {
  beforeEach(() => {
    setRequestDraftMock.mockReset();
    workspaceValue = createWorkspaceValue(createDraft());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("executes current request through proxy and renders formatted JSON response", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          ok: true,
          response: {
            status: 200,
            statusText: "OK",
            headers: {
              "content-type": "application/json",
            },
            body: JSON.stringify({ id: 10, name: "doggie" }),
            durationMs: 42,
            truncated: false,
          },
          analytics: {
            requestSizeBytes: 0,
            responseSizeBytes: 25,
          },
        }),
        {
          status: 200,
          headers: {
            "content-type": "application/json",
          },
        }
      )
    );

    render(<RequestConsole />);

    await userEvent.click(screen.getByRole("button", { name: /execute/i }));

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/proxy",
      expect.objectContaining({
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          endpointId: selectedEndpoint.id,
          method: "get",
          path: "/pet/{petId}",
          resolvedUrl: "https://petstore3.swagger.io/api/v3/pet/10",
          headers: {},
          query: {},
          pathParams: {
            petId: "10",
          },
          cookies: {},
        }),
      })
    );
    expect(await screen.findByText(/200 OK/)).toBeTruthy();
    expect(screen.getByText("42 ms")).toBeTruthy();
    expect(screen.getByText(/"id": 10/)).toBeTruthy();
    expect(screen.getByText(/"name": "doggie"/)).toBeTruthy();
  });

  it("renders structured proxy errors", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          ok: false,
          error: {
            type: "blocked_url",
            message: "Target host is not allowed",
          },
        }),
        {
          status: 400,
          headers: {
            "content-type": "application/json",
          },
        }
      )
    );

    render(<RequestConsole />);

    await userEvent.click(screen.getByRole("button", { name: /execute/i }));

    expect(await screen.findByText("blocked_url")).toBeTruthy();
    expect(screen.getByText("Target host is not allowed")).toBeTruthy();
  });

  it("resets visible response when draft changes", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          ok: true,
          response: {
            status: 200,
            statusText: "OK",
            headers: {},
            body: JSON.stringify({ id: 10 }),
            durationMs: 20,
            truncated: false,
          },
        }),
        {
          status: 200,
          headers: {
            "content-type": "application/json",
          },
        }
      )
    );

    render(<RequestConsole />);

    await userEvent.click(screen.getByRole("button", { name: /execute/i }));
    expect(await screen.findByText(/"id": 10/)).toBeTruthy();

    await userEvent.clear(screen.getByLabelText(/petId/i));
    await userEvent.type(screen.getByLabelText(/petId/i), "11");

    await waitFor(() => {
      expect(screen.queryByText(/"id": 10/)).toBeNull();
    });
    expect(screen.getByText("Execute a request to see the proxy response.")).toBeTruthy();
    expect(setRequestDraftMock).toHaveBeenCalled();
  });
});
