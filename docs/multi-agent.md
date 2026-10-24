# Multi-agent setup

Five agents work this repo in parallel, each in its own git worktree, branch and
dev-server port. Tooling: `scripts/agents.sh`.

| Agent | Owns (exclusive) | Branch | Port | URL |
|---|---|---|---|---|
| `master` | `src/screens/`, `src/components/`, `src/store/`, `src/types.ts`, `src/games/register.ts`, `src/index.css`, `src/App.tsx`, `src/main.tsx`, `src/content/`, `theme/`, `docs/`, `scripts/`, `index.html`, build config | `agent/master` | 5180 | http://localhost:5180/ |
| `board-game` | `src/games/boardGame/**` | `agent/board-game` | 5181 | http://localhost:5181/ |
| `fighting` | `src/games/fighting/**` | `agent/fighting` | 5182 | http://localhost:5182/ |
| `jeopardy` | `src/games/jeopardy/**` | `agent/jeopardy` | 5183 | http://localhost:5183/ |
| `feud` | `src/games/feud/**` | `agent/feud` | 5184 | http://localhost:5184/ |

Worktrees live side-by-side with the repo in `../fabio-game-show-agents/<agent>/`
(override with `AGENTS_DIR=...`), so Vite never scans another agent's checkout.

## Commands

```bash
bash scripts/agents.sh setup            # create/refresh all worktrees + agent files
bash scripts/agents.sh setup fighting   # just one
bash scripts/agents.sh status           # branch / dirty file count / server / URL
bash scripts/agents.sh urls             # URLs with a liveness check
bash scripts/agents.sh dev <agent>      # that agent's Vite server (foreground)
bash scripts/agents.sh run <agent>      # Hermes inside that worktree (interactive)
bash scripts/agents.sh run <agent> "…"  # one-shot prompt in that worktree
bash scripts/agents.sh sync [agent…]    # merge main into agent branches
bash scripts/agents.sh remove <agent> [--delete-branch]
bash scripts/agents.sh list             # the manifest
```

`setup` is idempotent: existing worktrees are reused, `node_modules` is only
installed when missing (`npm ci --prefer-offline`, ~10 s here), and the generated
agent files are rewritten every time.

## What `setup` generates in each worktree

All three are git-excluded via `.git/info/exclude` (still read from disk, just
never staged — so no agent's branch carries copies of them):

- **`.hermes.md`** — the agent's role: owned paths, the port, the workflow rules,
  and the standing instruction to end every reply with `App: <url>`.
- **`.agent/dev.sh`** — `npm run dev -- --port <port> --strictPort`. Strict port
  means a clash fails loudly instead of silently moving to another port.
- **`.agent/hermes.sh`** — `TERMINAL_CWD=$PWD hermes "$@"`.

### Why `.agent/hermes.sh` exists

Global config has `terminal.cwd: .`, and `.` resolves to `C:\Users\fabio`, so
Hermes pins project-context discovery to your home directory — no `.hermes.md`
or `AGENTS.md` in any project ever loads, and the agent sees no project rules.
The wrapper pins `TERMINAL_CWD` to the worktree for that one session, which is
what makes `.hermes.md` load. Verified: a session started through it reports its
own agent role and port.

If you'd rather fix it globally, `hermes config unset terminal.cwd` (or
`hermes config set terminal.cwd <path>`) makes every CLI session load project
context from its launch directory. That changes behaviour for gateway sessions
too, so it's a deliberate choice, not a default.

## Rules that keep the branches mergeable

1. **One owner per file.** Agents only edit their own paths. Anything shared —
   types, store, register, CSS, routing, package.json — belongs to `master`.
   A game agent that needs a shared change reports it instead of making it.
2. **Worktrees branch from `main`'s commit, not from your working tree.** Run
   `setup` and it warns when the main checkout is dirty; commit first if the
   agents must see those changes.
3. **Agents commit on `agent/<name>`** and never touch `main`. Integration is a
   merge (or PR) from those branches; `sync` merges `main` forward.
4. **Conflicts between two agents' branches** are resolved by a neutral third
   party — the `merge-reconciler` skill — never by either author, who will
   quietly favour their own side.
5. **One dev server per worktree, port fixed.** Never reuse another agent's port
   and never kill a server you didn't start; `status` shows what's live.

## Typical session

```bash
bash scripts/agents.sh setup                     # once, and after config changes
bash scripts/agents.sh dev fighting              # terminal 1  -> :5182
bash scripts/agents.sh run fighting              # terminal 2  -> agent session
# ...agent works, ends its reply with: App: http://localhost:5182/
bash scripts/agents.sh status                    # who's dirty, who's up
```
