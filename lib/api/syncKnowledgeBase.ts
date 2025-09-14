import { apiFetch } from "@/lib/helpers/apiFetch";

export async function syncKnowledgeBase(kbId: string, orgId: string) {
  const res = await apiFetch(`kb/${kbId}/sync`, {
    method: "POST",
    body: JSON.stringify({
      orgId,
    }),
  });

  await res.json();
}
