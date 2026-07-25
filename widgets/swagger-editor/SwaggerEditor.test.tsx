import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { OpenApiDocument } from "@/entities/openapi-document/model";
import type { OpenApiWorkspaceValue } from "@/features/openapi-workspace/model";

import { SwaggerEditor } from "./SwaggerEditor";
import messages from "../../messages/en.json";

const mocks = vi.hoisted(() => ({
  parseOpenApiSchema: vi.fn(),
  convertSchemaText: vi.fn(),
  setSchemaText: vi.fn(),
  setSchemaFormat: vi.fn(),
  setStatus: vi.fn(),
  setError: vi.fn(),
  setDocument: vi.fn(),
  setSelectedEndpointId: vi.fn(),
}));

let workspaceValue: OpenApiWorkspaceValue;

vi.mock("@/entities/openapi-document/model", () => ({
  parseOpenApiSchema: mocks.parseOpenApiSchema,
}));

vi.mock("@/entities/schema/model", async () => {
  const actual =
    await vi.importActual<typeof import("@/entities/schema/model")>("@/entities/schema/model");

  return {
    ...actual,
    convertSchemaText: mocks.convertSchemaText,
  };
});

vi.mock("@/features/openapi-workspace/model", () => ({
  useOpenApiWorkspace: () => workspaceValue,
}));

vi.mock("./CodeEditor", () => ({
  CodeEditor: ({
    format,
    onChange,
    value,
  }: {
    format: string;
    onChange: (value: string) => void;
    value: string;
  }) => (
    <textarea
      aria-label="schema text"
      data-format={format}
      onChange={(event) => onChange(event.currentTarget.value)}
      value={value}
    />
  ),
}));

const document: OpenApiDocument = {
  sourceVersion: "openapi3",
  title: "Pets API",
  version: "1.0.0",
  servers: [],
  endpoints: [
    {
      id: "GET /pets",
      method: "get",
      path: "/pets",
      tags: [],
      parameters: [],
      responses: [],
    },
  ],
};

function createWorkspaceValue(
  overrides: Partial<OpenApiWorkspaceValue> = {}
): OpenApiWorkspaceValue {
  return {
    schemaText: "openapi: 3.0.0",
    schemaFormat: "yaml",
    status: "idle",
    error: null,
    document: null,
    selectedEndpointId: null,
    selectedEndpoint: null,
    requestDraftsByEndpointId: {},
    isAuthenticated: false,
    setSchemaText: mocks.setSchemaText,
    setSchemaFormat: mocks.setSchemaFormat,
    setStatus: mocks.setStatus,
    setError: mocks.setError,
    setDocument: mocks.setDocument,
    setSelectedEndpointId: mocks.setSelectedEndpointId,
    setRequestDraft: vi.fn(),
    ...overrides,
  };
}

describe("SwaggerEditor", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    workspaceValue = createWorkspaceValue();
    mocks.convertSchemaText.mockReturnValue('{"openapi":"3.0.0"}');
  });

  it("renders ready state and updates schema text from editor", async () => {
    renderSwaggerEditor();

    expect(screen.getByText("Swagger/OpenAPI Editor")).toBeTruthy();
    expect(screen.getByText("Ready")).toBeTruthy();
    expect(screen.getByText("YAML")).toBeDisabled();

    fireEvent.change(screen.getByLabelText("schema text"), {
      target: {
        value: "openapi: 3.1.0",
      },
    });

    expect(mocks.setSchemaText).toHaveBeenLastCalledWith("openapi: 3.1.0");
  });

  it("converts schema format when switching to JSON", async () => {
    renderSwaggerEditor();

    await userEvent.click(screen.getByRole("button", { name: "JSON" }));

    expect(mocks.convertSchemaText).toHaveBeenCalledWith("openapi: 3.0.0", "json");
    expect(mocks.setSchemaText).toHaveBeenCalledWith('{"openapi":"3.0.0"}');
  });

  it("shows format conversion errors", async () => {
    mocks.convertSchemaText.mockImplementation(() => {
      throw new Error("Invalid YAML");
    });
    renderSwaggerEditor();

    await userEvent.click(screen.getByRole("button", { name: "JSON" }));

    expect(mocks.setStatus).toHaveBeenCalledWith("invalid");
    expect(mocks.setError).toHaveBeenCalledWith("Fix schema errors before converting to JSON.");
  });

  it("validates schema and selects first endpoint", async () => {
    mocks.parseOpenApiSchema.mockResolvedValue({
      ok: true,
      document,
    });
    renderSwaggerEditor();

    await userEvent.click(screen.getByRole("button", { name: "Validate" }));

    expect(mocks.setStatus).toHaveBeenCalledWith("validating");
    await waitFor(() => {
      expect(mocks.setStatus).toHaveBeenLastCalledWith("valid");
    });
    expect(mocks.setDocument).toHaveBeenCalledWith(document);
    expect(mocks.setSelectedEndpointId).toHaveBeenCalledWith("GET /pets");
  });

  it("handles validation errors", async () => {
    mocks.parseOpenApiSchema.mockResolvedValue({
      ok: false,
      error: "Schema is invalid",
    });
    renderSwaggerEditor();

    await userEvent.click(screen.getByRole("button", { name: "Validate" }));

    await waitFor(() => {
      expect(mocks.setStatus).toHaveBeenLastCalledWith("invalid");
    });
    expect(mocks.setError).toHaveBeenCalledWith("Schema is invalid");
    expect(mocks.setDocument).toHaveBeenCalledWith(null);
    expect(mocks.setSelectedEndpointId).toHaveBeenCalledWith(null);
  });

  it("saves valid schema for authenticated users", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: {
          "content-type": "application/json",
        },
      })
    );
    workspaceValue = createWorkspaceValue({
      status: "valid",
      document,
      isAuthenticated: true,
    });
    renderSwaggerEditor();

    await userEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(await screen.findByText("Schema saved.")).toBeTruthy();
    expect(globalThis.fetch).toHaveBeenCalledWith(
      "/api/schemas",
      expect.objectContaining({
        method: "PUT",
        body: JSON.stringify({
          content: "openapi: 3.0.0",
        }),
      })
    );
  });

  it("renders schema save failures", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ ok: false, error: "Save failed" }), {
        status: 400,
        headers: {
          "content-type": "application/json",
        },
      })
    );
    workspaceValue = createWorkspaceValue({
      status: "valid",
      document,
      isAuthenticated: true,
    });
    renderSwaggerEditor();

    await userEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(await screen.findByText("Save failed")).toBeTruthy();
  });
});

function renderSwaggerEditor() {
  render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <SwaggerEditor />
    </NextIntlClientProvider>
  );
}
