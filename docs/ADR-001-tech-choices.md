# ADR-001: Technology choices

## Status
Accepted

## Context

We need to deliver a delightful shared experience for couples with real-time collaboration, offline-friendly interactions, and growth potential. The product must run on iOS and Android, sync with Supabase, and support rapid iteration.

## Decision

- **Expo (React Native) + TypeScript** for the mobile client to maximize cross-platform reach with strong developer tooling and OTA updates.
- **React Navigation + Expo Router** for predictable navigation patterns with deep linking.
- **React Query** for server state management and caching of Supabase data.
- **Zustand** for lightweight local state to complement server data.
- **Skia + react-native-reanimated** (via `@shopify/react-native-skia`) for performant drawing on the whiteboard.
- **Supabase** (Postgres + Auth + Realtime + Edge Functions) for managed backend with RLS support, scheduled jobs, and realtime updates.
- **Jest + React Native Testing Library** to verify UI logic and reducers with TypeScript support.
- **ESLint + Prettier** to enforce code style across the monorepo.

## Consequences

- We inherit Expo OTA benefits and simplified build tooling (EAS) but need to respect managed workflow constraints.
- Supabase RLS policies require careful modeling of couple membership to avoid leaking data; we centralize membership checks via a helper view.
- Using Skia means bundling native code; Expo SDK LTS includes Skia support through the community module.
- React Query introduces additional caching layers; developers must invalidate caches when server mutations occur.
- Edge Functions, scheduled via `cron.json`, allow us to keep business logic close to the database without a separate server.
