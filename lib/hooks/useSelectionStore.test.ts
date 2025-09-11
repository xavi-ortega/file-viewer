import { useSelectionStore } from "@/lib/hooks/useSelectionStore";

const resetStore = () => {
  useSelectionStore.setState({
    selectedFolders: new Map(),
    selectedFiles: new Map(),
    excludedPaths: new Set(),
  });
};

describe("useSelectionStore selection logic", () => {
  beforeEach(() => resetStore());

  it("selecting a folder marks the folder as checked and descendants as checked (unless excluded)", () => {
    const s = useSelectionStore.getState();

    // select folder /a
    s.toggleFolder("a", "/a", true);

    // folder state
    expect(s.folderCheckState("a", "/a")).toBe(true);

    // a file under /a should appear checked
    expect(s.isFileChecked("/a/f.txt")).toBe(true);
  });

  it("excluding a file under a selected folder makes the folder indeterminate and the file unchecked", () => {
    const s = useSelectionStore.getState();
    s.toggleFolder("a", "/a", true);

    // exclude file
    s.toggleFile("f1", "/a/f.txt", false);

    expect(s.isFileChecked("/a/f.txt")).toBe(false);
    expect(s.folderCheckState("a", "/a")).toBe("indeterminate");
  });

  it("re-including an excluded file under a selected folder restores folder to checked", () => {
    const s = useSelectionStore.getState();
    s.toggleFolder("a", "/a", true);
    s.toggleFile("f1", "/a/f.txt", false); // exclude
    s.toggleFile("f1", "/a/f.txt", true); // include again

    expect(s.isFileChecked("/a/f.txt")).toBe(true);
    expect(s.folderCheckState("a", "/a")).toBe(true);
  });

  it("a folder under a selected ancestor should be considered checked", () => {
    const s = useSelectionStore.getState();
    s.toggleFolder("a", "/a", true);

    // /a/b is covered by /a
    expect(s.folderCheckState("b", "/a/b")).toBe(true);
  });

  it("a parent folder becomes indeterminate if it has selected descendants but itself is not selected", () => {
    const s = useSelectionStore.getState();

    // select a file /c/x.txt without selecting /c
    s.toggleFile("fx", "/c/x.txt", true);

    // /c should be indeterminate
    expect(s.folderCheckState("c", "/c")).toBe("indeterminate");
  });

  it("getAllNodes returns selected folders + files not under any selected folder", () => {
    const s = useSelectionStore.getState();
    // select folder /a
    s.toggleFolder("a", "/a", true);
    // select a file under /a => should be ignored in final list
    s.toggleFile("f1", "/a/child.pdf", true);
    // select a file outside /a => should be included
    s.toggleFile("f2", "/b/other.pdf", true);

    const nodes = s.getAllNodes();
    // must contain folder id 'a' and file id 'f2', but not 'f1'
    expect(nodes).toContain("a");
    expect(nodes).toContain("f2");
    expect(nodes).not.toContain("f1");
  });

  it("deselecting a folder clears exclusions under it", () => {
    const s = useSelectionStore.getState();
    s.toggleFolder("a", "/a", true);
    s.toggleFile("f1", "/a/excluded.txt", false); // exclude under /a

    // should be indeterminate
    expect(s.folderCheckState("a", "/a")).toBe("indeterminate");

    // deselect folder /a -> exclusions under /a should be cleared
    s.toggleFolder("a", "/a", false);

    // now no ancestor, and exclusions under /a are meaningless/cleared
    // folderCheckState should be false (no selection nor descendants)
    expect(s.folderCheckState("a", "/a")).toBe(false);
  });

  it("selecting root checks everything unless excluded", () => {
    const s = useSelectionStore.getState();

    // select root
    s.toggleFolder("__root__", "/", true);

    expect(s.folderCheckState("__root__", "/")).toBe(true);
    expect(s.isFileChecked("/any/depth/file.txt")).toBe(true);

    // exclude a path under root
    s.toggleFile("fx", "/any/depth/file.txt", false);
    expect(s.isFileChecked("/any/depth/file.txt")).toBe(false);
    expect(s.folderCheckState("__root__", "/")).toBe("indeterminate");
  });

  it("should resets all state", () => {
    const s = useSelectionStore.getState();
    s.toggleFolder("a", "/a", true);
    s.toggleFile("f2", "/b/x.pdf", true);
    s.clearAll();

    expect(
      Array.from(useSelectionStore.getState().selectedFolders.entries()).length,
    ).toBe(0);
    expect(
      Array.from(useSelectionStore.getState().selectedFiles.entries()).length,
    ).toBe(0);
    expect(
      Array.from(useSelectionStore.getState().excludedPaths.values()).length,
    ).toBe(0);
  });
});
