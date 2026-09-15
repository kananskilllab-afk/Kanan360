# Kanan Baroda — 3D Digital Twin

A public, no-login 3D digital twin of Kanan Baroda's five Vadodara branches — open the site, explore branches, floors, and rooms in an interactive Three.js scene, click a room to see its occupancy — plus a single-Super-Admin console that manages everything the public site renders.

**Access model is intentionally binary: PUBLIC (no account, read-only, the entire 3D site) and SUPER_ADMIN (one account, full control, lives at `/admin`).** There is no registration, no other roles, and no way to create a second admin account through the app.

## Status

- **Public 3D site — working.** Landing scene with all 5 branches as interactive buildings (hover stats, click-to-enter), per-branch floor scenes with a procedurally laid-out floor plan (real Area data, no hand-authored artwork yet — see "Floor-plan geometry" below), department-colored rooms, occupancy-tinted seat markers, click-to-open info panel, floor selector, camera toolbar (perspective/top/iso, zoom, reset, fullscreen, seat/label toggles).
- **Admin console — working.** Everything from the pre-pivot build (dashboard, branch CRUD, employee directory, analytics, audit log) now lives behind `/admin`, gated by the one Super Admin login.
- **Not built yet:** the CDR→SVG→GLB import pipeline and floor-plan/3D-asset upload UI, and Floor/Area/Seat admin CRUD forms (Branch CRUD exists; the others are still API-only — see "API" below).

## Stack

- **Client:** React 19, Vite, TypeScript, Tailwind CSS v4, shadcn/ui (Radix), React Router, TanStack Query, Zustand, Framer Motion, Recharts, **React Three Fiber + Three.js + drei** (the public 3D engine).
- **Server:** Node.js, Express 5, TypeScript, MongoDB/Mongoose, JWT auth (access + httpOnly refresh cookie), bcryptjs, Zod validation, Helmet, rate limiting.
- **Shared:** `@kanan-baroda/shared` — enums, wire types, and the `STATUS_CONFIG`/department color tokens every consumer (admin UI, 3D materials, charts) reads from, so a status color can't drift between them.

## Project layout

```
/client   React SPA (Vite) — public 3D site at "/", admin console at "/admin"
/server   Express API — /api/public/* (no auth), /api/admin/* (Super Admin only), /api/auth/*
/shared   Types + theme tokens shared by both
```

## Prerequisites

- Node.js 20+
- A MongoDB instance — **MongoDB Atlas** (recommended), local MongoDB, or run `npm run --workspace server dev:memdb` for a temporary in-memory one (dev only, data lost on stop).

## Setup

```bash
npm install                      # installs client, server, and shared together
cp .env.example server/.env      # fill in MONGODB_URI / JWT secrets
cp .env.example client/.env      # VITE_API_URL — defaults are fine for local dev
```

Generate real secrets for `JWT_SECRET` / `JWT_REFRESH_SECRET` — see `.env.example` for the full variable list. In development, the API also trusts any `http://localhost:<port>` origin regardless of `CLIENT_URL` (Vite's dev port drifts if 5173 is already taken by something else on your machine).

## Running locally

```bash
# Terminal 1 — API (http://localhost:4000)
npm run dev:server

# Terminal 2 — seed demo data (5 branches, ~260 demo employees — safe to re-run)
npm run seed

# Terminal 3 — client
npm run dev:client
```

Open the printed client URL for the **public 3D site**. Go to `/admin` for the **Super Admin console**.

### Super Admin login

The seed script bootstraps exactly one account — **`superadmin@kananbaroda.co` / `Demo@12345`**. Change this password before any real deployment; there is no self-service reset flow yet, so change it directly in the database or re-run the seed with a different hash.

Every seeded Branch/Floor/Area/Seat/Employee document is stamped `isDemoData: true` and none of it represents a real person.

## The public 3D site

- **Landing** (`/`) — all 5 branches as stylized buildings arranged on a grid-lined ground plane. Hover shows a floating stat card (floors, seats, sq. ft., utilization); click flies the camera in and opens that branch.
- **Branch/floor** (`/branch/:code`, `?floor=` to deep-link a specific floor) — a floor plan is laid out procedurally from each Area's `areaSqFt` (a shelf/row bin-packing algorithm — see `client/src/three/layout.ts`), colored by department, with seat markers colored by occupied/available. Click a room for a floating info panel (type, department, floor, branch, sq. ft., capacity, occupied, utilization) — the same public API endpoint (`GET /api/public/areas/code/:areaCode`) a deep link or future QR code would resolve through.
- **Toolbar** — perspective / top / isometric camera presets, zoom, reset, fullscreen, show-seats and show-labels toggles.
- **No employee PII anywhere on the public site** — the public API never returns employee names, emails, or IDs, only aggregate occupancy counts.

### Floor-plan geometry — read before expecting real architecture

There is no CDR/SVG/GLB floor plan yet. Room shapes are **procedurally generated** from each Area's square footage — a real, working stand-in, not a placeholder screen. `Area.areaCode` is still the one identifier that ties the 3D mesh, and eventually a hand-authored SVG/GLB, to its MongoDB record, so swapping in real architecture later only touches `client/src/three/layout.ts` and the geometry that consumes it — no other code changes.

## API

| Prefix | Auth | What's there |
|---|---|---|
| `/api/auth/*` | — | `login`, `refresh`, `logout`, `me` |
| `/api/public/*` | **none** | `overview`, `branches`, `branches/:id`, `floors?branchId=`, `areas?floorId=`, `areas/code/:areaCode` — everything the public 3D site reads |
| `/api/admin/branches` | Super Admin | Full CRUD |
| `/api/admin/floors`, `/areas`, `/departments` | Super Admin | List/create/update (no delete UI yet) |
| `/api/admin/seats` | Super Admin | List/create, `:id/assign`, `:id/unassign` |
| `/api/admin/employees` | Super Admin | List/create/update, `:id/move`, `:id/history` |
| `/api/admin/analytics` | Super Admin | `overview`, `branches`, `utilization` |
| `/api/admin/search` | Super Admin | `?q=` across employees/areas/branches |
| `/api/admin/audit-logs` | Super Admin | Every administrative mutation, append-only |

## Security notes

- Passwords hashed with bcrypt (12 rounds); access tokens are short-lived JWTs kept in memory only on the client (never `localStorage`) — a page refresh re-derives one from the httpOnly refresh cookie. The public site never attempts a session check at all.
- Helmet, a general + tighter auth-specific rate limiter, and CORS (any `localhost` origin in dev, the `CLIENT_URL` allow-list in production) are applied in `server/src/app.ts`.
- Every mutating route validates its body with Zod; every `/api/admin/*` route requires the Super Admin session server-side — the admin UI hiding a button is never the actual boundary.
- `npm audit` reports 0 vulnerabilities as of this writing; a `qs` transitive-dependency advisory is pinned via a root `overrides` entry.

## Known limitation

`shared/` is consumed as raw TypeScript by both apps (works out of the box with Vite and with `tsx` in dev). `npm run build:server`'s `tsc` output does **not** yet bundle `shared`'s compiled output for a standalone Node runtime — that gets solved as part of a future deployment pass, not glossed over here.
