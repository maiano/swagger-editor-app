"use client";

import { CopyIcon, PlayIcon } from "lucide-react";

import {
  buildCurlCommand,
  type OpenApiEndpoint,
  type RequestModel,
} from "@/entities/openapi-document/model";
import { useOpenApiWorkspace } from "@/features/openapi-workspace/model";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";

export function RequestConsole() {
  const { document, selectedEndpoint } = useOpenApiWorkspace();

  if (!document || !selectedEndpoint) {
    return (
      <Card className="border-panel-border bg-panel text-panel-foreground">
        <CardHeader>
          <CardTitle>Request Console</CardTitle>
          <CardDescription>Select an endpoint to prepare a request.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const request = createInitialRequestModel(selectedEndpoint);
  const curl = buildCurlCommand(request);

  return (
    <Card className="border-panel-border bg-panel text-panel-foreground">
      <CardHeader>
        <CardTitle>Request Console</CardTitle>
        <CardDescription>Request execution will be connected through proxy later.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="request-console grid gap-3 p-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`method-badge method-badge--${selectedEndpoint.method}`}>
              {selectedEndpoint.method}
            </span>
            <code className="break-all">{selectedEndpoint.path}</code>
          </div>
          <RequestParameterSummary endpoint={selectedEndpoint} />
        </div>
        <section className="grid gap-2">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm">cURL</h3>
            <Button type="button" variant="outline" size="sm" disabled>
              <CopyIcon data-icon="inline-start" />
              Copy
            </Button>
          </div>
          <pre className="border-border bg-editor text-editor-foreground max-h-56 overflow-auto rounded-md border p-3 text-xs">
            {curl}
          </pre>
        </section>
        <Button type="button" disabled>
          <PlayIcon data-icon="inline-start" />
          Execute after proxy
        </Button>
      </CardContent>
    </Card>
  );
}

function RequestParameterSummary({ endpoint }: { endpoint: OpenApiEndpoint }) {
  if (endpoint.parameters.length === 0 && !endpoint.requestBody) {
    return (
      <div className="border-border bg-muted/20 text-muted-foreground rounded-md border px-3 py-2 text-xs">
        No parameters or request body.
      </div>
    );
  }

  return (
    <div className="grid gap-2 text-xs">
      {endpoint.parameters.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {endpoint.parameters.map((parameter) => (
            <Badge key={`${parameter.in}:${parameter.name}`} variant="outline">
              {parameter.in}:{parameter.name}
              {parameter.required ? " *" : ""}
            </Badge>
          ))}
        </div>
      ) : null}
      {endpoint.requestBody ? (
        <Badge variant="secondary">
          body:{Object.keys(endpoint.requestBody.content).join(", ")}
        </Badge>
      ) : null}
    </div>
  );
}

function createInitialRequestModel(endpoint: OpenApiEndpoint): RequestModel {
  const baseUrl = endpoint.serverUrl ?? "";

  return {
    endpointId: endpoint.id,
    method: endpoint.method,
    path: endpoint.path,
    resolvedUrl: `${baseUrl}${endpoint.path}`,
    headers: {},
    query: {},
    pathParams: {},
    cookies: {},
    body: endpoint.requestBody ? {} : undefined,
  };
}
