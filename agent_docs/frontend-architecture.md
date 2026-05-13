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

### Folders
- Components go into their own folder inside `/packages/frontend/src`
- There should always be these minimum state folders : 
- - `__tests__` For tests
- - `api` For the related HTTP Client that knows the backend endpoints
- - `components` For the React Components
- - `hooks` For the Custom TanStack Query hooks who uses the HTTP Client

### Styles
- Styles should always use `css` or `Theme` from `'@/common/styles/Styles';` 
- CSS Classes should be defined at the end of the component file
- We should never have any inline styles

### Tests
- Always aim for integration tests that mimics what the user really see and do