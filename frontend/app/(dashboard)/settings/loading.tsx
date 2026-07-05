import { Skeleton } from "@/components/ui/Skeleton"

export default function SettingsLoading() {
  return (
    <div className="flex-1 p-8 pt-6 max-w-4xl space-y-8">
      <div className="space-y-2">
        <Skeleton className="h-10 w-[150px]" />
        <Skeleton className="h-4 w-[300px]" />
      </div>

      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="rounded-xl border border-zinc-800 bg-black text-white p-6 shadow space-y-6">
            <Skeleton className="h-6 w-[200px]" />
            <div className="space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
