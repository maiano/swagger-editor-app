import "server-only";

import { createSavedSchemaRepository } from "./create-saved-schema-repository";

export async function loadSavedSchema(userId: string) {
  const repository = await createSavedSchemaRepository();

  return repository.loadSavedSchema(userId);
}
