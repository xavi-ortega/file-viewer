import { NextRequest, NextResponse } from "next/server";
import { stackAiFetch } from "@/lib/helpers/stackAiFetch";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { kbId: string } },
) {
  const resourcePath = req.nextUrl.searchParams.get("resource_path") ?? "/";

  if (!resourcePath) {
    return NextResponse.json(
      { error: "Missing resource_path" },
      { status: 400 },
    );
  }

  const res = await stackAiFetch(
    `/knowledge_bases/${params.kbId}/resources?resource_path=${encodeURIComponent(resourcePath)}`,
    { method: "DELETE" },
  );

  const text = await res.text();

  return NextResponse.json({ ok: true, raw: text });
}
