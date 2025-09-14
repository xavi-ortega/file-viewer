import { INodeRow } from "@/lib/components/INodeRow";
import { VirtualizedChildren } from "@/lib/components/VirtualizedChildren";
import { useState } from "react";

type IFolderNodeProps = {
  depth: number;
  label: string;
  connId: string;
  resourceId: string;
  resourcePath: string;
  isRoot?: boolean;
};

export const IFolderNode = (props: IFolderNodeProps) => {
  const { depth, label, connId, resourceId, resourcePath, isRoot } = props;

  const [expanded, setExpanded] = useState(isRoot);

  return (
    <>
      <INodeRow
        id={resourceId}
        path={resourcePath}
        depth={depth}
        isFolder
        name={label}
        expanded={expanded}
        onToggle={() => setExpanded((expanded) => !expanded)}
        isRoot={isRoot}
      />

      {expanded ? (
        <VirtualizedChildren
          depth={depth}
          connId={connId}
          folderId={resourceId}
          folderPath={resourcePath}
        />
      ) : null}
    </>
  );
};
