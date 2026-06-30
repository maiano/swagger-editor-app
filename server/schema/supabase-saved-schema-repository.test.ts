import { describe, expect, it } from "vitest";

import {
  SupabaseSavedSchemaRepository,
  type SupabaseSavedSchemaClient,
  type SupabaseSavedSchemaRow,
  type SupabaseSavedSchemaUpsert,
} from "./supabase-saved-schema-repository";

const savedSchemaRow: SupabaseSavedSchemaRow = {
  user_id: "user-1",
  content: "openapi: 3.0.0",
  format: "yaml",
  created_at: "2026-06-01T10:00:00.000Z",
  updated_at: "2026-06-02T10:00:00.000Z",
};

describe("SupabaseSavedSchemaRepository", () => {
  it("loads and maps the saved schema row", async () => {
    const repository = new SupabaseSavedSchemaRepository(
      createClient({ selectResult: { data: savedSchemaRow, error: null } })
    );

    await expect(repository.loadSavedSchema("user-1")).resolves.toEqual({
      userId: "user-1",
      content: "openapi: 3.0.0",
      format: "yaml",
      createdAt: "2026-06-01T10:00:00.000Z",
      updatedAt: "2026-06-02T10:00:00.000Z",
    });
  });

  it("returns null when the user has no saved schema", async () => {
    const repository = new SupabaseSavedSchemaRepository(
      createClient({ selectResult: { data: null, error: null } })
    );

    await expect(repository.loadSavedSchema("user-1")).resolves.toBeNull();
  });

  it("throws a contextual error when loading fails", async () => {
    const repository = new SupabaseSavedSchemaRepository(
      createClient({ selectResult: { data: null, error: { message: "permission denied" } } })
    );

    await expect(repository.loadSavedSchema("user-1")).rejects.toThrow(
      "Failed to load saved schema: permission denied"
    );
  });

  it("upserts and maps the saved schema row", async () => {
    const upsertedRows: SupabaseSavedSchemaUpsert[] = [];
    const repository = new SupabaseSavedSchemaRepository(
      createClient({
        upsertResult: { data: { ...savedSchemaRow, content: '{"openapi":"3.0.0"}' }, error: null },
        onUpsert(row) {
          upsertedRows.push(row);
        },
      })
    );

    await expect(
      repository.saveSchema({
        userId: "user-1",
        content: '{"openapi":"3.0.0"}',
        format: "json",
      })
    ).resolves.toMatchObject({
      userId: "user-1",
      content: '{"openapi":"3.0.0"}',
      format: "yaml",
    });

    expect(upsertedRows[0]).toMatchObject({
      user_id: "user-1",
      content: '{"openapi":"3.0.0"}',
      format: "json",
    });
    expect(upsertedRows[0]?.updated_at).toEqual(expect.any(String));
  });
});

function createClient({
  selectResult = { data: null, error: null },
  upsertResult = { data: null, error: null },
  onUpsert,
}: {
  selectResult?: { data: SupabaseSavedSchemaRow | null; error: { message: string } | null };
  upsertResult?: { data: SupabaseSavedSchemaRow | null; error: { message: string } | null };
  onUpsert?: (row: SupabaseSavedSchemaUpsert) => void;
}): SupabaseSavedSchemaClient {
  return {
    from(table) {
      expect(table).toBe("saved_schemas");

      return {
        select() {
          const selectQuery = {
            eq(column: "user_id", value: string) {
              expect(column).toBe("user_id");
              expect(value).toBe("user-1");

              return selectQuery;
            },
            maybeSingle: async () => selectResult,
          };

          return selectQuery;
        },
        upsert(row, options) {
          expect(options).toEqual({ onConflict: "user_id" });
          onUpsert?.(row);

          return {
            select() {
              return {
                single: async () => upsertResult,
              };
            },
          };
        },
      };
    },
  };
}
