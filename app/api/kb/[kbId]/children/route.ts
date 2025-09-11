import { NextRequest, NextResponse } from "next/server";
import { stackAiFetch } from "@/lib/helpers/stackAiFetch";

export async function GET(
  req: NextRequest,
  { params }: { params: { kbId: string } },
) {
  const resourcePath = req.nextUrl.searchParams.get("resource_path") ?? "/";

  const res = await stackAiFetch(
    `/knowledge_bases/${params.kbId}/resources/children?resource_path=${encodeURIComponent(resourcePath)}`,
  );

  const json = await res.json();

  return NextResponse.json(json);
}
