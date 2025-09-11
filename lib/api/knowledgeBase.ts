import { apiFetch } from "@/lib/helpers/apiFetch";

export async function createKnowledgeBase(
  connectionId: string,
  connectionSourceIds: string[],
): Promise<{ knowledgeBaseId: string }> {
  const response = await apiFetch("kb", {
    method: "POST",
    body: JSON.stringify({
      connectionId,
      connectionSourceIds,
    }),
  });

  return response.json()
}

export async function syncKnowledgeBase(kbId: string, orgId: string) {
  const res = await apiFetch(`kb/${kbId}/sync`, {
    method: "POST",
    body: JSON.stringify({
      orgId
    }) ,
  });

  await res.json();
}

export async function deindexFiles(kbId: string, resourcePaths: string[]) {
  if (!resourcePaths.length) return;
  await Promise.all(
    resourcePaths.map((p) =>
      apiFetch(`kb/${kbId}/resources?resource_path=${encodeURIComponent(p)}`, {
        method: "DELETE",
      })
    )
  );
}
