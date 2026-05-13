## Repository layout

Monorepo with three independent yarn packages under `packages/` — there is no root workspace, each package is installed and built on its own:

- `packages/backend` — NestJS 10 + Prisma 5 + PostgreSQL API
- `packages/frontend` — React 19 + Vite 6 + TanStack Query + react-router 7 SPA
- `packages/infra` — Pulumi (AWS) infrastructure-as-code, plus mjml email templates

## Common commands
### Backend (`packages/backend`)

```bash
yarn install
docker-compose up -d                  # local Postgres on :5432 (db "Base-template")
yarn migrate:dev                      # apply Prisma migrations against .env.development
yarn prisma:generate                  # regenerate Prisma client after schema changes
yarn start:dev                        # nest watch mode with .env.development
yarn test                             # jest unit tests (uses testcontainers — Docker must be running)
yarn lint                             # eslint --fix
yarn build                            # nest build → dist/
```

### Frontend (`packages/frontend`)

```bash
yarn install
yarn dev                              # vite dev server
yarn test                             # vitest watch
yarn tsc                              # type-check only
yarn lint                             # eslint, --max-warnings 0
yarn build                            # tsc && vite build
```

### Infra (`packages/infra`)

Pulumi-managed. See `packages/infra/README.md` for the full AWS/Pulumi bootstrap (S3 state bucket, KMS secrets provider, stack init). Local scripts: `yarn tsc`, `yarn lint`, `yarn code-standard`, `yarn generate-emails` (compiles mjml templates in `emails/`).

## Backend architecture

The backend follows nest module architecture. `note/` is the canonical example to copy when adding a new resource.
Modules are built in layers. Prisma repositories interacts with the DB. Services reuse the prisma layer and might implement domain related logic if needed and Controller endpoints expose Services functionalities.

## Frontend architecture

Feature-folder layout under `src/`. `notes/` is the best example.
The frontend flow to the backend is  : component  →  hooks/use<Action><Feature>.ts  →  api/<Feature>Client.ts

Styling uses Emotion's `css` (classname API only — no styled components) wrapped by `@/common/styles/Styles.ts`

i18n is used for translations