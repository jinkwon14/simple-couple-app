# Supabase Deployment Guide

## Local development

```bash
cd supabase
supabase start      # launches local stack
supabase db reset   # applies migrations and seeds
```

The CLI loads env vars from `supabase/.env`. Ensure `SERVICE_ROLE_KEY` is set when invoking Edge Functions locally.

## Applying migrations to remote

> **Warning:** Running migrations against production is irreversible. Double-check credentials and back up data first.

```bash
supabase db push --project-ref your-project-ref
```

## Edge Functions

Deploy all functions:

```bash
supabase functions deploy assign_daily_question expire_whiteboards spawn_random_event send_push
```

To test locally:

```bash
supabase functions serve --env-file ../supabase/.env
```

## Cron jobs

Update scheduled tasks after deploying new functions:

```bash
supabase cron import cron.json
```

## Seeding data

The migration `003_seed.sql` inserts starter questions, missions, and pet species. If you need to reseed without dropping data, consider using `supabase db remote commit` and create a new migration for incremental content.
