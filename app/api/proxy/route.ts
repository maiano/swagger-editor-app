import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { recordRequestAnalytics } from "@/server/analytics/record-request-analytics";
import type { RequestAnalyticsRepository } from "@/server/analytics/request-analytics-repository";
import {
  SupabaseRequestAnalyticsRepository,
  type SupabaseRequestAnalyticsClient,
} from "@/server/analytics/supabase-request-analytics-repository";
import { executeProxyRequest } from "@/server/proxy/execute-proxy-request";
import { ProxyValidationError } from "@/server/proxy/proxy-errors";
import { proxyInputSchema, type ProxyInput } from "@/server/proxy/proxy-input";
import type { ProxyResult } from "@/server/proxy/proxy-result";
import { getUser } from "@/shared/lib/supabase/utils";
import type { User } from "@supabase/supabase-js";

export const runtime = "nodejs";

interface ProxyPostHandlerDependencies {
  getUser: () => Promise<User | null>;
  executeProxyRequest: (input: ProxyInput) => Promise<ProxyResult>;
  createAnalyticsRepository: () => Promise<RequestAnalyticsRepository>;
}

export const POST = createProxyPostHandler({
  getUser,
  executeProxyRequest,
  async createAnalyticsRepository() {
    const { createClient } = await import("@/shared/lib/supabase/server");
    const client = await createClient();

    return new SupabaseRequestAnalyticsRepository(
      client as unknown as SupabaseRequestAnalyticsClient
    );
  },
});

export function createProxyPostHandler({
  getUser,
  executeProxyRequest,
  createAnalyticsRepository,
}: ProxyPostHandlerDependencies) {
  return async function POST(request: Request) {
    let rawInput: unknown;

    try {
      rawInput = await request.json();
    } catch {
      return createProxyJsonResponse(
        {
          ok: false,
          error: {
            type: "invalid_payload",
            message: "Request body must be valid JSON",
          },
        },
        400
      );
    }

    try {
      const input = proxyInputSchema.parse(rawInput);
      const user = await getUser();
      const result = await executeProxyRequest(input);

      if (user) {
        await recordProxyAnalytics({
          repository: await createAnalyticsRepository(),
          userId: user.id,
          input,
          result,
        });
      }

      return createProxyJsonResponse(result, 200);
    } catch (error) {
      if (error instanceof ZodError) {
        return createProxyJsonResponse(
          {
            ok: false,
            error: {
              type: "invalid_payload",
              message: "Invalid proxy payload",
            },
          },
          400
        );
      }

      if (error instanceof ProxyValidationError) {
        return createProxyJsonResponse(
          {
            ok: false,
            error: {
              type: "blocked_url",
              message: error.message,
            },
          },
          400
        );
      }

      throw error;
    }
  };
}

function createProxyJsonResponse(result: ProxyResult, status: number) {
  return NextResponse.json(result, { status });
}

async function recordProxyAnalytics({
  repository,
  userId,
  input,
  result,
}: {
  repository: RequestAnalyticsRepository;
  userId: string;
  input: ProxyInput;
  result: ProxyResult;
}) {
  try {
    await recordRequestAnalytics({
      repository,
      userId,
      input,
      result,
    });
  } catch {
    // Analytics must not break the user's proxy response.
  }
}
