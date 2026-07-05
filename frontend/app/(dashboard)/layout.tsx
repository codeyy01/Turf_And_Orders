"use client";

import InstallPrompt from '@/components/pwa/InstallPrompt'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, CalendarDays, LineChart, Settings } from 'lucide-react'

const navItems = [
  { name: 'Overview', href: '/dashboard', icon: Home },
  { name: 'Bookings', href: '/bookings', icon: CalendarDays },
  { name: 'Revenue', href: '/revenue', icon: LineChart },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#f2f2f7] flex flex-col md:flex-row pb-20 md:pb-0 font-sans">
      
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 h-screen sticky top-0">
        <div className="p-6 border-b border-gray-100">
          <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">TurfManager</h1>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.name} 
                href={item.href}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? 'bg-emerald-50 text-emerald-700 font-semibold' 
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? 'text-emerald-600' : ''}`} />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </nav>
        
        <div className="p-4 border-t border-gray-100">
          <button
            onClick={async () => {
              const { createClient } = await import('@/lib/supabase/client')
              const supabase = createClient()
              await supabase.auth.signOut()
              window.location.href = '/auth/login'
            }}
            className="flex items-center space-x-3 px-4 py-3 w-full rounded-xl transition-all duration-200 text-gray-500 hover:bg-red-50 hover:text-red-600"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-center py-4 mb-4">
            <h1 className="text-lg font-bold bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">TurfManager</h1>
        </header>
        
        {children}
      </main>

      {/* iOS-Style Bottom Tab Bar for Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-gray-200 pb-safe z-50">
        <div className="flex justify-around items-center h-16 px-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.name} 
                href={item.href}
                className="flex flex-col items-center justify-center w-full h-full space-y-1"
              >
                <item.icon className={`w-6 h-6 transition-colors duration-200 ${isActive ? 'text-emerald-600' : 'text-gray-400'}`} />
                <span className={`text-[10px] font-medium transition-colors duration-200 ${isActive ? 'text-emerald-600' : 'text-gray-400'}`}>
                  {item.name}
                </span>
              </Link>
            )
          })}
        </div>
      </nav>

      <InstallPrompt />
    </div>
  )
}
