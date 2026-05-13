## Backend

## Files and folders
- `prisma/` prisma db schema and migrations
- `scripts/` deployment related scripts
- `src` Backend root
- `src/<Module>` Module root. Example : `src/note/` 

## Backend commands
```bash
yarn migrate:dev                      # apply Prisma migrations against .env.development
yarn prisma:generate                  # regenerate Prisma client after schema changes
yarn start:dev                        # nest watch mode with .env.development
yarn test                             # jest unit tests (uses testcontainers — Docker must be running)
yarn lint                             # eslint --fix
yarn build                            # nest build → dist/
```