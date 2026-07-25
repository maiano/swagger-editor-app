import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import type { OpenApiDocument } from "@/entities/openapi-document/model";

import { OpenApiWorkspaceProvider, useOpenApiWorkspace } from "./OpenApiWorkspaceProvider";

const document: OpenApiDocument = {
  sourceVersion: "openapi3",
  title: "Pets",
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
      summary: "List pets",
    },
  ],
};

function WorkspaceProbe() {
  const workspace = useOpenApiWorkspace();

  return (
    <div>
      <div data-testid="schema-format">{workspace.schemaFormat}</div>
      <div data-testid="status">{workspace.status}</div>
      <div data-testid="authenticated">{String(workspace.isAuthenticated)}</div>
      <div data-testid="selected-endpoint">{workspace.selectedEndpoint?.summary ?? "none"}</div>
      <div data-testid="draft-body">
        {workspace.requestDraftsByEndpointId["GET /pets"]?.bodyText}
      </div>
      <button type="button" onClick={() => workspace.setSchemaText('{"openapi":"3.0.0"}')}>
        set json
      </button>
      <button type="button" onClick={() => workspace.setStatus("valid")}>
        set valid
      </button>
      <button type="button" onClick={() => workspace.setDocument(document)}>
        set document
      </button>
      <button type="button" onClick={() => workspace.setSelectedEndpointId("GET /pets")}>
        select endpoint
      </button>
      <button
        type="button"
        onClick={() =>
          workspace.setRequestDraft("GET /pets", {
            pathParams: {},
            query: {},
            headers: {},
            bodyText: '{"name":"Rex"}',
          })
        }
      >
        set draft
      </button>
    </div>
  );
}

describe("OpenApiWorkspaceProvider", () => {
  it("detects initial format and exposes authentication state", () => {
    render(
      <OpenApiWorkspaceProvider initialSchemaText="openapi: 3.0.0" isAuthenticated>
        <WorkspaceProbe />
      </OpenApiWorkspaceProvider>
    );

    expect(screen.getByTestId("schema-format")).toHaveTextContent("yaml");
    expect(screen.getByTestId("status")).toHaveTextContent("idle");
    expect(screen.getByTestId("authenticated")).toHaveTextContent("true");
  });

  it("updates derived format, selected endpoint and request draft", async () => {
    render(
      <OpenApiWorkspaceProvider initialSchemaText="openapi: 3.0.0">
        <WorkspaceProbe />
      </OpenApiWorkspaceProvider>
    );

    await userEvent.click(screen.getByRole("button", { name: "set json" }));
    await userEvent.click(screen.getByRole("button", { name: "set valid" }));
    await userEvent.click(screen.getByRole("button", { name: "set document" }));
    await userEvent.click(screen.getByRole("button", { name: "select endpoint" }));
    await userEvent.click(screen.getByRole("button", { name: "set draft" }));

    expect(screen.getByTestId("schema-format")).toHaveTextContent("json");
    expect(screen.getByTestId("status")).toHaveTextContent("valid");
    expect(screen.getByTestId("selected-endpoint")).toHaveTextContent("List pets");
    expect(screen.getByTestId("draft-body")).toHaveTextContent('{"name":"Rex"}');
  });

  it("throws when the hook is used outside provider", () => {
    const originalError = console.error;
    console.error = () => undefined;

    try {
      expect(() => render(<WorkspaceProbe />)).toThrow(
        "useOpenApiWorkspace must be used inside OpenApiWorkspaceProvider"
      );
    } finally {
      console.error = originalError;
    }
  });
});
