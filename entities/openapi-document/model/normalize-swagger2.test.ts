import { describe, expect, it } from "vitest";

import { normalizeSwagger2 } from "./normalize-swagger2";

describe("normalizeSwagger2", () => {
  it("uses produces for response content when examples are absent", () => {
    const document = normalizeSwagger2({
      swagger: "2.0",
      info: {
        title: "Pets",
        version: "1.0.0",
      },
      host: "api.example.com",
      basePath: "/v1",
      schemes: ["https"],
      produces: ["application/json"],
      paths: {
        "/pets": {
          get: {
            operationId: "listPets",
            responses: {
              "200": {
                description: "OK",
                schema: {
                  type: "array",
                  items: {
                    type: "object",
                  },
                },
              },
            },
          },
        },
      },
    });

    expect(document.sourceVersion).toBe("swagger2");
    expect(document.servers[0]?.url).toBe("https://api.example.com/v1");
    expect(document.endpoints[0]?.id).toBe("GET /pets");
    expect(document.endpoints[0]?.responses[0]?.content).toHaveProperty("application/json");
  });

  it("does not create empty schemas for scalar parameters without schema fields", () => {
    const document = normalizeSwagger2({
      swagger: "2.0",
      info: {
        title: "Pets",
        version: "1.0.0",
      },
      paths: {
        "/pets": {
          get: {
            parameters: [
              {
                name: "empty",
                in: "query",
              },
            ],
            responses: {
              default: {
                description: "OK",
              },
            },
          },
        },
      },
    });

    expect(document.endpoints[0]?.parameters[0]?.schema).toBeUndefined();
  });
});
