# Turf & PlayStation Owner Dashboard

Next.js 14 (App Router) + Supabase + PWA starter for the owner-facing
dashboard. Customers still book entirely through WhatsApp — this app
is only for turf/PlayStation owners to manage bookings, revenue, and
settings.

## Setup

1. Install dependencies:
   npm install

2. Copy the env file and fill in your Supabase project details:
   cp .env.local.example .env.local

3. Run the dev server:
   npm run dev

Open http://localhost:3000 — you'll be redirected to /login.

Note: the PWA plugin is disabled in dev mode by design (see
next.config.js). To actually test the install prompt, run:
   npm run build && npm run start

## What's wired up

- OTP phone login via Supabase Auth (app/(auth)/login)
- Session refresh + route protection (middleware.ts)
- Business type picker as the first onboarding step
- Real-time booking calendar using Supabase's postgres_changes
  subscription (hooks/useRealtimeBookings.ts) — the slot turns red
  the instant a customer pays, no refresh needed
- Install-to-home-screen support for both Android (auto prompt) and
  iOS (manual instructions, since Safari doesn't support the
  install event) — components/pwa/InstallPrompt.tsx

## What's a stub, on purpose

- Revenue chart (components/dashboard/RevenueCard.tsx) — wire up
  Recharts once you finalize what breakdown you want (daily/weekly,
  by business type)
- Bookings, Settings pages — layout is there, data isn't wired yet
- lib/types/database.types.ts — generate real types once your schema
  is final: npx supabase gen types typescript --project-id xxx

## Before deploying

- Add real icons to public/icons/ (see the README.md in that folder)
- Set environment variables in Vercel (or wherever you deploy)
- Point Supabase auth phone provider at your SMS provider (Twilio/MSG91)
- Test the Lighthouse PWA score in Chrome DevTools before calling it done
