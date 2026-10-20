# Architecture

MAPA AI is a single-repo web app: a React frontend, a thin Express API for AI
calls, and Supabase for authentication and data.

```
┌──────────────────────────── Browser ─────────────────────────────┐
│  React + Vite (client/)                                           │
│                                                                   │
│   pages ──► hooks/use-auth ──────────────┐                        │
│        ├──► hooks/use-trips ─────────────┼──► supabase-js ───────┼──► Supabase
│        │                                 │    (anon key + user    │    ├─ Auth (email, Google)
│        └──► lib/api (Bearer token) ──┐   │     session JWT)       │    └─ Postgres + RLS
└──────────────────────────────────────┼───┴────────────────────────┘        ▲
                                       │ POST /api/ai/*                      │ verify token
                                       ▼                                     │ (auth.getUser)
                     ┌──────────── Express (server/) ───────────────┐        │
                     │ middleware/auth.ts ──────────────────────────┼────────┘
                     │ routes.ts → ai/index.ts ─┬─► ai/gemini.ts ───┼──► Google Gemini
                     │                          └─► ai/mock.ts      │    (when GEMINI_API_KEY set)
                     └──────────────────────────────────────────────┘
```

## Responsibilities

| Layer | Owns | Does not own |
|---|---|---|
| **Supabase Auth** | Sign-up, sign-in, Google OAuth, email confirmation, password reset, sessions | — |
| **Supabase Postgres** | `profiles`, `trips`, `package_requests`, with Row Level Security | AI calls |
| **Express** | `/api/ai/*` endpoints, serving the client (Vite in dev, static files in prod) | User data, sessions |
| **React client** | UI, form validation, talking to Supabase directly for CRUD | Secrets |
| **`shared/`** | Zod schemas + types used by both sides, static reference data (airports, countries, cities) | — |

### Why the client talks to Supabase directly

Trip CRUD is plain row reads/writes, and Row Level Security
(`auth.uid() = user_id`) already enforces ownership in the database. Routing it
through Express would add code without adding safety.

### Why AI calls go through Express

The Gemini key must stay on the server. Every `/api/ai/*` route requires a
valid Supabase access token (`Authorization: Bearer …`), which the server
verifies with `supabase.auth.getUser()`, so anonymous traffic can't spend the
AI quota. No Supabase secret is needed on the server; the anon key is enough
to verify tokens.

### Mock-first AI

`server/ai/index.ts` routes each feature to Gemini when `GEMINI_API_KEY` is set
and to `server/ai/mock.ts` otherwise. Responses are wrapped as
`{ source: "gemini" | "mock", data }`, and the UI shows a **Sample data** badge
for mock answers. Adding a key is the only change needed to go live.

Gemini runs in JSON mode (`responseMimeType: "application/json"`), so responses
parse reliably without the regex repair the old code needed.

### Billing

`shared/plans.ts` defines the Free limits and Plus passes. AI routes run
`quota(feature)` after auth: Free users over their monthly limit get HTTP 402
(`quota_exceeded`), which opens the upgrade dialog in the client; each
successful call writes an `ai_usage` row.

Checkout (`server/billing/`) creates a `payments` row, then a PayMongo Checkout
Session (or the dev-only test checkout). A pass is activated by the
`activate_payment()` SQL function, which is idempotent and callable only with
the service-role key. It is triggered by the PayMongo webhook in production,
and by `/api/billing/confirm` on the success page, which works locally where
webhooks can't reach. Users can read, but never write, `subscriptions`,
`payments` and `ai_usage`.

## Data model

See [`supabase/migrations/`](../supabase/migrations). Summary:

- **profiles** (`id` → `auth.users.id`): created automatically by a trigger on sign-up.
- **trips**: one saved trip with both itineraries stored as `jsonb`, plus `status` and `notes`.
- **package_requests**: Travel Package Quote form submissions.

All tables have RLS enabled. A user can only read and write rows where
`user_id = auth.uid()`.

## Folder layout

```
client/            React app (Vite root)
  src/
    pages/         One file per route
    components/    layout/, trips/, ui/ (shadcn), shared bits
    hooks/         use-auth (Supabase session), use-trips (CRUD)
    lib/           supabase client, api client, constants, utils
server/
  index.ts         Express entry
  config.ts        Env loading + feature flags
  routes.ts        /api routes
  middleware/      Supabase token verification
  ai/              Gemini client, prompts, mock data, service entry
shared/            Zod schemas, types, reference data
supabase/
  migrations/      SQL schema + RLS policies
docs/              This file
```

## Request flow: "Generate itineraries"

1. `pages/plan-trip.tsx` validates the form with `generateTripSchema` (shared).
2. `lib/api.ts` POSTs to `/api/ai/generate-trip` with the user's access token.
3. `middleware/auth.ts` verifies the token with Supabase.
4. `routes.ts` re-validates the body with the same schema.
5. `ai/index.ts` calls Gemini (or the mock) and returns `{ source, data }`.
6. On **Save trip**, `hooks/use-trips.ts` inserts the row straight into Supabase; RLS stamps and checks `user_id`.
