import "server-only";

import {
  SupabaseSavedSchemaRepository,
  type SupabaseSavedSchemaClient,
} from "./supabase-saved-schema-repository";

export async function createSavedSchemaRepository() {
  const { createClient } = await import("@/shared/lib/supabase/server");
  const client = await createClient();

  return new SupabaseSavedSchemaRepository(client as unknown as SupabaseSavedSchemaClient);
}
