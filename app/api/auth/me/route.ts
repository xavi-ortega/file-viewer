import { NextResponse } from "next/server";
import { stackAiFetch } from "@/lib/helpers/stackAiFetch";

export async function GET() {
  const res = await stackAiFetch("/organizations/me/current");
  const json = await res.json();

  return NextResponse.json({ org_id: json.org_id });
}
