import { NextRequest, NextResponse } from "next/server";
import { stackAiFetch } from "@/lib/helpers/stackAiFetch";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ kbId: string }> },
) {
  const params = await context.params;
  const search = new URLSearchParams(req.nextUrl.searchParams);

  try {
    const res = await stackAiFetch(
      `/knowledge_bases/${params.kbId}/resources/children?${search.toString()}`,
    );

    const json = await res.json();

    return NextResponse.json(json);
  } catch {
    // when the resource is not found the API throws error 500
    return NextResponse.json({
      data: [],
    });
  }
}
