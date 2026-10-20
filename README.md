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
# GEMINI_MODEL=gemini-2.5-flash
```

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
| `GEMINI_MODEL` | no (default `gemini-2.5-flash`) | server |
| `PORT` | no (default `5000`) | server |

`.env` is git-ignored. Never commit real keys.

## Git workflow

- `main` stays deployable. Do work on a branch: `feature/<name>`, `fix/<name>`.
- Keep commits small and focused, and run `npm run typecheck && npm run build` before pushing.
- Open a pull request into `main` and merge after review.
- Database changes go in a **new** file in `supabase/migrations/` (never edit an applied one):
  `npx supabase migration new <name>`.
