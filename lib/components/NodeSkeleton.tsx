import { Skeleton } from "@/components/ui/skeleton";

type NodeSkeletonProps = {
  depth: number;
  rows: number;
};

export const NodeSkeleton = ({ depth, rows }: NodeSkeletonProps) => (
  <div className="space-y-0">
    {Array.from({ length: rows }).map((_, i) => (
      <div
        key={i}
        className="grid grid-cols-[28px_1fr_160px] items-center gap-2 border-b px-3 py-2"
      >
        <div />
        <div
          className="flex min-w-0 items-center"
          style={{ paddingLeft: depth * 16 }}
        >
          <Skeleton className="mr-2 h-4 w-4" />
          <Skeleton className="h-4 w-56" />
        </div>
        <div className="flex justify-end">
          <Skeleton className="h-5 w-20" />
        </div>
      </div>
    ))}
  </div>
);
