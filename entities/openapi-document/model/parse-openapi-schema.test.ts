import { describe, expect, it } from "vitest";

import { parseOpenApiSchema } from "./parse-openapi-schema";

describe("parseOpenApiSchema", () => {
  it("parses, validates, dereferences, and normalizes JSON OpenAPI schemas", async () => {
    const result = await parseOpenApiSchema(
      JSON.stringify({
        openapi: "3.0.0",
        info: {
          title: "Pets",
          version: "1.0.0",
        },
        paths: {
          "/pets": {
            get: {
              responses: {
                "200": {
                  description: "OK",
                },
              },
            },
          },
        },
      })
    );

    expect(result.ok).toBe(true);

    if (!result.ok) {
      return;
    }

    expect(result.format).toBe("json");
    expect(result.document).toMatchObject({
      sourceVersion: "openapi3",
      title: "Pets",
      version: "1.0.0",
    });
    expect(result.document.endpoints[0]?.id).toBe("GET /pets");
  });

  it("parses, validates, dereferences, and normalizes YAML OpenAPI schemas", async () => {
    const result = await parseOpenApiSchema(`
openapi: 3.0.0
info:
  title: Pets
  version: 1.0.0
paths:
  /pets:
    get:
      responses:
        "200":
          description: OK
`);

    expect(result.ok).toBe(true);

    if (!result.ok) {
      return;
    }

    expect(result.format).toBe("yaml");
    expect(result.document.sourceVersion).toBe("openapi3");
    expect(result.document.endpoints[0]?.method).toBe("get");
  });

  it("returns a failure result for unsupported documents", async () => {
    const result = await parseOpenApiSchema(`
info:
  title: Missing version marker
  version: 1.0.0
paths: {}
`);

    expect(result).toEqual({
      ok: false,
      error: "Only Swagger 2.0 and OpenAPI 3.x are supported",
    });
  });
});
