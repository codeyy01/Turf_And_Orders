import { Skeleton } from "@/components/ui/Skeleton"

export default function RevenueLoading() {
  return (
    <div className="flex-1 p-8 pt-6 space-y-6">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-10 w-[200px]" />
        <Skeleton className="h-10 w-[150px]" />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="rounded-xl border border-zinc-800 bg-black text-white p-6 shadow">
            <Skeleton className="h-5 w-32 mb-4" />
            <Skeleton className="h-8 w-24 mb-2" />
            <Skeleton className="h-4 w-40" />
          </div>
        ))}
      </div>
      
      <div className="rounded-xl border border-zinc-800 bg-black text-white p-6 shadow">
        <Skeleton className="h-6 w-40 mb-6" />
        <div className="space-y-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex justify-between items-center py-2 border-b border-zinc-800 last:border-0">
              <Skeleton className="h-5 w-[150px]" />
              <Skeleton className="h-5 w-[100px]" />
              <Skeleton className="h-5 w-[120px]" />
              <Skeleton className="h-6 w-16" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
