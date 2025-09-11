import { apiFetch } from "@/lib/helpers/apiFetch";

export async function createKnowledgeBase(
  connectionId: string,
  connectionSourceIds: string[],
) {
  const response = await apiFetch("kb", {
    method: "POST",
    body: JSON.stringify({
      connectionId,
      connectionSourceIds,
    }),
  });

  return response.json();
}
