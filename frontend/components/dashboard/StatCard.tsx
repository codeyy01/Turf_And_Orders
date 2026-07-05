import { ReactNode } from 'react'

interface StatCardProps {
  title: string
  value: string
  icon: ReactNode
  trend?: string
  trendUp?: boolean
  gradient: string
}

export default function StatCard({ title, value, icon, trend, trendUp = true, gradient }: StatCardProps) {
  return (
    <div className={`rounded-3xl bg-gradient-to-br ${gradient} p-6 shadow-md text-white relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300`}>
      
      {/* Decorative background element */}
      <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-colors duration-500"></div>

      <div className="relative z-10 flex justify-between items-start">
        <div>
          <p className="text-white/80 text-sm font-medium tracking-wide">{title}</p>
          <div className="flex items-center mt-2">
            <span className="text-3xl font-bold tracking-tight">{value}</span>
          </div>
        </div>
        
        <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
          {icon}
        </div>
      </div>

      {trend && (
        <div className="relative z-10 mt-6 flex items-center space-x-2 text-sm text-white/90 bg-white/10 w-max px-3 py-1.5 rounded-full backdrop-blur-md">
          <span>{trend}</span>
        </div>
      )}
    </div>
  )
}
