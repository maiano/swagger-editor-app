import type {
  OpenApiDocument,
  OpenApiEndpoint,
  OpenApiMediaType,
  OpenApiParameter,
  OpenApiRequestBody,
  OpenApiResponse,
  OpenApiServer,
  OpenApiServerVariable,
} from "./types";
import {
  asBoolean,
  asRecord,
  asString,
  asStringArray,
  getEndpointId,
  HTTP_METHODS,
} from "./normalize-common";

function normalizeServers(value: unknown): OpenApiServer[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const servers: OpenApiServer[] = [];

  for (const server of value) {
    const record = asRecord(server);

    if (!record) {
      continue;
    }

    const url = asString(record.url);

    if (!url) {
      continue;
    }

    servers.push({
      url,
      description: asString(record.description),
      variables: normalizeServerVariables(record.variables),
    });
  }

  return servers;
}

function normalizeServerVariables(
  value: unknown
): Record<string, OpenApiServerVariable> | undefined {
  const record = asRecord(value);

  if (!record) {
    return undefined;
  }

  const variables: Record<string, OpenApiServerVariable> = {};

  for (const [name, variable] of Object.entries(record)) {
    const variableRecord = asRecord(variable);
    const defaultValue = asString(variableRecord?.default);

    if (!defaultValue) {
      continue;
    }

    const enumValues = asStringArray(variableRecord?.enum);

    variables[name] = {
      default: defaultValue,
      enum: enumValues.length > 0 ? enumValues : undefined,
      description: asString(variableRecord?.description),
    };
  }

  return Object.keys(variables).length > 0 ? variables : undefined;
}

function normalizeParameter(parameter: unknown): OpenApiParameter | undefined {
  const record = asRecord(parameter);

  if (!record) {
    return undefined;
  }

  const name = asString(record.name);
  const location = asString(record.in);

  if (
    !name ||
    (location !== "path" && location !== "query" && location !== "header" && location !== "cookie")
  ) {
    return undefined;
  }

  return {
    name,
    in: location,
    required: asBoolean(record.required) ?? location === "path",
    description: asString(record.description),
    schema: record.schema,
    example: record.example,
  };
}

function mergeParameters(
  pathParameters: unknown,
  operationParameters: unknown
): OpenApiParameter[] {
  const merged = new Map<string, OpenApiParameter>();

  const pushParameter = (parameter: unknown) => {
    const normalized = normalizeParameter(parameter);

    if (!normalized) {
      return;
    }

    merged.set(`${normalized.in}:${normalized.name}`, normalized);
  };

  if (Array.isArray(pathParameters)) {
    pathParameters.forEach(pushParameter);
  }

  if (Array.isArray(operationParameters)) {
    operationParameters.forEach(pushParameter);
  }

  return Array.from(merged.values());
}

function normalizeMediaType(value: unknown): OpenApiMediaType | undefined {
  const record = asRecord(value);

  if (!record) {
    return undefined;
  }

  const mediaType: OpenApiMediaType = {};

  if ("schema" in record) {
    mediaType.schema = record.schema;
  }

  if ("example" in record) {
    mediaType.example = record.example;
  }

  const examplesRecord = asRecord(record.examples);

  if (examplesRecord) {
    mediaType.examples = Object.fromEntries(
      Object.entries(examplesRecord).map(([key, example]) => {
        const exampleRecord = asRecord(example);
        return [key, exampleRecord && "value" in exampleRecord ? exampleRecord.value : example];
      })
    );
  }

  return Object.keys(mediaType).length > 0 ? mediaType : undefined;
}

function normalizeContent(value: unknown): Record<string, OpenApiMediaType> | undefined {
  const record = asRecord(value);

  if (!record) {
    return undefined;
  }

  const content = Object.fromEntries(
    Object.entries(record)
      .map(([contentType, mediaType]) => [contentType, normalizeMediaType(mediaType)] as const)
      .filter((entry): entry is readonly [string, OpenApiMediaType] => Boolean(entry[1]))
  );

  return Object.keys(content).length > 0 ? content : undefined;
}

function normalizeRequestBody(value: unknown): OpenApiRequestBody | undefined {
  const record = asRecord(value);

  if (!record) {
    return undefined;
  }

  const content = normalizeContent(record.content);

  if (!content) {
    return undefined;
  }

  return {
    required: asBoolean(record.required) ?? false,
    content,
  };
}

function normalizeResponses(value: unknown): OpenApiResponse[] {
  const record = asRecord(value);

  if (!record) {
    return [];
  }

  return Object.entries(record).map(([statusCode, response]) => {
    const responseRecord = asRecord(response);

    return {
      statusCode,
      description: asString(responseRecord?.description),
      content: normalizeContent(responseRecord?.content),
    };
  });
}

export function normalizeOpenApi3(document: unknown): OpenApiDocument {
  const record = asRecord(document);

  if (!record) {
    throw new Error("OpenAPI document must be an object");
  }

  const info = asRecord(record.info);
  const documentServers = normalizeServers(record.servers);
  const paths = asRecord(record.paths);
  const endpoints: OpenApiEndpoint[] = [];

  if (paths) {
    for (const [path, pathItem] of Object.entries(paths)) {
      const pathRecord = asRecord(pathItem);

      if (!pathRecord) {
        continue;
      }

      const pathParameters = pathRecord.parameters;
      const pathServers = normalizeServers(pathRecord.servers);

      for (const method of HTTP_METHODS) {
        const operation = asRecord(pathRecord[method]);

        if (!operation) {
          continue;
        }

        const operationId = asString(operation.operationId);
        const operationServers = normalizeServers(operation.servers);
        const serverUrl =
          operationServers[0]?.url ?? pathServers[0]?.url ?? documentServers[0]?.url;

        endpoints.push({
          id: getEndpointId(method, path),
          operationId,
          method,
          path,
          summary: asString(operation.summary),
          description: asString(operation.description),
          tags: asStringArray(operation.tags),
          parameters: mergeParameters(pathParameters, operation.parameters),
          requestBody: normalizeRequestBody(operation.requestBody),
          responses: normalizeResponses(operation.responses),
          serverUrl,
          deprecated: asBoolean(operation.deprecated),
        });
      }
    }
  }

  return {
    sourceVersion: "openapi3",
    title: asString(info?.title) ?? "Untitled API",
    version: asString(info?.version) ?? "",
    description: asString(info?.description),
    servers: documentServers,
    endpoints,
  };
}
