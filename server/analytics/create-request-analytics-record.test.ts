import { describe, expect, it } from "vitest";

import type { ProxyInput } from "@/server/proxy/proxy-input";
import type { ProxyResult } from "@/server/proxy/proxy-result";

import { createRequestAnalyticsRecord } from "./create-request-analytics-record";

const input: ProxyInput = {
  endpointId: "GET /pet/{petId}",
  method: "get",
  path: "/pet/{petId}",
  resolvedUrl: "https://petstore3.swagger.io/api/v3/pet/10",
  headers: {},
  query: {},
  pathParams: {
    petId: "10",
  },
  cookies: {},
};

describe("createRequestAnalyticsRecord", () => {
  it("returns null for anonymous users", () => {
    expect(
      createRequestAnalyticsRecord({
        userId: null,
        input,
        result: {
          ok: true,
        },
      })
    ).toBeNull();
  });

  it("maps successful proxy response to analytics record", () => {
    const result: ProxyResult = {
      ok: true,
      response: {
        status: 200,
        statusText: "OK",
        headers: {},
        body: "{}",
        durationMs: 123,
        truncated: false,
      },
      analytics: {
        requestSizeBytes: 0,
        responseSizeBytes: 2,
      },
    };

    expect(
      createRequestAnalyticsRecord({
        userId: "user-1",
        input,
        result,
        now: new Date("2026-06-19T10:00:00.000Z"),
        id: "record-1",
      })
    ).toEqual({
      id: "record-1",
      userId: "user-1",
      endpointId: "GET /pet/{petId}",
      method: "get",
      path: "/pet/{petId}",
      resolvedUrl: "https://petstore3.swagger.io/api/v3/pet/10",
      statusCode: 200,
      durationMs: 123,
      requestSizeBytes: 0,
      responseSizeBytes: 2,
      errorDetails: null,
      createdAt: "2026-06-19T10:00:00.000Z",
    });
  });

  it("maps proxy errors with null status code and fallback duration", () => {
    const result: ProxyResult = {
      ok: false,
      error: {
        type: "timeout",
        message: "Proxy request timed out",
      },
    };

    expect(
      createRequestAnalyticsRecord({
        userId: "user-1",
        input,
        result,
        now: new Date("2026-06-19T10:00:00.000Z"),
        id: "record-2",
        fallbackDurationMs: 15_000,
      })
    ).toMatchObject({
      id: "record-2",
      statusCode: null,
      durationMs: 15_000,
      requestSizeBytes: 0,
      responseSizeBytes: 0,
      errorDetails: "timeout: Proxy request timed out",
    });
  });
});
