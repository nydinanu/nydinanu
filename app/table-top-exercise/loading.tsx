export default function Loading() {
  return (
    <div className="min-h-screen bg-background pt-32 pb-16 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block mb-4 p-4 bg-primary/20 rounded-lg">
          <div className="w-8 h-8 border-3 border-primary/40 border-t-primary rounded-full animate-spin" />
        </div>
        <p className="text-primary font-bold">Loading Table Top Exercises...</p>
      </div>
    </div>
  )
}
