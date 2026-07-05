'use client'

import { useEffect, useState } from 'react'
import { X } from 'lucide-react'

// Handles both platforms:
//  - Android/Chrome: captures the native beforeinstallprompt event and
//    shows a one-tap "Install app" button.
//  - iOS/Safari: there is no install event to capture (Apple doesn't
//    support it), so we show manual instructions instead.
export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [isIos, setIsIos] = useState(false)
  const [show, setShow] = useState(false)

  useEffect(() => {
    // Check if user previously dismissed the prompt
    const dismissed = localStorage.getItem('pwa-dismissed')
    if (dismissed === 'true') return

    const ios = /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase())
    const standalone = window.matchMedia('(display-mode: standalone)').matches
    setIsIos(ios)

    if (standalone) return // already installed, don't nag

    setShow(true)
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  async function handleInstall() {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    await deferredPrompt.userChoice
    setDeferredPrompt(null)
    setShow(false)
  }

  function handleDismiss() {
    setShow(false)
    localStorage.setItem('pwa-dismissed', 'true')
  }

  if (!show) return null

  return (
    <div className="fixed bottom-24 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-80 rounded-2xl border border-gray-100 bg-white/90 backdrop-blur-xl p-4 shadow-[0_8px_30px_rgb(0,0,0,0.12)] z-[60] flex items-start space-x-3 transition-all">
      <div className="flex-1">
        {isIos ? (
          <p className="text-sm text-gray-700 font-medium leading-snug">
            Install this app on your iPhone: tap the Share icon, then <span className="font-bold text-gray-900">"Add to Home Screen"</span>.
          </p>
        ) : (
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-700 font-medium">Get the full experience</p>
            <button 
              onClick={handleInstall} 
              className="rounded-full bg-emerald-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors"
            >
              Install
            </button>
          </div>
        )}
      </div>
      
      <button 
        onClick={handleDismiss}
        className="text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-full p-1.5 transition-colors flex-shrink-0"
        aria-label="Close"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}
