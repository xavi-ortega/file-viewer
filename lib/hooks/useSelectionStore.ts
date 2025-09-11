import { create } from "zustand";

type State = {
  selectedFolders: Map<string, string>;
  selectedFiles: Map<string, string>;
  excludedPaths: Set<string>;
};

type Actions = {
  /**
   * Selects or deselects an entire folder.
   * - When selecting, adds the folder to `selectedFolders` and clears any exclusions under that path.
   * - When deselecting, removes the folder from `selectedFolders` and clears exclusions under that path.
   *
   * @param id Folder resource id.
   * @param path Folder resource path.
   * @param checked `true` to select the folder, `false` to deselect it.
   */
  toggleFolder: (id: string, path: string, checked: boolean) => void;
  /**
   * Selects or deselects a single file.
   * - If the file is under a selected folder, toggles its presence in `excludedPaths`
   *   (so it can be excluded without unselecting the whole folder).
   * - Otherwise, toggles the file in `selectedFiles`.
   *
   * @param id File resource id.
   * @param path File resource path.
   * @param checked `true` to select the file, `false` to deselect it.
   */
  toggleFile: (id: string, path: string, checked: boolean) => void;
  /**
   * Determines whether a file should appear checked in the UI.
   * - If any ancestor folder is selected, the file is considered checked unless its path is excluded.
   * - Otherwise, it is checked only if present in `selectedFiles`.
   *
   * @param path File resource path.
   * @returns `true` if the file should be shown as checked; `false` otherwise.
   */
  isFileChecked: (path: string) => boolean;
  /**
   * Computes the checkbox state for a folder.
   * - Returns `true` if:
   *   a) the folder is explicitly selected in `selectedFolders`, or
   *   b) the folder lies under any selected ancestor folder,
   *   AND there are no exclusions (`excludedPaths`) within this folder subtree.
   * - Returns `"indeterminate"` if:
   *   a) the folder is not selected but there are selected items beneath it, or
   *   b) the folder is selected and there are exclusions beneath it.
   * - Returns `false` otherwise.
   *
   * @param id Folder resource id.
   * @param path Folder resource path.
   * @returns `true` | `false` | `"indeterminate"` for the folder checkbox.
   */
  folderCheckState: (id: string, path: string) => boolean | "indeterminate";
  /**
   * Builds the final list of `resource_id`s to send as `connection_source_ids`
   * when creating the Knowledge Base.
   * - Includes all selected folders.
   * - Includes selected files that are NOT under any selected folder (to avoid duplication).
   *
   * @returns Array of resource_ids
   */
  getAllNodes: () => string[];
  /**
   * Clears all selection state: folders, files, and exclusions.
   */
  clearAll: () => void;
};

const isDescendantPath = (child: string, parent: string) => {
  if (parent === "/") return child !== "/";

  const p = parent.endsWith("/") ? parent : parent + "/";
  return child.startsWith(p);
};

export const useSelectionStore = create<State & Actions>((set, get) => ({
  selectedFolders: new Map(),
  selectedFiles: new Map(),
  excludedPaths: new Set(),

  toggleFolder: (id, path, checked) =>
    set((state) => {
      const folders = new Map(state.selectedFolders);
      const files = new Map(state.selectedFiles);
      const excluded = new Set(state.excludedPaths);

      if (checked) {
        folders.set(id, path);

        for (const p of Array.from(excluded)) {
          if (isDescendantPath(p, path)) {
            excluded.delete(p);
          }
        }
      } else {
        folders.delete(id);

        for (const p of Array.from(excluded)) {
          if (isDescendantPath(p, path)) {
            excluded.delete(p);
          }
        }
      }

      return {
        selectedFolders: folders,
        selectedFiles: files,
        excludedPaths: excluded,
      };
    }),

  toggleFile: (id, path, checked) =>
    set((state) => {
      const folders = state.selectedFolders;
      const files = new Map(state.selectedFiles);
      const excl = new Set(state.excludedPaths);

      const hasSelectedAncestor = Array.from(folders.values()).some(
        (fp) => isDescendantPath(path, fp) || path === fp,
      );

      if (hasSelectedAncestor) {
        if (checked) {
          excl.delete(path);
        } else {
          excl.add(path);
        }
      } else {
        if (checked) {
          files.set(id, path);
        } else {
          files.delete(id);
        }
      }

      return {
        selectedFolders: new Map(folders),
        selectedFiles: files,
        excludedPaths: excl,
      };
    }),

  isFileChecked: (path) => {
    const { selectedFolders, selectedFiles, excludedPaths } = get();

    const hasAncestor = Array.from(selectedFolders.values()).some(
      (fp) => isDescendantPath(path, fp) || path === fp,
    );

    if (hasAncestor) return !excludedPaths.has(path);

    return Array.from(selectedFiles.values()).includes(path);
  },
  folderCheckState: (id, path) => {
    const { selectedFolders, selectedFiles, excludedPaths } = get();

    const isSelected = selectedFolders.has(id);

    const hasSelectedAncestor = Array.from(selectedFolders.values()).some(
      (fp) => isDescendantPath(path, fp) || path === fp,
    );

    if (isSelected || hasSelectedAncestor) {
      const hasExcludedDescendant = Array.from(excludedPaths.values()).some(
        (p) => isDescendantPath(p, path) || p === path,
      );

      return hasExcludedDescendant ? "indeterminate" : true;
    }

    const hasSelectedDescendant =
      Array.from(selectedFolders.values()).some((fp) =>
        isDescendantPath(fp, path),
      ) ||
      Array.from(selectedFiles.values()).some((p) => isDescendantPath(p, path));

    return hasSelectedDescendant ? "indeterminate" : false;
  },

  getAllNodes: () => {
    const folders = Array.from(get().selectedFolders.keys());
    const folderPaths = Array.from(get().selectedFolders.values());
    const files = Array.from(get().selectedFiles.entries())
      .filter(
        ([, path]) =>
          !folderPaths.some((fp) => isDescendantPath(path, fp) || path === fp),
      )
      .map(([id]) => id);

    return [...folders, ...files];
  },

  clearAll: () =>
    set({
      selectedFolders: new Map(),
      selectedFiles: new Map(),
      excludedPaths: new Set(),
    }),
}));
