# ADR-{{Number}}: {{Short Title}}

Status: {{Proposed / Accepted / Implemented / Rejected / Superseded}}
Date: {{YYYY-MM-DD}}
Owner: {{Owner or team}}
Related Features: {{Links to docs/Features/*}}
Supersedes: {{ADR-XXXX or N/A}}
Superseded by: {{ADR-YYYY or N/A}}

> Usage: draft here first. Once accepted, save a copy as `docs/ADR/ADR-{{Number}}-{{short-kebab-title}}.md` (English, kebab-case) and keep the template unchanged.

---

## Context

{{Current situation, constraints, problems.}}

---

## Decision

{{Short, direct statement of the chosen option.}}

Key points:

- {{Point 1}}
- {{Point 2}}

---

## Alternatives considered

### {{Option A}}

- Pros: {{List}}
- Cons: {{List}}
- Rejected because: {{Reason}}

### {{Option B}}

- Pros: {{List}}
- Cons: {{List}}
- Rejected because: {{Reason}}

---

## Consequences

### Positive

- {{Benefit}}

### Negative / risks

- {{Risk}}
- Mitigation: {{How to handle it}}

---

## Impact

### Code

- Affected modules / services: {{List}}
- New boundaries / responsibilities: {{Description}}

### Data / configuration

- Data model / schema changes: {{List or N/A}}
- Config changes: {{Keys, defaults}}
- Backwards compatibility: {{Strategy}}

### Documentation

- Feature docs to update: {{Links}}
- Notes for `AGENTS.md`: {{New rules or patterns}}

---

## Verification (Mandatory: describe how to test this decision)

### Test environment

- Environment: Expo development build on Android device/emulator

### Test commands

- typecheck: `npx tsc --noEmit`
- android: `npx expo run:android`

### New or changed tests

| ID | Scenario | Level | Expected result | Notes |
| --- | --- | --- | --- | --- |
| {{TST-001}} | {{Happy path}} | Device | {{Observable outcome}} | {{Data}} |

---

## Rollout and migration

- Migration steps: {{Steps}}
- Backwards compatibility: {{Strategy}}
- Rollback: {{How to revert}}

---

## References

- Issues / tickets: {{Links}}
- Related ADRs: {{Links}}

---

## Filing checklist

- [ ] File saved under `docs/ADR/ADR-{{Number}}-{{short-kebab-title}}.md`
- [ ] Status reflects real state
- [ ] Links to related features and ADRs are filled in
