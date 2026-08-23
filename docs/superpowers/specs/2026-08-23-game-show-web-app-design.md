# Game Show Web App — Design Spec

**Date:** 2026-08-23
**Status:** Draft (Phase B, final)
**Decision log:** `docs/superpowers/brainstorms/2026-08-23-game-show-web-app-brainstorm.md`

## Problem

A single game host runs a full-day, in-person game show. Today the host has no tool to
organize who is playing, run the games on a shared screen, and keep a running score that
persists across the whole day. The games mix activities that happen entirely off-screen
(board games, fighting games) with two custom on-screen games — a Family Feud variant and
a Jeopardy variant. Scores must survive page reloads, be correctable at any time, and be
backed up / moved between devices.

## Goals

- Let the host create multiple named **sessions**, each with its own set of **participants**
  (individual players and/or teams), **scores**, and **played-game history**.
- Let the host launch four game modes per session and have the app award points automatically:
  1. **Board Game** (in-person placeholder)
  2. **Fighting Game** (single-elimination 1v1 bracket)
  3. **Fábio-ly Feud** (Family Feud variant)
  4. **What is… Panda?** (Jeopardy variant)
- Provide an **Admin page** reachable at any time to manage participants, override points,
  and control storage.
- Persist the entire app state in **localStorage** with **export/import** to/from a JSON file.
- Run entirely client-side (static SPA, no backend, no network).

## Non-Goals

- No multiplayer, networking, or real-time sync — one host controls everything on one screen.
- No in-app authoring of game content — content is bundled in repo files (see Design → Content).
- No accounts, authentication, or server persistence.
- No Fast Money round (Feud), no double elimination (Fighting Game).
- No internationalization (English UI only).

## Design Principles

1. **Single host, single screen.** The host controls and the audience-facing display are the
   same view. Every interaction is a deliberate host action.
2. **Mixed participants.** Individuals and teams are first-class participant types with their
   own scores; each game declares which kinds it accepts.
3. **Content is data.** Feud questions and Jeopardy categories are plain typed data modules
   (not code paths), so new content is added by editing files.
4. **One source of truth.** All mutable state lives in a single store that auto-persists to
   localStorage; the UI renders from it.
5. **Live scoreboard, single authorship.** Point changes are applied to `Participant.points`
   immediately as the host action that earns them occurs, and the same accumulated deltas form
   the game's result — scoring is written once, never twice.
6. **Safe destructive actions.** Clearing/importing/replacing/deleting/abandoning state always
   requires explicit host confirmation, and import validates structure and invariants first.
7. **Projection-friendly UI.** Large type and high-contrast boards suitable for a TV/projector.

## Acceptance Scenarios

> Gherkin scenarios. "Participants" may be individual players or teams unless a mode says otherwise.

```gherkin
Feature: Sessions and participants
  Scenario: Create a session and add players
    Given the app has no sessions
    When the host creates a session named "Saturday Show" and adds players "Ana" and "Bruno"
    Then the session "Saturday Show" appears in the session list with players "Ana" and "Bruno"

  Scenario: Create and manage a team
    Given a session exists
    When the host creates a team "Team Red" with members "Ana" and "Bruno"
    Then the scoreboard lists "Team Red" as a single participant whose own score is independent of "Ana" and "Bruno" individual scores

  Scenario: Switch and delete sessions
    Given sessions "A" and "B" exist and "A" is active
    When the host switches to "B" and then deletes "A"
    Then "A" is removed and "B" remains active with its own participants and scores

  Scenario: Deleting the active session
    Given a single session "A" is active
    When the host deletes "A"
    Then "A" is removed and the app shows the empty session list with no active session

Feature: Board Game (in-person placeholder)
  Scenario: Award points to winners
    Given a session with players "Ana", "Bruno", and "Carla"
    When the host starts a Board Game, names it "Catan", picks winners "Ana" and "Carla", and sets points to 5
    Then "Ana" and "Carla" each gain 5 points and the game is recorded in history with those awards

  Scenario: Board Game requires at least one winner
    Given a session with players
    When the host starts a Board Game but selects no winners
    Then the award action is disabled

Feature: Fighting Game (bracket)
  Scenario: Complete a bracket and score champion + runner-up
    Given a session with individual players "A", "B", "C", and "D"
    When the host starts a Fighting Game with players A, B, C, D, 1st place = 10, 2nd place = 5
    Then a single-elimination bracket is created
    When the host advances winners until a champion and runner-up are determined
    Then the champion gains 10 points, the runner-up gains 5 points, and no other player gains points

  Scenario: Bracket handles a non-power-of-2 field
    Given a session with individual players "A", "B", and "C"
    When the host starts a Fighting Game with players A, B, C
    Then the bracket rounds up to the nearest power of two and contains byes so that every participant has a path to the final

Feature: Fábio-ly Feud
  Scenario: Play one survey round to completion
    Given a session with teams "Team Red" and "Team Blue" and a Feud question with four answers
    When the host starts a Feud game and selects the two teams and that question
    Then the board shows the question with four hidden answer slots
    When the host marks "Team Red" the face-off winner, revealing the top answer worth 40
    And the host reveals two more answers worth 10 and 20
    Then "Team Red" has a running round total of 70 points
    When the host marks three strikes and "Team Blue" steals with a correct answer
    Then "Team Blue" receives 70 points

  Scenario: A round ends when all answers are revealed
    Given a Feud round with two answers worth 15 and 25
    When the controlling team reveals both answers before three strikes
    Then the controlling team receives 40 points and the round ends

  Scenario: A failed steal ends the round
    Given a Feud round with unrevealed answers and three strikes
    When the other team attempts a steal and is incorrect
    Then the remaining answers are revealed and the controlling team receives the round total

Feature: What is… Panda? (Jeopardy)
  Scenario: Correct and incorrect responses adjust score
    Given a session with players "Ana" and "Bruno"
    When the host starts a Jeopardy game and reveals a 200-point clue answered by "Ana"
    And the host marks the response correct
    Then "Ana" gains 200 points
    When a later 400-point clue is answered incorrectly by "Bruno"
    Then "Bruno" loses 400 points

  Scenario: Daily Double wager
    Given a Jeopardy game in progress and "Ana" with a current in-game score of at least 300
    When the host reveals a Daily Double clue and "Ana" wagers 300
    And the host marks the response correct
    Then "Ana" gains 300 points

  Scenario: Final Jeopardy wager
    Given a Jeopardy game in progress and "Ana" with a current in-game score of at least 400
    When the host runs Final Jeopardy and "Ana" wagers 400 and answers correctly
    Then "Ana" gains 400 points

Feature: Admin and storage
  Scenario: Manage participants from Admin
    Given a session with player "Ana"
    When the host opens Admin and renames "Ana" to "Ana B." and adds player "Bruno"
    Then the roster shows "Ana B." and "Bruno"

  Scenario: Override points
    Given a session with player "Ana" at 10 points
    When the host opens Admin and sets "Ana" points to 50
    Then the scoreboard shows "Ana" at 50 points

  Scenario: Export and import state
    Given a session with players and scores
    When the host exports state
    Then a JSON file is downloaded containing all sessions, participants, scores, and history
    When the host clears state and then imports that JSON file
    Then the app state is restored exactly as exported

  Scenario: Reject an invalid import
    Given the app has current state
    When the host imports a JSON file whose active session references a session id that does not exist
    Then the app shows an error and keeps the current state unchanged

  Scenario: Destructive actions require confirmation
    When the host attempts a destructive action (clear state, delete session, or import)
    Then a confirmation prompt appears
    When the host confirms
    Then the action proceeds
    When the host declines
    Then the action is cancelled and state is unchanged

  Scenario: Persist across reload
    Given a session with scores
    When the host reloads the page
    Then the same session, participants, and scores are shown

  Scenario: Corrupted storage falls back safely
    Given the stored state is corrupted or structurally invalid
    When the app loads
    Then it starts with a fresh empty state without crashing and the raw payload is preserved

  Scenario: Version mismatch preserves the payload
    Given stored state has a version older than the app version
    When the app loads
    Then the raw payload is preserved, a warning is shown, and the host is offered an export before starting fresh

  Scenario: Storage write failure keeps in-memory state authoritative
    Given localStorage writes throw an error
    When the host awards points to a player
    Then the score still updates on screen and a non-blocking "scores are not persisting" warning is shown

Feature: Client-side operation
  Scenario: Runs with no network
    Given the app is served as static files and the network is unavailable
    When the host creates a session, plays a game, and awards points
    Then a session is created, points are awarded, and no request leaves the device

Feature: Lifecycle
  Scenario: Abandon a mis-started game restores its points
    Given a Jeopardy game in progress where "Ana" already gained 200 points
    When the host abandons the game and confirms
    Then the game is discarded and "Ana"'s score is restored to its value before the game started
```

## Design

### Data model

```ts
type ParticipantKind = 'individual' | 'team';

interface Participant {
  id: string;
  kind: ParticipantKind;
  name: string;              // non-empty, trimmed
  members?: string[];        // team member display names (teams only)
  points: number;            // running session score
}

type GameKind = 'boardGame' | 'fighting' | 'feud' | 'jeopardy';

interface PointDelta {
  participantId: string;
  participantName: string;   // snapshot, so history survives participant deletion
  delta: number;             // signed change applied to Participant.points
}

interface GameResult {
  awards: PointDelta[];      // accumulated deltas earned during the game
}

interface Session {
  id: string;
  name: string;              // non-empty, trimmed
  participants: Participant[];
  games: GameInstance[];     // ordered history + at most one in-progress game
}

interface AppState {
  version: number;           // = CURRENT_VERSION (1)
  sessions: Session[];
  activeSessionId: string | null;
}
```

`CURRENT_VERSION = 1` is a constant; export always serializes it.

**`GameInstance` is a discriminated union** — `kind` narrows `config` and `state` with no casts:

```ts
interface GameInstanceBase<K extends GameKind, C, S> {
  id: string;
  kind: K;
  status: 'setup' | 'inProgress' | 'finished';
  config: C;
  state: S;
  initialPoints: Record<string, number>;  // each participant's points at game start (for abandon)
  appliedDeltas: PointDelta[];            // log of deltas already committed to session scores
  result?: GameResult;                    // = { awards: appliedDeltas } once finished
}

type GameInstance =
  | GameInstanceBase<'boardGame',  BoardGameConfig,  BoardGameState>
  | GameInstanceBase<'fighting',   FightingConfig,   FightingState>
  | GameInstanceBase<'feud',       FeudConfig,       FeudState>
  | GameInstanceBase<'jeopardy',   JeopardyConfig,   JeopardyState>;
```

A game's display title comes from its `GameDefinition.title`; only Board Game lets the host set
a per-instance name (stored in `BoardGameConfig.name`).

**Game-module ↔ store contract.** Each game module implements a `GameDefinition` typed to its
concrete config/state/action, and the store drives all four through this interface:

```ts
interface GameDefinition<K extends GameKind, C, S, A> {
  kind: K;
  title: string;
  acceptedKinds: ParticipantKind[];                 // participant kinds this game scores
  initialConfig: () => C;
  initialState: (c: C) => S;                        // folds scoring inputs into state
  validateConfig: (c: C) => string | null;          // returns an error string, or null if valid
  applyAction: (s: S, a: A) => { state: S; deltas: { participantId: string; delta: number }[] };
  isFinished: (s: S) => boolean;
}
```

Each module also declares its own action union (`BoardGameAction`, `FightingAction`,
`FeudAction`, `JeopardyAction`) in `src/types.ts` — there is no shared stringly-typed action
envelope. `initialState` folds in the scoring inputs each game needs (Board Game's `pointValue`;
the selected Feud questions and their answer points; the selected Jeopardy categories and clue
values), so `applyAction` only needs `(state, action)` to compute deltas. `applyAction` returns
`{ participantId, delta }[]`; the store enriches each with `participantName` (from the session's
participant list) to form `PointDelta`. The setup UI and the importer both call
`validateConfig`, so game invariants live with their module rather than in the central importer.

The store holds a registry of the four `GameDefinition`s. On every `applyAction` the store
(1) commits the returned deltas to `Participant.points` immediately, (2) wraps them with names and
appends to `instance.appliedDeltas`. When `isFinished` is true it sets `result = { awards:
appliedDeltas }` and appends the instance to history. **Scoring is authored once** (in
`applyAction`); the result is the accumulated log, never recomputed.

**Game config/state/action unions** — declared in `src/types.ts` as the single source of truth;
content modules import from it.

- `boardGame`: config `{ name: string; pointValue: number }` (positive integer; `name` defaults to
  "Board Game"); action `{ type: 'award', winnerIds: string[] }`; state folds in `pointValue` and
  tracks `{ winners: string[] }`.
- `fighting`: config `{ firstPlacePoints: number; secondPlacePoints: number; entrants: string[] }`
  (both positive integers, `secondPlacePoints <= firstPlacePoints`, entrants all
  `kind: 'individual'`); action `{ type: 'advance', matchId: string, winnerId: string }`; state is
  the bracket (rounds of matches with `playerA`, `playerB`, `winnerId`, `bye`).
- `feud`: config `{ teamAId: string; teamBId: string; questionIds: string[] }` (`teamAId !==
  teamBId`, both `kind: 'team'`, ≥ 1 question id, each present in bundled content); state folds in
  the selected questions and tracks, per question, the phase (`faceOff` | `board` | `steal` |
  `done`), revealed answer indices, strike count, and the accumulated round total.
- `jeopardy`: config `{ participantIds: string[]; categoryIds: string[] }` (both non-empty and
  distinct, each category id present in bundled content); state folds in the selected categories
  and tracks remaining clues, per-participant in-game scores, the active clue, and the phase
  (`board` | `finalJeopardy`).

### Content (bundled data)

```ts
// src/content/feud.ts
interface FeudAnswer { text: string; points: number }   // points = survey value (non-negative)
interface FeudQuestion { id: string; question: string; answers: FeudAnswer[] }
interface FeudCategory { id: string; name: string; questions: FeudQuestion[] }

// src/content/jeopardy.ts
interface JeopardyClue {
  id: string;
  value: number;             // point value (positive integer)
  clue: string;              // the "answer"
  response: string;          // the expected "question"
  dailyDouble?: boolean;
}
interface JeopardyCategory { id: string; name: string; clues: JeopardyClue[] }
interface JeopardyFinal { category: string; clue: string; response: string }
interface JeopardyBoard { categories: JeopardyCategory[]; finalJeopardy: JeopardyFinal }
```

Starter content is seeded for the themes pop culture, Brazil, anime, music, and movies. The host
adds new content by editing these modules (no in-app editor).

### Game mechanics

**Board Game (placeholder).** Setup: name (default "Board Game") + point value X (positive
integer). In-progress screen is a standby "`<name>` is being played…". The host selects one or
more winning participants (≥ 1 winner required); on "Award", each winner's session score is
increased by X immediately.

**Fighting Game.** Setup: host selects 2+ individual players, first-place points, and second-place
points (positive integers, second ≤ first). The app builds a balanced single-elimination bracket,
rounding the field **up to the nearest power of two** with byes. The host clicks the winner of each
match to advance. When the final is decided, the champion gains first-place points and the
runner-up (final loser) gains second-place points immediately.

**Fábio-ly Feud.** Exactly two distinct teams. Each selected question is a round:
1. **Face-Off** — the host marks which team won the face-off; that team controls the board, and
   the top answer is revealed, seeding the round total.
2. **Board** — the question and hidden answer slots are shown. The host reveals an answer slot when
   a guess is correct, accumulating the revealed answer points into the round total; a wrong guess
   adds a strike (max 3).
3. **All revealed** — when the last hidden answer slot is revealed (regardless of strike count), the
   controlling team takes the round total and the phase moves to `done`.
4. **Steal** — after 3 strikes, the other team gets one guess. Correct → the stealing team takes the
   round total. Incorrect → the controlling team keeps it, the remaining answers are revealed, and
   the phase moves to `done`.
5. The round total is credited to the winning team's session score immediately at round end; the
   game proceeds to the next question or finishes.

**What is… Panda? (Jeopardy).** Setup: host selects participants (individuals or teams) and
categories (each ≥ 1). The board is a category × clue grid with per-clue values.
- A clue is revealed; the host picks the responding participant and marks the response
  **correct** (+value) or **incorrect** (−value); the session score changes immediately.
- **Daily Double**: the responder wagers before seeing the clue, bounded by
  `0 ≤ wager ≤ max(current in-game score, highest clue value)`; correct +wager, incorrect −wager.
- **Final Jeopardy**: after the board is cleared, each participant with a positive in-game score is
  eligible and places a wager `0 ≤ wager ≤ current in-game score`; the final clue is revealed, and
  the host marks each correct/incorrect (±wager). If **no participant has a positive in-game score**,
  Final Jeopardy is skipped and the game finishes.
- The in-game score is the net of deltas applied during this game. Admin point override edits
  `Participant.points` (the session scoreboard) and is independent of a game's in-game score;
  wager bounds always use the in-game score.

**Lifecycle rules (all games).** At most one game per session may be `inProgress`; while one is
`inProgress`, the "Play a game" catalog is disabled (the host must finish or abandon the current
game first). At game start, the store snapshots each involved participant's points into
`instance.initialPoints`. An `abandon` action (with confirmation) restores each participant's
points to their `initialPoints` snapshot and discards the game, leaving session scores as if the
game had never started.

### Store, persistence, export/import

- A single global store holds `AppState` (React Context + `useReducer`). Mutations are pure
  reducer actions, which keeps every transition testable.
- The store subscribes to changes and writes `AppState` to `localStorage` under one key
  (`game-show:state`) on every mutation.
- **Write-failure handling**: if a localStorage write throws (quota exceeded, private mode,
  storage disabled), the store catches it, keeps the in-memory state authoritative, and surfaces a
  non-blocking "scores are not persisting" warning.
- **Load handling**: on load, the store runs the same structural validation as import. A valid
  state hydrates. A corrupted/unparseable/structurally-invalid payload falls back to a fresh empty
  state, logs it, and **preserves the raw payload** in storage (not overwritten). A valid-JSON
  payload whose `version !== CURRENT_VERSION` is likewise preserved: the host sees a warning and is
  offered to export the raw payload before choosing to start fresh.
- **Export** serializes `AppState` (always including `version: CURRENT_VERSION`) to JSON and
  triggers a file download (`game-show-state-<date>.json`).
- **Import** reads the chosen JSON file and, after host confirmation, validates it fully before
  replacing state:
  - `version === CURRENT_VERSION`; session ids unique; per-session participant ids unique; names
    non-empty and trimmed;
  - `activeSessionId` is `null` or an existing session;
  - for every game whose `status` is `setup` or `inProgress`: every participant id referenced by
    its `config`, `state`, and `appliedDeltas` exists in that session, and `validateConfig` passes.
    **Finished games are exempt** — they are historical records whose display uses
    `result.awards[].participantName`, so their ids need not resolve;
  - per-game config invariants (via `validateConfig`): `teamAId !== teamBId`; Fighting entrants all
    `kind: 'individual'` and point values positive integers with `second ≤ first`; Board Game
    `pointValue` a positive integer; Jeopardy `participantIds` non-empty/distinct and `categoryIds`
    non-empty with ids present in bundled content; Feud `questionIds` non-empty with ids present in
    bundled content; answer/clue values non-negative/positive per the content contracts.
  Any mismatch rejects the import and keeps the current state untouched.

### Screens / routing

- **Sessions** — list/create/switch/delete sessions. Deleting the active session resets
  `activeSessionId` (to `null`, or to another surviving session if one remains).
- **Session** — participant roster, scoreboard, "Play a game" catalog (the four registered games),
  and a link to Admin.
- **Game screens** — one component per game kind (setup → in-progress → result), rendering the
  projection-friendly board plus host controls on the same screen, with an **Abandon** action
  (confirmed).
- **Admin** — reachable from anywhere (header button / route): participant CRUD (players and
  teams), point override, and storage controls (export / import / clear).

### Admin participant-deletion semantics

A participant referenced by any game whose `status !== 'finished'` (i.e. `setup` or `inProgress`)
cannot be deleted — the UI disables deletion and explains why. A participant referenced only by
finished history may be deleted; their historical awards still render because
`PointDelta.participantName` snapshots the name at award time, and import does not require
finished-history ids to resolve.

### Error handling

- **Import validation failure** — show a clear error and keep the current state untouched.
- **Corrupted / structurally-invalid localStorage** — fall back to a fresh empty state without
  crashing, and preserve the raw payload.
- **Version mismatch** — preserve the raw payload, warn, and offer to export before resetting.
- **localStorage write failure** — keep in-memory state authoritative and warn non-blockingly.
- **Destructive actions** (delete session, clear state, import, abandon) — require confirmation.

## Implementation Phases

1. **Scaffold** — Vite + React + TypeScript app, routing, store with localStorage persistence,
   export/import utilities.
2. **Sessions & participants** — session CRUD, participant (player/team) CRUD, scoreboard.
3. **Board Game mode** — setup, standby screen, winner selection, point award.
4. **Fighting Game mode** — bracket generation (round up to nearest power of two, with byes),
   host-driven advancement, champion/runner-up scoring.
5. **Fábio-ly Feud** — face-off / board / all-revealed / strikes / steal loop with bundled content.
6. **What is… Panda?** — board, correct/incorrect scoring, Daily Double, Final Jeopardy.
7. **Admin page** — participant management, point override, storage controls.
8. **Content & polish** — starter content for the five themes, projection-friendly styling, final
   pass.

## Testing Strategy

Each behavior is implemented **test-first**: a failing test is written and run before the code
that makes it pass (red → green → refactor).

- **Vitest + React Testing Library** for unit and component tests.
- **Pure-logic unit tests** (highest value): bracket generation, Feud/Jeopardy `applyAction`
  reducers, delta accumulation/abandon restoration, and export/import serialization + validation.
- **Component tests** for key flows: create session, award Board Game points, advance a bracket
  match, reveal a Feud answer, mark a Jeopardy clue correct/incorrect.
- **Runnable commands**: `npm test` → `vitest run`; `npm run build` → `tsc && vite build`.
- End-to-end (Playwright) round-trip (export → clear → import) is **deferred**; the round-trip is
  covered by unit tests of serialization + validation.

## File Inventory

```
src/
  main.tsx
  App.tsx
  store/            # state, reducers, game registry, persistence, export/import, validation
  types.ts          # Participant, GameKind, PointDelta, GameResult, GameInstance union,
                    # GameDefinition, per-kind config/state/action unions
  content/
    feud.ts
    jeopardy.ts
  screens/
    Sessions.tsx
    Session.tsx
    Admin.tsx
  games/
    boardGame/  fighting/  feud/  jeopardy/
  components/       # scoreboard, bracket, board, shared UI
```

> Adding a future game mode touches: the `GameKind`/`GameInstance` unions, the store registry, the
> catalog entry, and its own `games/<name>/` module + `validateConfig`. This is a small, explicit
> checklist — an acceptable extension cost for four fixed modes.

## Out of Scope

- Multiplayer / networking / real-time sync / spectator devices.
- In-app content authoring.
- Backend, auth, or server persistence.
- Fast Money round; double-elimination brackets.
- i18n / non-English UI.
- Placements beyond 1st/2nd in Fighting Game.
- Schema migrations beyond the load-time version-mismatch warning and export path.
