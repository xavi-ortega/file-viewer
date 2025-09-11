import { NextResponse } from "next/server";
import { stackAiFetch } from "@/lib/helpers/stackAiFetch";
import { setKbId } from "@/lib/helpers/cookies";

export async function POST(req: Request) {
  const body = await req.json();

  const payload = {
    connection_id: body.connectionId,
    connection_source_ids: body.connectionSourceIds,
    name: "Test Knowledge Base",
    description:
      "This is a test knowledge base for Stack AI take home challenge",
    indexing_params: {
      ocr: false,
      unstructured: true,
      embedding_params: {
        embedding_model: "text-embedding-ada-002",
        api_key: null,
      },
      chunker_params: {
        chunk_size: 1500,
        chunk_overlap: 500,
        chunker: "sentence",
      },
    },
    org_level_role: null,
    cron_job_id: null,
  };

  const res = await stackAiFetch("/knowledge_bases", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const json = await res.json();

  const knowledgeBaseId = json.knowledge_base_id;

  void setKbId(knowledgeBaseId);

  return NextResponse.json({
    knowledgeBaseId,
  });
}
