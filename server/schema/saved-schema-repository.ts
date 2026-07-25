import type { SavedSchemaRecord } from "./saved-schema-record";

export interface SaveSchemaInput {
  userId: string;
  content: string;
  format: SavedSchemaRecord["format"];
}

export interface SavedSchemaRepository {
  loadSavedSchema(userId: string): Promise<SavedSchemaRecord | null>;
  saveSchema(input: SaveSchemaInput): Promise<SavedSchemaRecord>;
}
