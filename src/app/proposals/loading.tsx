import { Skeleton } from "@/components/ui/skeleton";

export default function ProposalsLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="border-b h-14" />
      <div className="mx-auto max-w-2xl px-4 py-10">
        <Skeleton className="h-8 w-32 mb-8" />
        <div className="space-y-1 mb-6">
          <Skeleton className="h-3 w-24 mb-3" />
          <div className="rounded-lg border overflow-hidden divide-y">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between px-4 py-3 bg-background">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="space-y-1.5">
                    <Skeleton className="h-3.5 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
