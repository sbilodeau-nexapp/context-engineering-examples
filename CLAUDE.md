# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository layout

Monorepo with three independent yarn packages under `packages/` — there is no root workspace, each package is installed and built on its own:

- `packages/backend` — NestJS 10 + Prisma 5 + PostgreSQL API
- `packages/frontend` — React 19 + Vite 6 + TanStack Query + react-router 7 SPA
- `packages/infra` — Pulumi (AWS) infrastructure-as-code, plus mjml email templates

Node version is pinned to 20 (`.nvmrc`). CI is GitLab; per-package pipelines are included from `packages/{backend,frontend}/.gitlab-ci.yml`.

## Common commands

All commands run from inside the respective package directory.

### Backend (`packages/backend`)

```bash
yarn install
docker-compose up -d                  # local Postgres on :5432 (db "Base-template")
yarn migrate:dev                      # apply Prisma migrations against .env.development
yarn prisma:generate                  # regenerate Prisma client after schema changes
yarn start:dev                        # nest watch mode with .env.development
yarn test                             # jest unit tests (uses testcontainers — Docker must be running)
yarn test -- path/to/file.spec.ts     # single test file
yarn test -- -t "test name"           # single test by name
yarn test:e2e                         # uses test/jest-e2e.json
yarn lint                             # eslint --fix
yarn build                            # nest build → dist/
```

Unit tests use `@quramy/jest-prisma` plus `@testcontainers/postgresql` — `globalSetup.ts` boots a real Postgres container per run via `test/testContainer.ts`. Tests need Docker available; they are not pure unit tests.

### Frontend (`packages/frontend`)

```bash
yarn install
yarn dev                              # vite dev server
yarn test                             # vitest watch
yarn test:run                         # vitest single run (CI mode)
yarn test:run path/to/file.test.tsx   # single test file
yarn tsc                              # type-check only
yarn lint                             # eslint, --max-warnings 0
yarn build                            # tsc && vite build
```

Requires `VITE_API_URL` (points to backend, defaults to `http://localhost:3000` in dev). Sentry vars (`VITE_SENTRY_DSN`, `VITE_SENTRY_ORG`, `VITE_SENTRY_PROJECT`) are optional but referenced by `MonitoringService` and the Sentry Vite plugin.

### Infra (`packages/infra`)

Pulumi-managed. See `packages/infra/README.md` for the full AWS/Pulumi bootstrap (S3 state bucket, KMS secrets provider, stack init). Local scripts: `yarn tsc`, `yarn lint`, `yarn code-standard`, `yarn generate-emails` (compiles mjml templates in `emails/`).

## Backend architecture

The backend follows a feature-module layout with a hand-rolled hexagonal split inside each module. `note/` is the canonical example to copy when adding a new resource — `simpleExample/` is an older reference with only the domain/repository halves.

A feature module contains:

- `<feature>.module.ts` — NestJS module wiring; binds the abstract repository token to the Prisma implementation: `{ provide: NoteRepository, useClass: NotePrismaRepository }`.
- `<feature>.controller.ts` — HTTP layer. Defines its own `*Response` / `*Payload` interfaces and a local `serialize()` that maps domain → response (e.g. `Date` → ISO string, `created_at` → `createdAt`). **Never leak domain objects or Prisma DTOs through the controller.**
- `<feature>.service.ts` — orchestration; depends only on the abstract repository.
- `domain/` — pure TypeScript: the entity class (`Note.ts`), an abstract repository class used as the DI token (`note.repository.ts`), plus `*Factory.ts` / `*Fixture.ts` helpers for tests.
- `repository/<feature>.prisma.repository.ts` — Prisma implementation of the repository. Uses a local `*Assembler` object to convert Prisma DTOs (snake_case columns) to domain entities (camelCase). Prisma DTO types are derived via `Prisma.validator<Prisma.<model>DefaultArgs>()({})` + `Prisma.<model>GetPayload<...>`.

Cross-cutting infra: `PrismaService` (imported via `PrismaModule` from `prisma.service.ts`), `SentryInterceptor` wired globally via `APP_INTERCEPTOR` in `app.module.ts`, `appConfiguration` loaded by `ConfigModule.forRoot`.

Prisma schema column convention is snake_case (`created_at`, `updated_at`, `is_a_bool`); the assembler is where the camelCase translation lives.

## Frontend architecture

Feature-folder layout under `src/`. The two real features are `helloWorld/` (sample) and `notes/` (CRUD wired to the backend). Each feature folder typically contains:

- `<Feature>.tsx` — entry component, lazy-loaded from `routing/Router.tsx`.
- `api/<Feature>Client.ts` — thin wrapper around the shared `Client` in `common/services/Client.ts` (axios-based). `NotesClient` is the reference pattern. Note the `update` method casts through `Response<T>` because `Client.put`'s typed signature unwraps `.data` but axios returns the full response at runtime — preserve that workaround rather than "fixing" it without updating `Client`.
- `api/types/` — shared request/response types (`Note`, `NotePayload`).
- `components/` — feature-specific UI.
- `__tests__/` — vitest + Testing Library; HTTP is mocked with `nock`.

Global wiring lives in `src/App.tsx`: TanStack Query `QueryClientProvider` (config in `common/utils/QueryClientConfig`), i18n side-effect import, Sentry init via `MonitoringService.init()`, React strict mode. Routes are declared in `src/routing/Router.tsx` using `createBrowserRouter`; new pages are added via `lazy()` + the `LazyLoading` wrapper. `GlobalErrorBoundary` is the route-level fallback; `UnknownRoute` is the catch-all.

Styling uses Emotion's `css` (classname API only — no styled components) wrapped by `@/common/styles/Styles.ts`, which augments the standard signatures with a `(theme: Theme) => …` form. Theme values come from CSS variables defined in `common/styles/theming.css` so theme switches don't re-render the React tree. Use `clsx` for conditional/composed classnames; for values that depend on runtime data, prefer the element's `style` prop over generating new classes.

i18n uses i18next with **a single flat namespace per language** in `public/locales/<lang>.json` (lazy-loaded; French is the fallback). Tests use `i18nTest.ts` which loads English synchronously. Path alias `@/` → `src/` is set up in both Vite and tsconfig.

## Conventions worth knowing

- Both backend and frontend use `eslint-plugin-simple-import-sort` — let the linter own import order; don't hand-sort.
- The backend's `dotenv-cli` pattern (`dotenv -e .env.development -- <cmd>`) is how env files are loaded for dev/migrate scripts. There is no automatic dotenv loading at runtime; production reads from the process env directly.
- The frontend lint script runs with `--max-warnings 0`. New warnings will fail CI.
- `packages/backend/src/simpleExample/` is illustrative scaffolding kept for reference. Real features live in their own module folder (`note/`).
