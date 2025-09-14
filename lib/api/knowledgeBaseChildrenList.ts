import { ItemStatus, KBItem, OptimisticItemStatus } from "@/lib/types";
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
      const resourceById = new Map(
        response.data.map((resource) => [resource.resource_id, resource]),
      );

      // Keep optimistic indexed resources while the knowledge base still didn't finish indexing them.
      // This is mainly used for the resources indexing flow. When a knowledge base already exists and the
      // user wants to index more resources, a new knowledge base is created keeping the old resources.
      const optimisticIndexedResources = old.filter(
        (node) =>
          node.status === OptimisticItemStatus.INDEXED &&
          resourceById.get(node.resource_id)?.status !== ItemStatus.INDEXED,
      );

      // Keep optimistic indexed resources while the knowledge base still didn't process them.
      // This is mainly used for the resources indexing flow.
      const optimisticPendingResources = old.filter(
        (node) =>
          node.status === OptimisticItemStatus.PENDING &&
          !resourceById.has(node.resource_id),
      );

      // Keep optimistic unindexed resources while the knowledge base still didn't delete them.
      // This is mainly used for the resources unindexing flow.
      const optimisticUnindexedResources = old.filter(
        (node) =>
          node.status === OptimisticItemStatus.UNINDEXED &&
          resourceById.has(node.resource_id),
      );

      // Remove fresh data in favor of optimistic data in some cases
      const idsToRemove = optimisticIndexedResources
        .map((resource) => resource.resource_id)
        .concat(
          optimisticUnindexedResources.map((resource) => resource.resource_id),
        );

      for (const id of idsToRemove) {
        resourceById.delete(id);
      }

      return [
        ...resourceById.values(),
        ...optimisticIndexedResources,
        ...optimisticPendingResources,
        ...optimisticUnindexedResources,
      ];
    },
    select: (nodes) => {
      const byId = new Map<string, ItemStatus | OptimisticItemStatus>();

      for (const node of nodes) {
        if (node.status) {
          byId.set(node.resource_id, node.status);
        }
      }

      return byId;
    },
    enabled: Boolean(kbId),
    refetchInterval: 3000,
  });
}
