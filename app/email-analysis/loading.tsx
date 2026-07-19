import { Skeleton } from "@/components/ui/skeleton"

export default function EmailAnalysisLoading() {
  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Skeleton className="w-14 h-14 rounded-lg" />
            <div>
              <Skeleton className="w-48 h-8 mb-2" />
              <Skeleton className="w-64 h-4" />
            </div>
          </div>
          <Skeleton className="w-24 h-9" />
        </div>

        <div className="mb-8 border-2 border-dashed border-primary/40 rounded-lg p-8">
          <Skeleton className="w-12 h-12 mx-auto mb-4" />
          <Skeleton className="w-48 h-6 mx-auto mb-2" />
          <Skeleton className="w-64 h-4 mx-auto" />
        </div>
      </div>
    </div>
  )
}
