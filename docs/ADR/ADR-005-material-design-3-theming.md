# ADR-005: Material Design 3 Theming

Status: Accepted
Date: 2025-12-18
Owner: User
Related Features: All UI components
Supersedes: N/A
Superseded by: N/A

---

## Context

We need a consistent design system for the photo gallery app that:
- Provides dark mode by default (user preference)
- Feels modern and polished
- Uses semantic color tokens (not hardcoded hex values)
- Supports light/dark theme switching
- Works well for photo content (neutral backgrounds, high contrast)

---

## Decision

Use **Material Design 3** color system with dark mode as default.

Key points:
- Color definitions in `constants/Colors.ts`
- Semantic tokens: primary, surface, onSurface, etc.
- Both light and dark schemes defined
- Components use tokens via `useColorScheme()`
- Custom tokens for domain-specific needs (uploadedBadge)

Color structure:
```typescript
const Colors = {
  light: { ... },
  dark: {
    primary: '#BB86FC',
    onPrimary: '#000000',
    surface: '#121212',
    onSurface: '#FFFFFF',
    // ... (Material Design 3 tokens)
  }
}
```

---

## Alternatives considered

### Custom color palette

- Pros: Full control, unique branding
- Cons: Time-consuming, no accessibility guidelines, reinventing wheel
- Rejected because: Material Design 3 provides accessibility out of the box

### TailwindCSS classes

- Pros: Utility-first, rapid development
- Cons: Not native to React Native, requires extra setup, conflicts with StyleSheet
- Rejected because: Not well-integrated with React Native ecosystem

### Styled Components

- Pros: CSS-in-JS, theme provider
- Cons: Runtime performance cost, extra dependency, learning curve
- Rejected because: React Native StyleSheet is performant and built-in

---

## Consequences

### Positive

- Consistent, professional design out of the box
- Accessibility-tested color contrasts
- Semantic naming improves code readability
- Theme switching support built-in
- Well-documented design guidelines
- Dark mode friendly for photo galleries

### Negative / risks

- Locked into Material Design aesthetics
- Less flexibility for unique branding
- Some custom colors needed (uploadedBadge)
- Mitigation: Extend with custom tokens as needed, core system stays Material

---

## Impact

### Code

- Color definitions: `constants/Colors.ts`
- Usage: All components import Colors and use via colorScheme
- No hardcoded hex values in components (rule in AGENTS.md)
- Theme detection: `useColorScheme()` hook

### Design tokens

Core Material Design 3 tokens:
- **Surface colors:** primary, surface, background, surfaceVariant
- **On-colors:** onPrimary, onSurface, onBackground (for text/icons)
- **Outline colors:** outline, outlineVariant (for borders)
- **State colors:** error, errorContainer (for validation)

Custom tokens:
- `uploadedBadge`: Color for cloud upload indicator
- More can be added as needed

### Documentation

- Design guidelines: docs/Development/design-guidelines.md
- Token usage: Always use semantic tokens, never hardcode colors

---

## Verification

### Test environment

- Visual: Both light and dark modes
- Accessibility: Color contrast ratios meet WCAG AA

### Test flows

| ID | Scenario | Level | Expected result | Notes |
| --- | --- | --- | --- | --- |
| TST-001 | Switch to light mode | Device | All colors update correctly | Check system settings |
| TST-002 | Switch to dark mode | Device | All colors update correctly | Default theme |
| TST-003 | Primary color usage | Visual | Consistent across all screens | Check buttons, icons |
| TST-004 | Text contrast | Visual | All text readable | Use contrast checker |

---

## References

- Material Design 3: https://m3.material.io/
- Color system: https://m3.material.io/styles/color/overview
- Accessibility: https://m3.material.io/foundations/accessible-design/overview
- Colors definition: constants/Colors.ts
- Design guidelines: docs/Development/design-guidelines.md
