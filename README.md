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
one-time pass (₱149 for 30 days, ₱1,290 for a year) paid with **PayPal**
(PayPal balance or any Visa/Mastercard, charged in PHP). Plans and prices live in
[`shared/plans.ts`](shared/plans.ts).

1. Apply the billing migrations in [`supabase/migrations/`](supabase/migrations).
2. Add `SUPABASE_SERVICE_ROLE_KEY` to `.env` (Supabase → Project Settings → API).
   It is server-only and is what activates plans; usage limits switch on with it.
3. **Test without PayPal:** leave the PayPal settings empty. In development,
   "Get Plus" opens a built-in **test checkout** where you can simulate a paid or
   failed payment. It is disabled in production.
4. **Test with PayPal Sandbox:** at [developer.paypal.com](https://developer.paypal.com)
   → *Apps & Credentials* → **Sandbox**, open the *Default Application* and copy the
   **Client ID** and **Secret** into `PAYPAL_CLIENT_ID` / `PAYPAL_CLIENT_SECRET`
   (`PAYPAL_ENV=sandbox`). Under *Testing Tools → Sandbox Accounts* you'll find a
   **Personal** test buyer — log in with it on the PayPal page. No real money moves.
5. **Go live:** create a *Live* app, use its credentials with `PAYPAL_ENV=live`, and
   set `APP_URL`. The pass is activated when PayPal returns the buyer to
   `/billing/success`, where the server captures the payment; a buyer who
   approves but never returns is never charged.

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

## 5. Sharing, reminders, limits and Taglish

- **Shareable trips.** On a trip page, **Share** creates a private link
  (`/s/<random token>`) that anyone can open without an account. It shows the
  itinerary and booking links, but never notes, emails or dates. Messenger and
  Viber show a preview (title and photo). **Stop sharing** kills the link.
- **Trip reminders.** Set a **departure date** on a trip to get emails 30 and 7
  days before you fly (visa deadline, packing list, booking links). The server
  checks every hour and sends each reminder once. Add `RESEND_API_KEY` (and a
  verified `EMAIL_FROM`) to send for real; without it reminders are only logged.
  Reminders need `SUPABASE_SERVICE_ROLE_KEY` and a server that stays running.
- **AI limits (every plan).** 10 AI requests per minute and 100 per day per user
  (day resets at midnight Philippine time). Change them in `AI_RATE_LIMITS` in
  [`shared/plans.ts`](shared/plans.ts).
- **English / Taglish.** The EN/TL switch (app sidebar; the public homepage stays English) changes the main
  interface text and makes every AI answer reply in Taglish. Translations live in
  [`client/src/lib/i18n.tsx`](client/src/lib/i18n.tsx); untranslated text falls
  back to English.

## Deploy to Vercel

Import the repository with its root directory set to the repository root.
The checked-in `vercel.json` selects the Vite frontend in `dist/public`,
routes `/api/*` to the Express function, and supports direct links to app pages.
Shared-trip links also pass through the function for social previews.
The Node server bundle in `dist/index.js` is for standalone hosting and must
not be served as the site's homepage.

Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in Vercel's environment
settings before building. Add the other service keys as needed, and set
`APP_URL` to the production URL. Allow that URL in Supabase's authentication
redirect settings. Changing `VITE_*` values requires a new build.

The persistent server's hourly reminder timer does not run in the Vercel
function; automatic reminder emails require a separately scheduled worker.

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
| `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET` | for real checkout | server only |
| `PAYPAL_ENV` | no (default `sandbox`) | server |
| `PAYMONGO_SECRET_KEY` | alternative to PayPal | server only |
| `APP_URL` | production | server |
| `RESEND_API_KEY`, `EMAIL_FROM` | for reminder emails | server only |
| `PORT` | no (default `5000`) | server |

`.env` is git-ignored. Never commit real keys.

## Git workflow

- `main` stays deployable. Do work on a branch: `feature/<name>`, `fix/<name>`.
- Keep commits small and focused, and run `npm run typecheck && npm run build` before pushing.
- Open a pull request into `main` and merge after review.
- Database changes go in a **new** file in `supabase/migrations/` (never edit an applied one):
  `npx supabase migration new <name>`.
