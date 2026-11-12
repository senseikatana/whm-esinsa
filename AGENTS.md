# AGENTS.md

Monorepo with two parallel SGA/WMS implementations. Read the per-stack `AGENTS.md` before working inside `withastro/` or `withnext/`.

## Layout

- `withastro/` — Astro 7 (`output: "static"`, per-page SSR via adapter), React islands only inside `/dashboard`, InsForge as backend. Optional Express + Drizzle + libSQL messaging backend in `server/` (port 8787).
- `withnext/` — Next.js 16 + React 19 + InsForge, served through the Cloudflare Worker in `withnext/cloudflare-worker/`.

## Commands (run from each project root)

`withastro/`:

- `bun install` — Bun is the package manager; `bun.lock` is tracked (`package-lock.json` is not).
- `bun run dev` — dev server. Prefer `astro dev --background`; manage with `astro dev stop|status|logs`.
- `bun run check` / `bun run check:server` — typecheck frontend (astro check) / backend (separate `server/tsconfig.json`).
- `bun test` — bun:test. Only `src/i18n/tests/i18n.test.ts` exists today.
- `bun run dev:server` — messaging backend only; needed for the Messaging view and Kitt panel, not for the rest of the dashboard.

`withnext/`:

- `bun run dev` / `bun run build` / `bun run start`
- `bun run check` / `bun run check:fix` — Biome, scoped to `app/**` only (see `withnext/biome.json` `files.includes`).
- `bun run db:*` — wrap `bunx -y @insforge/cli@latest`. Migrations live in `withnext/migrations/` as `<timestamp>_<kebab-case>.sql`; apply with `bun run db:migrate`.
- No test suite.

## Gotchas

- CI lives at the repo root: `.github/workflows/deploy.yml`. GitHub only reads workflows from the root, and the jobs use `working-directory: withnext`. Push/PR run the quality job only; deploys are manual (`gh workflow run deploy.yml`) until `INSFORGE_ACCESS_TOKEN` and `CLOUDFLARE_API_TOKEN` are provisioned as repo secrets.
- `withnext` runs Next.js 16.2 + React 19.2 with APIs that differ from older releases. After `bun install`, read `withnext/node_modules/next/dist/docs/` before writing framework code and heed deprecation notices.
- `withastro` always attaches an adapter. `ASTRO_ADAPTER` selects `netlify | vercel | cloudflare | node`; unset defaults to `node` (standalone), not a fully static build, even though `withastro/AGENTS.md` and `DEPLOY.md` hints say otherwise. Netlify sets it in `netlify.toml`.
- Never run `insforge domains attach senseikatana.com` or `insforge domains dns sync` — it overwrites the records the Cloudflare Worker needs. App URL is `https://whm.senseikatana.com` (worker `whm-withnext-proxy`, upstream `https://8cc79ec9.insforge.site`).
- `withnext` has unreachable layers from an earlier iteration: `app/api/*` (except nothing uses them), `app/lib/apis/*`, `app/lib/queries.ts`, and most of `app/lib/services/*` are not imported by the UI. Verify imports before extending or deleting them.
- `withastro` messaging env vars in `.env.example` do not match what `server/` reads (`WHATSAPP_PHONE_NUMBER_ID` vs `WHATSAPP_PHONE_ID`, `SERVER_PORT` vs `PORT`, etc.). `server/index.ts` also loads `.env` from the CWD, not from `server/`.
- Prisma in `withastro` is vestigial: only `prisma/seed.ts` and an unused `src/lib/prisma.ts` import it; the dashboard persists JSON documents to the InsForge `wms_docs` table instead. Its `prisma:*` scripts are broken (the installed `prisma` is the v8 RC Platform CLI with no `generate` command), and `bun run check` fails on those two files.
- InsForge credentials never go in the repo: app code reads env vars (`.env` / `.env.local`), the CLI reads `.insforge/project.json`. Projects: `astro-awesome-projects` (`https://5xz8euqt.ap-southeast.insforge.app`) and `whm-withnext` (`https://8cc79ec9.ap-southeast.insforge.app`). Prefer the `insforge*` skills over guessing SDK APIs.

## Conventions

- Conventional Commits (`feat:`, `fix:`, `docs(scope):`, `chore:`), Spanish or English, no AI-attribution trailers.
- Branch flow: work locally on `dev`; only `origin/main` exists and only `main` deploys.
- Biome (withnext): double quotes, semicolons, tab indent, 100 line width, auto-organized imports; `noExplicitAny` and `useExhaustiveDependencies` are intentionally off.
- `withastro` public site must stay `.astro` with zero client JS; React islands only for stateful dashboard interactions. Products are cards on the public site and tables (`CrudView`) in the dashboard.
