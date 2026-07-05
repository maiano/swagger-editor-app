"use client";

import { CopyIcon, PlayIcon } from "lucide-react";
import { useState } from "react";
import { useTranslations } from "next-intl";

import {
  buildCurlCommand,
  type OpenApiEndpoint,
  type RequestModel,
} from "@/entities/openapi-document/model";
import { useOpenApiWorkspace } from "@/features/openapi-workspace/model";
import type { RequestDraft } from "@/features/openapi-workspace/model";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";

type ProxyResult = {
  ok: boolean;
  response?: {
    status: number;
    statusText?: string;
    headers: Record<string, string>;
    body: string;
    durationMs: number;
    truncated: boolean;
  };
  error?: {
    type: string;
    message: string;
  };
  analytics?: {
    requestSizeBytes: number;
    responseSizeBytes: number;
  };
};

type ExecuteState =
  | {
      endpointId: string | null;
      status: "idle";
    }
  | {
      endpointId: string;
      status: "loading";
    }
  | {
      endpointId: string;
      status: "success";
      result: ProxyResult;
    }
  | {
      endpointId: string;
      status: "failed";
      message: string;
    };

const IDLE_EXECUTE_STATE: ExecuteState = {
  endpointId: null,
  status: "idle",
};

export function RequestConsole() {
  const t = useTranslations("RequestConsole");
  const { document, selectedEndpoint, requestDraftsByEndpointId, setRequestDraft } =
    useOpenApiWorkspace();
  const [copyState, setCopyState] = useState<{
    endpointId: string | null;
    status: "idle" | "copied" | "failed";
  }>({
    endpointId: null,
    status: "idle",
  });
  const [executeState, setExecuteState] = useState<ExecuteState>({
    endpointId: null,
    status: "idle",
  });

  if (!document || !selectedEndpoint) {
    return (
      <Card className="border-panel-border bg-panel text-panel-foreground">
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
          <CardDescription>{t("selectEndpoint")}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const selectedEndpointId = selectedEndpoint.id;
  const draft =
    requestDraftsByEndpointId[selectedEndpointId] ?? createInitialRequestDraft(selectedEndpoint);
  const request = createRequestModel(selectedEndpoint, draft);
  const curl = buildCurlCommand(request);
  const copyStatus = copyState.endpointId === selectedEndpointId ? copyState.status : "idle";
  const visibleExecuteState =
    executeState.endpointId === selectedEndpointId ? executeState : IDLE_EXECUTE_STATE;

  function updateDraft(value: RequestDraft) {
    setCopyState({ endpointId: selectedEndpointId, status: "idle" });
    setExecuteState({ endpointId: null, status: "idle" });
    setRequestDraft(selectedEndpointId, value);
  }

  async function copyCurl() {
    if (!navigator.clipboard) {
      setCopyState({ endpointId: selectedEndpointId, status: "failed" });
      return;
    }

    try {
      await navigator.clipboard.writeText(curl);
      setCopyState({ endpointId: selectedEndpointId, status: "copied" });
    } catch {
      setCopyState({ endpointId: selectedEndpointId, status: "failed" });
    }
  }

  async function executeRequest() {
    setExecuteState({ endpointId: selectedEndpointId, status: "loading" });

    try {
      const response = await fetch("/api/proxy", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(request),
      });
      const result = (await response.json()) as ProxyResult;

      setExecuteState({
        endpointId: selectedEndpointId,
        status: "success",
        result,
      });
    } catch {
      setExecuteState({
        endpointId: selectedEndpointId,
        status: "failed",
        message: t("requestFailedBeforeProxy"),
      });
    }
  }

  return (
    <Card className="border-panel-border bg-panel text-panel-foreground">
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="request-console grid gap-3 p-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`method-badge method-badge--${selectedEndpoint.method}`}>
              {selectedEndpoint.method}
            </span>
            <code className="break-all">{selectedEndpoint.path}</code>
          </div>
          <RequestDraftForm endpoint={selectedEndpoint} draft={draft} onChange={updateDraft} />
        </div>
        <section className="grid gap-2">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm">cURL</h3>
            <Button type="button" variant="outline" size="sm" onClick={copyCurl}>
              <CopyIcon data-icon="inline-start" />
              {copyStatus === "copied" ? t("copied") : t("copy")}
            </Button>
          </div>
          {copyStatus === "failed" ? (
            <p className="text-status-error text-xs">{t("clipboardUnavailable")}</p>
          ) : null}
          <pre className="border-border bg-editor text-editor-foreground max-h-56 overflow-auto rounded-md border p-3 text-xs">
            {curl}
          </pre>
        </section>
        <Button
          type="button"
          onClick={executeRequest}
          disabled={visibleExecuteState.status === "loading"}
        >
          <PlayIcon data-icon="inline-start" />
          {visibleExecuteState.status === "loading" ? t("executing") : t("execute")}
        </Button>
        <ResponsePanel state={visibleExecuteState} />
      </CardContent>
    </Card>
  );
}

function ResponsePanel({ state }: { state: ExecuteState }) {
  const t = useTranslations("RequestConsole");

  if (state.status === "idle") {
    return (
      <section className="border-border bg-muted/20 text-muted-foreground rounded-md border px-3 py-2 text-xs">
        {t("executePrompt")}
      </section>
    );
  }

  if (state.status === "loading") {
    return (
      <section className="border-border bg-muted/20 text-muted-foreground rounded-md border px-3 py-2 text-xs">
        {t("executeProxy")}
      </section>
    );
  }

  if (state.status === "failed") {
    return (
      <section className="border-status-error/30 bg-status-error/10 text-status-error rounded-md border px-3 py-2 text-xs">
        {state.message || t("requestFailedBeforeProxy")}
      </section>
    );
  }

  const { result } = state;

  if (!result.ok || !result.response) {
    return (
      <section className="border-status-error/30 bg-status-error/10 text-status-error grid gap-1 rounded-md border px-3 py-2 text-xs">
        <div className="font-medium">{result.error?.type ?? "proxy_error"}</div>
        <div>{result.error?.message ?? t("proxyError")}</div>
      </section>
    );
  }

  const statusTone = result.response.status >= 400 ? "text-status-error" : "text-status-success";
  const responseBody = formatResponseBody(result.response.body);

  return (
    <section className="border-border bg-muted/20 grid gap-3 rounded-md border p-3">
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <Badge variant="outline" className={statusTone}>
          {result.response.status} {result.response.statusText}
        </Badge>
        <span className="text-muted-foreground">
          {t("duration", { duration: result.response.durationMs })}
        </span>
        {result.analytics ? (
          <span className="text-muted-foreground">
            {t("bytes", { bytes: result.analytics.responseSizeBytes.toLocaleString() })}
          </span>
        ) : null}
        {result.response.truncated ? <Badge variant="secondary">{t("truncated")}</Badge> : null}
      </div>
      <pre className="border-border bg-editor text-editor-foreground max-h-56 overflow-auto rounded-md border p-3 text-xs whitespace-pre-wrap">
        {responseBody || t("emptyResponse")}
      </pre>
    </section>
  );
}

function formatResponseBody(body: string): string {
  if (!body.trim()) {
    return "";
  }

  try {
    return JSON.stringify(JSON.parse(body), null, 2);
  } catch {
    return body;
  }
}

function RequestDraftForm({
  endpoint,
  draft,
  onChange,
}: {
  endpoint: OpenApiEndpoint;
  draft: RequestDraft;
  onChange: (value: RequestDraft) => void;
}) {
  const t = useTranslations("HttpRequest");

  if (endpoint.parameters.length === 0 && !endpoint.requestBody) {
    return (
      <div className="border-border bg-muted/20 text-muted-foreground rounded-md border px-3 py-2 text-xs">
        {t("noParametersOrRequestBody")}
      </div>
    );
  }

  const pathParameters = endpoint.parameters.filter((parameter) => parameter.in === "path");
  const queryParameters = endpoint.parameters.filter((parameter) => parameter.in === "query");
  const headerParameters = endpoint.parameters.filter((parameter) => parameter.in === "header");

  return (
    <div className="grid gap-3">
      <ParameterInputs
        title={t("path")}
        values={draft.pathParams}
        parameters={pathParameters}
        onChange={(pathParams) => onChange({ ...draft, pathParams })}
      />
      <ParameterInputs
        title={t("query")}
        values={draft.query}
        parameters={queryParameters}
        onChange={(query) => onChange({ ...draft, query })}
      />
      <ParameterInputs
        title={t("headers")}
        values={draft.headers}
        parameters={headerParameters}
        onChange={(headers) => onChange({ ...draft, headers })}
      />
      {endpoint.requestBody ? (
        <section className="grid gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm">{t("body")}</h3>
            <Badge variant="secondary">
              {Object.keys(endpoint.requestBody.content).join(", ")}
            </Badge>
          </div>
          <Textarea
            value={draft.bodyText}
            rows={6}
            className="font-mono text-xs"
            onChange={(event) => onChange({ ...draft, bodyText: event.target.value })}
          />
        </section>
      ) : null}
    </div>
  );
}

function ParameterInputs({
  title,
  parameters,
  values,
  onChange,
}: {
  title: string;
  parameters: OpenApiEndpoint["parameters"];
  values: Record<string, string>;
  onChange: (value: Record<string, string>) => void;
}) {
  if (parameters.length === 0) {
    return null;
  }

  return (
    <section className="grid gap-2">
      <h3 className="text-sm">{title}</h3>
      <div className="grid gap-2">
        {parameters.map((parameter) => (
          <label key={`${parameter.in}:${parameter.name}`} className="grid gap-1">
            <span className="text-muted-foreground flex items-center gap-2 text-xs">
              <span>{parameter.name}</span>
              {parameter.required ? <Badge variant="outline">required</Badge> : null}
            </span>
            <Input
              value={values[parameter.name] ?? ""}
              placeholder={parameter.description}
              onChange={(event) =>
                onChange({
                  ...values,
                  [parameter.name]: event.target.value,
                })
              }
            />
          </label>
        ))}
      </div>
    </section>
  );
}

function createInitialRequestDraft(endpoint: OpenApiEndpoint): RequestDraft {
  return {
    pathParams: createEmptyParameterValues(endpoint, "path"),
    query: createEmptyParameterValues(endpoint, "query"),
    headers: createEmptyParameterValues(endpoint, "header"),
    bodyText: endpoint.requestBody ? "{}" : "",
  };
}

function createRequestModel(endpoint: OpenApiEndpoint, draft: RequestDraft): RequestModel {
  const baseUrl = endpoint.serverUrl ?? "";
  const path = resolvePathParams(endpoint.path, draft.pathParams);
  const query = removeEmptyValues(draft.query);
  const resolvedUrl = appendQueryString(`${baseUrl}${path}`, query);
  const body = draft.bodyText.trim().length > 0 ? draft.bodyText : undefined;

  return {
    endpointId: endpoint.id,
    method: endpoint.method,
    path: endpoint.path,
    resolvedUrl,
    headers: removeEmptyValues(draft.headers),
    query,
    pathParams: removeEmptyValues(draft.pathParams),
    cookies: {},
    body,
  };
}

function createEmptyParameterValues(
  endpoint: OpenApiEndpoint,
  location: "path" | "query" | "header"
): Record<string, string> {
  return Object.fromEntries(
    endpoint.parameters
      .filter((parameter) => parameter.in === location)
      .map((parameter) => [parameter.name, ""])
  );
}

function removeEmptyValues(values: Record<string, string>): Record<string, string> {
  return Object.fromEntries(Object.entries(values).filter(([, value]) => value.trim().length > 0));
}

function resolvePathParams(path: string, pathParams: Record<string, string>): string {
  return Object.entries(pathParams).reduce(
    (resolvedPath, [name, value]) =>
      value.trim().length > 0
        ? resolvedPath.replaceAll(`{${name}}`, encodeURIComponent(value))
        : resolvedPath,
    path
  );
}

function appendQueryString(url: string, query: Record<string, string>): string {
  const params = new URLSearchParams(query);
  const queryString = params.toString();

  if (!queryString) {
    return url;
  }

  return `${url}${url.includes("?") ? "&" : "?"}${queryString}`;
}
