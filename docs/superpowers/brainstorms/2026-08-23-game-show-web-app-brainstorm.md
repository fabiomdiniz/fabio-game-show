# Brainstorming: Game Show Web App (single-host)

**Date Started:** 2026-08-23
**Status:** Done
**Current Phase:** finalizing
**Based On:** —
**Final Spec:** docs/superpowers/specs/2026-08-23-game-show-web-app-design.md
**Last Updated:** 2026-08-23 19:25

## Original User Request

> I want to plan creating a web app that will be used during a whole day for a game show with people in-person
> At the game creation you will be able to specify who will play and that will create a game session, then for that game session it will be possible to select specific games to play and then based on who wins people will get points for their score
> the entire UI will be controlled by a single game host, there is no multiplayer needs
>
> * some games will be just a placeholder for a game happening in person (not in the site), like "Board Game", the UI will just show that a board game is being played and then ask for the winners, who will then get X points
> * another game will be Fábio-ly Feud - a custom version of Family Feud but with custom categories (focused on pop culture, Brazil, anime, music and movies). The host will control the UI which will be used to play the game
> * another game will be What is… Panda? - a custom version of Jeopardy but with custom categories (focused on pop culture, Brazil, anime, music and movies). The host will control the UI which will be used to play the game
> * There will be an admin page where the host can open at any time to control the storage and override points and players
> * The entire storage will use localstorage but with ability to export and import state

---

## Phase A: Alignment Decision Log

### Additional requirement (during Phase A): Fighting Game mode
> Similar to Board Game placeholder: a "Fighting Game" mode shows a fighting game is being played; the host selects who plays, brackets are created for 1v1 fights, and the final winner scores points.

### Q9: Fighting Game participants
**Options Presented:**
- A: Individual players only
- B: Individuals or teams
**Decision:** A — Individual players only enter the bracket.
**Rationale:** 1v1 fighting is person vs person.
**Timestamp:** 2026-08-23 18:25

### Q10: Fighting Game bracket format
**Options Presented:**
- A: Single elimination + byes
- B: Double elimination
**Decision:** A — Single-elimination, auto-seeded 1v1 bracket with byes for non-power-of-2 fields; host clicks each match winner to advance.
**Rationale:** Standard, simplest tournament shape for in-person play.
**Timestamp:** 2026-08-23 18:27

### Q11: Fighting Game scoring
**Options Presented:**
- A: Champion only, configurable X
- B: Champion + runner-up (separate 1st/2nd point values)
- C: Champion only, fixed 1
**Decision:** B — Champion and runner-up both score; host sets separate 1st-place and 2nd-place point values at setup.
**Rationale:** Rewards the runner-up too, without over-scoping placements.
**Timestamp:** 2026-08-23 18:29

### Q1: Tech stack
**Options Presented:**
- A: React + Vite + TypeScript
- B: Svelte + Vite
- C: Vanilla HTML/CSS/JS
- D: Vue + Vite
**Decision:** A — React + Vite + TypeScript
**Rationale:** Component-based, well suited to interactive boards/reveal UIs and the admin page; standard tooling; easy static deploy; node/npm available.
**Timestamp:** 2026-08-23 18:04

### Q2: Participants & scoring unit
**Options Presented:**
- A: Individual players only
- B: Teams only
- C: Mixed (both individual players and teams as separate participant types)
**Decision:** C — Mixed: sessions can hold both individual players and teams as distinct participant types with separate scoreboards; each game declares which participant kind it scores.
**Rationale:** Supports Feud (teams) and Jeopardy/placeholder (individuals or teams) without forcing one model for the whole day.
**Timestamp:** 2026-08-23 18:06

### Q3: Fábio-ly Feud scope
**Options Presented:**
- A: Main game (face-off + survey board + 3 strikes + steal), no Fast Money
- B: Full game incl. Fast Money bonus round
- C: Minimal (reveal board + manual points)
**Decision:** A — Main game with face-off, strikes, and steal; no Fast Money.
**Rationale:** Authentic Feud feel without the extra Fast Money build effort.
**Timestamp:** 2026-08-23 18:08

### Q4: What is… Panda? scope
**Options Presented:**
- A: Full (board + Daily Double + Final Jeopardy wager)
- B: Board + Daily Double (no Final)
- C: Board only (correct/wrong ± value)
**Decision:** A — Full: category×value board, Daily Double wagers, Final Jeopardy wager.
**Rationale:** Each extra piece (DD, Final) is small to build and gives the authentic Jeopardy feel.
**Timestamp:** 2026-08-23 18:10

### Q5: Game content authoring
**Options Presented:**
- A: Bundled starter content + in-app editor
- B: Bundled content only (edit code/JSON files)
- C: Import JSON only
**Decision:** B — Bundled content only: Feud/Jeopardy content lives in code/JSON files in the repo; the host edits files (no in-app content editor).
**Rationale:** Simplest to build; content is authored ahead of time by editing repo files.
**Timestamp:** 2026-08-23 18:12

### Q6: Session model
**Options Presented:**
- A: Single active session
- B: Multiple saved sessions (session library)
**Decision:** B — Multiple saved sessions: create/switch/delete named sessions, each with its own players, scores, and history.
**Rationale:** Supports reuse across days/events and matches the export/import backup workflow.
**Timestamp:** 2026-08-23 18:14

### Q7: Display model
**Options Presented:**
- A: Single shared screen (board + host controls together)
- B: Separate host view vs audience view
**Decision:** A — Single shared screen: the host controls everything on one screen, which is also projected/shown to the audience.
**Rationale:** Matches "single host, no multiplayer"; simplest UI and projection setup.
**Timestamp:** 2026-08-23 18:16

### Phase A → B Transition Confirmation [2026-08-23 18:20]
**Alignment Summary (compiled by ds):**
- Decision 1 (Q1): React + Vite + TypeScript SPA.
- Decision 2 (Q2): Mixed participants — sessions hold both individual players and teams as distinct participant types with separate scoreboards; each game declares which kind it scores.
- Decision 3 (Q3): Fábio-ly Feud = main game only (Face-Off, survey board with top answers, 3 strikes, steal); no Fast Money. Exactly 2 teams.
- Decision 4 (Q4): What is… Panda? = full Jeopardy (category×value board, Daily Double wager, Final Jeopardy wager).
- Decision 5 (Q5): Game content is bundled in repo files only (no in-app content editor); ship starter content for pop culture/Brazil/anime/music/movies.
- Decision 6 (Q6): Multiple saved sessions (library: create/switch/delete), each with own players, scores, history.
- Decision 7 (Q7): Single shared screen — host controls and the audience-facing board are the same screen.
- Decision 8 (Q8): English UI.
- Decision 9 (default): Storage = localStorage auto-save on every change; Export/Import = full app state as a JSON file (sessions, participants, scores, history, in-progress game).
- Decision 10 (default): Admin page = manage players/teams, override points, storage controls (export/import/clear), and session management.
- Decision 11 (default): Board Game (in-person placeholder) mode — a generic in-person-game placeholder: the UI shows the game is being played, then the host picks the winners and a point value (X), which the app adds to each winner. The host can name the game (default "Board Game"). Scoring is otherwise auto-computed (Feud/Jeopardy from game rules).
- Decision 12 (default): Static deployable SPA (Vite build; `npm run dev` locally; deployable to any static host). No backend.
- Decision 13 (Q9–Q11): New "Fighting Game" mode — individual players only; single-elimination 1v1 bracket (auto-seeded, byes for non-power-of-2); host clicks each match winner to advance; champion and runner-up each score configurable 1st/2nd-place point values.

**User Confirmation:** ✓ Confirmed

---

## Phase B: Spec Writing Status

- [✓] Initial draft complete (time: 2026-08-23 18:40)
- [✓] Round 1 revision
- [✓] Round 2 revision
- [✓] Round 3 revision
- [ ] Final sign-off

## Phase B Review Progress

> Spec drafts must include ## Acceptance Scenarios (Gherkin) after Design Principles.

### Round 1 [✓ complete]

**Dispatched reviewers (6):** architect | red-team | edge-cases | yagni-gatekeeper | bdd-reviewer | tdd-reviewer

**Receipt Status:** architect ✓ | red-team ✓ | edge-cases ✓ | yagni-gatekeeper ✓ | bdd-reviewer ✓ | tdd-reviewer ✓

**Round metadata:** dispatched_count: 6 | successful_receipt_count: 6 | excluded_roles: —

**Findings:**

| ID | Sev | Location | Reviewer | Problem | Arbiter | Status |
|----|-----|----------|----------|---------|---------|--------|
| F1.6 | B | §Acceptance/Data model | red-team | Delta-timing contradiction (immediate vs at-finish) | KEEP | ✓ FIXED |
| F1.1 | I | §Store | architect | Game-module↔store contract unspecified | KEEP | ✓ FIXED |
| F1.2 | I | §Design Principles | architect | Per-game acceptedKinds missing | KEEP | ✓ FIXED |
| F1.7 | I | §Admin | red-team | Participant-deletion semantics undefined | KEEP | ✓ FIXED |
| F1.8 | I | §Import | red-team | Import lacks referential-integrity validation | KEEP | ✓ FIXED |
| F1.9 | I | §Feud | red-team | Feud end-of-round when all revealed | KEEP | ✓ FIXED |
| F1.10 | I | §Sessions | red-team | No abandon action / one-in-progress rule | KEEP | ✓ FIXED |
| F1.14 | I | §Jeopardy | edge-cases | Wager bounds + Final eligibility undefined | KEEP | ✓ FIXED |
| F1.16 | I | §Sessions | edge-cases | Deleting active session dangles activeSessionId | KEEP | ✓ FIXED |
| F1.18 | I | §Store | edge-cases | localStorage write-failure unhandled | KEEP | ✓ FIXED |
| F1.25 | I | §Acceptance | bdd-reviewer | No failure-path scenarios | KEEP | ✓ FIXED |
| F1.29 | I | §Testing | tdd-reviewer | Test-first commitment absent | KEEP | ✓ FIXED |
| F1.30 | I | §Testing | tdd-reviewer | No concrete runnable commands | KEEP | ✓ FIXED |

**Arbiter Output:**
- counts: raw=31 → dedup=25 → after_filter=23 (B=1, I=12, N=10)
- degradation_check: N/A
- convergence_status: CONTINUE
- arbiter_rationale: 6 reviewers produced 31 findings; 6 dedup/merged, 2 conflict-discarded, leaving 23 (1 blocking, 12 important, 10 nit). Blocking delta-timing contradiction plus 12 important gaps → not converged; round 2 resolves the 13 revision instructions.

### Appendix (NITs)

- F1.3: version handling undefined → define CURRENT_VERSION=1, always serialize, reject ≠ current.
- F1.4: Jeopardy content lacks a Final Jeopardy clue slot → add one.
- F1.5: core unions prose-only → move GameConfig/GameState/GameResult + content interfaces into types.ts.
- F1.11: "padding to the next power of two" → "round up to the nearest power of two".
- F1.19: point-value constraints (positive ints, 2nd ≤ 1st).
- F1.23: drop createdAt/startedAt/finishedAt (ordered array suffices).
- F1.24: defer optional Playwright e2e.
- F1.26: reword team scenario Then clause observably.
- F1.27: pin Feud scenario reference value.
- F1.28: add Admin participant-CRUD scenario.

### Discarded

- F1.12, F1.13, F1.15, F1.17, F1.21: DEDUP_DISCARDED (duplicates of F1.14/F1.3/F1.7/F1.9/F1.3).
- F1.20: MERGED into F1.8.
- F1.22: FALSE_DISCARDED (version field retained as import discriminator).
- F1.31: FALSE_DISCARDED (Playwright e2e deferred; round-trip covered by unit tests).

### Round 2 [✓ complete]

**Dispatched reviewers (6):** architect | red-team | edge-cases | yagni-gatekeeper | bdd-reviewer | tdd-reviewer

**Receipt Status:** architect ✓ | red-team ✓ | edge-cases ✓ | yagni-gatekeeper ✓ | bdd-reviewer ✓ | tdd-reviewer ✓

**Round metadata:** dispatched_count: 6 | successful_receipt_count: 6 | excluded_roles: —

**Findings:**

| ID | Sev | Location | Reviewer | Problem | Arbiter | Status |
|----|-----|----------|----------|---------|---------|--------|
| F2.1 | B | §Lifecycle | edge-cases | Abandon leaves applied deltas w/ no rollback | KEEP | ✓ FIXED |
| F2.2 | B | §Import/Admin | red-team | Deleted scored participant breaks export→import round-trip | KEEP | ✓ FIXED |
| F2.3 | B | §Goals | bdd-reviewer | Goal 5 (no network) has no scenario | KEEP | ✓ FIXED |
| F2.4 | I | §Data model | yagni-gatekeeper | Generic untyped game contract erases type safety | KEEP | ✓ FIXED |
| F2.5 | I | §Store | architect | applyAction deltas vs buildResult dual scoring | KEEP | ✓ FIXED |
| F2.6 | I | §Admin | red-team | Deletion guard misses 'setup' status | KEEP | ✓ FIXED |
| F2.7 | I | §Import | red-team | Config invariants (distinct teams, entrant kind) unenforced | KEEP | ✓ FIXED |
| F2.8 | I | §Jeopardy | edge-cases | Final Jeopardy with empty eligible set undefined | KEEP | ✓ FIXED |
| F2.9 | I | §Import | edge-cases | Numeric bounds unvalidated | KEEP | ✓ FIXED |
| F2.10 | I | §Store | edge-cases | Version mismatch treated as corruption (data loss) | KEEP | ✓ FIXED |
| F2.11 | I | §Acceptance | bdd-reviewer | Write-failure/corruption error paths unscenaried | KEEP | ✓ FIXED |

**Round 2 arbitration:** user accepted all 11 findings — all fixed (statuses ✓ FIXED). Cheap NITs (F2.12–F2.19) also applied.

**Arbiter Output:**
- counts: raw=27 → dedup=21 → after_filter=19 (B=3, I=8, N=8)
- degradation_check: FAILED
- convergence_status: STOP_DEGENERATE
- arbiter_rationale: Round 2 converged on a durable core of data-integrity and round-trip gaps flagged independently by multiple roles, so blocking+important only fell 13→11 and degradation fails. YAGNI's version-field and write-warning removals were rejected as conflicts. NITs moved to appendix.

### Appendix (NITs)

- F2.12: strengthen Final Jeopardy scenario precondition (score ≥ 400).
- F2.13: define Feud steal award when round total is 0.
- F2.14: per-mode minimum selections; disable start otherwise.
- F2.15: disallow Admin override during in-progress game, or read wager bounds from Participant.points.
- F2.16: replace generic acceptedKinds-driven rendering with hardcoded kind checks.
- F2.17: state clue value in Jeopardy incorrect scenario (e.g. 400).
- F2.18: add Feud question answer-count to Given (e.g. four answers).
- F2.19: restructure destructive-confirmation scenario (action in When; add decline path).

### Discarded

- F2.20, F2.21, F2.22, F2.23, F2.24, F2.25: DEDUP_DISCARDED (duplicates of F2.4/F2.1/F2.2/F2.7).
- F2.26: FALSE_DISCARDED (keep version field + fix load path).
- F2.27: FALSE_DISCARDED (keep write-failure warning + add scenario).

### Round 3 [✓ complete]

**Dispatched reviewers (6):** architect | red-team | edge-cases | yagni-gatekeeper | bdd-reviewer | tdd-reviewer

**Receipt Status:** architect ✓ | red-team ✓ | edge-cases ✓ | yagni-gatekeeper ✓ | bdd-reviewer ✓ | tdd-reviewer ✓

**Round metadata:** dispatched_count: 6 | successful_receipt_count: 6 | excluded_roles: —

**Findings:**

| ID | Sev | Location | Reviewer | Problem | Arbiter | Status |
|----|-----|----------|----------|---------|---------|--------|
| F3.1 | B | §Contract | architect | applyAction can't compute PointDelta from (state,action) | KEEP | ✓ FIXED |
| F3.2 | B | §Admin/Import | red-team | Finished-game config/state ids break round-trip after deletion | KEEP | ✓ FIXED |
| F3.3 | I | §Lifecycle | red-team | Abandon vs mid-game override corrupts score | KEEP | ✓ FIXED |
| F3.4 | I | §Import | red-team | appliedDeltas ids unvalidated for in-progress games | KEEP | ✓ FIXED |
| F3.5 | I | §Store | red-team | Parseable-but-broken schema hydrates and crashes | KEEP | ✓ FIXED |
| F3.6 | I | §Feud | edge-cases | Failed-steal branch never reaches done | KEEP | ✓ FIXED |

**Arbiter Output:**
- counts: raw=18 → dedup=17 → after_filter=17 (B=2, I=4, N=11)
- degradation_check: FAILED
- convergence_status: STOP_LIMIT
- arbiter_rationale: Two spec-breaking inconsistencies (applyAction cannot compute deltas; finished-game deletion vs import id validation) are BLOCKING; four correctness/completeness gaps IMPORTANT. Validation-centralization refactor and version-mismatch scenario downgraded to NIT. No false findings.

### Appendix (NITs)

- F3.7: add validateConfig/referencedParticipantIds hooks to GameDefinition (applied).
- F3.8: document add-a-game checklist (applied).
- F3.9: import content-id existence checks (applied).
- F3.10: tighten numeric types in import (applied).
- F3.11: specify catalog disabled while inProgress (applied).
- F3.12: import id-uniqueness check (applied).
- F3.13: non-empty trimmed names (applied).
- F3.14: remove GameDefinition.description (applied).
- F3.15: remove per-instance title for fixed games (applied).
- F3.16: add version-mismatch scenario (applied).
- F3.17: tighten "runs with no network" Then (applied).

### Discarded

- F3.18: DEDUP_DISCARDED (edge-cases abandon/override duplicates F3.3).

---

## Phase B User Intervention Decisions

### I1 [✓ decided]
**Triggered in round:** Round 2 (STOP_DEGENERATE)
**Related finding:** F2.1–F2.11
**Reason for intervention:** Degradation check failed (blocking+important fell only 13→11); reviewers flagged a durable core of data-integrity/round-trip/type-safety gaps.
**Options Presented:**
- A: Accept all 11 and fix (then re-review)
- B: Fix BLOCKING only, defer IMPORTANT
- C: Defer all, finalize as-is
**User Decision:** A — accept all 11 and fix (plus cheap NITs).
**Rationale:** All findings are genuine correctness/data-integrity improvements.
**Timestamp:** 2026-08-23 19:05

### I2 [✓ decided]
**Triggered in round:** Round 3 (STOP_LIMIT)
**Related finding:** F3.1–F3.6
**Reason for intervention:** Hard 3-round ceiling reached; two BLOCKING (applyAction contract, finished-game deletion vs import) + four IMPORTANT gaps remained.
**Options Presented:**
- A: Accept all and fix (consistent with I1) → finalize
- B: Defer remaining → finalize as-is
**User Decision:** A — accept all and fix (standing "accept all and fix" instruction).
**Rationale:** All findings are genuine correctness/data-integrity improvements.
**Timestamp:** 2026-08-23 19:20
- B: ...
**User Decision:** <choice>
**Rationale:** <user reason>
**Timestamp:** YYYY-MM-DD HH:MM
