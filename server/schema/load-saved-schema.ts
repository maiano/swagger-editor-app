import "server-only";

import {
  SupabaseSavedSchemaRepository,
  type SupabaseSavedSchemaClient,
} from "./supabase-saved-schema-repository";

export async function loadSavedSchema(userId: string) {
  const repository = await createSavedSchemaRepository();

  return repository.loadSavedSchema(userId);
}

async function createSavedSchemaRepository() {
  const { createClient } = await import("@/shared/lib/supabase/server");
  const client = await createClient();

  return new SupabaseSavedSchemaRepository(client as unknown as SupabaseSavedSchemaClient);
}
