"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, MoreHorizontal } from "lucide-react";
import { useSelectionStore } from "@/lib/hooks/useSelectionStore";
import { syncKnowledgeBase } from "@/lib/api/syncKnowledgeBase";
import { useDeindexFiles } from "@/lib/api/deindexFiles";
import { useCreateKnowledgeBase } from "@/lib/api/createKnowledgeBase";
import { useAppStore } from "@/lib/hooks/useAppStore";

type BulkActionsMenuProps = {
  orgId: string;
  connId: string;
};

export function BulkActionsMenu({ connId, orgId }: BulkActionsMenuProps) {
  const queryClient = useQueryClient();
  const createKnowledgeBase = useCreateKnowledgeBase();
  const deindexFiles = useDeindexFiles();

  const kbId = useAppStore((state) => state.knowledgeBaseId);

  const [busy, setBusy] = useState<"index" | "deindex">();

  const store = useSelectionStore();

  const excludedPaths = useMemo(
    () => Array.from(store.excludedPaths.values()),
    [store.excludedPaths],
  );
  const filePathsSelected = useMemo(
    () => Array.from(store.selectedFiles.values()),
    [store.selectedFiles],
  );

  const counts = useMemo(
    () => ({
      folders: store.selectedFolders.size,
      files: store.selectedFiles.size,
      total: store.selectedFolders.size + store.selectedFiles.size,
      excludes: excludedPaths.length,
    }),
    [
      excludedPaths.length,
      store.selectedFiles.size,
      store.selectedFolders.size,
    ],
  );

  const disabledIndex = counts.total === 0 || !!busy;
  const disabledDeindex = !kbId || disabledIndex;

  async function onIndexSelected() {
    try {
      setBusy("index");
      const connectionSourceIds = store.getAllNodes();
      if (connectionSourceIds.length === 0) {
        toast.info("Nothing selected to index");
        return;
      }

      const res = await createKnowledgeBase.mutateAsync({
        connectionId: connId,
        connectionSourceIds,
      });

      await syncKnowledgeBase(res.knowledgeBaseId, orgId);

      // Apply exclusions (if any)
      if (excludedPaths.length) {
        await deindexFiles.mutateAsync({
          kbId: res.knowledgeBaseId,
          resourcePaths: excludedPaths,
        });
      }

      await syncKnowledgeBase(res.knowledgeBaseId, orgId);

      toast.success(
        `Indexing started${excludedPaths.length ? ` — ${excludedPaths.length} file(s) will be excluded` : ""}`,
      );

      store.clearAll();

      await queryClient.invalidateQueries({ queryKey: ["kb"] });
    } catch (e) {
      toast.error((e as Error)?.message ?? e ?? "Failed to index selection");
    } finally {
      setBusy(undefined);
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

      await deindexFiles.mutateAsync({
        kbId,
        resourcePaths: filePathsSelected,
      });

      toast.success("De-indexed selected files");

      store.clearAll();

      await queryClient.invalidateQueries({ queryKey: ["kb"] });
    } catch (e) {
      toast.error((e as Error)?.message ?? e ?? "Failed to de-index selection");
    } finally {
      setBusy(undefined);
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          {busy ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />{" "}
              {busy === "index" ? "Indexing files" : "Unindexing files"}
            </>
          ) : (
            <MoreHorizontal className="h-4 w-4" />
          )}
        </Button>
      </DropdownMenuTrigger>
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
        <DropdownMenuItem disabled={disabledIndex} onClick={onIndexSelected}>
          Start indexing
        </DropdownMenuItem>
        <DropdownMenuItem
          disabled={disabledDeindex}
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
