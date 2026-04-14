# AGENTS.md

## Repo Reality
- This repo has two independent projects: `cmspro/` (ASP.NET backend) and `cmspro-web/` (Next.js frontend).
- Trust executable sources over plans/docs: use `package.json`, `*.csproj`, `Program.cs`, and `src/app/**` when behavior and docs disagree.
- No CI workflows or pre-commit config are present; checks are manual.

## Backend (`cmspro/`)
- Entry point is `cmspro/CmsPro.API/Program.cs`; current runtime API surface is only `GET /weatherforecast`.
- `CmsPro.API` references `CmsPro.Infrastructure` directly; `CmsPro.Application` exists but currently has no source files and is not referenced.
- EF Core context is `cmspro/CmsPro.Infrastructure/Persistence/ApplicationDbContext.cs`; migrations live in `cmspro/CmsPro.Infrastructure/Migrations/`.
- Run from repo root:
  - `dotnet build cmspro/cmspro.slnx`
  - `dotnet run --project cmspro/CmsPro.API`
  - `dotnet ef migrations add <Name> --project cmspro/CmsPro.Infrastructure --startup-project cmspro/CmsPro.API`
  - `dotnet ef database update --project cmspro/CmsPro.Infrastructure --startup-project cmspro/CmsPro.API`
- There are currently no backend test projects.
- `cmspro/package.json` is not backend build tooling (only a placeholder npm setup with Prisma dependency).
- `cmspro/CmsPro.API/appsettings.json` currently contains a concrete DB connection string; do not add/commit more secrets there. Prefer local env override `ConnectionStrings__Default`.

## Frontend (`cmspro-web/`)
- Stack in code: Next `16.2.1`, React `19`, Tailwind `4`.
- App entry is `cmspro-web/src/app/layout.tsx`; provider wiring is `cmspro-web/src/providers/index.tsx`.
- The current app behavior is local-demo-first: dashboard/public routes read from `cmspro-web/src/lib/local-demo/*` (not live backend endpoints).
- Demo auth is localStorage-based:
  - users: `moderador@cmspro.demo` / `Demo123!`, `editor@cmspro.demo` / `Demo123!`
  - keys: `cmspro-local-session`, `cmspro-local-db`
- If data is mutated outside local-demo service helpers, dispatch `cmspro-local-db-updated` or UI pages will not refresh.
- `NEXT_PUBLIC_DATA_MODE` is documented in spec files but not wired in runtime code.
- Implemented routes: `/`, `/login`, `/testimonials`, `/testimonials/[id]`, `/dashboard`, `/dashboard/testimonials`, `/dashboard/moderation`, `/dashboard/moderation/[id]`.
- Routes referenced in docs/navigation but not implemented as pages include `/register`, `/dashboard/analytics`, and `/dashboard/settings`.
- Run inside `cmspro-web/`:
  - `npm install`
  - `npm run dev`
  - `npm run lint && npm run type-check && npm run build`
  - `npm run test -- --run` (one-shot; plain `npm run test` may stay interactive)
- There are currently no `*.test.*` files.
- Theme uses `data-theme` via `ThemeProvider`; do not switch to class-based dark mode patterns unless you update provider + CSS together.

## Embed Package
- Workspace package path: `cmspro-web/packages/embed`.
- Build from `cmspro-web/` root: `npm run --workspace @cmspro/embed build`.
- Main entry is `cmspro-web/packages/embed/src/widget.tsx`; bundle exports global `window.CmsProWidget`.
- Root frontend `tsconfig.json` excludes `packages/`, so embed code is not covered by `npm run type-check` in `cmspro-web`.
