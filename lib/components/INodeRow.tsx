import { ItemStatus, OptimisticItemStatus } from "@/lib/types";
import { ChevronDown, ChevronRight, FileText, Folder } from "lucide-react";
import { StatusBadge } from "@/lib/components/StatusBadge";
import { Checkbox } from "@/components/ui/checkbox";
import { useSelectionStore } from "@/lib/hooks/useSelectionStore";

type INodeRowProps = {
  id: string;
  path: string;
  depth: number;
  isFolder: boolean;
  name: string;
  status?: ItemStatus | OptimisticItemStatus;
  expanded?: boolean;
  onToggle?: () => void;
  isRoot?: boolean;
};

export const INodeRow = (props: INodeRowProps) => {
  const {
    id,
    path,
    depth,
    isFolder,
    name,
    status = isFolder ? undefined : ItemStatus.UNINDEXED,
    expanded,
    onToggle,
    isRoot,
  } = props;

  const store = useSelectionStore();

  const checked = isFolder
    ? store.folderCheckState(id, path)
    : store.isFileChecked(path);

  const handleCheckedChange = (checked: boolean) => {
    if (isFolder) {
      store.toggleFolder(id, path, checked);
    } else {
      store.toggleFile(id, path, checked);
    }
  };

  return (
    <div
      className="grid grid-cols-[auto_auto_1fr_auto] items-center gap-2 border-b px-3 py-2 hover:bg-muted/50 last:b-0"
      title={name}
    >
      <Checkbox checked={checked} onCheckedChange={handleCheckedChange} />

      <div
        className={"h6 w-6"}
        style={{
          marginLeft: 16 * depth,
        }}
      >
        {isFolder ? (
          <button
            className="flex h-6 w-6 items-center justify-center rounded hover:bg-muted"
            onClick={isFolder ? onToggle : undefined}
            aria-label={isFolder ? (expanded ? "Collapse" : "Expand") : "File"}
          >
            {expanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
        ) : null}
      </div>

      <div className="flex items-center gap-2 overflow-hidden">
        {isFolder ? (
          <Folder className="min-w-4 min-h-4 h-4 w-4 text-blue-600" />
        ) : (
          <FileText className="min-w-4 min-h-4 h-4 w-4 text-pink-600" />
        )}
        <span className={`truncate ${isRoot ? "font-medium" : ""}`}>
          {name}
        </span>
      </div>

      {status ? (
        <div className="flex justify-end w-[85px]">
          <StatusBadge status={status} />
        </div>
      ) : null}
    </div>
  );
};
