# Feature: Onboarding Flow

**Status:** Planning
**Owner:** User
**Related ADRs:** ADR-001 (Telegram Cloud Storage)

---

## Purpose

Guide first-time users through setting up their Telegram bot for photo backup in a friendly, step-by-step wizard. Reduce friction and confusion by breaking down the complex setup process into digestible steps with clear instructions and validation.

---

## Business Rules

1. **Only for First-Time Users:** Shown once when `settings.onboardingCompleted = false`
2. **Progressive Disclosure:** Show one step at a time, not all at once (Hick's Law)
3. **Validation Required:** Each step must validate before proceeding
4. **Skippable:** Users can skip and configure later in Settings
5. **Success Celebration:** End with satisfying success state (Peak-End Rule)
6. **No Confirmshaming:** If user skips, show neutral "You can set this up anytime in Settings"

---

## Main Flow

### Step 1: Welcome Screen

**Goal:** Explain what Wyvern Photos does

**Content:**
- Hero image/icon
- Title: "Welcome to Wyvern Photos"
- Subtitle: "Unlimited photo backup using your own Telegram account"
- Benefits list:
  - ✓ Unlimited storage (no quotas)
  - ✓ You own your data completely
  - ✓ Private and encrypted
  - ✓ Access from anywhere
- Buttons:
  - **Primary:** "Get Started" (continues to Step 2)
  - **Text:** "Skip for now" (closes onboarding, sets `onboardingCompleted = true`)

---

### Step 2: Create Telegram Bot

**Goal:** Guide user to create bot via @BotFather

**Content:**
- Title: "1. Create Your Bot"
- Instructions:
  1. Open Telegram
  2. Search for **@BotFather**
  3. Send `/newbot` command
  4. Follow instructions to name your bot
  5. Copy the bot token you receive
- Visual: Screenshot of @BotFather conversation
- Input: Bot Token text field (masked)
- Validation: Click "Next" triggers `getMe()` API call
  - ✅ Valid → Continue to Step 3
  - ❌ Invalid → Show error "Invalid token. Please check and try again."
- Buttons:
  - **Primary:** "Next"
  - **Text:** "Back" (to Step 1)

---

### Step 3: Create Private Channel

**Goal:** Guide user to create channel and add bot

**Content:**
- Title: "2. Create Your Storage Channel"
- Instructions:
  1. In Telegram, create a **new channel**
  2. Name it (e.g., "My Photo Vault")
  3. Set it to **Private**
  4. Add your bot as an **admin**
  5. Get the channel ID:
     - Forward any message from channel to **@userinfobot**
     - Copy the channel ID (starts with `-100`)
- Visual: Screenshot showing channel creation
- Input: Channel ID text field (numeric, starts with `-100`)
- Validation: Click "Next" triggers `getChat()` API call
  - ✅ Valid + bot has access → Continue to Step 4
  - ❌ Invalid or no access → Show error with checklist:
    - "Make sure the bot is added to the channel"
    - "Make sure the bot has admin permissions"
    - "Make sure the channel ID is correct"
- Buttons:
  - **Primary:** "Next"
  - **Text:** "Back" (to Step 2)

---

### Step 4: Success!

**Goal:** Celebrate completion, encourage first upload (Peak-End Rule)

**Content:**
- Large success checkmark animation (scale + fade-in)
- Title: "You're All Set!"
- Subtitle: "Your Telegram bot is now connected"
- Next steps card:
  - "Go to Photos tab and select photos to upload"
  - "Photos will be backed up to your private Telegram channel"
  - "You can change settings anytime in the Settings tab"
- Buttons:
  - **Primary:** "Start Uploading" (navigates to Photos tab, closes onboarding)
  - **Text:** "Explore Settings" (navigates to Settings tab)

**Side Effects:**
- Save bot configuration to database (`insertBot`)
- Save bot token to secure store (`saveBotToken`)
- Update settings (`primaryBotId`, `onboardingCompleted = true`)

---

## Components

### Files

- **NEW:** `app/onboarding.tsx` — Onboarding screen (full-screen modal)
- **NEW:** `components/OnboardingStep.tsx` — Reusable step wrapper with progress indicator
- **Modify:** `app/_layout.tsx` — Show onboarding modal on first launch
- **Modify:** `hooks/useDatabase.ts` — Check `onboardingCompleted` flag

### UI Components

```typescript
interface OnboardingStepProps {
  stepNumber: number;
  totalSteps: number;
  title: string;
  children: React.ReactNode;
  onNext: () => void;
  onBack?: () => void;
  nextLabel?: string;
  isNextDisabled?: boolean;
}
```

---

## Design Guidelines Applied

### UX Laws

- **Hick's Law:** Progressive disclosure — one thing at a time
- **Peak-End Rule:** Success screen ends on high note with celebration
- **Doherty Threshold:** Instant feedback on button presses, validation within 400ms
- **Fitts's Law:** Large buttons (56dp FAB), easy touch targets
- **Jakob's Law:** Familiar wizard pattern (step indicators, Next/Back buttons)

### Visual Design

- **Material Design 3:** Use theme colors from `Colors.ts`
- **Dark Mode:** OLED-friendly backgrounds
- **Typography:** Scale from design-guidelines.md (headers 28-36px)
- **Spacing:** Consistent 16dp horizontal padding, 24dp vertical
- **Animations:**
  - Step transitions: Slide left/right
  - Success checkmark: Scale 0 → 1.2 → 1.0 with spring
  - Buttons: Subtle press feedback

### Ethical Design

- ✅ Clear, honest language (no jargon)
- ✅ Easy skip option (no guilt-tripping)
- ✅ Transparent about what data goes where
- ❌ No confirmshaming ("Skip for now" not "No, I don't want security")

---

## Test Flows

### Positive Flow — Complete Onboarding

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | First app launch | Onboarding Welcome screen appears |
| 2 | Tap "Get Started" | Step 1 (Create Bot) appears |
| 3 | Enter valid bot token | Input accepted |
| 4 | Tap "Next" | getMe() succeeds, Step 2 appears |
| 5 | Enter valid channel ID | Input accepted |
| 6 | Tap "Next" | getChat() succeeds, Success screen appears |
| 7 | Tap "Start Uploading" | Navigate to Photos tab, onboarding closed |

### Negative Flow — Invalid Token

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Enter invalid bot token | Input accepted (allows typing) |
| 2 | Tap "Next" | getMe() fails, error alert shows |
| 3 | User corrects token | Error clears |
| 4 | Tap "Next" again | Validation succeeds, proceed to Step 2 |

### Negative Flow — Channel Access Error

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Enter channel ID, bot not added | Input accepted |
| 2 | Tap "Next" | getChat() fails, detailed error shows with checklist |
| 3 | User adds bot to channel | User taps "Next" again |
| 4 | Tap "Next" | Validation succeeds, proceed to Success |

### Edge Case — Skip Onboarding

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Tap "Skip for now" | Neutral message, onboarding closes |
| 2 | Open Settings tab | Bot configuration shows "Not configured" |
| 3 | Configure bot in Settings | Works identically to onboarding |
| 4 | Re-launch app | Onboarding does NOT show again |

---

## Definition of Done

- [x] Feature doc created and reviewed
- [x] Implementation plan created with component breakdown
- [x] OnboardingStep wrapper component built
- [x] 4-step onboarding flow implemented
- [x] Bot token and channel ID validation working
- [x] Success animation implemented (scale + spring)
- [x] Skippable with neutral messaging
- [x] Database flag `onboardingCompleted` persists
- [x] Navigation integration (show on first launch only)
- [x] Follows all design guidelines (MD3, dark mode, 48dp targets)
- [ ] Device tested on Android and iOS
- [x] No confirmshaming or deceptive patterns

---

## Notes

- Keep language beginner-friendly (avoid "channel ID", say "storage space number")
- Consider video tutorial link for visual learners
- Success screen could show first upload suggestion (visual callout)
- Future enhancement: Auto-detect channel ID from bot if possible (reduce friction)
