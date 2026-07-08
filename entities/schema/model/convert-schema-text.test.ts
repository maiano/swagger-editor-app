import { describe, expect, it } from "vitest";

import { convertSchemaText } from "./convert-schema-text";
import { parseSchemaText } from "./parse-schema-text";

describe("convertSchemaText", () => {
  it("converts YAML schema text to formatted JSON", () => {
    const result = convertSchemaText(
      `
openapi: 3.0.0
info:
  title: Pets
  version: 1.0.0
paths: {}
`,
      "json"
    );

    expect(result).toContain('"openapi": "3.0.0"');
    expect(result).toContain('"title": "Pets"');
    expect(parseSchemaText(result)).toMatchObject({
      format: "json",
    });
  });

  it("converts JSON schema text to YAML", () => {
    const result = convertSchemaText(
      JSON.stringify({
        openapi: "3.0.0",
        info: {
          title: "Pets",
          version: "1.0.0",
        },
        paths: {},
      }),
      "yaml"
    );

    expect(result).toContain("openapi: 3.0.0");
    expect(result).toContain("title: Pets");
    expect(parseSchemaText(result)).toMatchObject({
      format: "yaml",
    });
  });
});
