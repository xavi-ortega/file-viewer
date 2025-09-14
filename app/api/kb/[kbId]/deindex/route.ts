import { NextRequest, NextResponse } from "next/server";
import { stackAiFetch } from "@/lib/helpers/stackAiFetch";

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ kbId: string }> },
) {
  const params = await context.params;
  const resourcePath = req.nextUrl.searchParams.get("resource_path") ?? "/";

  if (!resourcePath) {
    return NextResponse.json(
      { error: "Missing resource_path" },
      { status: 400 },
    );
  }

  const res = await stackAiFetch(
    `/knowledge_bases/${params.kbId}/resources?resource_path=${encodeURIComponent(resourcePath)}`,
    { method: "DELETE", body: JSON.stringify({ resource_path: resourcePath }) },
  );

  const text = await res.text();

  return NextResponse.json({ ok: true, raw: text });
}
