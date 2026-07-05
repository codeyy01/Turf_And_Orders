'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const OPTIONS = [
  { value: 'turf', label: 'Turf only', sub: 'Football / cricket grounds' },
  { value: 'playstation', label: 'PlayStation only', sub: 'Console rental / gaming cafe' },
  { value: 'both', label: 'Both', sub: 'Runs turf + console gaming' },
] as const

export default function BusinessTypePage() {
  const router = useRouter()
  const supabase = createClient()

  async function selectType(value: string) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase
      .from('owners')
      .update({ business_type: value })
      .eq('id', user.id)

    router.push('/onboarding/business-details')
  }

  return (
    <div className="mx-auto max-w-md p-4">
      <h1 className="mb-4 text-xl font-medium">What do you manage?</h1>
      <div className="space-y-2">
        {OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => selectType(opt.value)}
            className="w-full rounded-lg border p-4 text-left hover:border-brand-500"
          >
            <p className="font-medium">{opt.label}</p>
            <p className="text-sm text-gray-500">{opt.sub}</p>
          </button>
        ))}
      </div>
    </div>
  )
}
