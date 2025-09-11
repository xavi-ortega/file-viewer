// lib/components/BulkActionsMenu.tsx
"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, MoreHorizontal } from "lucide-react";
import { useSelectionStore } from "@/lib/hooks/useSelectionStore";
import { createKnowledgeBase, deindexFiles, syncKnowledgeBase } from "@/lib/api/knowledgeBase";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

type BulkActionsMenuProps = {
  orgId: string;
  connId: string;
  kbId?: string | null;
};

export function BulkActionsMenu({ connId, kbId, orgId }: BulkActionsMenuProps) {
  const queryClient = useQueryClient();
  const [busy, setBusy] = useState<"index" | "deindex" | null>(null);

  const store = useSelectionStore()

  const excludedPaths = useMemo(() => Array.from(store.excludedPaths.values()), [store.excludedPaths]);
  const filePathsSelected = useMemo(() => Array.from(store.selectedFiles.values()), [store.selectedFiles]);

  const counts = useMemo(
    () => ({
      folders: store.selectedFolders.size,
      files: store.selectedFiles.size,
      total: store.selectedFolders.size + store.selectedFiles.size,
      excludes: excludedPaths.length,
    }),
    [excludedPaths.length, store.selectedFiles.size, store.selectedFolders.size]
  );

  const disabledIndex = counts.total === 0 || !!busy;
  const disabledDeidx = !kbId || filePathsSelected.length === 0 || !!busy;

  async function onIndexSelected() {
    try {
      setBusy("index");
      const connectionSourceIds = store.getAllNodes();
      if (connectionSourceIds.length === 0) {
        toast.info("Nothing selected to index");
        return;
      }

      const res = await createKnowledgeBase(connId, connectionSourceIds);

      await syncKnowledgeBase(res.knowledgeBaseId, orgId).catch(() => {});


      // Apply exclusions (if any)
      if (excludedPaths.length) {
        await deindexFiles(res.knowledgeBaseId, excludedPaths).catch(() => {});
      }

      toast.success(
        `Indexing started${excludedPaths.length ? ` — ${excludedPaths.length} file(s) will be excluded` : ""}`
      );

      store.clearAll();

      await queryClient.invalidateQueries({ queryKey: ["kb"] });
    } catch (e) {
      toast.error((e as Error)?.message ?? e ?? "Failed to index selection");
    } finally {
      setBusy(null);
    }
  }

  async function onDeindexSelected() {
    if (!kbId) return;
    try {
      setBusy("deindex");

      if (filePathsSelected.length === 0) {
        toast.info("Select files to de-index");
        return;
      }

      await deindexFiles(kbId, filePathsSelected);

      toast.success("De-indexed selected files");

      store.clearAll();

      await queryClient.invalidateQueries({ queryKey: ["kb"] });
    } catch (e) {
      toast.error((e as Error)?.message ?? e ?? "Failed to de-index selection");
    } finally {
      setBusy(null);
    }
  }

  return (
    <DropdownMenu>

        <Tooltip delayDuration={1000}>
          <TooltipTrigger>
            <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              {busy ? <><Loader2 className="h-4 w-4 animate-spin" /> Indexing</> : <MoreHorizontal className="h-4 w-4" />}
            </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent>
            Bulk actions
          </TooltipContent>
        </Tooltip>

      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          {counts.total} selected
          {counts.total > 0 && (
            <span className="block text-xs text-muted-foreground">
              {counts.folders} folders • {counts.files} files
              {counts.excludes ? ` • ${counts.excludes} excluded` : ""}
            </span>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          disabled={disabledIndex}
          onClick={onIndexSelected}
        >
          Start indexing
        </DropdownMenuItem>
        <DropdownMenuItem
          disabled={disabledDeidx}
          onClick={onDeindexSelected}
          title={!kbId ? "Create a KB first" : undefined}
        >
          De-index selected files
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={store.clearAll}
          disabled={counts.total === 0 || !!busy}
        >
          Clear selection
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
