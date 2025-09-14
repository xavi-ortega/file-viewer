import { NextRequest, NextResponse } from "next/server";
import { stackAiFetch } from "@/lib/helpers/stackAiFetch";

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ kbId: string }> },
) {
  const params = await context.params;
  const body = (await req.json()) as { resourcePaths?: string[] };

  if (!body.resourcePaths) {
    return NextResponse.json(
      { error: "Missing resource to deindex" },
      { status: 400 },
    );
  }

  const res = await Promise.all(
    body.resourcePaths.map((resourcePath) =>
      stackAiFetch(
        `/knowledge_bases/${params.kbId}/resources?resource_path=${encodeURIComponent(resourcePath)}`,
        {
          method: "DELETE",
          body: JSON.stringify({ resource_path: resourcePath }),
        },
      ).then((res) => res.text()),
    ),
  );

  return NextResponse.json({ ok: true, raw: JSON.stringify(res) });
}
