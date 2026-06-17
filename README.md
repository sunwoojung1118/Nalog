# Nalog

A weekly journaling app for iOS, Android, and the web. One file per week — write today's entry on the starter tab, scroll up to see the days you've already written, scroll past today to peek at what your friends have been writing.

Built with Expo SDK 52, React Native 0.76, TypeScript, and Reanimated.

## Stack

- **Expo SDK 52** — managed workflow, Expo Router (file-based routing)
- **React Native 0.76 / React 18**
- **TypeScript** (strict)
- **React Native Reanimated** + Gesture Handler (writer pop reveal, bottom-sheet snap)
- **AsyncStorage** for local persistence (no backend yet)

## Getting started

```bash
# nvm must be sourced once per terminal session
export NVM_DIR="$HOME/.nvm" && source "$NVM_DIR/nvm.sh"

npm install
npm start          # Expo dev server (scan the QR with Expo Go)
npm run ios        # iOS simulator
npm run android    # Android emulator
npm run web        # Browser
npm run lint       # ESLint
```

Native `/ios` and `/android` folders are not checked in. Run `npx expo prebuild` to generate them when needed.

## Project layout

```
src/
  app/                  # Expo Router screens (file-based)
    _layout.tsx
    index.tsx           # Starter / writer tab
    settings.tsx
    log/                # Long-form blog-style posts
    n/[id].tsx          # Nalog post detail
    u/[id].tsx          # User profile
  components/
    WeekWriter.tsx      # Writer surface — today's entry + scroll-up reveal of prior days
    DayEntry.tsx        # One day's subtitle + body input
    WriterStateProvider.tsx
    BottomSheet.tsx     # Snap-driven sheet hosting the social feed
    SheetStateContext.tsx
    writer/             # Header, past-week affordance
    sheet/              # Snap helpers
    log/                # Log composer / list
  hooks/
    useAutoSavedField.ts
    useAutoPublish.ts
    useNow.ts
  lib/
    date.ts             # ISO week + day index, storage keys
    useCurrentDate.ts
  social/
    components/         # Avatar, FollowerWidget, etc.
    data/               # social-store hooks, seed friends + posts
    tabs/               # Home / Discover / Profile tabs inside the sheet
  constants/theme.ts    # Colors, fonts, spacing
assets/                 # Images, fonts, icons
```

## Data model

A **week** is the unit of storage. Each week has:

- one **title** (`nalog_w{week}_title`)
- seven **day entries** (`nalog_w{week}_d{1..7}_subtitle` and `_body`), one per day Mon–Sun

Day index is derived from `getDayIndex(Date)` (1 = Monday, 7 = Sunday) and the week from ISO 8601 week numbers. The writer shows today's day as the editable surface and renders earlier days of the same week above it, read-only.

Published weeks (when the user shares to the timeline) are stored separately under `nalog_pub_w{week}` so drafts and published posts don't collide.

## Notable behaviors

- **Pop-as-you-scroll-up** — on the writer tab, prior days are invisible on arrival. Each one fades and scales in as it scrolls into the viewport, driven by a shared `scrollY` on the UI thread.
- **Overscroll opens the feed** — scrolling 64px past the bottom of today's entry pops the social bottom sheet to its bar snap.
- **Auto-save** — fields debounce 800ms before writing to AsyncStorage; the header shows "Saving…" → "All changes saved".
- **Streak** — number of consecutive published weeks ending at the most recent published week ≤ this week.

## Conventions

- Strict TypeScript; no `any` if you can help it.
- Path alias `@/*` → `src/*`.
- Read the versioned Expo docs at <https://docs.expo.dev/versions/v52.0.0/> before touching Expo APIs — APIs have shifted since older snapshots.
