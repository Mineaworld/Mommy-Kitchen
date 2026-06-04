import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseAdminClient } from "@/lib/supabase/server";

const schema = z.object({
  event_name: z.enum(["category_opened", "recipe_opened", "video_play_attempted", "fallback_used"]),
  recipe_id: z.string().min(1).optional(),
  category_id: z.string().min(1).optional(),
  device_type: z.string().optional()
});

export const POST = async (request: NextRequest) => {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "Invalid analytics event" } },
      { status: 400 }
    );
  }

  const client = getSupabaseAdminClient();
  if (client) {
    await client.from("analytics_events").insert(parsed.data);
  }

  return NextResponse.json({ ok: true }, { status: 201 });
};
