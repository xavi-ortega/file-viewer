import { ItemStatus } from "@/lib/types";
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
  status?: ItemStatus;
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
    status = isFolder ? undefined : ItemStatus.NOT_INDEXED,
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
    <div className="grid grid-cols-[auto_auto_1fr_auto] items-center gap-2 border-b px-3 py-2 hover:bg-muted/50 last:b-0">
      <Checkbox checked={checked} onCheckedChange={handleCheckedChange} />

      <button
        className="flex h-6 w-6 items-center justify-center rounded hover:bg-muted"
        onClick={isFolder ? onToggle : undefined}
        aria-label={isFolder ? (expanded ? "Collapse" : "Expand") : "File"}
      >
        {isFolder ? (
          expanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )
        ) : null}
      </button>

      <div className="flex min-w-0 items-center">
        <span
          style={{ paddingLeft: depth * 16 }}
          className="flex min-w-0 items-center gap-2"
        >
          {isFolder ? (
            <Folder className="h-4 w-4 text-blue-600" />
          ) : (
            <FileText className="h-4 w-4 text-pink-600" />
          )}
          <span className={`truncate ${isRoot ? "font-medium" : ""}`}>
            {name}
          </span>
        </span>
      </div>

      {status ? (
        <div className="flex justify-end">
          <StatusBadge status={status} />
        </div>
      ) : null}
    </div>
  );
};
