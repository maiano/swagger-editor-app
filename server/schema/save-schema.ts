import "server-only";

import { parseOpenApiSchema } from "@/entities/openapi-document/model";

import {
  SupabaseSavedSchemaRepository,
  type SupabaseSavedSchemaClient,
} from "./supabase-saved-schema-repository";

export interface SaveSchemaForUserInput {
  userId: string;
  content: string;
}

export interface SaveSchemaSuccess {
  ok: true;
  schema: Awaited<ReturnType<SupabaseSavedSchemaRepository["saveSchema"]>>;
}

export interface SaveSchemaFailure {
  ok: false;
  error: string;
}

export type SaveSchemaResult = SaveSchemaSuccess | SaveSchemaFailure;

export async function saveSchemaForUser(input: SaveSchemaForUserInput): Promise<SaveSchemaResult> {
  const content = input.content.trim();

  if (!content) {
    return {
      ok: false,
      error: "Schema text is empty",
    };
  }

  const parseResult = await parseOpenApiSchema(content);

  if (!parseResult.ok) {
    return {
      ok: false,
      error: parseResult.error,
    };
  }

  const repository = await createSavedSchemaRepository();
  const schema = await repository.saveSchema({
    userId: input.userId,
    content,
    format: parseResult.format,
  });

  return {
    ok: true,
    schema,
  };
}

async function createSavedSchemaRepository() {
  const { createClient } = await import("@/shared/lib/supabase/server");
  const client = await createClient();

  return new SupabaseSavedSchemaRepository(client as unknown as SupabaseSavedSchemaClient);
}
