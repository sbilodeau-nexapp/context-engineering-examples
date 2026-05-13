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
- `<moduleName>/`
- - `<moduleName>.module.ts` NestJS module definition
- - `<moduleName>.controller.ts` The controller that dispatchs actions to the appropriate service method.
- - `<moduleName>.service.ts` The service that manages the domain layer and prisma operation.
- - `__tests__` For the controller tests
- - `domain` For the domain types, logic and repository interface
- - `repository` For the actual prisma repository implementation

### Tests
Aim for integration test when testing the controller actions and the repository methods. When the domain logic becomes more than a simple CRUD, implement unit tests.