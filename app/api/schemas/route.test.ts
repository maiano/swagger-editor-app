import { beforeEach, describe, expect, it, vi } from "vitest";

import { saveSchemaForUser } from "@/server/schema";
import { getUser } from "@/shared/lib/supabase/utils";

import { PUT } from "./route";

vi.mock("@/shared/lib/supabase/utils", () => ({
  getUser: vi.fn(),
}));

vi.mock("@/server/schema", () => ({
  saveSchemaForUser: vi.fn(),
}));

function createSchemaRequest(body: unknown): Request {
  return new Request("http://localhost/api/schemas", {
    method: "PUT",
    body: JSON.stringify(body),
    headers: {
      "content-type": "application/json",
    },
  });
}

describe("/api/schemas", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 for invalid JSON", async () => {
    const response = await PUT(
      new Request("http://localhost/api/schemas", {
        method: "PUT",
        body: "{",
        headers: {
          "content-type": "application/json",
        },
      })
    );

    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: "Request body must be valid JSON",
    });
    expect(response.status).toBe(400);
  });

  it("returns 401 when user is not authenticated", async () => {
    vi.mocked(getUser).mockResolvedValue(null);

    const response = await PUT(createSchemaRequest({ content: "openapi: 3.0.0" }));

    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: "Authentication required",
    });
    expect(response.status).toBe(401);
    expect(saveSchemaForUser).not.toHaveBeenCalled();
  });

  it("returns 400 for invalid payload shape", async () => {
    vi.mocked(getUser).mockResolvedValue({ id: "user-1" } as never);

    const response = await PUT(createSchemaRequest({ content: 123 }));

    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: "Invalid schema payload",
    });
    expect(response.status).toBe(400);
  });

  it("returns 422 when schema validation fails", async () => {
    vi.mocked(getUser).mockResolvedValue({ id: "user-1" } as never);
    vi.mocked(saveSchemaForUser).mockResolvedValue({
      ok: false,
      error: "Schema text is empty",
    });

    const response = await PUT(createSchemaRequest({ content: "" }));

    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: "Schema text is empty",
    });
    expect(response.status).toBe(422);
  });

  it("saves schema for authenticated users", async () => {
    vi.mocked(getUser).mockResolvedValue({ id: "user-1" } as never);
    vi.mocked(saveSchemaForUser).mockResolvedValue({
      ok: true,
      schema: {
        userId: "user-1",
        content: "openapi: 3.0.0",
        format: "yaml",
        createdAt: "2026-06-01T10:00:00.000Z",
        updatedAt: "2026-06-02T10:00:00.000Z",
      },
    });

    const response = await PUT(createSchemaRequest({ content: "openapi: 3.0.0" }));

    await expect(response.json()).resolves.toMatchObject({
      ok: true,
      schema: {
        userId: "user-1",
        format: "yaml",
      },
    });
    expect(response.status).toBe(200);
    expect(saveSchemaForUser).toHaveBeenCalledWith({
      userId: "user-1",
      content: "openapi: 3.0.0",
    });
  });
});
