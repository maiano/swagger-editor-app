import type {
  OpenApiDocument,
  OpenApiEndpoint,
  OpenApiMediaType,
  OpenApiParameter,
  OpenApiRequestBody,
  OpenApiResponse,
  OpenApiServer,
} from "./types";
import {
  asBoolean,
  asRecord,
  asString,
  asStringArray,
  getEndpointId,
  HTTP_METHODS,
} from "./normalize-common";

type UnknownRecord = Record<string, unknown>;

function normalizeSwaggerServers(document: UnknownRecord): OpenApiServer[] {
  const schemes = asStringArray(document.schemes);
  const host = asString(document.host);
  const basePath = asString(document.basePath) ?? "";

  if (!host) {
    return [];
  }

  const normalizedSchemes = schemes.length > 0 ? schemes : ["https"];

  return normalizedSchemes.map((scheme) => ({
    url: `${scheme}://${host}${basePath}`,
  }));
}

function normalizeNonBodyParameter(parameter: unknown): OpenApiParameter | undefined {
  const record = asRecord(parameter);

  if (!record) {
    return undefined;
  }

  const name = asString(record.name);
  const location = asString(record.in);

  if (!name || (location !== "path" && location !== "query" && location !== "header")) {
    return undefined;
  }

  return {
    name,
    in: location,
    required: asBoolean(record.required) ?? location === "path",
    description: asString(record.description),
    schema: normalizeSwagger2ParameterSchema(record),
    example: record.example,
  };
}

function normalizeSwagger2ParameterSchema(parameter: UnknownRecord): unknown {
  if ("schema" in parameter) {
    return parameter.schema;
  }

  const schema: UnknownRecord = {};

  for (const key of ["type", "format", "items", "enum", "default", "minimum", "maximum"] as const) {
    if (parameter[key] !== undefined) {
      schema[key] = parameter[key];
    }
  }

  return Object.keys(schema).length > 0 ? schema : undefined;
}

function mergeParameters(pathParameters: unknown, operationParameters: unknown): UnknownRecord[] {
  const merged = new Map<string, UnknownRecord>();

  const pushParameter = (parameter: unknown) => {
    const record = asRecord(parameter);

    if (!record) {
      return;
    }

    const name = asString(record.name);
    const location = asString(record.in);

    if (!name || !location) {
      return;
    }

    merged.set(`${location}:${name}`, record);
  };

  if (Array.isArray(pathParameters)) {
    pathParameters.forEach(pushParameter);
  }

  if (Array.isArray(operationParameters)) {
    operationParameters.forEach(pushParameter);
  }

  return Array.from(merged.values());
}

function createMediaType(schema: unknown, example?: unknown): OpenApiMediaType {
  return example === undefined ? { schema } : { schema, example };
}

function normalizeSwaggerRequestBody(
  parameters: UnknownRecord[],
  consumes: string[]
): OpenApiRequestBody | undefined {
  const bodyParameter = parameters.find((parameter) => parameter.in === "body");
  const formDataParameters = parameters.filter((parameter) => parameter.in === "formData");

  if (bodyParameter) {
    const contentType = consumes[0] ?? "application/json";

    return {
      required: asBoolean(bodyParameter.required) ?? false,
      content: {
        [contentType]: createMediaType(bodyParameter.schema),
      },
    };
  }

  if (formDataParameters.length === 0) {
    return undefined;
  }

  const contentType = consumes.includes("multipart/form-data")
    ? "multipart/form-data"
    : "application/x-www-form-urlencoded";

  const schema = {
    type: "object",
    properties: Object.fromEntries(
      formDataParameters.map((parameter) => [
        asString(parameter.name) ?? "field",
        {
          type: parameter.type,
          format: parameter.format,
          items: parameter.items,
          enum: parameter.enum,
          description: parameter.description,
        },
      ])
    ),
    required: formDataParameters
      .filter((parameter) => asBoolean(parameter.required))
      .map((parameter) => asString(parameter.name))
      .filter((name): name is string => Boolean(name)),
  };

  return {
    required: formDataParameters.some((parameter) => asBoolean(parameter.required) ?? false),
    content: {
      [contentType]: createMediaType(schema),
    },
  };
}

function normalizeSwaggerResponses(responses: unknown, produces: string[]): OpenApiResponse[] {
  const record = asRecord(responses);

  if (!record) {
    return [];
  }

  return Object.entries(record).map(([statusCode, response]) => {
    const responseRecord = asRecord(response);
    const schema = responseRecord?.schema;
    const exampleSource = asRecord(responseRecord?.examples);
    const exampleEntries = exampleSource ? Object.entries(exampleSource) : [];
    const contentTypes =
      exampleEntries.length > 0 ? exampleEntries.map(([contentType]) => contentType) : produces;

    let content: Record<string, OpenApiMediaType> | undefined;

    if (schema !== undefined || exampleEntries.length > 0) {
      const normalizedTypes = contentTypes.length > 0 ? contentTypes : ["application/json"];

      content = Object.fromEntries(
        normalizedTypes.map((contentType) => {
          const matchingExample = exampleEntries.find(
            ([exampleContentType]) => exampleContentType === contentType
          );

          return [contentType, createMediaType(schema, matchingExample?.[1])];
        })
      );
    }

    return {
      statusCode,
      description: asString(responseRecord?.description),
      content,
    };
  });
}

function getConsumes(
  document: UnknownRecord,
  pathItem: UnknownRecord,
  operation: UnknownRecord
): string[] {
  const operationConsumes = asStringArray(operation.consumes);

  if (operationConsumes.length > 0) {
    return operationConsumes;
  }

  const pathConsumes = asStringArray(pathItem.consumes);

  if (pathConsumes.length > 0) {
    return pathConsumes;
  }

  return asStringArray(document.consumes);
}

function getProduces(
  document: UnknownRecord,
  pathItem: UnknownRecord,
  operation: UnknownRecord
): string[] {
  const operationProduces = asStringArray(operation.produces);

  if (operationProduces.length > 0) {
    return operationProduces;
  }

  const pathProduces = asStringArray(pathItem.produces);

  if (pathProduces.length > 0) {
    return pathProduces;
  }

  return asStringArray(document.produces);
}

export function normalizeSwagger2(document: unknown): OpenApiDocument {
  const record = asRecord(document);

  if (!record) {
    throw new Error("Swagger document must be an object");
  }

  const info = asRecord(record.info);
  const servers = normalizeSwaggerServers(record);
  const paths = asRecord(record.paths);
  const endpoints: OpenApiEndpoint[] = [];

  if (paths) {
    for (const [path, pathItem] of Object.entries(paths)) {
      const pathRecord = asRecord(pathItem);

      if (!pathRecord) {
        continue;
      }

      for (const method of HTTP_METHODS) {
        const operation = asRecord(pathRecord[method]);

        if (!operation) {
          continue;
        }

        const mergedParameters = mergeParameters(pathRecord.parameters, operation.parameters);
        const consumes = getConsumes(record, pathRecord, operation);
        const produces = getProduces(record, pathRecord, operation);
        const operationId = asString(operation.operationId);

        endpoints.push({
          id: getEndpointId(method, path),
          operationId,
          method,
          path,
          summary: asString(operation.summary),
          description: asString(operation.description),
          tags: asStringArray(operation.tags),
          parameters: mergedParameters
            .map(normalizeNonBodyParameter)
            .filter((parameter): parameter is OpenApiParameter => Boolean(parameter)),
          requestBody: normalizeSwaggerRequestBody(mergedParameters, consumes),
          responses: normalizeSwaggerResponses(operation.responses, produces),
          serverUrl: servers[0]?.url,
          deprecated: asBoolean(operation.deprecated),
        });
      }
    }
  }

  return {
    sourceVersion: "swagger2",
    title: asString(info?.title) ?? "Untitled API",
    version: asString(info?.version) ?? "",
    description: asString(info?.description),
    servers,
    endpoints,
  };
}
