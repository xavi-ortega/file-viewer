import { useConnChildrenListing } from "@/lib/api/connectionChildrenList";
import { useKbChildrenListing } from "@/lib/api/knowledgeBaseChildrenList";
import { ItemStatus } from "@/lib/types";

export function useChildrenListing(params: {
  connId: string;
  kbId: string;
  resourceId?: string;
  resourcePath?: string;
}) {
  const { connId, kbId, resourceId, resourcePath } = params;

  const {
    data: connChildren = [],
    isLoading: connLoading,
    error: connError,
  } = useConnChildrenListing({
    connId,
    resourceId,
  });

  const {
    data: kbChildren = [],
    isLoading: kbLoading,
    error: kbError,
  } = useKbChildrenListing({
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
  };
}
