'use client'

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import { format, parseISO, subDays, eachDayOfInterval } from 'date-fns'

type Booking = {
  start_time: string
  amount: number
  status: 'pending' | 'confirmed' | 'cash_pending' | 'cancelled'
}

export default function RevenueChart({ bookings }: { bookings: Booking[] }) {
  // Generate last 7 days including today
  const last7Days = eachDayOfInterval({
    start: subDays(new Date(), 6),
    end: new Date(),
  })

  // Aggregate revenue per day
  const data = last7Days.map((date) => {
    const dayStr = format(date, 'yyyy-MM-dd')
    const dayBookings = bookings.filter(
      (b) => 
        b.start_time.startsWith(dayStr) && 
        (b.status === 'confirmed' || b.status === 'cash_pending')
    )
    const revenue = dayBookings.reduce((sum, b) => sum + (b.amount || 0), 0)
    
    return {
      date: format(date, 'MMM d'),
      revenue,
    }
  })

  return (
    <div className="h-[400px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
          <XAxis 
            dataKey="date" 
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#6b7280', fontSize: 12 }}
            dy={10}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#6b7280', fontSize: 12 }}
            tickFormatter={(value) => `₹${value}`}
            dx={-10}
          />
          <Tooltip 
            cursor={{ fill: '#f9fafb' }}
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            formatter={(value: number) => [`₹${value}`, 'Revenue']}
          />
          <Bar 
            dataKey="revenue" 
            fill="#10b981" 
            radius={[4, 4, 0, 0]} 
            maxBarSize={48}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
