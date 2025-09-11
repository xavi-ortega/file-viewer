"use client";

import { IFolderNode } from "@/lib/components/IFolderNode";
import { BulkActionsMenu } from "@/lib/components/BulkActionsMenu";

type FilerViewerProps = {
  title: string;
  orgId: string;
  connId: string;
  kbId?: string;
};

export const INodeViewer = (props: FilerViewerProps) => {
  const { title, orgId, connId, kbId } = props;

  return (
    <div className="mx-auto max-w-5xl p-4">
      <div className="mb-2 flex items-center justify-between rounded-md border bg-background px-3 py-2">
        <div className="text-sm font-medium">{title}</div>
        <BulkActionsMenu orgId={orgId} connId={connId} kbId={kbId} />
      </div>

      <div className="overflow-hidden rounded-lg border">
        <IFolderNode
          depth={0}
          label={title}
          connId={connId}
          kbId={kbId}
          resourceId={""}
          resourcePath="/"
          isRoot
        />
      </div>
    </div>
  );
};
