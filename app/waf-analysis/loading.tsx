import { Skeleton } from "@/components/ui/skeleton"

export default function WAFAnalysisLoading() {
  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
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

        {/* Input Section */}
        <div className="mb-8 border-2 border-dashed border-primary/40 rounded-lg p-8">
          <Skeleton className="w-12 h-12 mx-auto mb-4" />
          <Skeleton className="w-48 h-6 mx-auto mb-2" />
          <Skeleton className="w-64 h-4 mx-auto" />
        </div>

        {/* Results Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="border border-primary/30 rounded-lg p-6">
              <Skeleton className="w-32 h-6 mb-4" />
              <Skeleton className="w-full h-4 mb-2" />
              <Skeleton className="w-full h-4 mb-2" />
              <Skeleton className="w-3/4 h-4" />
            </div>
          ))}
        </div>

        {/* Report Section */}
        <div className="border border-primary/30 rounded-lg p-6">
          <Skeleton className="w-48 h-8 mb-4" />
          <div className="space-y-3">
            <Skeleton className="w-full h-4" />
            <Skeleton className="w-full h-4" />
            <Skeleton className="w-3/4 h-4" />
          </div>
        </div>
      </div>
    </div>
  )
}
