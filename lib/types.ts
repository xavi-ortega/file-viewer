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
  UNINDEXED = "unindexed",
}

export enum OptimisticItemStatus {
  INDEXED = "optimisticIndexed",
  PENDING = "optimisticPending",
  UNINDEXED = "optimisticUnindexed",
}

export type KBItem = ConnItem & {
  status?: ItemStatus | OptimisticItemStatus;
};
