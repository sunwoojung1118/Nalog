# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

# Nalog — Expo + React Native App

A weekly journaling app for iOS, Android, and web. One file per week — today's entry is the editable surface; prior days of the week sit above it (read-only, pop-in on scroll), and a bottom sheet below hosts a social feed of friends' weeks.

## Stack
- Expo SDK 54 / Expo Router 6 (file-based routing, managed workflow)
- React Native 0.81 / React 19
- TypeScript (strict, `@/*` → `src/*`)
- React Native Reanimated 4 + Gesture Handler — drives the pop-in reveal and bottom-sheet snap on the UI thread
- AsyncStorage — local-only persistence; no backend

## Commands
```bash
# nvm must be sourced once per terminal session (not in .zshrc)
export NVM_DIR="$HOME/.nvm" && source "$NVM_DIR/nvm.sh"

npm install
npm start          # Expo dev server (scan QR with Expo Go)
npm run ios        # iOS simulator
npm run android    # Android emulator
npm run web        # Browser
npm run lint       # expo lint (ESLint flat config, eslint-config-expo)
```

There is no test runner configured. `scripts/reset-project.js` (`npm run reset-project`) wipes the starter app — don't run it casually.

Native `/ios` and `/android` folders are gitignored; run `npx expo prebuild` to regenerate when needed.

## Architecture

**Storage is the source of truth.** State lives in AsyncStorage and is read back through hooks; there is no global store. The unit of storage is a **week**:

- `nalog_w{week}_title` — one title per week
- `nalog_w{week}_d{1..7}_subtitle` / `_body` — seven day entries, Mon (1) → Sun (7)
- `nalog_pub_w{week}` — published snapshot, kept separate from the draft so publishing doesn't mutate the editable week

Week numbers are ISO 8601; day index comes from `getDayIndex(Date)` in `src/lib/date.ts`. The writer always shows today as editable and renders earlier days of the same week above it.

**Three layers stacked on one screen** (`src/app/index.tsx`):
1. `WeekWriter` (`src/components/`) — today's `DayEntry` plus prior days, animated by a shared `scrollY` value
2. A `BottomSheet` snap surface (`src/components/BottomSheet.tsx`, helpers in `components/sheet/`)
3. The social feed inside the sheet (`src/social/` — its own `components/`, `data/` store hooks + seed data, and `tabs/` for Home/Discover/Profile)

Overscrolling 64px past today's entry pops the sheet to its bar snap — the two surfaces are coupled, not independent.

**Other routes:** `src/app/log/` (long-form posts), `n/[id].tsx` (post detail), `u/[id].tsx` (user profile), `settings.tsx`.

**Hooks worth knowing** (`src/hooks/`):
- `useAutoSavedField` — 800ms debounced writes to AsyncStorage; header reflects "Saving…" → "All changes saved"
- `useAutoPublish` — promotes a week's draft to `nalog_pub_w{week}` on the publish trigger
- `useNow` — ticking clock for streak/day rollover

**Streak** = consecutive published weeks ending at the most recent published week ≤ this week.

## Conventions
- Strict TS; avoid `any`.
- Reanimated animations should stay on the UI thread (`useSharedValue`, `useAnimatedStyle`) — don't bridge `scrollY` through React state.
- Theme tokens live in `src/constants/theme.ts`; don't hardcode colors/spacing.
