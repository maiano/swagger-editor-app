import { NextResponse } from "next/server";
import { z, ZodError } from "zod";

import { saveSchemaForUser } from "@/server/schema";
import { getUser } from "@/shared/lib/supabase/utils";

export const runtime = "nodejs";

const saveSchemaPayloadSchema = z.object({
  content: z.string(),
});

export async function PUT(request: Request) {
  let rawPayload: unknown;

  try {
    rawPayload = await request.json();
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error: "Request body must be valid JSON",
      },
      { status: 400 }
    );
  }

  try {
    const user = await getUser();

    if (!user) {
      return NextResponse.json(
        {
          ok: false,
          error: "Authentication required",
        },
        { status: 401 }
      );
    }

    const payload = saveSchemaPayloadSchema.parse(rawPayload);
    const result = await saveSchemaForUser({
      userId: user.id,
      content: payload.content,
    });

    if (!result.ok) {
      return NextResponse.json(result, { status: 422 });
    }

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          ok: false,
          error: "Invalid schema payload",
        },
        { status: 400 }
      );
    }

    throw error;
  }
}
