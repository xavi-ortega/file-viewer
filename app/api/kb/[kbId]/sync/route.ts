import { NextResponse } from "next/server";
import { stackAiFetch } from "@/lib/helpers/stackAi";

export async function POST(
  req: Request,
  { params }: { params: { kbId: string } },
) {
  const body = await req.json();

  const res = await stackAiFetch(
    `/knowledge_bases/sync/trigger/${params.kbId}/${body.orgId}`,
  );

  const text = await res.text();

  return NextResponse.json({ ok: true, raw: text });
}
