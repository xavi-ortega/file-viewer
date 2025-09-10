export async function createKnowledgeBase(
  connectionId: string,
  connectionSourceIds: string[],
) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/kb`, {
    method: "POST",
    cache: "no-store",
    body: JSON.stringify({
      connectionId,
      connectionSourceIds,
    }),
  });

  return response.json();
}
