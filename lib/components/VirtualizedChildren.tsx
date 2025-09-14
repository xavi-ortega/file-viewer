import { useEffect } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { IFolderNode } from "@/lib/components/IFolderNode";
import { nameFromPath } from "@/lib/helpers/str";
import { INodeRow } from "@/lib/components/INodeRow";
import { NodeSkeleton } from "@/lib/components/NodeSkeleton";
import { NODES_PER_PAGE } from "@/lib/constants";
import { useConnChildrenListing } from "@/lib/api/connectionChildrenList";
import { useKbChildrenStatus } from "@/lib/api/knowledgeBaseChildrenList";
import { useAppStore } from "@/lib/hooks/useAppStore";

type VirtualizedChildrenProps = {
  depth: number;
  connId: string;
  folderId: string;
  folderPath: string;
};

export const VirtualizedChildren = (props: VirtualizedChildrenProps) => {
  const { depth, connId, folderId, folderPath } = props;

  // const { items, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } =
  //   useChildrenListing({
  //     connId,
  //     resourceId: folderId,
  //     resourcePath: folderPath,
  //   });

  const kbId = useAppStore((state) => state.knowledgeBaseId);

  const {
    data: resources = [],
    isLoading,
    error: connError,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useConnChildrenListing({
    connId,
    resourceId: folderId,
    limit: NODES_PER_PAGE,
  });

  const { data: resourceStatus, error: kbError } = useKbChildrenStatus({
    kbId,
    resourcePath: folderPath,
  });

  const rowVirtualizer = useVirtualizer({
    count: hasNextPage ? resources.length + NODES_PER_PAGE : resources.length,
    estimateSize: () => 41,
    overscan: 5,
    getScrollElement: () => document.body,
  });

  const virtualItems = rowVirtualizer.getVirtualItems();

  useEffect(() => {
    const [lastItem] = virtualItems.toReversed();

    if (!lastItem) {
      return;
    }

    if (
      lastItem.index >= resources.length - 1 &&
      hasNextPage &&
      !isFetchingNextPage
    ) {
      void fetchNextPage();
    }
  }, [
    hasNextPage,
    fetchNextPage,
    resources.length,
    isFetchingNextPage,
    virtualItems,
  ]);

  return (
    <div className={"h-full"}>
      {isLoading ? (
        <NodeSkeleton depth={depth + 1} rows={NODES_PER_PAGE} />
      ) : (
        virtualItems.map((vItem) => {
          const index = vItem.index;
          const isLoader = index >= resources.length;
          const item = resources[index];

          return (
            <div
              key={vItem.key}
              data-index={index}
              ref={rowVirtualizer.measureElement}
            >
              {isLoader ? (
                <NodeSkeleton depth={depth + 1} rows={NODES_PER_PAGE} />
              ) : item.inode_type === "directory" ? (
                <IFolderNode
                  key={item.resource_id}
                  depth={depth + 1}
                  label={nameFromPath(item.inode_path.path)}
                  connId={connId}
                  resourceId={item.resource_id}
                  resourcePath={item.inode_path.path}
                />
              ) : (
                <INodeRow
                  key={item.resource_id}
                  id={item.resource_id}
                  path={item.inode_path.path}
                  depth={depth + 1}
                  isFolder={false}
                  name={nameFromPath(item.inode_path.path)}
                  status={resourceStatus?.get(item.resource_id)}
                />
              )}
            </div>
          );
        })
      )}
    </div>
  );
};
