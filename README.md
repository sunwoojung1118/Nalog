# Nalog

A weekly journaling app for iOS, Android, and the web. One file per week — write today's entry on the starter tab, scroll up to see the days you've already written, scroll past today to peek at what your friends have been writing.

Built with Expo SDK 54, React Native 0.81, TypeScript, and Reanimated.

## Stack

- **Expo SDK 54** — managed workflow, Expo Router 6 (file-based routing)
- **React Native 0.81 / React 19**
- **TypeScript** (strict)
- **React Native Reanimated 4** + Gesture Handler (writer pop reveal, bottom-sheet snap)
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
- Read the versioned Expo docs at <https://docs.expo.dev/versions/v54.0.0/> before touching Expo APIs — APIs have shifted since older snapshots.

## Writer redesign (Phase 6)

The day's writing surface is a continuous Google-Docs-style canvas (`DocEditor`):

- **Private runs**: highlight a range of text and tap the floating **Private** bar to mark it. Private characters render with a light-gray background to the author and are **omitted entirely** from the server response sent to other viewers (server-enforced by `redact_blocks` in the `week_feed_active` view).
- **Inline photos**: up to 5 per day via `+ photo`, each with its own caption.
- **Per-day Training & Metrics**: bottom section with rows of activity + value (number or `HH:MM` time).
- **Weekly habits**: declared at the top of the week; each day shows tick pills for them.
- **Rolling 7-day visibility**: a published week is visible to followers for at most 7 days AND only while it's the author's latest week. Older weeks remain in the author's profile under **Your archive**.

### iOS native "Private" UIMenu item (follow-up)

For full parity with the native Cut/Copy/Replace popup on iOS, ship a custom `UIMenuItem` via an Expo config plugin + native module under `plugins/withPrivateMenuItem/` and `modules/private-text-input/`. This requires `npx expo prebuild` and an EAS dev client (Expo Go can't load custom native code). Until then, the floating selection toolbar (`src/components/writer/SelectionToolbar.tsx`) handles all platforms.
