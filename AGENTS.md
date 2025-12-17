# AGENTS.md

Wyvern Photos — Expo/React Native, TypeScript, SQLite

Follows [MCAF](https://mcaf.managed-code.com/)

---

## Conversations (Self-Learning)

Learn the user's habits, preferences, and working style. Extract rules from conversations, save to "## Rules to follow", and generate code according to the user's personal rules.

**Update requirement (core mechanism):**

Before doing ANY task, evaluate the latest user message.
If you detect a new rule, correction, preference, or change → update `AGENTS.md` first.
Only after updating the file you may produce the task output.
If no new rule is detected → do not update the file.

**When to extract rules:**

- prohibition words (never, don't, stop, avoid) → add NEVER rule
- requirement words (always, must, make sure, should) → add ALWAYS rule
- memory words (remember, keep in mind, note that) → add rule
- process words (the process is, the workflow is, we do it like) → add to workflow
- future words (from now on, going forward) → add permanent rule

**Preferences → add to Preferences section:**

- positive (I like, I prefer, this is better) → Likes
- negative (I don't like, I hate, this is bad) → Dislikes
- comparison (prefer X over Y, use X instead of Y) → preference rule

---

## Rules to follow (Mandatory, no exceptions)

### Commands

- start: `npm start`
- android: `npm run android` or `npx expo run:android`
- ios: `npm run ios` or `npx expo run:ios`
- web: `npm run web`
- typecheck: `npx tsc --noEmit`
- prebuild: `npx expo prebuild`

### Task Delivery (ALL TASKS)

- Read assignment, inspect code and docs before planning
- Write multi-step plan before implementation
- Implement code and tests together
- Run typecheck after changes
- Summarize changes before marking complete
- Always run required builds and tests yourself; do not ask the user to execute them

### Documentation (ALL TASKS)

- All docs live in `docs/`
- Update feature docs when behaviour changes
- Update ADRs when architecture changes
- Templates: `docs/templates/ADR-Template.md`, `docs/templates/Feature-Template.md`

### Testing (ALL TASKS)

- Every behaviour change needs sufficient automated tests
- Prefer integration/API tests over unit tests
- No mocks for internal systems (database, storage) — use real implementations
- Never delete or weaken a test to make it pass
- Device testing is PRIMARY for mobile features

### Autonomy

- Start work immediately — no permission seeking
- Questions only for architecture blockers not covered by ADR
- Report only when task is complete

### Code Style

- Use strict TypeScript with explicit types
- Prefer `interface` over `type` for object shapes
- Use `const` by default, `let` only when reassignment needed
- Functional components with hooks only (no class components)
- Use `expo-image` instead of `Image` from react-native
- Use `expo-router` Link/router for navigation
- No magic literals — extract to constants

### Naming

- **Files**: kebab-case for utilities, PascalCase for components
- **Components**: PascalCase
- **Functions**: camelCase
- **Constants**: SCREAMING_SNAKE_CASE
- **Types/Interfaces**: PascalCase

### Critical (NEVER violate)

- Never commit secrets, keys, bot tokens
- Never store tokens in plain text — use expo-secure-store
- Never skip tests to make build green
- Never log sensitive data (tokens, file contents)

### Boundaries

**Always:**

- Read AGENTS.md and docs before editing code
- Run typecheck before commit

**Ask first:**

- Changing database schema
- Adding new dependencies
- Modifying Telegram API integration

---

## Preferences

### Likes

- Material Design 3 aesthetics
- Dark mode
- Clean, minimal UI

### Dislikes

- Kotlin (user explicitly stated this)

---

## Reference

- **Original project**: `../cloudgallery-ref/` (Kotlin implementation for reference only)
- **Documentation**: `docs/`
- **Database**: `lib/database/` (SQLite via expo-sqlite)
- **Telegram API**: `lib/telegram/` (Bot API client)
