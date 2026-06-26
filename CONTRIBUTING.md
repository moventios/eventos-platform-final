# Contributing

## Prerequisites

- Node 20
- pnpm (`npm i -g pnpm`)
- Docker (for Supabase local dev)

## Local Setup

```bash
git clone <repo-url>
cd eventos
pnpm install
cp .env.example .env
```

Fill in the Supabase variables in `.env` (see below), then:

```bash
supabase start
pnpm --filter @eventos/database db:push
pnpm dev
```

### Supabase Variables

After `supabase start`, the CLI prints `API URL`, `anon key`, and `service_role key`. Copy these into `.env`.

### RLS Policies

```bash
psql $DATABASE_URL -f packages/database/rls/*.sql
```

### Stored Procedures

```bash
psql $DATABASE_URL -f packages/database/procedures/*.sql
```

## Testing

```bash
pnpm turbo test
```

## Branches

| Prefix | Use |
|--------|-----|
| `feature/` | New features |
| `fix/` | Bug fixes |
| `chore/` | Maintenance |

## Pull Requests

- Target `main`
- CI must pass before merge
