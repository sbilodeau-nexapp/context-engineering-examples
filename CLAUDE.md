# Small Notes CRUD app.

Demo app that lets user create read update and delete notes.

## Monorepo Map

| Package | Tech | Purpose |
|---------|------|---------|
| `packages/backend/` | NestJS 10 + Prisma 5 + PostgreSQL API | NestJS Rest API for CRUD operation |
| `packages/frontend/` | React 19, Vite 6, EmotionCSS TanStack Query, i18next | React frontend |
| `packages/infra/` | AWS, Pulumi | Deployment and Infra |


## Context Docs

Read these before working — pick whichever are relevant to the task:

| File | When to read |
|------|-------------|
| `agent_docs/backend-architecture.md` | When creating or updating new modules |
| `agent_docs/frontend-architecture.md` | When creating or updating new features |