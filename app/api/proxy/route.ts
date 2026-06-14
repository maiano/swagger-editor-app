import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { ProxyValidationError } from "@/server/proxy/proxy-errors";
import type { ProxyResult } from "@/server/proxy/proxy-result";
import { proxyInputSchema } from "@/server/proxy/proxy-input";
import { validateTargetUrl } from "@/server/proxy/validate-target-url";

export const runtime = "nodejs";

export async function POST(request: Request) {
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
    await validateTargetUrl(input.resolvedUrl);

    return createProxyJsonResponse(
      {
        ok: false,
        error: {
          type: "not_implemented",
          message: "Proxy execution is not implemented yet",
        },
      },
      501
    );
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
}

function createProxyJsonResponse(result: ProxyResult, status: number) {
  return NextResponse.json(result, { status });
}
