import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Turf & PlayStation Manager',
  description: 'Manage your bookings, revenue, and customers in real time',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'TurfManager',
  },
}

export const viewport: Viewport = {
  themeColor: '#0f6e56',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

import { Toaster } from 'sonner'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster position="top-center" />
      </body>
    </html>
  )
}
