"use client";

import { ServerIcon } from "lucide-react";
import { useState } from "react";
import { useTranslations } from "next-intl";

import type {
  OpenApiEndpoint,
  OpenApiMediaType,
  OpenApiParameter,
  OpenApiParameterLocation,
  OpenApiResponse,
} from "@/entities/openapi-document/model";
import { useOpenApiWorkspace } from "@/features/openapi-workspace/model";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { Separator } from "@/shared/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";

export function SwaggerViewer() {
  const t = useTranslations("SwaggerViewer");
  const { document, selectedEndpoint, selectedEndpointId, setSelectedEndpointId } =
    useOpenApiWorkspace();

  if (!document) {
    return (
      <Card className="border-panel-border bg-panel text-panel-foreground">
        <CardHeader>
          <CardTitle>{t("viewer")}</CardTitle>
          <CardDescription>{t("viewerDescription")}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="border-panel-border bg-panel text-panel-foreground">
      <CardHeader>
        <CardTitle>{document.title}</CardTitle>
        <CardDescription>
          {t("schemaOverview", {
            version: document.version,
            count: document.endpoints.length,
          })}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid gap-2">
          {document.endpoints.length > 0 ? (
            <EndpointGroups
              endpoints={document.endpoints}
              selectedEndpointId={selectedEndpointId}
              onSelectEndpoint={setSelectedEndpointId}
            />
          ) : (
            <div className="border-border bg-muted/30 text-muted-foreground rounded-md border px-3 py-2 text-sm">
              {t("noEndpoints")}
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

function EndpointGroups({
  endpoints,
  selectedEndpointId,
  onSelectEndpoint,
}: {
  endpoints: OpenApiEndpoint[];
  selectedEndpointId: string | null;
  onSelectEndpoint: (endpointId: string) => void;
}) {
  return (
    <div className="grid gap-3">
      {groupEndpointsByPath(endpoints).map(([path, pathEndpoints]) => (
        <section key={path} className="grid gap-2">
          <div className="text-muted-foreground border-border border-b pb-1 font-mono text-xs">
            {path}
          </div>
          <div className="grid gap-1.5">
            {pathEndpoints.map((endpoint) => (
              <EndpointListItem
                key={endpoint.id}
                endpoint={endpoint}
                selected={selectedEndpointId === endpoint.id}
                onSelect={() => onSelectEndpoint(endpoint.id)}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
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
  const t = useTranslations("SwaggerViewer");

  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <MethodBadge method={endpoint.method} />
        <code className="break-all">{endpoint.path}</code>
        {endpoint.deprecated ? <Badge variant="destructive">{t("deprecated")}</Badge> : null}
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
        <EndpointMeta label={t("parameters")} value={endpoint.parameters.length} />
        <EndpointMeta label={t("responses")} value={endpoint.responses.length} />
        <EndpointMeta
          label={t("requestBody")}
          value={endpoint.requestBody ? Object.keys(endpoint.requestBody.content).length : 0}
        />
      </div>
      <ParametersView parameters={endpoint.parameters} />
      <RequestBodyView content={endpoint.requestBody?.content} />
      <ResponsesView responses={endpoint.responses} />
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

function ParametersView({ parameters }: { parameters: OpenApiParameter[] }) {
  const t = useTranslations("SwaggerViewer");
  const locations: OpenApiParameterLocation[] = ["path", "query", "header", "cookie"];

  if (parameters.length === 0) {
    return <EmptySection title={t("parameters")} message={t("noParameters")} />;
  }

  return (
    <section className="grid gap-2">
      <h3 className="text-sm">{t("parameters")}</h3>
      {locations.map((location) => {
        const locationParameters = parameters.filter((parameter) => parameter.in === location);

        if (locationParameters.length === 0) {
          return null;
        }

        return (
          <div key={location} className="border-border grid gap-2 rounded-md border p-3">
            <div className="text-muted-foreground font-mono text-xs uppercase">{location}</div>
            <div className="grid gap-2">
              {locationParameters.map((parameter) => (
                <div
                  key={`${parameter.in}:${parameter.name}`}
                  className="bg-muted/20 grid gap-1 rounded-md px-3 py-2"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs">{parameter.name}</span>
                    {parameter.required ? <Badge variant="outline">{t("required")}</Badge> : null}
                  </div>
                  {parameter.description ? (
                    <p className="text-muted-foreground text-xs">{parameter.description}</p>
                  ) : null}
                  {parameter.schema !== undefined ? (
                    <SchemaPreview value={parameter.schema} />
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </section>
  );
}

function RequestBodyView({ content }: { content: Record<string, OpenApiMediaType> | undefined }) {
  const t = useTranslations("SwaggerViewer");

  if (!content || Object.keys(content).length === 0) {
    return <EmptySection title={t("requestBody")} message={t("noRequestBody")} />;
  }

  return (
    <section className="grid gap-2">
      <h3 className="text-sm">{t("requestBody")}</h3>
      <MediaTypeTabs content={content} />
    </section>
  );
}

function ResponsesView({ responses }: { responses: OpenApiResponse[] }) {
  const t = useTranslations("SwaggerViewer");

  if (responses.length === 0) {
    return <EmptySection title={t("responses")} message={t("noResponses")} />;
  }

  return (
    <section className="grid gap-2">
      <h3 className="text-sm">{t("responses")}</h3>
      <div className="grid gap-2">
        {responses.map((response) => (
          <div key={response.statusCode} className="border-border grid gap-2 rounded-md border p-3">
            <div className="flex flex-wrap items-center gap-2">
              <StatusCodeBadge statusCode={response.statusCode} />
              {response.description ? (
                <span className="text-muted-foreground text-xs">{response.description}</span>
              ) : null}
            </div>
            <MediaTypeTabs content={response.content} />
          </div>
        ))}
      </div>
    </section>
  );
}

function MediaTypeTabs({ content }: { content: Record<string, OpenApiMediaType> | undefined }) {
  const defaultContentType = content ? getDefaultContentType(content) : "";
  const [selectedContentType, setSelectedContentType] = useState(defaultContentType);
  const t = useTranslations("SwaggerViewer");
  if (!content || Object.keys(content).length === 0) {
    return <div className="text-muted-foreground text-xs">{t("noContentSchema")}</div>;
  }

  const entries = Object.entries(content);
  const activeContentType =
    selectedContentType in content ? selectedContentType : defaultContentType;
  const activeMediaType = content[activeContentType];

  return (
    <div className="grid gap-2">
      {entries.length > 1 ? (
        <Select value={activeContentType} onValueChange={setSelectedContentType}>
          <SelectTrigger
            size="sm"
            className="bg-muted/20 h-7 max-w-full justify-between rounded-md font-mono text-xs"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="start" className="max-w-[min(28rem,calc(100vw-2rem))]">
            {entries.map(([contentType]) => (
              <SelectItem key={contentType} value={contentType} className="font-mono text-xs">
                {contentType}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : null}
      {activeMediaType ? (
        <MediaTypePanel
          key={activeContentType}
          contentType={activeContentType}
          mediaType={activeMediaType}
        />
      ) : null}
    </div>
  );
}

function MediaTypePanel({
  contentType,
  mediaType,
}: {
  contentType: string;
  mediaType: OpenApiMediaType;
}) {
  const panels = getMediaTypePanels(mediaType);

  const t = useTranslations("SwaggerViewer");

  if (panels.length === 0) {
    return (
      <div className="bg-muted/20 text-muted-foreground rounded-md px-3 py-2 text-xs">
        {t("noSchemaExamples", { contentType })}
      </div>
    );
  }

  if (panels.length === 1) {
    const [panel] = panels;

    if (!panel) {
      return null;
    }

    return (
      <div className="bg-muted/20 grid gap-2 rounded-md px-3 py-2">
        <SchemaPreview label={`${panel.label} · ${contentType}`} value={panel.value} />
      </div>
    );
  }

  return (
    <div className="bg-muted/20 grid gap-2 rounded-md px-3 py-2">
      <Tabs defaultValue={panels[0]?.id} className="gap-2">
        <TabsList variant="line" className="max-w-full justify-start overflow-x-auto">
          {panels.map((panel) => (
            <TabsTrigger key={panel.id} value={panel.id} className="text-xs">
              {panel.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {panels.map((panel) => (
          <TabsContent key={panel.id} value={panel.id}>
            <SchemaPreview label={panel.label} value={panel.value} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

function SchemaPreview({ label = "Schema", value }: { label?: string; value: unknown }) {
  return (
    <div className="grid gap-1">
      <div className="text-muted-foreground text-xs">{label}</div>
      <pre className="border-border bg-editor text-editor-foreground max-h-56 overflow-auto rounded-md border p-3 text-xs">
        {formatPreviewValue(value)}
      </pre>
    </div>
  );
}

function StatusCodeBadge({ statusCode }: { statusCode: string }) {
  const statusClass =
    statusCode === "default"
      ? "status-badge--info"
      : statusCode.startsWith("2")
        ? "status-badge--success"
        : statusCode.startsWith("4") || statusCode.startsWith("5")
          ? "status-badge--error"
          : "status-badge--warning";

  return <span className={`status-badge ${statusClass}`}>{statusCode}</span>;
}

function EmptySection({ title, message }: { title: string; message: string }) {
  return (
    <section className="grid gap-2">
      <h3 className="text-sm">{title}</h3>
      <div className="border-border bg-muted/20 text-muted-foreground rounded-md border px-3 py-2 text-xs">
        {message}
      </div>
    </section>
  );
}

function formatPreviewValue(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }

  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function getDefaultContentType(content: Record<string, OpenApiMediaType>): string {
  if ("application/json" in content) {
    return "application/json";
  }

  return Object.keys(content)[0] ?? "";
}

function getMediaTypePanels(mediaType: OpenApiMediaType) {
  const panels: Array<{ id: string; label: string; value: unknown }> = [];

  if (mediaType.schema !== undefined) {
    panels.push({
      id: "schema",
      label: "Schema",
      value: mediaType.schema,
    });
  }

  if (mediaType.example !== undefined) {
    panels.push({
      id: "example",
      label: "Example",
      value: mediaType.example,
    });
  }

  if (mediaType.examples) {
    for (const [name, example] of Object.entries(mediaType.examples)) {
      panels.push({
        id: `example:${name}`,
        label: name,
        value: example,
      });
    }
  }

  return panels;
}

function groupEndpointsByPath(endpoints: OpenApiEndpoint[]) {
  const groups = new Map<string, OpenApiEndpoint[]>();

  for (const endpoint of endpoints) {
    const group = groups.get(endpoint.path);

    if (group) {
      group.push(endpoint);
      continue;
    }

    groups.set(endpoint.path, [endpoint]);
  }

  return Array.from(groups.entries());
}
