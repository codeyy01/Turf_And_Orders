import { Skeleton } from "@/components/ui/Skeleton"

export default function BookingsLoading() {
  return (
    <div className="flex-1 p-8 pt-6 space-y-6">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-10 w-[200px]" />
        <Skeleton className="h-10 w-[150px]" />
      </div>
      
      <div className="rounded-xl border border-zinc-800 bg-black text-white p-6 shadow">
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-8 w-[250px]" />
          <div className="flex space-x-2">
            <Skeleton className="h-10 w-10" />
            <Skeleton className="h-10 w-10" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
        
        <div className="space-y-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex space-x-4">
              <Skeleton className="h-12 w-24 shrink-0" />
              <Skeleton className="h-12 w-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
