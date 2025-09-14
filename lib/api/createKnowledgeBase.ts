import { apiFetch } from "@/lib/helpers/apiFetch";
import {
  QueryClient,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ConnItem,
  ItemStatus,
  KBItem,
  OptimisticItemStatus,
} from "@/lib/types";
import { useSelectionStore } from "@/lib/hooks/useSelectionStore";
import { useAppStore } from "@/lib/hooks/useAppStore";
import { isConnKey, isKbKey } from "@/lib/keys";

function isChild(child: string, parent: string) {
  if (parent === "/") {
    return child !== "/";
  }

  const parts = child.split(`${parent}/`);

  if (parts.length > 1) {
    return !parts[1].includes("/");
  }

  return false;
}

function parentFolder(path: string) {
  const i = path.lastIndexOf("/");

  return i <= 0 ? "/" : path.slice(0, i);
}

function populateKbFolderCache(
  queryClient: QueryClient,
  allResources: ConnItem[],
  kbId: string,
  folder: string,
  excluded: Set<string>,
) {
  const childrenFolders: string[] = [];
  const childrenFiles: KBItem[] = [];

  for (const resource of allResources) {
    if (
      isChild(resource.inode_path.path, folder) &&
      !excluded.has(resource.inode_path.path)
    ) {
      if (resource.inode_type === "file") {
        childrenFiles.push({ ...resource, status: ItemStatus.PENDING });
      } else {
        childrenFolders.push(resource.inode_path.path);
      }
    }
  }

  if (childrenFiles.length > 0) {
    queryClient.setQueryData(
      ["kb", "children", { kbId, resourcePath: folder }],
      childrenFiles,
    );
  }

  for (const folder of childrenFolders) {
    populateKbFolderCache(queryClient, allResources, kbId, folder, excluded);
  }
}

async function createKnowledgeBase({
  connectionId,
  connectionSourceIds,
}: {
  connectionId: string;
  connectionSourceIds: string[];
}): Promise<{ knowledgeBaseId: string }> {
  const response = await apiFetch("kb", {
    method: "POST",
    body: JSON.stringify({
      connectionId,
      connectionSourceIds,
    }),
  });

  return response.json();
}

export function useCreateKnowledgeBase() {
  const queryClient = useQueryClient();

  const { knowledgeBaseId: kbId, setKnowledgeBaseId: setKbId } = useAppStore();
  const excludedPaths = useSelectionStore((state) => state.excludedPaths);

  return useMutation({
    mutationFn: (variables: {
      connectionId: string;
      connectionSourceIds: string[];
    }) => {
      const previousData = queryClient.getQueriesData<KBItem[]>({
        predicate: (q) => isKbKey(q.queryKey, kbId),
      });

      // We want to keep the already indexed resource paths in the new knowledge base
      const alreadyIndexedIds = previousData.flatMap(([, data]) => {
        return data?.map((resource) => resource.resource_id) ?? [];
      });

      return createKnowledgeBase({
        connectionId: variables.connectionId,
        connectionSourceIds:
          variables.connectionSourceIds.concat(alreadyIndexedIds),
      });
    },
    onMutate: async (variables) => {
      await queryClient.cancelQueries({
        predicate: (q) => isKbKey(q.queryKey, kbId),
      });

      const snapshots = queryClient.getQueriesData<KBItem[]>({
        predicate: (q) => isKbKey(q.queryKey, kbId),
      });

      // We want to keep the already indexed resource paths in the new knowledge base
      const alreadyIndexedResourcePaths = snapshots.flatMap(([, data]) => {
        return data?.map((resource) => resource.inode_path.path) ?? [];
      });

      const connPages = queryClient.getQueriesData<{
        pages: { data: ConnItem[] }[];
      }>({ predicate: (q) => isConnKey(q.queryKey) });

      const resourceById = new Map<string, ConnItem>();
      const resourceByPath = new Map<string, ConnItem>();
      const allResources = [];

      for (const [, cache] of connPages) {
        const items = cache?.pages?.flatMap((p) => p.data) ?? [];

        for (const item of items) {
          allResources.push(item);
          resourceById.set(item.resource_id, item);
          resourceByPath.set(item.inode_path.path, item);
        }
      }

      const selectedFolderPaths = new Set<string>();
      const selectedFilePaths = new Set<string>();

      for (const id of variables.connectionSourceIds) {
        if (id === "") {
          selectedFolderPaths.add("/");
          continue;
        }

        const resource = resourceById.get(id);

        if (!resource) continue;

        if (resource.inode_type === "directory") {
          selectedFolderPaths.add(resource.inode_path.path);
        } else {
          selectedFilePaths.add(resource.inode_path.path);
        }
      }

      for (const folder of selectedFolderPaths) {
        populateKbFolderCache(
          queryClient,
          allResources,
          kbId,
          folder,
          excludedPaths,
        );
      }

      for (const path of selectedFilePaths) {
        const parent = parentFolder(path);
        const queryKey = ["kb", "children", { kbId, resourcePath: parent }];
        const snapshot = queryClient.getQueryData<KBItem[]>(queryKey) ?? [];
        const resource = resourceByPath.get(path);

        if (resource && resource.inode_type !== "directory") {
          queryClient.setQueryData(queryKey, [
            ...snapshot,
            { ...resource, status: OptimisticItemStatus.PENDING },
          ]);
        }
      }

      for (const path of alreadyIndexedResourcePaths) {
        const parent = parentFolder(path);
        const queryKey = ["kb", "children", { kbId, resourcePath: parent }];
        const snapshot = queryClient.getQueryData<KBItem[]>(queryKey) ?? [];
        const resource = resourceByPath.get(path);

        if (resource && resource.inode_type !== "directory") {
          queryClient.setQueryData(queryKey, [
            ...snapshot,
            { ...resource, status: OptimisticItemStatus.INDEXED },
          ]);
        }
      }

      return { kbId, snapshots };
    },
    onSuccess: async ({ knowledgeBaseId: newKbId }) => {
      // When a new knowledge base is created, we populate it with the optimistic update of the old one.
      // This is done because when the knowledge base hasn't sync yet, the files will show as not indexed,
      // while they are actually being indexed.
      const oldKbCache = queryClient.getQueriesData<KBItem[]>({
        predicate: (q) => isKbKey(q.queryKey, kbId),
      });

      for (const [key, oldCache] of oldKbCache) {
        const newKey = key.map((part) => {
          if (part && typeof part === "object" && "kbId" in part) {
            return {
              ...part,
              kbId: newKbId,
            };
          }

          return part;
        });

        queryClient.setQueryData(newKey, oldCache);
      }

      setKbId(newKbId);

      return queryClient.invalidateQueries({
        predicate: (q) => isKbKey(q.queryKey, newKbId),
      });
    },
    onError: (err, _, ctx) => {
      if (ctx) {
        // bring back the old knowledge base
        setKbId(ctx.kbId);

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
        err instanceof Error ? err.message : "Failed to start indexing",
      );
    },
  });
}
