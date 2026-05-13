# Context Engineering — Exemples

Monorepo de démonstration pour les exemples pratiques de **context engineering avec l'IA**. L'application sous-jacente est un simple CRUD de notes (créer, lire, modifier, supprimer).

## Structure

| Package | Tech | Rôle |
|---------|------|------|
| `packages/backend/` | NestJS 10 · Prisma 5 · PostgreSQL | API REST |
| `packages/frontend/` | React 19 · Vite 6 · TanStack Query | Interface web |
| `packages/infra/` | AWS · Pulumi | Infrastructure et déploiement |

## Objectif

Ce repo sert de terrain de jeu pour explorer des techniques de context engineering : structurer les instructions, les docs d'architecture, et les exemples fournis aux agents IA pour obtenir du code de qualité production.