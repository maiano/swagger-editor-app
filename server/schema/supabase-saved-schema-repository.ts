import type { SavedSchemaRecord } from "./saved-schema-record";
import type { SaveSchemaInput, SavedSchemaRepository } from "./saved-schema-repository";

interface SupabaseErrorLike {
  message: string;
}

interface SupabaseSingleResult<Row> {
  data: Row | null;
  error: SupabaseErrorLike | null;
}

interface SupabaseSavedSchemasSelectQuery {
  eq(column: "user_id", value: string): SupabaseSavedSchemasSelectQuery;
  maybeSingle(): PromiseLike<SupabaseSingleResult<SupabaseSavedSchemaRow>>;
}

interface SupabaseSavedSchemasUpsertQuery {
  select(columns: string): SupabaseSavedSchemasUpsertSelectQuery;
}

interface SupabaseSavedSchemasUpsertSelectQuery {
  single(): PromiseLike<SupabaseSingleResult<SupabaseSavedSchemaRow>>;
}

interface SupabaseSavedSchemasTable {
  select(columns: string): SupabaseSavedSchemasSelectQuery;
  upsert(
    row: SupabaseSavedSchemaUpsert,
    options: { onConflict: "user_id" }
  ): SupabaseSavedSchemasUpsertQuery;
}

export interface SupabaseSavedSchemaClient {
  from(table: "saved_schemas"): SupabaseSavedSchemasTable;
}

export interface SupabaseSavedSchemaRow {
  user_id: string;
  content: string;
  format: "json" | "yaml";
  created_at: string;
  updated_at: string;
}

export interface SupabaseSavedSchemaUpsert {
  user_id: string;
  content: string;
  format: "json" | "yaml";
  updated_at: string;
}

export class SupabaseSavedSchemaRepository implements SavedSchemaRepository {
  constructor(private readonly client: SupabaseSavedSchemaClient) {}

  async loadSavedSchema(userId: string): Promise<SavedSchemaRecord | null> {
    const { data, error } = await this.client
      .from("saved_schemas")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to load saved schema: ${error.message}`);
    }

    return data ? fromSupabaseSavedSchemaRow(data) : null;
  }

  async saveSchema(input: SaveSchemaInput): Promise<SavedSchemaRecord> {
    const { data, error } = await this.client
      .from("saved_schemas")
      .upsert(toSupabaseSavedSchemaUpsert(input), { onConflict: "user_id" })
      .select("*")
      .single();

    if (error) {
      throw new Error(`Failed to save schema: ${error.message}`);
    }

    if (!data) {
      throw new Error("Failed to save schema: empty Supabase response");
    }

    return fromSupabaseSavedSchemaRow(data);
  }
}

function toSupabaseSavedSchemaUpsert(input: SaveSchemaInput): SupabaseSavedSchemaUpsert {
  return {
    user_id: input.userId,
    content: input.content,
    format: input.format,
    updated_at: new Date().toISOString(),
  };
}

function fromSupabaseSavedSchemaRow(row: SupabaseSavedSchemaRow): SavedSchemaRecord {
  return {
    userId: row.user_id,
    content: row.content,
    format: row.format,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
