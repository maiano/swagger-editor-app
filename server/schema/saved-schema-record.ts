import type { SchemaFormat } from "@/entities/schema/model";

export interface SavedSchemaRecord {
  userId: string;
  content: string;
  format: SchemaFormat;
  createdAt: string;
  updatedAt: string;
}
