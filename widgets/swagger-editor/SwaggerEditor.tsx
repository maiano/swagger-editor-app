"use client";

import { AlertTriangleIcon, CheckCircle2Icon, Loader2Icon } from "lucide-react";
import { useState } from "react";

import { parseOpenApiSchema } from "@/entities/openapi-document/model";
import { detectSchemaFormat } from "@/entities/schema/model";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";

import { CodeEditor } from "./CodeEditor";

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
      responses:
        "200":
          description: OK
`;

type ValidationState =
  | { status: "idle"; message: string }
  | { status: "valid"; message: string; endpointCount: number }
  | { status: "invalid"; message: string };

export function SwaggerEditor() {
  const [schemaText, setSchemaText] = useState(INITIAL_SCHEMA);
  const [validationState, setValidationState] = useState<ValidationState>({
    status: "idle",
    message: "Ready",
  });
  const [isValidating, setIsValidating] = useState(false);
  const format = detectSchemaFormat(schemaText);

  async function validateCurrentSchema() {
    const trimmedText = schemaText.trim();

    if (!trimmedText) {
      setValidationState({
        status: "invalid",
        message: "Schema text is empty",
      });
      return;
    }

    setIsValidating(true);

    const result = await parseOpenApiSchema(trimmedText);

    if (!result.ok) {
      setValidationState({
        status: "invalid",
        message: result.error,
      });
      setIsValidating(false);
      return;
    }

    setValidationState({
      status: "valid",
      message: `${result.document.title} ${result.document.version}`,
      endpointCount: result.document.endpoints.length,
    });
    setIsValidating(false);
  }

  return (
    <Card className="border-panel-border bg-panel text-panel-foreground">
      <CardHeader className="border-b">
        <CardTitle>Swagger/OpenAPI Editor</CardTitle>
        <CardAction className="flex items-center gap-2">
          <Badge variant="outline" className="uppercase">
            {format}
          </Badge>
          <Button
            type="button"
            onClick={validateCurrentSchema}
            disabled={isValidating || !schemaText.trim()}
          >
            {isValidating ? (
              <Loader2Icon className="animate-spin" data-icon="inline-start" />
            ) : null}
            Validate
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="grid gap-3 pt-4">
        <CodeEditor value={schemaText} format={format} onChange={setSchemaText} />
        <ValidationStatus state={validationState} />
      </CardContent>
    </Card>
  );
}

function ValidationStatus({ state }: { state: ValidationState }) {
  if (state.status === "valid") {
    return (
      <div className="border-status-success/30 bg-status-success/10 text-status-success flex items-center justify-between gap-3 rounded-md border px-3 py-2 text-sm">
        <span className="inline-flex min-w-0 items-center gap-2">
          <CheckCircle2Icon className="size-4 shrink-0" />
          <span className="truncate">{state.message}</span>
        </span>
        <span className="font-mono text-xs">{state.endpointCount} endpoints</span>
      </div>
    );
  }

  if (state.status === "invalid") {
    return (
      <div className="border-status-error/30 bg-status-error/10 text-status-error flex items-start gap-2 rounded-md border px-3 py-2 text-sm">
        <AlertTriangleIcon className="mt-0.5 size-4 shrink-0" />
        <span>{state.message}</span>
      </div>
    );
  }

  return (
    <div className="border-border bg-muted/30 text-muted-foreground rounded-md border px-3 py-2 text-sm">
      {state.message}
    </div>
  );
}
