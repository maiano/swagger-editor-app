"use client";

import { AlertTriangleIcon, CheckCircle2Icon, CloudUploadIcon, Loader2Icon } from "lucide-react";
import { useState } from "react";

import { parseOpenApiSchema } from "@/entities/openapi-document/model";
import { useOpenApiWorkspace } from "@/features/openapi-workspace/model";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";

import { CodeEditor } from "./CodeEditor";

export function SwaggerEditor() {
  const workspace = useOpenApiWorkspace();
  const isValidating = workspace.status === "validating";
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "failed">("idle");
  const [saveError, setSaveError] = useState<string | null>(null);

  async function validateCurrentSchema() {
    const trimmedText = workspace.schemaText.trim();

    if (!trimmedText) {
      workspace.setStatus("invalid");
      workspace.setError("Schema text is empty");
      workspace.setDocument(null);
      workspace.setSelectedEndpointId(null);
      return;
    }

    workspace.setStatus("validating");
    workspace.setError(null);

    const result = await parseOpenApiSchema(trimmedText);

    if (!result.ok) {
      workspace.setStatus("invalid");
      workspace.setError(result.error);
      workspace.setDocument(null);
      workspace.setSelectedEndpointId(null);
      return;
    }

    workspace.setStatus("valid");
    workspace.setError(null);
    workspace.setDocument(result.document);
    workspace.setSelectedEndpointId(result.document.endpoints[0]?.id ?? null);
    setSaveState("idle");
    setSaveError(null);
  }

  async function saveCurrentSchema() {
    setSaveState("saving");
    setSaveError(null);

    try {
      const response = await fetch("/api/schemas", {
        method: "PUT",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          content: workspace.schemaText,
        }),
      });
      const result = (await response.json()) as { ok: boolean; error?: string };

      if (!response.ok || !result.ok) {
        setSaveState("failed");
        setSaveError(result.error ?? "Failed to save schema.");
        return;
      }

      setSaveState("saved");
    } catch {
      setSaveState("failed");
      setSaveError("Failed to reach schema save endpoint.");
    }
  }

  return (
    <Card className="border-panel-border bg-panel text-panel-foreground">
      <CardHeader className="border-b">
        <CardTitle>Swagger/OpenAPI Editor</CardTitle>
        <CardAction className="flex items-center gap-2">
          <Badge variant="outline" className="uppercase">
            {workspace.schemaFormat}
          </Badge>
          <Button
            type="button"
            onClick={validateCurrentSchema}
            disabled={isValidating || !workspace.schemaText.trim()}
          >
            {isValidating ? (
              <Loader2Icon className="animate-spin" data-icon="inline-start" />
            ) : null}
            Validate
          </Button>
          {workspace.isAuthenticated ? (
            <Button
              type="button"
              variant="outline"
              onClick={saveCurrentSchema}
              disabled={saveState === "saving" || workspace.status !== "valid"}
            >
              {saveState === "saving" ? (
                <Loader2Icon className="animate-spin" data-icon="inline-start" />
              ) : (
                <CloudUploadIcon data-icon="inline-start" />
              )}
              Save
            </Button>
          ) : null}
        </CardAction>
      </CardHeader>
      <CardContent className="grid gap-3 pt-4">
        <CodeEditor
          value={workspace.schemaText}
          format={workspace.schemaFormat}
          onChange={workspace.setSchemaText}
        />
        <ValidationStatus
          status={workspace.status}
          error={workspace.error}
          title={workspace.document?.title}
          version={workspace.document?.version}
          endpointCount={workspace.document?.endpoints.length ?? 0}
        />
        <SaveStatus state={saveState} error={saveError} />
      </CardContent>
    </Card>
  );
}

interface ValidationStatusProps {
  status: "idle" | "validating" | "valid" | "invalid";
  error: string | null;
  title?: string;
  version?: string;
  endpointCount: number;
}

function ValidationStatus({ status, error, title, version, endpointCount }: ValidationStatusProps) {
  if (status === "valid") {
    return (
      <div className="border-status-success/30 bg-status-success/10 text-status-success flex items-center justify-between gap-3 rounded-md border px-3 py-2 text-sm">
        <span className="inline-flex min-w-0 items-center gap-2">
          <CheckCircle2Icon className="size-4 shrink-0" />
          <span className="truncate">
            {title} {version}
          </span>
        </span>
        <span className="font-mono text-xs">{endpointCount} endpoints</span>
      </div>
    );
  }

  if (status === "invalid") {
    return (
      <div className="border-status-error/30 bg-status-error/10 text-status-error flex items-start gap-2 rounded-md border px-3 py-2 text-sm">
        <AlertTriangleIcon className="mt-0.5 size-4 shrink-0" />
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div className="border-border bg-muted/30 text-muted-foreground rounded-md border px-3 py-2 text-sm">
      {status === "validating" ? "Validating..." : "Ready"}
    </div>
  );
}

function SaveStatus({
  state,
  error,
}: {
  state: "idle" | "saving" | "saved" | "failed";
  error: string | null;
}) {
  if (state === "idle") {
    return null;
  }

  if (state === "saved") {
    return (
      <div className="border-status-success/30 bg-status-success/10 text-status-success rounded-md border px-3 py-2 text-sm">
        Schema saved.
      </div>
    );
  }

  if (state === "failed") {
    return (
      <div className="border-status-error/30 bg-status-error/10 text-status-error rounded-md border px-3 py-2 text-sm">
        {error ?? "Failed to save schema."}
      </div>
    );
  }

  return (
    <div className="border-border bg-muted/30 text-muted-foreground rounded-md border px-3 py-2 text-sm">
      Saving schema...
    </div>
  );
}
