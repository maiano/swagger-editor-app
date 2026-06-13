"use client";

import { ServerIcon } from "lucide-react";

import type { OpenApiEndpoint } from "@/entities/openapi-document/model";
import { useOpenApiWorkspace } from "@/features/openapi-workspace/model";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Separator } from "@/shared/ui/separator";

export function SwaggerViewer() {
  const { document, selectedEndpoint, selectedEndpointId, setSelectedEndpointId } =
    useOpenApiWorkspace();

  if (!document) {
    return (
      <Card className="border-panel-border bg-panel text-panel-foreground">
        <CardHeader>
          <CardTitle>Viewer</CardTitle>
          <CardDescription>Validate a Swagger/OpenAPI schema to inspect endpoints.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="border-panel-border bg-panel text-panel-foreground">
      <CardHeader>
        <CardTitle>{document.title}</CardTitle>
        <CardDescription>
          v{document.version} · {document.endpoints.length} endpoints
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid gap-2">
          {document.endpoints.length > 0 ? (
            document.endpoints.map((endpoint) => (
              <EndpointListItem
                key={endpoint.id}
                endpoint={endpoint}
                selected={selectedEndpointId === endpoint.id}
                onSelect={() => setSelectedEndpointId(endpoint.id)}
              />
            ))
          ) : (
            <div className="border-border bg-muted/30 text-muted-foreground rounded-md border px-3 py-2 text-sm">
              No endpoints found in this schema.
            </div>
          )}
        </div>
        {selectedEndpoint ? (
          <>
            <Separator />
            <EndpointDetails endpoint={selectedEndpoint} />
          </>
        ) : null}
      </CardContent>
    </Card>
  );
}

function EndpointListItem({
  endpoint,
  selected,
  onSelect,
}: {
  endpoint: OpenApiEndpoint;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <Button
      type="button"
      variant={selected ? "secondary" : "outline"}
      className="h-auto justify-start gap-3 px-3 py-2 text-left"
      onClick={onSelect}
    >
      <MethodBadge method={endpoint.method} />
      <span className="min-w-0 flex-1">
        <span className="block truncate font-mono text-xs">{endpoint.path}</span>
        {endpoint.summary ? (
          <span className="text-muted-foreground block truncate text-xs">{endpoint.summary}</span>
        ) : null}
      </span>
    </Button>
  );
}

function EndpointDetails({ endpoint }: { endpoint: OpenApiEndpoint }) {
  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <MethodBadge method={endpoint.method} />
        <code className="break-all">{endpoint.path}</code>
        {endpoint.deprecated ? <Badge variant="destructive">Deprecated</Badge> : null}
      </div>
      {endpoint.description || endpoint.summary ? (
        <p className="text-sm">{endpoint.description ?? endpoint.summary}</p>
      ) : null}
      <div className="grid gap-2 text-sm">
        {endpoint.serverUrl ? (
          <div className="text-muted-foreground flex items-center gap-2">
            <ServerIcon className="size-4" />
            <span className="truncate font-mono text-xs">{endpoint.serverUrl}</span>
          </div>
        ) : null}
        <EndpointMeta label="Parameters" value={endpoint.parameters.length} />
        <EndpointMeta label="Responses" value={endpoint.responses.length} />
        <EndpointMeta
          label="Request body"
          value={endpoint.requestBody ? Object.keys(endpoint.requestBody.content).length : 0}
        />
      </div>
    </div>
  );
}

function EndpointMeta({ label, value }: { label: string; value: number }) {
  return (
    <div className="border-border bg-muted/20 flex items-center justify-between rounded-md border px-3 py-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-mono text-xs">{value}</span>
    </div>
  );
}

function MethodBadge({ method }: { method: OpenApiEndpoint["method"] }) {
  return <span className={`method-badge method-badge--${method}`}>{method}</span>;
}
