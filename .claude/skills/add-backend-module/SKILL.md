---
name: add-backend-module
description: Step-by-step guide for adding a new backend module in packages/backend — controller, service, domain, Prisma repository, module wiring, and tests.
argument-hint: [module-name] [description]
context: fork
---

# Add Backend Module: $ARGUMENTS

Read the relevant agent_docs first:
- `agent_docs/backend-architecture.md` for the required flow and folder conventions
- `packages/backend/CLAUDE.md` for available yarn commands
- `packages/backend/src/note/` as the canonical reference module (CRUD)

## Required Flow

Every module that performs CRUD MUST follow:

```
Backend Controller
    ↓
Service Layer
    ↓
Prisma Repository (implements domain Repository ABC)
    ↓
DB
```

The controller never calls Prisma directly. The service depends on the abstract repository from `domain/`, not on the Prisma implementation.

## Folder Structure

Create the module under `packages/backend/src/<module>/`:

```
src/<module>/
├── __tests__/
│   └── <module>.controller.spec.ts   # Integration tests for controller
├── domain/
│   ├── <Module>.ts                   # Domain entity class
│   ├── <Module>Factory.ts            # Builds new entities (id, timestamps)
│   ├── <Module>Fixture.ts            # Faker-based factory for tests
│   └── <module>.repository.ts        # abstract class (ABC) — the contract
├── repository/
│   ├── __tests__/                    # Integration tests for prisma repo
│   └── <module>.prisma.repository.ts # implements the domain repository
├── <module>.controller.ts
├── <module>.service.ts
└── <module>.module.ts
```

## Steps

### 1. Prisma Schema

- Add the model to `packages/backend/prisma/schema.prisma`
- Snake_case columns (`created_at`, `updated_at`) — assemble to camelCase in the repository
- Run `yarn migrate:dev` to generate the migration
- Run `yarn prisma:generate` if the client isn't regenerated automatically

### 2. Domain Layer (`domain/`)

- `<Module>.ts`: plain class with a single `Attributes` constructor object, all fields public
- `<module>.repository.ts`: `abstract class <Module>Repository` declaring only what the service needs (`getAllX`, `getXById`, `createX`, `updateX`, `deleteX`, ...). Used as the DI token.
- `<Module>Factory.ts`: builds new entities with `uuid()` id and `new Date()` timestamps
- `<Module>Fixture.ts`: same shape as Factory but uses `@faker-js/faker` and accepts `Partial<Attributes>` overrides — for tests only

### 3. Prisma Repository (`repository/`)

- `@Injectable()` class implementing the domain repository ABC
- Inject `PrismaService` from `../../prisma.service`
- Define a typed DTO with `Prisma.validator<Prisma.<model>DefaultArgs>()({})` + `Prisma.<model>GetPayload`
- Use an `Assembler` at the bottom of the file to map DB DTOs → domain entities (snake_case → camelCase)

### 4. Service (`<module>.service.ts`)

- `@Injectable()` class depending on the abstract repository (not the prisma one)
- Throw `NotFoundException` for missing entities — re-use `getById` inside `update`/`remove` to centralize the check
- Use the domain Factory for `create`; never new up entities inline

### 5. Controller (`<module>.controller.ts`)

- `@Controller('<plural>')` route prefix
- Declare local `<Module>Response` and `<Module>Payload` interfaces — keep transport types separate from domain
- Use `@HttpCode(204)` on `Delete`
- Add a local `serialize` helper at the bottom converting domain → response (dates → ISO strings)

### 6. Module (`<module>.module.ts`)

- `imports: [PrismaModule]`
- `controllers: [<Module>Controller]`
- `providers: [<Module>Service, { provide: <Module>Repository, useClass: <Module>PrismaRepository }]` — bind the ABC to its impl

### 7. Register the Module

- Add `<Module>Module` to `imports` in `packages/backend/src/app.module.ts`

### 8. Tests

- Controller integration tests in `__tests__/<module>.controller.spec.ts` — exercise real HTTP routes against the full Nest app
- Repository integration tests in `repository/__tests__/` — testcontainers spins up Postgres (Docker must be running)
- Add unit tests only when the service has non-trivial domain logic beyond CRUD

## Checklist

- [ ] Prisma schema updated and migration generated (`yarn migrate:dev`)
- [ ] Folder layout matches `domain/`, `repository/`, `__tests__/`
- [ ] Service depends on the abstract repository, not the Prisma class
- [ ] Module binds `{ provide: <Module>Repository, useClass: <Module>PrismaRepository }`
- [ ] `<Module>Module` added to `app.module.ts` imports
- [ ] `NotFoundException` thrown for missing entities
- [ ] Controller response/payload types separate from domain
- [ ] Lint clean: `yarn lint`
- [ ] Tests pass: `yarn test` (Docker running for testcontainers)
- [ ] Build clean: `yarn build`
