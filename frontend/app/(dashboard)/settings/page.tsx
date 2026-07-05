'use client'

import { useState, useEffect } from 'react'
import { Save, LogOut, Download, QrCode } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { QRCodeCanvas } from 'qrcode.react'

export default function SettingsPage() {
  const supabase = createClient()
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [businessId, setBusinessId] = useState<string | null>(null)
  const [locationId, setLocationId] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    businessName: '',
    phone: '',
    pricePerSlot: '1000',
    minDurationMins: '60',
    slotIntervalMins: '60'
  })

  useEffect(() => {
    async function loadSettings() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      let { data: businessArr } = await supabase
        .from('businesses')
        .select('*')
        .eq('owner_id', user.id)
        .limit(1)
        
      let business = businessArr && businessArr.length > 0 ? businessArr[0] : null
        
      let targetBusiness = business
      let targetLocation = null

      if (!targetBusiness) {
        // Auto-setup business directly in frontend
        const { data: newBiz, error: bizErr } = await supabase
          .from('businesses')
          .insert({ owner_id: user.id, name: 'My Turf', phone: '+919999999999' })
          .select()
          .single()

        if (bizErr) {
          toast.error("Failed to create business: " + bizErr.message)
        } else {
          targetBusiness = newBiz
          
          const { data: newLoc, error: locErr } = await supabase
            .from('locations')
            .insert({
              business_id: targetBusiness.id,
              name: 'Main Ground',
              address: '123 Turf Street',
              default_price: 1000,
              min_duration_mins: 60,
              slot_interval_mins: 60
            })
            .select()
            .single()

          if (locErr) {
            toast.error("Failed to create location: " + locErr.message)
          } else {
            targetLocation = newLoc
            toast.success("Initial profile created automatically!")
          }
        }
      } else {
        const { data: locArr } = await supabase
          .from('locations')
          .select('*')
          .eq('business_id', targetBusiness.id)
          .limit(1)
        targetLocation = locArr && locArr.length > 0 ? locArr[0] : null
      }

      if (targetBusiness && targetLocation) {
        setBusinessId(targetBusiness.id)
        setLocationId(targetLocation.id)
        setFormData({
          businessName: targetLocation.name,
          phone: targetBusiness.phone || '',
          pricePerSlot: targetLocation.default_price.toString(),
          minDurationMins: targetLocation.min_duration_mins.toString(),
          slotIntervalMins: targetLocation.slot_interval_mins.toString()
        })
      } else {
        toast.error("Could not load Business or Location data.")
      }
      setIsLoading(false)
    }
    loadSettings()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!businessId || !locationId) {
      toast.error('Cannot save: Business or Location profile is missing.')
      return
    }
    setIsSaving(true)
    
    try {
      // Update business (currently we don't have business name, location name is used for now)
      // but we can update the phone if needed (though it says disabled in UI)
      
      // Update location
      const { error } = await supabase
        .from('locations')
        .update({
          name: formData.businessName,
          default_price: parseFloat(formData.pricePerSlot),
          min_duration_mins: parseInt(formData.minDurationMins),
          slot_interval_mins: parseInt(formData.slotIntervalMins)
        })
        .eq('id', locationId)

      if (error) throw error
      toast.success('Settings saved successfully')
    } catch (error: any) {
      toast.error('Failed to save settings: ' + error.message)
    } finally {
      setIsSaving(false)
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    window.location.href = '/auth/login'
  }

  const handleDownloadQR = () => {
    const canvas = document.getElementById('whatsapp-qr') as HTMLCanvasElement
    if (!canvas) return
    const pngUrl = canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream')
    const downloadLink = document.createElement('a')
    downloadLink.href = pngUrl
    downloadLink.download = `${formData.businessName || 'turf'}-qr.png`
    document.body.appendChild(downloadLink)
    downloadLink.click()
    document.body.removeChild(downloadLink)
  }

  if (isLoading) {
    return <div className="p-8">Loading settings...</div>
  }

  return (
    <div className="space-y-6 max-w-4xl pb-24">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500">
          Manage your business details, pricing, and booking intervals.
        </p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <form onSubmit={handleSave} className="divide-y divide-gray-200">
          <div className="p-6 space-y-6">
            <h2 className="text-lg font-medium text-gray-900">Business Profile</h2>
            
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Turf Name</label>
                <input
                  type="text"
                  required
                  value={formData.businessName}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-emerald-500 sm:text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">WhatsApp Number</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-emerald-500 sm:text-sm bg-gray-50 cursor-not-allowed"
                  disabled
                />
                <p className="mt-1 text-xs text-gray-500">Contact support to change the registered Meta API number.</p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <h2 className="text-lg font-medium text-gray-900">Booking & Pricing</h2>
            
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Default Slot Price (₹)</label>
                <input
                  type="number"
                  required
                  value={formData.pricePerSlot}
                  onChange={(e) => setFormData({ ...formData, pricePerSlot: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-emerald-500 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Minimum Duration (Minutes)</label>
                <select
                  value={formData.minDurationMins}
                  onChange={(e) => setFormData({ ...formData, minDurationMins: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-emerald-500 sm:text-sm"
                >
                  <option value="30">30 Mins</option>
                  <option value="60">60 Mins</option>
                  <option value="90">90 Mins</option>
                  <option value="120">120 Mins</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Slot Interval Generation (Minutes)</label>
                <select
                  value={formData.slotIntervalMins}
                  onChange={(e) => setFormData({ ...formData, slotIntervalMins: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-emerald-500 sm:text-sm"
                >
                  <option value="30">Every 30 Mins (e.g. 1:00, 1:30)</option>
                  <option value="60">Every Hour (e.g. 1:00, 2:00)</option>
                </select>
                <p className="mt-1 text-xs text-gray-500">How frequently start times are offered to users on WhatsApp.</p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div className="flex items-center space-x-2">
              <QrCode className="w-5 h-5 text-gray-700" />
              <h2 className="text-lg font-medium text-gray-900">WhatsApp QR Code</h2>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Print this QR code and place it at your turf. Customers can scan it to immediately start booking on WhatsApp.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-8 bg-gray-50 p-6 rounded-xl border border-gray-100">
              <div className="bg-white p-4 rounded-xl shadow-sm">
                <QRCodeCanvas 
                  id="whatsapp-qr"
                  value={`https://wa.me/${formData.phone.replace('+', '')}?text=Book%20${encodeURIComponent(formData.businessName || 'My Turf')}`} 
                  size={160} 
                  level="H"
                  includeMargin={true}
                  bgColor="#ffffff"
                  fgColor="#000000"
                />
              </div>
              <div className="flex flex-col space-y-3 items-center sm:items-start">
                <button
                  type="button"
                  onClick={handleDownloadQR}
                  className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download QR Code
                </button>
                <p className="text-xs text-gray-500 text-center sm:text-left">
                  High-quality PNG format for printing.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-6 flex justify-end rounded-b-xl">
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center justify-center rounded-md border border-transparent bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {isSaving ? (
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <Save className="mr-2 -ml-1 h-4 w-4" />
              )}
              {isSaving ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        </form>
      </div>
      
      {/* Mobile Logout Button */}
      <div className="md:hidden mt-8">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center space-x-2 py-3 border border-red-200 text-red-600 bg-red-50 rounded-xl font-medium"
        >
          <LogOut className="w-5 h-5" />
          <span>Log Out</span>
        </button>
      </div>
    </div>
  )
}
