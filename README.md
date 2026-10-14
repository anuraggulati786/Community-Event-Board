# Community Events Board

An admin posts local events (music nights, workshops, food fairs); visitors browse, follow
categories and save reminders. Every screen is driven by this project's own JSON API, so a mobile
client could consume exactly the same endpoints later.

**Stack:** Next.js 15 (App Router) · TypeScript · PostgreSQL · Prisma 7 · Tailwind CSS · shadcn/ui
(Radix primitives) · Framer Motion · Zod · JWT (`jose`) · bcrypt.

---

## 1. Run it in under 5 minutes

You need **Node ≥ 20.9** and **any PostgreSQL 14+** (local, Docker, Neon, Supabase — anything works).

```bash
# 1. Dependencies (also runs `prisma generate` via postinstall)
npm install

# 2. PostgreSQL — the fastest route if you don't have a server running:
docker run --name ceb-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=community_events -p 5432:5432 -d postgres:16

# 3. Environment
cp .env.example .env
#    The template already matches the Docker command above.
#    Set real JWT secrets before you deploy anywhere:
#    node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"

# 4. Apply the schema and load the 15 sample events
npm run db:deploy
npm run db:seed

# 5. Start
npm run dev            # → http://localhost:3000
```

That is the whole setup. `db:seed` is safe to run repeatedly — it upserts 15 events with stable ids.

### Admin login

| | |
|---|---|
| URL | http://localhost:3000/admin/login |
| Email | `admin@community.com` |
| Password | `admin123` |

Both are overridable with `ADMIN_EMAIL` / `ADMIN_PASSWORD`; the defaults above are exactly the ones
from the brief so the app works out of the box.

### Environment variables

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Signs visitor tokens (HS256) |
| `ADMIN_JWT_SECRET` | Signs admin tokens — kept separate on purpose |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | The single hard-coded admin identity |
| `SESSION_TTL_SECONDS` | Token lifetime (default 7 days) |

### Useful scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build / serve |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run db:deploy` | Apply committed migrations (non-interactive) |
| `npm run db:migrate` | Create a new migration during development |
| `npm run db:seed` | Load the 15 sample events |
| `npm run db:reset` | Drop, re-migrate and re-seed |
| `npm run db:studio` | Prisma Studio |

---

## 2. API

Every endpoint returns JSON. Success responses are `{ "data": ..., "meta"?: ... }`; errors are
`{ "error": { "message": "...", "code": "..." } }` with a matching HTTP status
(400 validation, 401 unauthorised, 404 not found, 409 conflict, 500 unexpected).

Browsers authenticate with an httpOnly cookie. **Every protected endpoint also accepts
`Authorization: Bearer <token>`**, which is what a mobile app would use.

### Authentication

| Method | Path | Notes |
| --- | --- | --- |
| `POST` | `/api/auth/signup` | `{ email, password }` → creates the user, returns a JWT |
| `POST` | `/api/auth/login` | `{ email, password }` → returns a JWT + sets the cookie |
| `POST` | `/api/auth/logout` | Clears the session cookie |
| `GET` | `/api/auth/me` | Current user, or `401` |

### Events

| Method | Path | Notes |
| --- | --- | --- |
| `GET` | `/api/events` | Active + upcoming only, nearest first. Query: `category`, `city`, `q`, `page`, `pageSize` (default 6). `meta` carries `total`, `totalPages` and `availableCities` |
| `GET` | `/api/events/[id]` | One event. Returns `404` for inactive or past events, matching the listing rule |

### Signed-in user

| Method | Path | Notes |
| --- | --- | --- |
| `POST` | `/api/user/favorites` | `{ categories: ["MUSIC","FOOD"] }` — replaces the user's interests |
| `GET` | `/api/feed` | Upcoming active events in the user's categories. Supports `page` / `pageSize` |
| `GET` | `/api/reminders` | The user's upcoming reminders; `meta.eventIds` hydrates button state |
| `POST` | `/api/reminders` | `{ eventId }` → `201` on create, `200` if it already existed (idempotent) |
| `DELETE` | `/api/reminders?eventId=...` | Removes a reminder |
| `GET` | `/api/card-design/[eventId]` | Saved theme + stickers, or defaults with `saved: false` |
| `POST` | `/api/card-design` | `{ eventId, theme, stickers }` — upserts the design |

### Admin (protected server-side)

| Method | Path | Notes |
| --- | --- | --- |
| `POST` | `/api/admin/login` | `{ email, password }` → admin JWT |
| `POST` | `/api/admin/logout` | Clears the admin cookie |
| `GET` | `/api/admin/events` | All events plus total / active / inactive counts |
| `POST` | `/api/admin/events` | Create an event |
| `PATCH` | `/api/admin/events/[id]` | Edit an event, or flip Active/Inactive |

> There is deliberately **no `DELETE` route** — events are deactivated, never removed.

---

## 3. The three questions

### 3.1 Show your database structure. Why did you design it this way?

Four tables: `users`, `events`, `reminders`, `card_designs` (a `Category` enum and a `CardTheme`
enum constrain the only two closed sets of values).
`events` stands alone — it is admin-authored and never deleted, so it has an `isActive` flag rather
than a delete path. `reminders` and `card_designs` are join tables between `users` and `events`,
each with `UNIQUE(userId, eventId)`, which makes "Remind me" and "save my card" natural idempotent
upserts; both cascade on delete. Interests live on the user as a native `Category[]` array instead
of a fifth table because the set is fixed at five values and is always read or written wholesale.

### 3.2 How does your filter query work, and what index would you add?

All three filters are ANDed onto one base predicate, `isActive = true AND eventDate > now()`.
`category` and `city` are equality matches; `q` becomes a `contains` (`ILIKE '%term%'`) OR across
title and description, so *Music + Coimbatore + "night"* returns only rows matching all three.
The count and the current page are fetched in a single `$transaction`, ordered by `eventDate ASC`
with `skip`/`take` for pagination (6 per page).
The index that matters is the composite **`(isActive, eventDate)`**: it satisfies the predicate and
supplies the sort order, so Postgres never falls back to a sort of the whole table. Because a
`%term%` search cannot use a normal B-tree, I would add a **GIN index with `pg_trgm`** on
`title`/`description` once the table grows; `category` and `city` already have their own indexes for
the filtered variants.

### 3.3 How do you store passwords and protect the admin pages and APIs?

Visitor passwords are hashed with **bcrypt (10 rounds)**; only the hash is ever stored and login uses
`bcrypt.compare`. The admin is a single identity read from the environment and compared with
`crypto.timingSafeEqual`, so neither half of the credential leaks through response timing.
Both sessions are **HS256 JWTs signed with different secrets and different audiences**
(`ceb:user` vs `ceb:admin`), so a visitor token can never be replayed as an admin one; tokens are
kept in `httpOnly`, `SameSite=Lax` cookies (Secure in production).
**Edge middleware** blocks `/admin/*`, `/api/admin/*`, `/feed`, `/onboarding` and the user APIs
before any page or handler runs, and **every protected handler re-checks** with
`requireAdmin()` / `requireUser()` — protection never depends on the client.

---

## 4. Project structure

```
prisma/
  schema.prisma            # models, enums, indexes
  migrations/              # committed SQL migration
  seed.ts                  # the 15 sample events
src/
  app/
    (visitor)/             # public + signed-in pages (events, event details, feed, auth)
    admin/                 # admin pages (dashboard, listing, create, edit)
    api/                   # JSON route handlers — the only thing the UI talks to
  components/
    ui/                    # shadcn/ui primitives
    events/ · feed/ · card-designer/ · admin/ · interests/ · layout/ · states/
  hooks/                   # use-api, use-session, use-reminders
  lib/
    services/              # all data access + business rules (server-only)
    validators/            # Zod schemas shared by API and forms
    auth/                  # tokens, sessions, password hashing
    db/                    # Prisma client + connection
    api/                   # fetch client, error types, response envelope
    format.ts              # ₹ and date formatting (shared with any future client)
  middleware.ts            # edge route protection
```

The UI never imports Prisma. Components call `lib/api/client.ts`, which calls the route handlers,
which call `lib/services/*` — the same boundary a mobile app would sit behind.

---

## 5. AI tools

This project was developed with the assistance of AI-powered coding tools to improve development efficiency. All code, architecture, and functionality were personally reviewed, tested, and verified through build validation and end-to-end functional testing, with identified issues corrected prior to submission.

---

## 6. What is left / deliberate limits

Nothing in the brief is unfinished. These are intentional boundaries, not gaps:

- **No reminder delivery.** "Remind me" stores the reminder and surfaces it in *My Feed*; email or
  push was not requested.
- **No image uploads.** `imageUrl` is a plain URL, as specified; the seed uses `picsum.photos`.
- **Single hard-coded admin**, exactly as the brief asks — admins are not database rows.
- **No account recovery.** Password reset / email verification were not requested, and there is no
  mail provider configured.
- **No committed test suite.** Behaviour was verified against the running app (see §5); the API is
  small enough that the reviewer can exercise it from the table in §2.
