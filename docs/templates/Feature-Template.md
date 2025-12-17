# Feature: {{FeatureName}}

Status: {{Draft / In Progress / Implemented / Deprecated}}
Owner: {{Owner or team}}
Created: {{YYYY-MM-DD}}
Links: {{Issues / tickets}}

---

## Purpose

{{Short description of the business problem and value.}}

---

## Scope

### In scope

- {{Item}}

### Out of scope

- {{Item}}

---

## Business Rules

- {{Rule 1}}
- {{Rule 2}}
- {{Rule 3}}

---

## User Flows

### Primary flows

1. {{Flow name}}
   - Actor: {{User / Service}}
   - Trigger: {{Trigger}}
   - Steps: {{Short list}}
   - Result: {{Outcome}}

### Edge cases

- {{Edge case}} → {{Expected behaviour}}

---

## System Behaviour

- Entry points: {{API endpoints / UI / events / scheduled jobs}}
- Reads from: {{DB / service / cache}}
- Writes to: {{DB / service / queue}}
- Side effects / emitted events: {{List}}
- Idempotency: {{Yes/No, conditions}}
- Error handling: {{Rules and user-facing messages}}
- Security / permissions: {{AuthZ rules}}

---

## Diagrams

```mermaid
{{Mermaid diagram for main flow}}
```

---

## Verification (Mandatory: describe how to test)

### Test environment

- Environment: Expo development build on Android device/emulator
- Data: Use test Telegram bot and private channel

### Test commands

- typecheck: `npx tsc --noEmit`
- android: `npx expo run:android`

### Test flows

**Positive scenarios**

| ID | Description | Level | Expected result | Notes |
| --- | --- | --- | --- | --- |
| POS-001 | {{Happy path}} | Device | {{Outcome}} | {{Data}} |

**Negative scenarios**

| ID | Description | Level | Expected result | Notes |
| --- | --- | --- | --- | --- |
| NEG-001 | {{Validation failure}} | Device | {{Error}} | {{Input}} |

---

## Definition of Done

- Behaviour matches rules and flows in this document
- All test flows covered by manual device testing
- TypeScript compiles without errors
- Documentation updated

---

## References

- ADRs: {{Links to docs/ADR/*}}
- Code: {{Main modules}}
