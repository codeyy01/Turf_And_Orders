import { Skeleton } from "@/components/ui/Skeleton"

export default function DashboardLoading() {
  return (
    <div className="flex-1 p-8 pt-6 space-y-4">
      <div className="flex items-center justify-between space-y-2 mb-6">
        <Skeleton className="h-10 w-[200px]" />
      </div>
      
      {/* Cards Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-xl border border-zinc-800 bg-black text-white p-6 shadow">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-4 w-4" />
            </div>
            <Skeleton className="h-8 w-32 mt-2" />
            <Skeleton className="h-4 w-40 mt-2" />
          </div>
        ))}
      </div>
      
      {/* Chart Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-4">
        <div className="col-span-4 rounded-xl border border-zinc-800 bg-black text-white p-6 shadow">
          <Skeleton className="h-6 w-32 mb-4" />
          <Skeleton className="h-[350px] w-full" />
        </div>
        <div className="col-span-3 rounded-xl border border-zinc-800 bg-black text-white p-6 shadow">
          <Skeleton className="h-6 w-48 mb-4" />
          <div className="space-y-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="ml-4 space-y-1">
                  <Skeleton className="h-4 w-[150px]" />
                  <Skeleton className="h-4 w-[100px]" />
                </div>
                <div className="ml-auto">
                  <Skeleton className="h-5 w-16" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
