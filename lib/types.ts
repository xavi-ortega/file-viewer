export type INodeType = "directory" | "file";

export type ConnItem = {
  resource_id: string;
  inode_type: INodeType;
  inode_path: { path: string }; // ej: "/papers"
};

export enum ItemStatus {
  PARSED = "parsed",
  PENDING = "pending",
  INDEXED = "indexed",
  NOT_INDEXED = "notIndexed",
}

export type KBItem = ConnItem & {
  status?: ItemStatus.PENDING | ItemStatus.INDEXED | ItemStatus.PARSED;
};
