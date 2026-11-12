# AGENTS.md

WarehouseFlow SGA — Next.js 16 + React 19 + Neon Postgres + Better Auth.
Single app at the repository root (the old `withastro/` and `withnext/` split no longer exists).

## Layout

- `app/` — App Router. The UI is client-side (`app/App.tsx`), route handlers live under `app/api/`.
- `app/lib/` — auth (Better Auth), Postgres pool, CRUD services, seed data.
- `db/migrations/` — SQL migrations applied by `scripts/db-migrate.ts`.
- `db/seeds/` — idempotent demo data applied by `scripts/seed.ts`.
- `docs/AUTH.md` — auth flow, roles, OAuth setup.

## Commands

- `nub install` — Nub is the package manager (`nub.lock`).
- `nub run dev` — Next dev server on port 3000.
- `nub run build` / `nub run start`
- `nub run check` / `nub run check:fix` — Biome, scoped to `app/**`.
- `nub run db:auth:migrate` — creates/updates Better Auth tables.
- `nub run db:migrate` — applies `db/migrations/*.sql` once, tracked in `schema_migrations`.
- `nub run db:seed` — demo catalog + the six demo accounts (idempotent).
- `nub run db:setup` — the three above, in order.

## Auth rules

- `app/lib/auth.ts` is server-only. Never import it from a client component; use `app/lib/auth-client.ts`.
- Every route handler that touches data must go through `withAuth` (reads) or `withWriteAuth` (writes) from `app/lib/api-auth.ts`.
- `viewer` is read-only; the API enforces it (REST and GraphQL mutations).
- Public sign-ups get `viewer`; promote roles in the database. Unknown or inactive accounts fail closed in `getSessionUser`.
- Roles are `input: false` in Better Auth. Role changes happen in the database, never from the browser.
- Demo credentials live in `app/lib/seeds/accounts.ts` and are rendered by `LoginPage` from that same module.

## Gotchas

- `DATABASE_URL` and `BETTER_AUTH_SECRET` are required at runtime. Missing `DATABASE_URL` fails fast in `app/lib/db.ts` instead of silently pointing somewhere else.
- `pg` is in `serverExternalPackages` (see `next.config.ts`); do not import `app/lib/db.ts` from client code.
- SQL is built only from allowlisted table/column names (`app/lib/table-columns.ts`). Add new columns there before exposing them through the CRUD API.
- `nub install` enforces a 24h minimum release age. If a freshly published package is blocked, pick the previous patch or exempt it explicitly instead of disabling the gate.
- `withastro`-era leftovers: `app/lib/apis/*`, `app/lib/queries.ts`, `app/lib/services/api-manager.ts` and most `app/lib/services/*` are not imported by the UI. Verify imports before extending or deleting them.
- The Neon project provisioned by the agent is claimable and expires unless claimed. Claiming rotates `DATABASE_URL`; update the env afterwards.
- OAuth buttons read `/api/auth-config`; if a provider is not configured the button stays disabled. There are no app-level `GOOGLE_CLIENT_ID` reads anywhere else.

## Conventions

- Conventional Commits (`feat:`, `fix:`, `docs(scope):`, `chore:`), Spanish or English, no AI-attribution trailers.
- Biome: double quotes, semicolons, tab indent, 100 line width, auto-organized imports; `noExplicitAny` is off.
- Public UI stays in Spanish; code identifiers, comments and commit messages in English.
- Do not commit `.env*` files (`.env.example` is committed).
