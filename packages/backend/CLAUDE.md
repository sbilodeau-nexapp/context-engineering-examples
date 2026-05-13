## Backend architecture

The backend follows nest module architecture. `note/` is the canonical example to copy when adding a new resource.
Modules are built in layers. Prisma repositories interacts with the DB. Services reuse the prisma layer and might implement domain related logic if needed and Controller endpoints expose Services functionalities.

## Backend commands

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