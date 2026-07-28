# Nalog

A weekly journaling app built with React Native (Expo) and Supabase.

Nalog treats the week as the natural unit of reflection. Each day you write a short entry; the seven days roll up into a single weekly Nalog that can be published to friends' feeds.

This is the original cross-platform version of Nalog. The project has since been rewritten natively in SwiftUI — see [nalog-ios](https://github.com/sunwoojung1118/nalog-ios).

## Features

- Continuous document-style writer for each day, with debounced autosave and a draft → publish flow
- Private text runs — highlight any range and mark it private; private characters are stripped server-side (`redact_blocks` in the `week_feed_active` view) so they never reach other viewers
- Inline photos with captions, per-day training and metrics rows, weekly habit tick pills
- Social feed with rolling 7-day visibility: a published week is visible to followers only while it is the author's latest week; older weeks move to the profile archive
- Follows, profiles, user search, and streaks (consecutive published weeks)
- Email auth with auto-provisioned profiles

## Tech Stack

- **Expo SDK 54 / React Native 0.81 / React 19** — Expo Router (file-based routing), strict TypeScript
- **Reanimated 4 + Gesture Handler** — UI-thread scroll animations, bottom-sheet snapping
- **Supabase** — Postgres, Auth, Storage, Row Level Security

## Architecture

```
src/
  app/            Expo Router screens
    (tabs)/       home, write, search, community, profile
    n/[id]        Nalog detail
    u/[id]        user profile
  components/     NalogCard, NalogWriteModal, TabBar, GlassView, ...
  hooks/          useWeekDraft, useDebouncedCallback
  lib/            Supabase client, feed/profile/follow API modules, draft logic
supabase/
  migrations/     versioned SQL — schema, social graph, storage, RLS hardening
```

- All data access goes through typed API modules in `src/lib`, sharing one Supabase client configured from environment variables.
- The database schema lives in versioned SQL migrations, including dedicated security-hardening passes: RLS policies on every table, locked-down trigger functions, and view-level redaction of private content.
- Credentials are never committed — the client reads `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` from the environment (see `.env.example`).
