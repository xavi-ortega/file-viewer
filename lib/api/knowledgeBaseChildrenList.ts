import { ItemStatus, KBItem } from "@/lib/types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { kbChildrenKey } from "@/lib/keys";
import { apiFetch } from "@/lib/helpers/apiFetch";

async function listKbChildren(
  kbId: string,
  resourcePath?: string,
): Promise<{
  data: KBItem[];
}> {
  const searchParams = resourcePath
    ? `?resource_path=${encodeURIComponent(resourcePath)}`
    : "";

  const res = await apiFetch(`kb/${kbId}/children${searchParams}`);

  if (!res.ok) throw new Error("Failed to list KB children");

  return res.json();
}

export function useKbChildrenStatus(params: {
  kbId: string;
  resourcePath?: string;
}) {
  const { kbId, resourcePath } = params;

  const queryClient = useQueryClient();

  const queryKey = kbChildrenKey(kbId, resourcePath);

  return useQuery({
    queryKey,
    queryFn: async () => {
      const response = await listKbChildren(kbId, resourcePath);

      const old = queryClient.getQueryData<KBItem[]>(queryKey) ?? [];
      const newIds = response.data.map((resource) => resource.resource_id);

      // if there was one cached element that was pending, keep it in case the knowledge base didn't yet sync
      return [
        ...old.filter(
          (node) =>
            (node.status === ItemStatus.PENDING ||
              node.status === ItemStatus.OPTIMISTIC_INDEXED) &&
            !newIds.includes(node.resource_id),
        ),
        ...response.data,
      ];
    },
    select: (nodes) => {
      const byId = new Map<string, ItemStatus>();

      for (const node of nodes) {
        if (node.status) {
          byId.set(node.resource_id, node.status);
        }
      }

      return byId;
    },
    enabled: Boolean(kbId),
    refetchInterval: 1000,
  });
}
