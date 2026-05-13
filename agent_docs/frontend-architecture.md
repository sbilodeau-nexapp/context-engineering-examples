# Frontend Architecture

## Architecture Guidelines and Flow
Always use the following flow when creating or updating frontend components that implements CRUD operations.
```
Frontend Component Action
    ↓
Custom TanStack Query Hook
    ↓
Frontend API Client
    ↓
Backend Controller
```

## Folder Structure

Create the feature under `packages/frontend/src/<feature>/` with at minimum:

```
src/<feature>/
├── __tests__/           # Integration tests (user-facing behavior)
├── api/
│   ├── <Feature>Client.ts
│   ├── types/           # Domain types and payloads
│   └── __tests__/       # Client unit tests
├── components/          # React components
├── hooks/               # TanStack Query hooks (one file per query/mutation)
└── <Feature>.tsx        # Feature root component
```

### Styles
- Styles should always use `css` or `Theme` from `'@/common/styles/Styles';` 
- CSS Classes should be defined at the end of the component file
- We should never have any inline styles

### Tests
- Always aim for integration tests that mimics what the user really see and do