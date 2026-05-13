---
name: add-frontend-feature
description: Step-by-step guide for adding a new frontend feature in packages/frontend — API client, TanStack Query hooks, components, routing, and tests.
argument-hint: [feature-name] [description]
context: fork
---

# Add Frontend Feature: $ARGUMENTS

Read the relevant agent_docs first:
- `agent_docs/frontend-architecture.md` for the required flow and folder conventions
- `packages/frontend/CLAUDE.md` for available yarn commands
- `packages/frontend/src/notes/` as the canonical reference implementation (CRUD)

## Required Flow

Every feature that talks to the backend MUST follow the flow:

```
Frontend Component Action
    ↓
Custom TanStack Query Hook
    ↓
Frontend API Client
    ↓
Backend Controller
```

Do not call the API directly from a component. Do not skip the hook layer.

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

## Steps

### 1. API Client (`api/<Feature>Client.ts`)

- Use `Client` from `@/common/services/Client` (`get`, `post`, `put`, `delete`)
- Export a single object with one method per endpoint (`list`, `create`, `update`, `remove`, ...)
- Define request/response types in `api/types/`
- See `packages/frontend/src/notes/api/NotesClient.ts` for the pattern (including the `put` response-unwrap quirk)

### 2. TanStack Query Hooks (`hooks/`)

- One hook per operation: `use<Feature>.ts`, `useCreate<Feature>.ts`, `useUpdate<Feature>.ts`, `useDelete<Feature>.ts`
- Queries use `useQuery` with a stable `queryKey: ['<feature>']`
- Mutations use `useMutation` and invalidate the matching `queryKey` in `onSuccess`
- Mutations accept an `Options` object with an `onSuccess` callback for the caller (form reset, navigation, etc.)
- Return only what the component needs (`data`, `isPending`, `isError`, ...)

### 3. Components (`components/`)

- Pure React components — no direct API calls
- Consume hooks from `hooks/`
- Styles via `css` or `Theme` from `@/common/styles/Styles`
- CSS classes defined at the bottom of the component file
- No inline styles

### 4. Feature Root + Routing

- Create `<Feature>.tsx` as the entry point composing components
- Register the route in `src/routing/Router.tsx`
- Add nav entry under `src/routing/components/` if the feature is user-reachable from the shell

### 5. i18n

- Add translation keys under `public/locales/<lang>/...`
- Never hardcode user-facing strings

### 6. Tests

- Integration tests in `__tests__/` mimicking real user flows (render, click, assert visible state)
- Client unit tests in `api/__tests__/` for the HTTP contract
- Mock the network at the boundary, not the hooks

## Checklist

- [ ] Folder layout matches `__tests__/`, `api/`, `components/`, `hooks/`
- [ ] No component bypasses the hook → client flow
- [ ] All mutations invalidate the relevant `queryKey`
- [ ] No inline styles; CSS classes at end of component file
- [ ] All user-facing strings come from i18n
- [ ] Route registered in `src/routing/Router.tsx`
- [ ] Type-check clean: `yarn tsc`
- [ ] Lint clean: `yarn lint`
- [ ] Tests pass: `yarn test`
