import { ItemStatus, OptimisticItemStatus } from "@/lib/types";

type StatusBadgeProps = {
  status: ItemStatus | OptimisticItemStatus;
};

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  let cfg = {
    text: "Not indexed",
    cls: "bg-muted text-muted-foreground",
  };

  switch (status) {
    case ItemStatus.INDEXED:
    case OptimisticItemStatus.INDEXED:
      cfg = {
        text: "Indexed",
        cls: "bg-emerald-100 text-emerald-700",
      };
      break;
    case ItemStatus.PENDING:
    case ItemStatus.PARSED:
    case OptimisticItemStatus.PENDING:
      cfg = {
        text: "Indexing…",
        cls: "bg-amber-100 text-amber-700",
      };
      break;
  }

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ${cfg.cls}`}
    >
      {cfg.text}
    </span>
  );
};
