# Backend Architecture

## Architecture Guidelines and Flow
Always use the following flow when creating or updating backend modules that needs CRUD operations.
Controllers always call the service layer who manages interaction with the ORM (Prisma)
```
Backend Controller
    ↓
Service Layer
    ↓
Prisma Repository
    ↓
DB
```

### Folders
- Modules go into their own folder inside `/packages/backend/src`
- There should always be these minimum state files and folders : 
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


### Tests
Aim for integration test when testing the controller actions and the repository methods. When the domain logic becomes more than a simple CRUD, implement unit tests.