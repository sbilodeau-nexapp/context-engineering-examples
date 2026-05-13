# CLAUDE.md

When the user requests code examples, setup or configuration steps, or library/API documentation, use context7

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Structure

This is a monorepo containing three packages:
- **backend**: NestJS API with Prisma ORM and PostgreSQL
- **frontend**: React with Vite, TypeScript, i18next, and Emotion CSS-in-JS  
- **infra**: Pulumi infrastructure as code for AWS deployment

## Development Commands

### Backend (`packages/backend/`)
```bash
# Install dependencies and start database
yarn install
docker-compose up -d

# Development
yarn start:dev          # Start with hot reload
yarn start              # Start normally
yarn start:prod         # Production mode

# Database
yarn migrate:dev         # Run migrations in development
yarn migrate:prod        # Deploy migrations in production
yarn prisma:generate     # Generate Prisma client

# Testing & Quality
yarn test               # Unit tests
yarn test:e2e           # End-to-end tests
yarn lint               # ESLint with auto-fix
yarn format             # Prettier formatting
```

### Frontend (`packages/frontend/`)
```bash
# Development
yarn dev                # Start Vite dev server
yarn build              # Build for development
yarn build:production   # Production build
yarn preview            # Preview production build

# Testing & Quality
yarn test               # Vitest tests
yarn lint               # ESLint
yarn format             # Check Prettier formatting
yarn format:fix         # Fix Prettier formatting
yarn tsc                # TypeScript check
```

### Infrastructure (`packages/infra/`)
```bash
# Pulumi deployment
pulumi up               # Deploy infrastructure
pulumi stack init [stack]  # Create new stack
```

## Architecture

### Backend Architecture
- **Domain-Driven Design**: Each feature has `domain/`, `repository/` folders
- **NestJS modules**: Controllers, services, and dependency injection
- **Prisma ORM**: Type-safe database access with PostgreSQL
- **Repository pattern**: Interface in domain, implementation in repository
- **Test containers**: PostgreSQL test containers for e2e tests
- **Sentry monitoring**: Global error interceptor

Example domain structure (see `src/simpleExample/`):
- `domain/SimpleExample.ts` - Domain entity
- `domain/example.repository.ts` - Repository interface  
- `repository/example.prisma.repository.ts` - Prisma implementation

### Frontend Architecture
- **React Router**: File-based routing configuration in `src/routing/Router.tsx`
- **TanStack Query**: Data fetching and caching
- **Emotion CSS-in-JS**: Styling with theme support via CSS variables
- **i18next**: Internationalization with lazy-loaded locale files
- **Feature-based structure**: Each feature has `components/`, `api/`, `domain/` folders
- **Global error boundaries**: Catch and handle React errors
- **Lazy loading**: Code splitting for better performance

Example feature structure (see `src/helloWorld/`):
- `components/` - React components
- `api/` - API clients and types
- `domain/` - Business logic

### Testing Strategy
- **Backend**: Jest with test containers for database integration
- **Frontend**: Vitest + Testing Library for components, Nock for API mocking
- **Global setup**: Database seeding and teardown in test environment

## Configuration

### Environment Variables
- Backend requires `DATABASE_URL` for Prisma
- Frontend requires `VITE_API_URL` for backend communication
- Both packages support Sentry monitoring via respective DSN variables

### Key Configuration Files
- `packages/backend/prisma/schema.prisma` - Database schema
- `packages/frontend/vite.config.ts` - Vite configuration
- `packages/infra/Pulumi.yaml` - Infrastructure configuration

## Deployment

The project includes GitLab CI/CD setup with:
- Backend: ECS deployment with ECR Docker registry
- Frontend: S3 + CloudFront deployment
- Infrastructure: Pulumi-managed AWS resources

Required AWS IAM permissions are documented in the main README.md.
