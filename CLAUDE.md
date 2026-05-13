# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository layout

Monorepo with three independent packages (each has its own `package.json`, lockfile, and CI include in `.gitlab-ci.yml`):

- `packages/backend` — NestJS 10 + Prisma 5 + PostgreSQL API
- `packages/frontend` — React 19 + Vite 6 + TanStack Query SPA
- `packages/infra` — Pulumi (TypeScript) AWS infrastructure

Node version is pinned to **20** (`.nvmrc`). Backend uses **yarn**; frontend uses **yarn**; infra has both `yarn.lock` and `package-lock.json`.

## Common commands

All commands run from the relevant package directory (`cd packages/backend` or `cd packages/frontend`).

### Backend (`packages/backend`)

```bash
docker-compose up -d              # start local Postgres (port 5432, db "Base-template")
yarn migrate:dev                  # apply Prisma migrations against .env.development
yarn prisma:generate              # regenerate Prisma client after schema changes
yarn start:dev                    # nest start --watch with .env.development
yarn test                         # jest — spins up a Postgres testcontainer (globalSetup)
yarn test -- path/to/file.spec.ts # run a single test file
yarn test -- -t "test name"       # run tests matching a name
yarn test:e2e                     # uses test/jest-e2e.json
yarn lint                         # eslint --fix
yarn build                        # nest build → dist/
```

### Frontend (`packages/frontend`)

```bash
yarn dev                          # vite dev server
yarn test                         # vitest watch
yarn test:run                     # vitest single run
yarn test:run path/to/file.spec.tsx   # single file
yarn lint                         # eslint (max-warnings 0)
yarn tsc                          # type-check only
yarn build                        # tsc && vite build
```

Test files use `*.spec.ts(x)` (configured in both `vite.config.ts` and the backend Jest config).

## Backend architecture

Each feature module follows a **DDD-style layered structure** — see `src/note/` as the canonical example (and `src/simpleExample/` as the original template):

```
note/
  domain/            # Note entity, NoteFactory, NoteFixture, abstract NoteRepository
  repository/        # NotePrismaRepository implements NoteRepository, + DTO assembler
  note.controller.ts # HTTP layer, serializes domain → response DTO
  note.service.ts    # use cases, throws NotFoundException for missing entities
  note.module.ts     # binds NoteRepository → NotePrismaRepository via DI
```

Key conventions:

- **Repository is an abstract class** in `domain/`, bound to a Prisma implementation in the module via `{ provide: NoteRepository, useClass: NotePrismaRepository }`. Services depend on the abstract class — never import the Prisma repo directly.
- **Domain entities** (e.g. `Note.ts`) carry camelCase fields; Prisma DTOs use snake_case (`created_at`, `updated_at`). The repository file defines a `NoteAssembler.fromDto` to translate.
- **Factories** (`NoteFactory.create(...)`) generate `id` (UUID) and timestamps so services never construct entities directly.
- **Fixtures** (`NoteFixture.ts`) use `@faker-js/faker` for tests.
- Controllers serialize dates to ISO strings — domain `Date` objects never leak out of the HTTP layer.

### Testing strategy

- `globalSetup.ts` / `globalTeardown.ts` start a real Postgres via `@testcontainers/postgresql`, run `prisma migrate deploy` against it, and set `DATABASE_URL`. Docker must be running.
- `jest-env.ts` uses `@quramy/jest-prisma` to wrap each test in a transaction that's rolled back — tests share the container but stay isolated.
- Repository specs hit the real DB; controller/service specs typically mock the repository.

## Frontend architecture

Feature-folder layout under `src/`:

```
notes/
  api/         # NotesClient.ts — axios calls + response types
  hooks/       # useNotes, useCreateNote, useUpdateNote, useDeleteNote (TanStack Query)
  components/  # NoteForm, NotesList
  Notes.tsx    # page-level composition
common/
  i18n/        # i18next config (lazy-loaded public/locales/*.json)
  services/    # MonitoringService (Sentry wrapper)
  styles/      # Theme.ts, Styles.ts (custom css() that injects theme), theming.css
  utils/       # QueryClientConfig
routing/Router.tsx   # react-router config; uses LazyLoading() + GlobalErrorBoundary
```

Key conventions (from `packages/frontend/README.md`):

- **Path alias** `@/*` → `src/*` (set in both `tsconfig.json` and `vite.config.ts`).
- **Styling**: Emotion `@emotion/css` for classnames only (not `styled`/`emotion/react`). Use the project's custom `css()` from `common/styles/Styles.ts` to access the theme; combine with `clsx`. Theming is via CSS variables in `theming.css` — no `ThemeProvider`.
- **Data fetching**: TanStack Query v5 hooks per feature. API clients (`*Client.ts`) wrap axios using `VITE_API_URL`.
- **i18n**: single flat JSON per language under `public/locales/`. Tests use `i18nTest.ts` to bypass lazy loading.
- **Monitoring**: route through `MonitoringService.logError/logMessage` rather than calling Sentry directly.
- **React Compiler is enabled** (`babel-plugin-react-compiler` in `vite.config.ts`) — avoid manual `useMemo`/`useCallback` unless profiling shows a need.
- **Testing**: Vitest + Testing Library + `testing-library-selector` (define a `ui` object of selectors per spec) + **Nock** for API mocks (not MSW).

## Environment

- Backend reads env via `@nestjs/config` + `dotenv-cli`. Files: `.env.development`, `.env.production`. `DATABASE_URL` is required.
- Frontend uses Vite env vars prefixed with `VITE_`: `VITE_API_URL`, `VITE_SENTRY_DSN`, `VITE_SENTRY_ORG`, `VITE_SENTRY_PROJECT`.

## CI

GitLab CI (`.gitlab-ci.yml`) runs only on merge requests, with per-package change detection (`packages/backend/**/*` or `packages/frontend/**/*`). Each package contributes its own `.gitlab-ci.yml` via `include:`.
