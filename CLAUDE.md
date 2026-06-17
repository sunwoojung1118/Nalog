@AGENTS.md

# Nalog — Expo + React Native App

## Stack
- Expo SDK 52 / Expo Router (file-based routing)
- React Native 0.76 / React 18
- TypeScript (strict)
- React Native Reanimated 3 + Gesture Handler

## Project structure
```
src/
  app/          # Expo Router screens (_layout.tsx, index.tsx, explore.tsx)
  components/   # Shared UI components
  constants/    # Theme tokens
  hooks/        # Custom hooks
assets/         # Images, fonts, icons
```

## Commands
```bash
# Activate nvm first (required every new terminal session)
export NVM_DIR="$HOME/.nvm" && source "$NVM_DIR/nvm.sh"

npm start          # Start Expo dev server (scan QR with Expo Go)
npm run ios        # iOS simulator
npm run android    # Android emulator
npm run web        # Browser
npm run lint       # ESLint
```

## Notes
- `AGENTS.md` pins the Expo v52 docs URL — read versioned docs before writing any Expo API code.
- `.gitignore` excludes generated `/ios` and `/android` folders; use `npx expo prebuild` to generate them when needed.
- `nvm` must be sourced manually each terminal session until added to `.zshrc`.
