# Game Show Web App Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers-deepseek-v4:subagent-driven-development (recommended) or superpowers-deepseek-v4:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A single-host, client-side SPA for running a full-day in-person game show — sessions, individual/team scoring, four game modes, an admin page, and localStorage persistence with JSON export/import.

**Architecture:** React + TypeScript SPA with a single global store (React Context + `useReducer`). All mutable state lives in one `AppState` object, persisted to localStorage on every mutation. Each of the four game modes is a pure `GameDefinition` module (config/state/action + `applyAction` returning score deltas) driven by a shared game registry; screens are thin views over the store.

**Tech Stack:** Vite, React 18, TypeScript, react-router-dom, Vitest + React Testing Library + jsdom.

**Spec:** `docs/superpowers/specs/2026-08-23-game-show-web-app-design.md`

---

### Task 1: Scaffold the Vite + React + TypeScript app

**Files:**
- Create: `package.json`, `tsconfig.json`, `tsconfig.node.json`, `vite.config.ts`, `index.html`, `src/main.tsx`, `src/App.tsx`, `src/index.css`
- Create: `vitest.setup.ts`

**Acceptance Criteria:**

Feature: App scaffold
  Scenario: App boots and renders the router
    Given the app is built and served
    When the host opens the root URL
    Then the app renders without a blank screen and a Sessions route exists

- [ ] **Step 1: Scaffold** — run `npm create vite@latest . -- --template react-ts` (in the repo root; accept the react-ts template). Then `npm install`.
- [ ] **Step 2: Install deps** — `npm install react-router-dom` and `npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom`.
- [ ] **Step 3: Configure Vitest** — in `vite.config.ts`, add `test: { environment: 'jsdom', setupFiles: './vitest.setup.ts', globals: true }` (and the `/// <reference types="vitest" />` triple-slash). Create `vitest.setup.ts` with `import '@testing-library/jest-dom'`.
- [ ] **Step 4: Add scripts** — in `package.json`, add `"test": "vitest run"`, `"test:watch": "vitest"`, and keep `"build": "tsc -b && vite build"`.
- [ ] **Step 5: Wire the router** — `src/main.tsx` renders `<App/>` in `#root`; `src/App.tsx` sets up `BrowserRouter` with placeholder routes `/` (Sessions), `/session/:id`, `/admin`. Each route renders a stub component that returns a heading.
- [ ] **Step 6: Verify** — run `npm run build` and confirm it exits 0; run `npm test` and confirm the (empty) suite exits 0.
- [ ] **Step 7: Commit** — `git add -A && git commit -m "chore: scaffold vite react-ts app with router and vitest"`

---

### Task 2: Define the data model in `src/types.ts`

**Files:**
- Create: `src/types.ts`

**Acceptance Criteria:**

Feature: Data model
  Scenario: Types compile with a discriminated GameInstance union
    Given `src/types.ts` on disk
    When `npm run build` runs
    Then the discriminated union narrows config/state by `kind` with no `unknown`

- [ ] **Step 1: Write the failing type test** — create `src/types.test.ts` that imports the types and asserts, at compile time, `const i: GameInstance = ...` narrows correctly (use a `satisfies`/exhaustive-switch helper `assertNever`).
- [ ] **Step 2: Implement `src/types.ts`** — add, per spec §Data model: `ParticipantKind`, `Participant`, `GameKind`, `PointDelta`, `GameResult`, `Session`, `AppState`, `CURRENT_VERSION = 1`, the `GameDefinition<K,C,S,A>` interface, and the `GameInstanceBase<K,C,S>` + `GameInstance` discriminated union plus per-kind `BoardGameConfig/State/Action`, `FightingConfig/State/Action`, `FeudConfig/State/Action`, `JeopardyConfig/State/Action`.
- [ ] **Step 3: Verify** — `npm run build` (types resolve), `npm test` (type test passes).
- [ ] **Step 4: Commit** — `git add src/types.ts src/types.test.ts && git commit -m "feat(types): add game-show data model and game definition contract"`

---

### Task 3: Add bundled content data

**Files:**
- Create: `src/content/feud.ts`, `src/content/jeopardy.ts`

**Acceptance Criteria:**

Feature: Bundled content
  Scenario: Content exports satisfy the interfaces
    Given `src/content/feud.ts` and `src/content/jeopardy.ts`
    When a test imports and validates them against the spec interfaces
    Then every Feud question has non-negative answer points and the Jeopardy board has categories plus a finalJeopardy

- [ ] **Step 1: Write the failing test** — `src/content/content.test.ts` imports the interfaces from `types.ts` and asserts: Feud categories/questions/answers are non-empty with `points >= 0`; Jeopardy `categories` non-empty, each clue `value > 0` (integer), and `finalJeopardy` present.
- [ ] **Step 2: Implement `feud.ts`** — export `feudCategories: FeudCategory[]` with starter questions across pop culture / Brazil / anime / music / movies (≥ 1 category, each with ≥ 2 questions, each question ≥ 2 answers with point values). Also export a flat `findFeudQuestion(id)` helper.
- [ ] **Step 3: Implement `jeopardy.ts`** — export `jeopardyBoard: JeopardyBoard` with `categories: JeopardyCategory[]` (≥ 5 categories × 5 clues, values 100–500, one `dailyDouble: true`) and `finalJeopardy: JeopardyFinal`. Also export `findJeopardyCategory(id)`.
- [ ] **Step 4: Verify** — `npm test` (content test passes), `npm run build`.
- [ ] **Step 5: Commit** — `git add src/content && git commit -m "feat(content): seed feud and jeopardy starter content"`

---

### Task 4: Implement the store reducer

**Files:**
- Create: `src/store/state.ts`, `src/store/reducer.ts`, `src/store/actions.ts`

**Acceptance Criteria:**

Feature: Store reducer
  Scenario: Session and participant mutations are pure
    Given an empty `AppState`
    When the reducer applies `createSession` then `addParticipant` actions
    Then state contains the session and participant with unchanged input objects

- [ ] **Step 1: Write failing tests** — `src/store/reducer.test.ts` covers: create/rename/delete session, set active session (and reset on delete of active), add/rename/delete participant, and the deletion guard (participant referenced by a non-finished game cannot be deleted).
- [ ] **Step 2: Implement `state.ts`** — `emptyState(): AppState` returning `{ version: CURRENT_VERSION, sessions: [], activeSessionId: null }`.
- [ ] **Step 3: Implement `actions.ts`** — typed action union: `CreateSession`, `RenameSession`, `DeleteSession`, `SetActiveSession`, `AddParticipant`, `RenameParticipant`, `DeleteParticipant`, `OverridePoints`, `StartGame`, `ApplyGameAction`, `FinishGame`, `AbandonGame`, `ClearState`, `ImportState`.
- [ ] **Step 4: Implement `reducer.ts`** — pure `reducer(state, action)` handling every action. `DeleteSession` resets `activeSessionId` if it pointed at the deleted session. `DeleteParticipant` throws/returns-unchanged if the participant is referenced by any game with `status !== 'finished'`. `OverridePoints` sets `Participant.points` to the given number. Use the shared `crypto.randomUUID()` for ids (shimmed in tests).
- [ ] **Step 5: Verify** — `npm test` (reducer tests green), `npm run build`.
- [ ] **Step 6: Commit** — `git add src/store && git commit -m "feat(store): pure reducer for sessions, participants, and game lifecycle"`

---

### Task 5: Implement persistence, export/import, and validation

**Files:**
- Create: `src/store/persistence.ts`

**Acceptance Criteria:**

Feature: Persistence
  Scenario: Export → clear → import round-trips state
    Given an app state with sessions and scores
    When the host exports, clears, and imports the same JSON
    Then the state is restored exactly
  Scenario: Invalid import is rejected
    Given current state
    When the host imports JSON with a dangling activeSessionId
    Then an error is returned and the current state is kept

- [ ] **Step 1: Write failing tests** — `src/store/persistence.test.ts` covers: `serialize`/`parse` round-trip; `validateState` rejects wrong version, dangling `activeSessionId`, missing participant id in a non-finished game's config/state/appliedDeltas, duplicate ids, empty names, and config invariants (teamAId≠teamBId, negative/zero point values); `validateState` accepts a finished game whose `result.awards` reference a deleted participant; `loadState` returns fresh state + preserved raw payload on corrupt/version-mismatch input.
- [ ] **Step 2: Implement `persistence.ts`** — `STORAGE_KEY = 'game-show:state'`; `serialize(state): string`; `parse(json): AppState | null`; `validateState(v: unknown): string | null` (returns error message or null) implementing the full import rule set from spec §Store/import; `loadState(): { state: AppState; preservedRaw?: string }`; `saveState(state)` with try/catch (returns `false` and keeps in-memory state authoritative on write failure); `exportState(state)` triggering a JSON download; `importFile(file): { state, error }`.
- [ ] **Step 3: Verify** — `npm test` (persistence tests green), `npm run build`.
- [ ] **Step 4: Commit** — `git add src/store/persistence.ts src/store/persistence.test.ts && git commit -m "feat(store): localStorage persistence with validated export/import"`

---

### Task 6: Wire the store context and game registry

**Files:**
- Create: `src/store/gameRegistry.ts`, `src/store/StoreContext.tsx`

**Acceptance Criteria:**

Feature: Store context and registry
  Scenario: applyAction commits deltas and abandon restores initialPoints
    Given a store with a session and an in-progress game
    When a game action returns a positive delta and the store commits it
    Then the participant's points increase immediately and the delta is recorded
    When the game is abandoned
    Then the participant's points are restored to the pre-game value

- [ ] **Step 1: Write failing tests** — `src/store/store.test.tsx` uses a fake `GameDefinition` to assert: `StartGame` snapshots `initialPoints`; committing a `{ participantId, delta }` increments `Participant.points` and appends a name-enriched `PointDelta`; `FinishGame` sets `result = { awards: appliedDeltas }`; `AbandonGame` restores `initialPoints`; only one game may be `inProgress` (starting a second is rejected).
- [ ] **Step 2: Implement `gameRegistry.ts`** — export `gameDefinitions: Record<GameKind, GameDefinition<...>>` populated with the four modules (initially stubbed; Task 9–12 fill them in). Export `getGameDefinition(kind)`.
- [ ] **Step 3: Implement `StoreContext.tsx`** — `StoreProvider` using `useReducer(reducer, loadState().state)`, an effect that calls `saveState` on every state change (ignoring write failures), and exposes `state`, `dispatch`, plus helpers `startGame`, `applyGameAction`, `finishGame`, `abandonGame` that delegate to the registry (`getGameDefinition`) and dispatch the corresponding actions with name-enriched deltas.
- [ ] **Step 4: Verify** — `npm test` (store tests green), `npm run build`.
- [ ] **Step 5: Commit** — `git add src/store && git commit -m "feat(store): context provider and game registry with delta commit/abandon"`

---

### Task 7: Sessions screen

**Files:**
- Create: `src/screens/Sessions.tsx`
- Modify: `src/App.tsx`

**Acceptance Criteria:**

Feature: Sessions
  Scenario: Create, switch, and delete sessions
    Given no sessions
    When the host creates "Saturday Show" and then deletes it
    Then the list reflects the create and the delete

- [ ] **Step 1: Write failing component test** — `src/screens/Sessions.test.tsx` renders `<Sessions/>` inside `StoreProvider` (fresh state) and asserts: creating a session shows it; clicking it navigates to `/session/:id`; deleting (with confirm) removes it.
- [ ] **Step 2: Implement `Sessions.tsx`** — list sessions, a "New session" form (non-empty trimmed name), a delete button with a `window.confirm` guard, and navigation to `/session/:id`. Empty-state message when no sessions.
- [ ] **Step 3: Wire in `App.tsx`** — route `/` renders `<Sessions/>`.
- [ ] **Step 4: Verify** — `npm test`, `npm run build`.
- [ ] **Step 5: Commit** — `git add src/screens/Sessions.tsx src/App.tsx && git commit -m "feat(sessions): session list/create/switch/delete screen"`

---

### Task 8: Participants and scoreboard (Session screen)

**Files:**
- Create: `src/screens/Session.tsx`, `src/components/Scoreboard.tsx`, `src/components/ParticipantForm.tsx`

**Acceptance Criteria:**

Feature: Participants
  Scenario: Add individual players and teams
    Given a session
    When the host adds player "Ana" and team "Team Red" (members "Ana","Bruno")
    Then the scoreboard lists both with independent scores
  Scenario: Deletion is guarded
    Given a participant referenced by an in-progress game
    When the host tries to delete them
    Then deletion is disabled

- [ ] **Step 1: Write failing tests** — `src/screens/Session.test.tsx` asserts adding players/teams, rendering the scoreboard sorted by points descending, and the deletion guard.
- [ ] **Step 2: Implement `Scoreboard.tsx`** — render participants sorted by `points` desc, with a kind badge (individual/team) and team members.
- [ ] **Step 3: Implement `ParticipantForm.tsx`** — add individual (name) or team (name + member names), non-empty trimmed validation.
- [ ] **Step 4: Implement `Session.tsx`** — load the session by route param, show scoreboard + participant form, a "Play a game" catalog (four buttons from `gameDefinitions`), and a link to `/admin`. The catalog is disabled while a game is `inProgress`.
- [ ] **Step 5: Verify** — `npm test`, `npm run build`.
- [ ] **Step 6: Commit** — `git add src/screens/Session.tsx src/components && git commit -m "feat(session): participants, scoreboard, and game catalog"`

---

### Task 9: Board Game mode

**Files:**
- Create: `src/games/boardGame/definition.ts`, `src/games/boardGame/BoardGameScreen.tsx`
- Modify: `src/store/gameRegistry.ts`

**Acceptance Criteria:**

Feature: Board Game
  Scenario: Award points to winners
    Given players "Ana","Bruno","Carla"
    When the host starts a Board Game "Catan", picks "Ana","Carla", points 5, and awards
    Then "Ana" and "Carla" each gain 5 and the game records to history

- [ ] **Step 1: Write failing test** — `src/games/boardGame/definition.test.ts`: `initialConfig` has `pointValue=1, name='Board Game'`; `validateConfig` rejects non-positive `pointValue`; `applyAction` `award` returns a `+pointValue` delta per winner; `isFinished` true after `award`.
- [ ] **Step 2: Implement `definition.ts`** — `BoardGameConfig { name, pointValue }`, `BoardGameState { winners }`, `BoardGameAction { type:'award', winnerIds }`. `initialState` folds `pointValue` in; `applyAction` returns deltas; `isFinished` returns true once awarded.
- [ ] **Step 3: Implement `BoardGameScreen.tsx`** — setup (name, pointValue, winner multi-select, ≥1 winner required), standby screen "`<name>` is being played…", award button, and result view. Register the route `/session/:id/game/:gameId`.
- [ ] **Step 4: Wire registry** — replace the stub with the real definition.
- [ ] **Step 5: Verify** — `npm test`, `npm run build`.
- [ ] **Step 6: Commit** — `git add src/games/boardGame src/store/gameRegistry.ts && git commit -m "feat(board-game): in-person placeholder with winner point award"`

---

### Task 10: Fighting Game mode (bracket)

**Files:**
- Create: `src/games/fighting/bracket.ts`, `src/games/fighting/definition.ts`, `src/games/fighting/FightingScreen.tsx`
- Modify: `src/store/gameRegistry.ts`

**Acceptance Criteria:**

Feature: Fighting Game
  Scenario: Bracket generation and completion
    Given individual players A,B,C,D
    When the host starts a Fighting Game (1st=10, 2nd=5) and advances to a champion
    Then the champion gains 10, the runner-up gains 5, others gain 0
  Scenario: Byes for non-power-of-2
    Given individual players A,B,C
    When the host starts a Fighting Game
    Then the bracket rounds up to 4 with one bye

- [ ] **Step 1: Write failing tests** — `src/games/fighting/bracket.test.ts`: `buildBracket([ids])` returns balanced rounds; 3 entrants → size 4 with 1 bye; `definition.test.ts`: `validateConfig` rejects non-individual entrants and `second > first`; `advance` sets match winner and propagates; finishing produces champion + runner-up deltas.
- [ ] **Step 2: Implement `bracket.ts`** — `buildBracket(entrantIds): Match[][]` rounding up to the nearest power of two, distributing byes across the first round; `advance(bracket, matchId, winnerId)`.
- [ ] **Step 3: Implement `definition.ts`** — config/state/action per spec; `isFinished` when the final match has a winner; `applyAction` for `advance` emits first/second-place deltas only at the final.
- [ ] **Step 4: Implement `FightingScreen.tsx`** — setup (select 2+ individual players, 1st/2nd points), bracket view (click winner per match), champion/runner-up result.
- [ ] **Step 5: Wire registry** — replace the stub.
- [ ] **Step 6: Verify** — `npm test`, `npm run build`.
- [ ] **Step 7: Commit** — `git add src/games/fighting src/store/gameRegistry.ts && git commit -m "feat(fighting): single-elimination bracket with champion/runner-up scoring"`

---

### Task 11: Fábio-ly Feud mode

**Files:**
- Create: `src/games/feud/definition.ts`, `src/games/feud/FeudScreen.tsx`
- Modify: `src/store/gameRegistry.ts`

**Acceptance Criteria:**

Feature: Feud
  Scenario: A round with strikes and a steal
    Given teams "Team Red","Team Blue" and a 4-answer question
    When the host marks Red the face-off winner, reveals 3 answers, then 3 strikes and a Blue steal
    Then Blue receives the round total
  Scenario: All-revealed ends the round
    Given a 2-answer question
    When both answers are revealed
    Then the controlling team receives the total and the round ends

- [ ] **Step 1: Write failing tests** — `src/games/feud/definition.test.ts` covers: face-off reveals top answer; reveal accumulates total; 3 strikes + correct steal credits the stealing team; failed steal credits controlling team and ends round; all-revealed ends round; `validateConfig` rejects `teamAId===teamBId` and unknown question ids.
- [ ] **Step 2: Implement `definition.ts`** — per spec §Feud; `initialState` folds the selected questions (via `findFeudQuestion`) into state; phase machine `faceOff → board → steal → done`.
- [ ] **Step 3: Implement `FeudScreen.tsx`** — setup (two teams, question selection), face-off, board (reveal slots / strike button), steal, and round totals; result view.
- [ ] **Step 4: Wire registry** — replace the stub.
- [ ] **Step 5: Verify** — `npm test`, `npm run build`.
- [ ] **Step 6: Commit** — `git add src/games/feud src/store/gameRegistry.ts && git commit -m "feat(feud): face-off/board/strikes/steal loop"`

---

### Task 12: What is… Panda? (Jeopardy) mode

**Files:**
- Create: `src/games/jeopardy/definition.ts`, `src/games/jeopardy/JeopardyScreen.tsx`
- Modify: `src/store/gameRegistry.ts`

**Acceptance Criteria:**

Feature: Jeopardy
  Scenario: Correct/incorrect adjust score
    Given players "Ana","Bruno"
    When the host reveals a 200 clue answered by Ana and marks correct
    Then Ana gains 200; a later incorrect clue deducts its value from the responder
  Scenario: Daily Double and Final wager bounds
    Given Ana with in-game score 300
    When Ana wagers 300 on a Daily Double and answers correctly
    Then Ana gains 300
    And a wager above the bound is rejected

- [ ] **Step 1: Write failing tests** — `src/games/jeopardy/definition.test.ts`: correct/incorrect deltas; Daily Double wager bound `0..max(score, highest clue value)`; Final eligibility (positive score) and wager `0..score`; empty eligible set skips Final and finishes; `validateConfig` rejects empty/duplicate participantIds and unknown category ids.
- [ ] **Step 2: Implement `definition.ts`** — per spec §Jeopardy; `initialState` folds selected categories/clues; phases `board → finalJeopardy`.
- [ ] **Step 3: Implement `JeopardyScreen.tsx`** — setup (participants, categories), clue grid (reveal, pick responder, correct/incorrect), Daily Double wager, Final Jeopardy (eligibility + wagers + reveal), result view.
- [ ] **Step 4: Wire registry** — replace the stub.
- [ ] **Step 5: Verify** — `npm test`, `npm run build`.
- [ ] **Step 6: Commit** — `git add src/games/jeopardy src/store/gameRegistry.ts && git commit -m "feat(jeopardy): board, daily double, and final jeopardy"`

---

### Task 13: Admin page

**Files:**
- Create: `src/screens/Admin.tsx`
- Modify: `src/App.tsx`

**Acceptance Criteria:**

Feature: Admin
  Scenario: Override points and manage participants
    Given player "Ana" at 10
    When the host opens Admin, renames "Ana" to "Ana B.", and sets her points to 50
    Then the roster shows "Ana B." and the scoreboard shows 50
  Scenario: Export and import
    Given current state
    When the host exports then imports the file
    Then state is restored; a corrupt file is rejected with the current state kept

- [ ] **Step 1: Write failing tests** — `src/screens/Admin.test.tsx`: rename participant, override points, export triggers a download, import of an invalid file shows an error and keeps state, clear state requires confirmation.
- [ ] **Step 2: Implement `Admin.tsx`** — participant list (rename/delete with the non-finished guard), point override (number input + set), and storage controls (Export, Import file input, Clear with `window.confirm`), and a link back to the session.
- [ ] **Step 3: Wire in `App.tsx`** — route `/admin` renders `<Admin/>`.
- [ ] **Step 4: Verify** — `npm test`, `npm run build`.
- [ ] **Step 5: Commit** — `git add src/screens/Admin.tsx src/App.tsx && git commit -m "feat(admin): participant management, point override, storage controls"`

---

### Task 14: Polish, projection styling, and final build

**Files:**
- Modify: `src/index.css`, `src/App.tsx`, and screen/game components for layout/type scale

**Acceptance Criteria:**

Feature: Final polish
  Scenario: Build passes and app is usable on a projector
    Given the full app
    When `npm run build` and `npm test` run
    Then both exit 0 with no type errors or failing tests

- [ ] **Step 1: Styling pass** — apply large, high-contrast typography and board layouts suitable for a projector (min font sizes, strong color contrast for revealed/hidden state).
- [ ] **Step 2: Edge-case sweep** — add missing empty states (no session, no participants, empty eligible Final set) and confirm the catalog is disabled while a game is in progress.
- [ ] **Step 3: Full verification** — run `npm test` (all suites green) and `npm run build` (clean).
- [ ] **Step 4: Commit** — `git add -A && git commit -m "style: projection-friendly styling and empty states"`
