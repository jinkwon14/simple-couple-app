# LoveGarden Monorepo

A production-ready vertical slice of the LoveGarden couple experience. This repository contains both the Expo mobile client and Supabase backend assets.

## Project structure

```
├── app/                 # Expo (React Native) application
├── supabase/            # Database schema, seeds, Edge Functions, config
├── docs/                # Product and technical documentation
├── .github/workflows/   # CI pipelines
├── .vscode/             # Workspace recommendations
└── package.json         # Workspace scripts (pnpm)
```

## Prerequisites

- Node.js 20+
- pnpm 8+
- Supabase CLI (`pnpm dlx supabase start` or install globally)
- Expo CLI (`pnpm dlx expo --version`)

## Quick start

1. **Create Supabase project**
   - Provision a new Supabase project.
   - Retrieve the project URL, anon key, and service role key.

2. **Configure environment**
   - Copy `app/.env.example` to `app/.env` and fill in the Supabase anon key, project URL, and defaults.
   - Copy `supabase/.env.example` to `supabase/.env` (or export variables in your shell) with the service role key and Expo push access token.

3. **Apply database schema**
   ```bash
   cd supabase
   supabase db reset --local   # spins up local db, runs migrations & seed
   # or, to apply against remote (danger!), see docs/supabase-deploy.md
   ```

4. **Install dependencies**
   ```bash
   pnpm install
   ```

5. **Generate placeholder Expo assets**
   ```bash
   pnpm --filter app assets:generate
   ```

6. **Run the Expo app**
   ```bash
   pnpm --filter app start
   ```

   Open the Metro bundler UI, then launch on iOS Simulator, Android Emulator, or Expo Go.

## Scripts

The root `package.json` forwards commands into each workspace:

- `pnpm dev` – start the Expo app in development mode.
- `pnpm lint` – run lint checks.
- `pnpm test` – execute unit tests.
- `pnpm build` – produce a development build (EAS-like) for both platforms.
- `pnpm migrate:up` – push latest Supabase migrations locally.
- `pnpm supabase:functions:serve` – serve Edge Functions locally for testing.
- `pnpm seed` – run Supabase seed routine (see scripts for details).

## EAS build notes

- **Debug builds**: use `eas build --profile development` to produce development clients for QA.
- **Release builds**: configure credentials in EAS, then run `eas build --platform all --profile production`.
- Make sure environment variables are set in EAS secrets (`EXPO_PUBLIC_SUPABASE_URL`, etc.).

## Additional documentation

See `/docs` for architectural decisions, content roadmap, and deployment guides.
