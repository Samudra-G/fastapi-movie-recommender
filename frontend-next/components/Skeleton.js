import { Skeleton } from "@/components/ui/skeleton";

export const MovieCardSkeleton = () => (
  <div className="flex flex-col gap-2 rounded-xl overflow-hidden">
    <Skeleton className="w-full aspect-[2/3] rounded-xl" />
    <Skeleton className="h-4 w-3/4" />
    <Skeleton className="h-4 w-1/2" />
  </div>
);
