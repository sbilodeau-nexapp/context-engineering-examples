# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository layout

Monorepo with three independent Yarn packages (no root workspace — each package has its own `yarn.lock` and is installed/built separately):

- `packages/backend` — NestJS 10 + Prisma 5 + PostgreSQL API
- `packages/frontend` — React 19 + Vite 6 + Vitest 3 SPA
- `packages/infra` — Pulumi (TypeScript) IaC for AWS (separate sub-stacks: `ci-cd/`, `docker-registry/`, `emails/`)

Node version is pinned to 20 via `.nvmrc`. GitLab CI definitions live in each package's `.gitlab-ci.yml`, aggregated by the root `.gitlab-ci.yml`.

## Common commands

All commands run from inside the package directory (`cd packages/<pkg>`).

### Backend (`packages/backend`)

```bash
docker-compose up -d              # start local Postgres (required for dev/tests)
yarn start:dev                    # nest start --watch with .env.development
yarn migrate:dev                  # prisma migrate dev
yarn prisma:generate              # regenerate Prisma client
yarn test                         # jest (uses Testcontainers — Docker must be running)
yarn test -- path/to/file.spec.ts # single test file
yarn test -- -t "test name"       # single test by name
yarn test:e2e                     # jest with test/jest-e2e.json
yarn lint                         # eslint --fix on src/apps/libs/test
```

Jest is configured inline in `package.json` (`rootDir: src`, `testRegex: .*\.spec\.ts$`). `globalSetup.ts` / `globalTeardown.ts` and `jest-env.ts` spin up a Postgres Testcontainer and apply Prisma migrations before the suite — tests get a real DB, not mocks (uses `@quramy/jest-prisma`).

### Frontend (`packages/frontend`)

```bash
yarn dev                          # vite dev server
yarn build                        # tsc && vite build (typecheck is part of build)
yarn test                         # vitest (watch)
yarn test:run                     # vitest run (CI mode)
yarn test:run path/to/file.test.ts
yarn lint                         # flat-config eslint, --max-warnings 0
yarn tsc                          # typecheck only
```

Requires Node 20.19+ (Vite 6 constraint). ESLint uses the flat config in `eslint.config.js` (not `.eslintrc`).

### Infra (`packages/infra`)

```bash
pulumi stack select
pulumi preview
pulumi up
npm run generate-emails           # mjml → html, required before first deploy
```

State lives in S3, secrets via AWS KMS. On Apple Silicon prefix Pulumi commands with `GODEBUG=asyncpreemptoff=1` if you hit crashes. See `packages/infra/README.md` for the full bootstrap sequence (docker-registry stack must be deployed before the main stack).

## Architecture notes

### Backend

- NestJS with a single `AppModule`. `ConfigModule` is global and loads `app.config.ts`.
- Global `SentryInterceptor` (`APP_INTERCEPTOR`) wraps every request for error reporting.
- `simpleExample/` is the reference feature illustrating the layering convention: `domain/` holds entities, factories, fixtures, and a repository **interface**; `repository/` holds the Prisma implementation of that interface. Follow this split when adding features — domain code must not import Prisma directly.
- `PrismaService` (`src/prisma.service.ts`) is the shared client; tests get a transactional Prisma instance from `@quramy/jest-prisma` rather than mocking it.

### Frontend

Detailed conventions are in `packages/frontend/README.md`. The non-obvious ones:

- **Styling**: Emotion in **classnames-only** mode (`@emotion/css`), composed with `clsx`. Do not introduce `@emotion/styled` or `@emotion/react`. Use the homemade `css` helper in `src/common/styles/Styles.ts` to get theme injection; theme tokens are CSS variables defined in `src/common/styles/theming.css` (avoids re-rendering the tree on theme change — there is no `ThemeProvider`).
- **i18n**: Single flat JSON per language under `public/locales/`, lazy-loaded by `i18next-http-backend`. Fallback language is `fr`. Tests use a separate sync setup in `i18nTest.ts` (English only) because the test runtime has no HTTP backend.
- **Routing**: Config-driven in `src/routing/Router.tsx`. Use the existing `LazyLoading` helper for code-splitting and the `GlobalErrorBoundary` pattern for unhandled errors. `UnknownRoute.tsx` is the 404 slot.
- **Testing**: Vitest + Testing Library + `testing-library-selector` (define a `ui` object of selectors per test). API calls are mocked with **Nock**, not MSW. `helloWorld/api/HelloWorldClient.ts` is the canonical example.
- **Vitest 3 gotcha**: `mockReset()` restores the original implementation; use `mockClear()` to only clear call history.
- **Monitoring**: Use `MonitoringService` (`logError` / `logMessage`) for manual Sentry reports rather than calling `@sentry/react` directly.

### Infra

Three independent Pulumi projects share the same stack name convention (e.g. stack `dev` must exist in `infra/`, `ci-cd/`, and `docker-registry/` together). `gitlab-variables.ts` writes GitLab CI variables back from Pulumi outputs — some appear "deleted" during preview because they're only populated after ECS rolls out; do not let Pulumi drop them.
