# Wyvern Photos - UI/UX Design Guidelines

Design principles learned from industry best practices to create a premium, user-friendly photo vault experience.

---

## Core Laws of UX to Follow

### 1. Aesthetic-Usability Effect
> Users perceive aesthetically pleasing design as more usable.

**Application:**
- Invest in beautiful dark mode with gradient accents
- Use smooth animations and micro-interactions
- Polish visual details - they make users more tolerant of minor issues

### 2. Fitts's Law
> Time to acquire target = function of distance and size.

**Application:**
- Touch targets minimum 48x48dp (preferably 56dp for primary actions)
- FAB for primary action (Upload) - large, easy to reach
- Bottom navigation for thumb-friendly access
- Adequate spacing between selectable items

### 3. Hick's Law
> Decision time increases with number of choices.

**Application:**
- Limit options in settings (use smart defaults)
- Progressive disclosure - show advanced options only when needed
- Highlight recommended options (e.g., WiFi-only backup)
- Use progressive onboarding, not all-at-once setup

### 4. Miller's Law (7±2)
> Working memory holds 7±2 items.

**Application:**
- Chunk photo grid into logical sections (by date, folder)
- Limit visible stats/info at once
- Use tabs to organize (Photos, Cloud, Settings)

### 5. Jakob's Law
> Users prefer familiar patterns from other apps.

**Application:**
- Follow Google Photos / Apple Photos conventions
- Standard photo grid with selection behavior
- Familiar gestures: long-press to select, pinch to zoom
- Pull-to-refresh for updates

### 6. Peak-End Rule
> Users judge experience by peak moment and ending.

**Application:**
- Celebrate successful uploads with satisfying animations
- Smooth onboarding completion with success state
- Never end on error - always provide next action
- Upload complete notification should feel rewarding

### 7. Tesler's Law (Conservation of Complexity)
> Complexity must exist somewhere - system or user.

**Application:**
- Handle Telegram API complexity internally
- Auto-detect channel ID if possible
- Smart defaults for backup settings
- Tooltips/guidance for complex features (encryption)

### 8. Doherty Threshold
> Response time < 400ms keeps users engaged.

**Application:**
- Optimistic UI updates (show success before confirmation)
- Skeleton loading states
- Progress indicators for uploads
- Instant visual feedback on selection

### 9. Von Restorff Effect (Isolation Effect)
> Different items are remembered better.

**Application:**
- Highlight upload FAB with primary color
- Visual distinction for encrypted photos
- Badge for pending uploads count
- Use color to differentiate cloud vs local photos

---

## Deceptive Patterns to AVOID

### Never Use:
- **Confirmshaming** - Don't guilt trip ("No, I don't want to protect my photos")
- **Preselection** - Don't pre-check optional features
- **Hidden costs** - Be transparent about Telegram limits
- **Forced action** - Don't require unnecessary permissions
- **Obstruction** - Make deletion/export easy
- **Trick wording** - Use clear, honest language
- **Nagging** - Respect user's choices, don't repeatedly ask
- **Visual interference** - Don't make important options hard to see

### Ethical Design:
- Clear opt-in for all features
- Easy-to-find delete/cancel options
- Transparent about what data is stored where
- Honest about encryption limitations

---

## Fluid Responsive Design (Utopia)

### Typography Scale
Define base sizes that scale fluidly between devices:

| Step | Mobile (360px) | Tablet/Desktop |
|------|----------------|----------------|
| -1   | 12px           | 14px           |
| 0    | 14px           | 16px (body)    |
| 1    | 16px           | 18px           |
| 2    | 18px           | 22px           |
| 3    | 22px           | 28px           |
| 4    | 28px           | 36px (headers) |

### Spacing Scale
Use consistent spacing multiples:
- xs: 4dp
- sm: 8dp
- md: 16dp
- lg: 24dp
- xl: 32dp
- 2xl: 48dp

### Grid
- Photo grid: 3 columns on phone, 4-5 on tablet
- Consistent padding: 16dp horizontal
- Gap between items: 2-4dp for photos

---

## Visual Hierarchy

### Primary Actions
- Upload FAB: Filled, primary color, elevated
- Selection checkmarks: Prominent, high contrast

### Secondary Actions
- Settings toggles: Standard switches
- Navigation: Outlined or text buttons

### Information
- Badges: Small, colored indicators
- Progress: Thin bars or circular indicators
- Stats: Subtle, secondary text color

---

## Animation Guidelines

### Micro-interactions
- Selection: Scale 0.95 → 1.0 with haptic feedback
- FAB: Subtle scale on press
- Checkmark: Pop-in animation

### Transitions
- Page transitions: Shared element for photos
- Modal: Slide up from bottom
- Settings expansion: Smooth height animation

### Loading States
- Skeleton placeholders (not spinners) for photo grid
- Progress bar for uploads
- Shimmer effect for loading thumbnails

---

## Accessibility

- Minimum touch target: 48x48dp
- Color contrast: 4.5:1 for text
- Screen reader support for all actions
- Reduce motion option respected
- Clear focus indicators

---

## Dark Mode Priority

Since user prefers dark mode:
- Default to dark theme
- OLED-friendly true black backgrounds
- Comfortable contrast (not too stark)
- Accent colors that pop against dark

---

## Sources

- [Laws of UX](https://lawsofux.com/)
- [Utopia - Fluid Responsive Design](https://utopia.fyi/)
- [Deceptive Patterns](https://www.deceptive.design/)
- [Material Design 3](https://m3.material.io/)
