import { ItemStatus } from "@/lib/types";

type StatusBadgeProps = {
  status: ItemStatus;
};

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  const map: Record<ItemStatus, { text: string; cls: string }> = {
    [ItemStatus.INDEXED]: {
      text: "Indexed",
      cls: "bg-emerald-100 text-emerald-700",
    },
    [ItemStatus.OPTIMISTIC_INDEXED]: {
      text: "Indexed",
      cls: "bg-emerald-100 text-emerald-700",
    },
    [ItemStatus.PENDING]: {
      text: "Indexing…",
      cls: "bg-amber-100 text-amber-700",
    },
    [ItemStatus.PARSED]: {
      text: "Indexing…",
      cls: "bg-amber-100 text-amber-700",
    },
    [ItemStatus.NOT_INDEXED]: {
      text: "Not indexed",
      cls: "bg-muted text-muted-foreground",
    },
  } as const;

  const cfg = map[status] ?? map[ItemStatus.NOT_INDEXED];
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ${cfg.cls}`}
    >
      {cfg.text}
    </span>
  );
};
