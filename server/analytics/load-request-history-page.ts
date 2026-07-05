import "server-only";

import type { RequestHistoryPageParams } from "./request-history-page";
import {
  SupabaseRequestAnalyticsRepository,
  type SupabaseRequestAnalyticsClient,
} from "./supabase-request-analytics-repository";

export async function loadRequestHistoryPage(userId: string, params?: RequestHistoryPageParams) {
  const repository = await createRequestAnalyticsRepository();

  return repository.getRequestHistoryPage(userId, params);
}

async function createRequestAnalyticsRepository() {
  const { createClient } = await import("@/shared/lib/supabase/server");
  const client = await createClient();

  return new SupabaseRequestAnalyticsRepository(
    client as unknown as SupabaseRequestAnalyticsClient
  );
}
