import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { executeProxyRequest } from "@/server/proxy/execute-proxy-request";
import { ProxyValidationError } from "@/server/proxy/proxy-errors";
import type { ProxyResult } from "@/server/proxy/proxy-result";
import { proxyInputSchema } from "@/server/proxy/proxy-input";

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
    const result = await executeProxyRequest(input);

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
}

function createProxyJsonResponse(result: ProxyResult, status: number) {
  return NextResponse.json(result, { status });
}
