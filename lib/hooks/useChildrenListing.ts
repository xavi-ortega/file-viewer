import { useConnChildrenListing } from "@/lib/api/connectionChildrenList";
import { useKbChildrenStatus } from "@/lib/api/knowledgeBaseChildrenList";
import { ItemStatus } from "@/lib/types";
import { NODES_PER_PAGE } from "@/lib/constants";
import { useAppStore } from "@/lib/hooks/useAppStore";

export function useChildrenListing(params: {
  connId: string;
  resourceId?: string;
  resourcePath?: string;
}) {
  const { connId, resourceId, resourcePath } = params;

  const kbId = useAppStore((state) => state.knowledgeBaseId);

  const {
    data: connChildren = [],
    isLoading: connLoading,
    error: connError,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useConnChildrenListing({
    connId,
    resourceId,
    limit: NODES_PER_PAGE,
  });

  const {
    data: kbChildren = [],
    isLoading: kbLoading,
    error: kbError,
  } = useKbChildrenStatus({
    kbId,
    resourcePath,
  });

  const items = connChildren.map((item) => {
    const kbItem = kbChildren.find((k) => k.resource_id === item.resource_id);

    const status = kbItem?.status ?? ItemStatus.NOT_INDEXED;

    return {
      resourceId: item.resource_id,
      iNodeType: item.inode_type,
      iNodePath: item.inode_path.path,
      status,
    };
  });

  return {
    items,
    isLoading: connLoading || kbLoading,
    error: connError || kbError,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  };
}
