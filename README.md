# K Reaction Booker

Proposal and booking platform for The K Reaction, turning new and returning client inquiries into priced proposals, DM replies, and booked dates.

## Stack

React 19 · TypeScript · Vite 7 · Tailwind CSS 3 · jsPDF + html2canvas (PDF export) · lucide-react

Current state: front-end only, running on seed data (`src/data/seed.ts`). No backend yet.

## Run locally

```bash
npm install
npm run dev      # dev server
npm run build    # type-check + production build
```

## Structure

```
src/
  App.tsx                 # page layout and app state
  types.ts                # Lead, Service, Proposal types
  lib/proposal.ts         # pricing + proposal logic
  data/seed.ts            # sample services and leads
  components/             # intake form, proposal generator, quick replies, etc.
public/brand/             # logo assets
```

## Known issues / backlog

1. **Deposit rule** — proposal deposit is computed as 50% of package price; business rule is a fixed $100. `Service.depositAmount` is also unused by the proposal math.
2. **Performance vs. coverage time** — Live Recording only tracks performance duration; no separate setup/breakdown or total coverage time, and `callTime` is collected but unused.
3. **Over-broad performance detection** — regex in `lib/proposal.ts` matches plain `show`, and Event Recap Videos are always priced as show packages (ignoring the service's base price).
4. **Overlapping tiers** — "Live Recording" and "Live Set Recording" use different package ladders.
5. **Not yet built** — AI message parser, multi-step intake, Supabase persistence, Zustand, React Router, Stripe/Resend integrations.
