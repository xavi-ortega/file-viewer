import { NextResponse } from "next/server";
import { stackAiFetch } from "@/lib/helpers/stackAi";

export async function GET() {
  const res = await stackAiFetch(
    "/connections?connection_provider=gdrive&limit=1",
  );

  const list = await res.json();

  if (!Array.isArray(list) || list.length === 0) {
    return NextResponse.json(
      { error: "No GDrive connection found" },
      { status: 404 },
    );
  }

  const conn = list[0];

  return NextResponse.json({
    connectionId: conn.connection_id,
    name: conn.name,
  });
}
