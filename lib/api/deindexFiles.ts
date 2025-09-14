import { apiFetch } from "@/lib/helpers/apiFetch";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { KBItem, OptimisticItemStatus } from "@/lib/types";
import { isKbKey } from "@/lib/keys";
import { toast } from "sonner";

async function deindexFiles(params: { kbId: string; resourcePaths: string[] }) {
  const { kbId, resourcePaths } = params;

  if (!resourcePaths.length) return;

  return apiFetch(`kb/${kbId}/deindex`, {
    method: "DELETE",
    body: JSON.stringify({ resourcePaths }),
  });
}

export function useDeindexFiles() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deindexFiles,
    onMutate: ({ kbId, resourcePaths }) => {
      const snapshots = queryClient.getQueriesData<KBItem[]>({
        predicate: (q) => isKbKey(q.queryKey, kbId),
      });

      for (const [key, data] of snapshots) {
        const resources = data?.map((resource) => {
          if (resourcePaths.includes(resource.inode_path.path)) {
            return {
              ...resource,
              status: OptimisticItemStatus.UNINDEXED,
            };
          }

          return resource;
        });

        queryClient.setQueryData(key, resources);
      }

      return {
        kbId,
        snapshots,
      };
    },
    onSuccess: (_, variables) => {
      return queryClient.invalidateQueries({
        predicate: (q) => isKbKey(q.queryKey, variables.kbId),
      });
    },
    onError: (err, _, ctx) => {
      if (ctx?.snapshots) {
        queryClient.setQueriesData(
          {
            predicate: (query) => isKbKey(query.queryKey, ctx.kbId),
          },
          [],
        );

        for (const [key, snap] of ctx.snapshots) {
          queryClient.setQueryData(key, snap);
        }
      }

      toast.error(
        err instanceof Error ? err.message : "Failed to deindex files",
      );
    },
  });
}
