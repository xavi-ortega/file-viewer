import { NextRequest, NextResponse } from "next/server";
import { stackAiFetch } from "@/lib/helpers/stackAiFetch";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ connectionId: string }> },
) {
  const params = await context.params;
  const search = new URLSearchParams(req.nextUrl.searchParams);

  const res = await stackAiFetch(
    `/connections/${params.connectionId}/resources/children?${search.toString()}`,
  );

  const json = await res.json();

  return NextResponse.json(json);
}
