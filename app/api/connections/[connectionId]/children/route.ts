import { NextRequest, NextResponse } from "next/server";
import { stackAiFetch } from "@/lib/helpers/stackAiFetch";

export async function GET(
  req: NextRequest,
  { params }: { params: { connectionId: string } },
) {
  const resourceId = req.nextUrl.searchParams.get("resource_id");
  const searchParams = resourceId
    ? `?resource_id=${encodeURIComponent(resourceId)}`
    : "";

  const res = await stackAiFetch(
    `/connections/${params.connectionId}/resources/children${searchParams}`,
  );

  const json = await res.json();

  return NextResponse.json(json);
}
