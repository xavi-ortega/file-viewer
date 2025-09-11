import { useState } from "react";
import { useChildrenListing } from "@/lib/hooks/useChildrenListing";
import { INodeRow } from "@/lib/components/INodeRow";
import { NodeSkeleton } from "@/lib/components/NodeSkeleton";

const nameFromPath = (path: string) => {
  if (!path) return "";

  const parts = path.split("/").filter(Boolean);
  return parts.at(-1) ?? "/";
};

type IFolderNodeProps = {
  depth: number;
  label: string;
  connId: string;
  kbId?: string;
  resourceId: string;
  resourcePath: string;
  isRoot?: boolean;
};

export const IFolderNode = (props: IFolderNodeProps) => {
  const {
    depth,
    label,
    connId,
    kbId = "",
    resourceId,
    resourcePath,
    isRoot,
  } = props;
  const [expanded, setExpanded] = useState(isRoot);

  const { items, isLoading } = useChildrenListing({
    connId,
    kbId,
    resourceId,
    resourcePath,
  });

  return (
    <>
      <INodeRow
        id={resourceId}
        path={resourcePath}
        depth={depth}
        isFolder
        name={label}
        expanded={expanded}
        onToggle={() => setExpanded((v) => !v)}
        isRoot={isRoot}
      />

      {expanded && (
        <>
          {isLoading && <NodeSkeleton depth={depth + 1} rows={5} />}

          {!isLoading &&
            items.map((item) =>
              item.iNodeType === "directory" ? (
                <IFolderNode
                  key={item.resourceId}
                  depth={depth + 1}
                  label={nameFromPath(item.iNodePath)}
                  connId={connId}
                  kbId={kbId}
                  resourceId={item.resourceId}
                  resourcePath={item.iNodePath}
                />
              ) : (
                <INodeRow
                  key={item.resourceId}
                  id={item.resourceId}
                  path={item.iNodePath}
                  depth={depth + 1}
                  isFolder={false}
                  name={nameFromPath(item.iNodePath)}
                  status={item.status}
                />
              ),
            )}
        </>
      )}
    </>
  );
};
