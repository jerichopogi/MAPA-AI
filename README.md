# MAPA AI

AI travel planning for Filipino travelers: day-by-day itineraries in your
budget, visa checklists for Philippine passports, local recommendations and a
travel assistant.

**Stack:** React + Vite + Tailwind (shadcn/ui) · Express · Supabase (Auth + Postgres) · Google Gemini

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for how the pieces fit together.

## Quick start

Requires **Node.js 20.12+**.

```bash
npm install
cp .env.example .env      # Windows PowerShell: Copy-Item .env.example .env
npm run dev               # http://localhost:5000
```

The landing page works right away. To sign in and save trips you need a
Supabase project (about 5 minutes, free tier is fine).

## 1. Set up Supabase

1. Create a project at [supabase.com/dashboard](https://supabase.com/dashboard).
2. **Create the schema.** Choose one:
   - **SQL editor (simplest):** open *SQL Editor → New query*, paste the contents of
     [`supabase/migrations/20261020000000_init.sql`](supabase/migrations/20261020000000_init.sql), and run it.
   - **Supabase CLI:**
     ```bash
     npx supabase init        # once; keeps the existing migrations folder
     npm run db:link          # pick your project
     npm run db:push          # applies supabase/migrations
     ```
   > The **Direct connection** string (`db.<ref>.supabase.co`) is IPv6-only. On
   > networks without IPv6 (most Philippine ISPs), use the **Session pooler**
   > string from the dashboard's **Connect** button instead
   > (`postgres.<ref>@aws-0-<region>.pooler.supabase.com:5432`).
3. **Add your keys.** Go to *Project Settings → API* and copy them into `.env`:
   ```
   VITE_SUPABASE_URL=https://<project-ref>.supabase.co
   VITE_SUPABASE_ANON_KEY=<anon public key>
   ```
4. **Allow the redirect URLs.** Under *Authentication → URL Configuration*:
   - Site URL: `http://localhost:5000`
   - Redirect URLs: `http://localhost:5000/**` (add your production URL later)
5. *(Optional)* **Google sign-in:** go to *Authentication → Providers → Google* and add
   your Google OAuth client ID and secret.

Restart `npm run dev` after editing `.env`.

> Email confirmation is on by default, so new users get a confirmation link
> before they can sign in. Supabase's built-in email sender is rate-limited;
> for production, add SMTP under *Authentication → Emails*.

## 2. Turn on live AI (optional)

Until a key is set, every AI feature returns realistic **sample data** (marked
with a badge in the UI). To use Gemini:

```
GEMINI_API_KEY=<key from https://aistudio.google.com/apikey>
# GEMINI_MODEL=gemini-3.5-flash-lite        # fast; full Flash models are slower but richer
# GEMINI_FALLBACK_MODEL=gemini-flash-lite-latest  # used when the main model is busy
```

## 3. Payments: Free and Plus plans (optional)

Free users get 3 AI itineraries plus 20 other AI answers a month. **Plus** is a
one-time pass (₱149 for 30 days, ₱1,290 for a year) paid through
[PayMongo](https://paymongo.com) with GCash, Maya or card. Plans and prices
live in [`shared/plans.ts`](shared/plans.ts).

1. Apply [`supabase/migrations/20261020120000_billing.sql`](supabase/migrations/20261020120000_billing.sql).
2. Add `SUPABASE_SERVICE_ROLE_KEY` to `.env` (Supabase → Project Settings → API).
   It is server-only and is what activates plans; usage limits switch on with it.
3. **Test without PayMongo:** leave `PAYMONGO_SECRET_KEY` empty. In development,
   "Get Plus" opens a built-in **test checkout** where you can simulate a paid or
   failed payment. It is disabled in production.
4. **Test with PayMongo:** set `PAYMONGO_SECRET_KEY=sk_test_…`. Checkout redirects
   to PayMongo's hosted page, where test payments are approved without real money.
   Locally, the success page confirms the payment with PayMongo directly.
5. **Production:** use your live key, set `APP_URL`, and add a webhook in
   PayMongo → Developers → Webhooks pointing to `https://<your-domain>/api/billing/webhook`
   with the event `checkout_session.payment.paid`. Put its secret in `PAYMONGO_WEBHOOK_SECRET`.

## 4. Affiliate commissions (optional)

Every AI trip includes **suggested flights, stays and activities**. The AI only
names what to book; the app builds the links in
[client/src/lib/affiliates.ts](client/src/lib/affiliates.ts), so they always go to
the real partner site with your partner ID:

| Partner | Used for | Sign up | Setting |
|---|---|---|---|
| Agoda | Hotels | Agoda Partners | `VITE_AGODA_CID` |
| Booking.com | Hotels | Booking.com Affiliate Partner Programme | `VITE_BOOKING_AID` |
| Klook | Tours & activities | Klook Affiliate Program | `VITE_KLOOK_AID` |
| Cebu Pacific, AirAsia | Flights | Usually via an affiliate network (e.g. Involve Asia) | `VITE_CEBUPACIFIC_LINK`, `VITE_AIRASIA_LINK` |

After approval, open each partner's deep-link tool and, if its format differs
from the default, paste it into the matching `*_LINK` setting
(placeholders: `{query}`, `{from}`, `{to}`, `{id}`, `{url}`). Restart `npm run dev`.
A commission disclosure is shown under every set of suggestions.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | API + Vite dev server with hot reload on :5000 |
| `npm run build` | Builds the client to `dist/public` and the server to `dist/` |
| `npm start` | Runs the production build |
| `npm run typecheck` | TypeScript check across client, server and shared |
| `npm run db:link` / `db:push` | Link a Supabase project / apply migrations (Supabase CLI) |

## Environment variables

| Variable | Required | Used by |
|---|---|---|
| `VITE_SUPABASE_URL` | for sign-in | client + server (token checks) |
| `VITE_SUPABASE_ANON_KEY` | for sign-in | client + server |
| `GEMINI_API_KEY` | no (mock data without it) | server |
| `GEMINI_MODEL` | no (default `gemini-3.5-flash-lite`) | server |
| `GEMINI_FALLBACK_MODEL` | no (default `gemini-flash-lite-latest`) | server |
| `SUPABASE_SERVICE_ROLE_KEY` | for plans & limits | server only |
| `PAYMONGO_SECRET_KEY` | for real checkout | server only |
| `PAYMONGO_WEBHOOK_SECRET` | production | server only |
| `PAYMONGO_METHODS` | no (default `gcash,paymaya,card`) | server |
| `APP_URL` | production | server |
| `PORT` | no (default `5000`) | server |

`.env` is git-ignored. Never commit real keys.

## Git workflow

- `main` stays deployable. Do work on a branch: `feature/<name>`, `fix/<name>`.
- Keep commits small and focused, and run `npm run typecheck && npm run build` before pushing.
- Open a pull request into `main` and merge after review.
- Database changes go in a **new** file in `supabase/migrations/` (never edit an applied one):
  `npx supabase migration new <name>`.
