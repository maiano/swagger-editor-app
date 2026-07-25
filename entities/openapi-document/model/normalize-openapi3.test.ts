import { describe, expect, it } from "vitest";

import { normalizeOpenApi3 } from "./normalize-openapi3";

describe("normalizeOpenApi3", () => {
  it("normalizes endpoints with stable method-path ids and keeps operationId separate", () => {
    const document = normalizeOpenApi3({
      openapi: "3.0.0",
      info: {
        title: "Pets",
        version: "1.0.0",
        description: "Pet API",
      },
      servers: [
        {
          url: "https://{env}.example.com",
          variables: {
            env: {
              default: "api",
              enum: ["api", "staging"],
              description: "Environment",
            },
          },
        },
      ],
      paths: {
        "/pets/{id}": {
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          get: {
            operationId: "duplicatedOperationId",
            deprecated: true,
            responses: {
              "200": {
                description: "OK",
              },
            },
          },
        },
      },
    });

    expect(document.sourceVersion).toBe("openapi3");
    expect(document.description).toBe("Pet API");
    expect(document.servers[0]?.variables?.env?.default).toBe("api");
    expect(document.endpoints[0]).toMatchObject({
      id: "GET /pets/{id}",
      operationId: "duplicatedOperationId",
      method: "get",
      path: "/pets/{id}",
      deprecated: true,
      serverUrl: "https://{env}.example.com",
    });
  });
});
