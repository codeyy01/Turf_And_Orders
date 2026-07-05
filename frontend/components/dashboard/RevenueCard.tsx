import { IndianRupee, TrendingUp } from 'lucide-react'

export default function RevenueCard() {
  return (
    <div className="rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 p-6 shadow-md text-white relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
      
      {/* Decorative background element */}
      <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-colors duration-500"></div>

      <div className="relative z-10 flex justify-between items-start">
        <div>
          <p className="text-emerald-50 text-sm font-medium tracking-wide">Today&apos;s Revenue</p>
          <div className="flex items-center mt-2">
            <span className="text-4xl font-bold tracking-tight">₹0</span>
          </div>
        </div>
        
        <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
          <IndianRupee className="w-6 h-6 text-white" />
        </div>
      </div>

      <div className="relative z-10 mt-6 flex items-center space-x-2 text-sm text-emerald-100 bg-white/10 w-max px-3 py-1.5 rounded-full backdrop-blur-md">
        <TrendingUp className="w-4 h-4" />
        <span>+0% from yesterday</span>
      </div>
    </div>
  )
}
