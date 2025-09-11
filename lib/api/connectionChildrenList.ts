import { ConnItem } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import { connChildrenKey } from "@/lib/keys";
import { apiFetch } from "@/lib/helpers/apiFetch";

async function listConnChildren(
  connectionId: string,
  resourceId?: string | null,
): Promise<{ data: ConnItem[] }> {
  const searchParams = resourceId
    ? `?resource_id=${encodeURIComponent(resourceId)}`
    : "";

  const res = await apiFetch(
    `connections/${connectionId}/children${searchParams}`,
  );

  if (!res.ok) throw new Error("Failed to list children");

  return res.json();
}

export function useConnChildrenListing(params: {
  connId: string;
  resourceId?: string;
}) {
  const { connId, resourceId } = params;

  return useQuery({
    queryKey: connChildrenKey(connId, resourceId),
    queryFn: async () => {
      const response = await listConnChildren(connId, resourceId);

      return response.data;
    },
    staleTime: 60_000,
  });
}
