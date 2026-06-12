export type SchemaFormat = "json" | "yaml";

export interface ParsedSchemaText {
  format: SchemaFormat;
  value: unknown;
}
