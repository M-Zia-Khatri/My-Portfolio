# Game Section UI/UX Audit

Date: 2026-03-31
Scope:
- `client/src/features/home/sections/GameSection.tsx`
- `client/src/features/game/components/*`
- `client/src/features/game/context/GuessNumContext.tsx`
- `client/src/features/game/context/gameReducer.ts`
- `client/src/features/game/hooks/useTimer.ts`
- `client/src/features/game/store/GameSetStore.ts`

## 1) Mobile viewport clipping because section uses fixed `h-dvh`
- **File + component**: `GameSection.tsx` / `GameSection`
- **Exact issue**: On small screens, the game panel can be clipped and overlap with surrounding content/header; users see stacked cards cut off and awkward scroll behavior.
- **Root cause**: The wrapper uses `h-dvh` (`className="h-dvh w-full"`) while content inside is taller than one viewport (title, controls, number grid, score table). This forces an undersized container.
- **Suggested fix (minimal)**:
  - Replace with `min-h-dvh` on mobile and keep fixed height only for desktop if needed.
  - Example: `className="min-h-dvh w-full lg:h-dvh"`.

## 2) Score table can overflow horizontally on mobile
- **File + component**: `ScoreHistory.tsx` / `ScoreHistory`
- **Exact issue**: The score table has 5 columns and no horizontal scrolling wrapper, causing clipping/compression on narrow screens.
- **Root cause**: Container only enables vertical scroll (`overflow-y-auto`), no `overflow-x-auto` despite fixed table structure.
- **Suggested fix (minimal)**:
  - Wrap `Table.Root` in `div` with `overflow-x-auto`.
  - Set `min-w` on table (e.g., `min-w-[460px]`) so columns stay readable.

## 3) Feedback toast labeled mobile-only but rendered for all breakpoints
- **File + component**: `GameSection.tsx` + `Feedback.tsx`
- **Exact issue**: Comment says “Mobile feedback toast”, but feedback renders on desktop too, duplicating result signals with `GuessResult` and causing attention conflict.
- **Root cause**: `Feedback` is always mounted without breakpoint guards.
- **Suggested fix (minimal)**:
  - Mount `Feedback` only on small breakpoints (e.g., `lg:hidden` wrapper), or conditionally disable when left sidebar is visible.

## 4) Feedback message normalization typo leads to inconsistent messaging
- **File + component**: `Feedback.tsx` / `Feedback`
- **Exact issue**: Message uses `message.replace(/cols/, 'close')`. This can produce odd text if future messages contain `cols` in other contexts and does not properly normalize known states.
- **Root cause**: Ad-hoc regex replacement rather than explicit message mapping.
- **Suggested fix (minimal)**:
  - Map enum/message values explicitly:
    - `'too low' -> 'Too low'`
    - `'too high' -> 'Too high'`
    - `'very close' -> 'Very close'`
    - `'you win' -> 'You win'`

## 5) Custom level selection is identity-unsafe (name collisions)
- **File + component**: `SelDifficultLevel.tsx` / `SelDifficultLevel`
- **Exact issue**: If two custom presets share the same name, selecting from dropdown may load wrong preset.
- **Root cause**: `Select.Item value={lvl.name}` and lookup via `find((l) => l.name === val)` use name as identifier.
- **Suggested fix (minimal)**:
  - Use stable id in select value (`value={lvl.id}`), and resolve by id.
  - Keep display label as `lvl.name`.

## 6) Editing a custom level can reorder list unexpectedly (visual jump)
- **File + component**: `CustomLevelDialog.tsx` / `CustomLevelDialog`
- **Exact issue**: Saving an edited custom level removes old item then appends updated item; row jumps to end.
- **Root cause**: Edit flow uses `removeCustomLevel(editingId)` then `addCustomLevel(payload)` instead of in-place update.
- **Suggested fix (minimal)**:
  - Add `updateCustomLevel(id, patch)` action in store and preserve existing index.

## 7) Name editing in history is mouse-only (keyboard accessibility gap)
- **File + component**: `ScoreRow.tsx` / `ScoreRow`
- **Exact issue**: User must double-click name to edit; keyboard users cannot trigger edit through tab/enter.
- **Root cause**: Edit trigger is non-focusable `Text` with `onDoubleClick` only.
- **Suggested fix (minimal)**:
  - Make trigger a `button` or add `tabIndex={0}` + `onKeyDown` Enter/Space handling.
  - Add `aria-label` for edit affordance.

## 8) Start button allows empty/whitespace name (UX inconsistency)
- **File + component**: `HiddenNumber.tsx` / `HiddenNumber`
- **Exact issue**: Game starts even when name field is blank; scoreboard then stores empty names and displays placeholder later.
- **Root cause**: Start handler calls `setStarted(true)` with no validation.
- **Suggested fix (minimal)**:
  - Disable start unless `nameInput.trim().length > 0` or auto-fill default like "Player".

## 9) Post-game history clear also resets live game unexpectedly
- **File + component**: `ViewDelHistory.tsx` + `GuessNumContext.tsx`
- **Exact issue**: “Delete All” history action also restarts game state immediately, which is surprising if user only intended history cleanup.
- **Root cause**: Button uses `clearAndReloadHistory` (clear + startGame) rather than pure history clear.
- **Suggested fix (minimal)**:
  - Wire delete action to `clearHistory` only.
  - If reset is desired, make it explicit with button text: “Delete All & Reset Game”.

## 10) Timer/UI state can feel stale after difficulty change before start
- **File + component**: `GuessNumContext.tsx` + `useTimer.ts`
- **Exact issue**: Difficulty changes update limits in store, but random number/game state isn’t re-seeded until `startGame`. Depending on interaction order, user can see mixed pre-start state briefly (new timer with previous round state markers).
- **Root cause**: Settings are stored globally but reducer state refresh is only in `startGame`/restart.
- **Suggested fix (minimal)**:
  - On difficulty change (while `!started`), dispatch a lightweight reset action (`RESET_GAME` with new guessLimit) to keep UI consistent.

## 11) Spelling/content quality issue in primary heading
- **File + component**: `GameSection.tsx` / heading
- **Exact issue**: Heading reads “Gess the number”.
- **Root cause**: Typo in static copy.
- **Suggested fix (minimal)**:
  - Change to “Guess the number”.

---

## Performance-focused notes
1. `GuessNumContext` value object is recreated each render; all consumers rerender on any field update.
   - **Minimal fix**: Memoize provider value with `useMemo` and split context (state/actions) only if needed.
2. `ScoreHistory` updates copy full history array for single name edits.
   - **Minimal fix**: Add store action for index/id update to avoid full-map churn.
3. `Feedback` mounts/unmounts each guess with timeout; acceptable, but duplicate feedback channel on desktop amplifies paint churn.

These are not architecture refactors; they are targeted UI/rendering improvements.
