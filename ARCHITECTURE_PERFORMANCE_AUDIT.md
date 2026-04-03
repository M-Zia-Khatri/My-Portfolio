# Full-Stack Architecture & Performance Audit

## Scope
- Frontend: React + Vite + Tailwind + Radix + TanStack Query + Axios + Zustand + React Hook Form
- Backend: Node.js + Express + Prisma + MariaDB + Redis (cache + rate-limit)
- Modules reviewed: auth, contact, dashboard, game, skills, portfolio, shared

---

## Executive Summary (Brutally Honest)

### What is strong
1. **You already have several advanced patterns in place** (ETag optimistic locking, stale-while-revalidate cache helpers, request dedupe for token refresh, code-splitting for home sections).
2. **Feature-oriented frontend structure exists** and is directionally correct.
3. **Shared utility layers** (api, hooks, store, components) are present and reusable.

### What is currently limiting scale/performance
1. **State boundaries are blurred** (React Query auth state mirrored into Zustand; game state split between Context + Zustand with broad subscriptions).
2. **Feature boundaries are violated in places** (public portfolio section imports dashboard API/types).
3. **Backend business logic is controller-heavy** (validation + orchestration + cache + DB in controllers), which will become difficult to scale/test.
4. **Several performance-sensitive components still perform expensive work per frame/per render** (notably hero SVG animation and global game context updates).
5. **Security/ops hardening gaps** remain (hardcoded CORS origin and local-origin rate-limit bypass).

---

## 1) Architecture Review

## 1.1 Feature-based structure quality

**Current state:** Mostly good, but not strict.

- `features/*` and `shared/*` split is clear.
- However, the public `PortfolioSection` directly imports API/types from dashboard feature paths (`features/dashboard/...`), which creates cross-feature coupling and leaks admin implementation details into public UI.

### High-impact issue
- **Coupling smell:**
  - Public page imports `fetchPortfolio` from dashboard feature API. 
  - Public page also imports dashboard DTO type and remaps it locally.

### Refactor strategy
**Before:**
- `features/home/sections/PortfolioSection.tsx` imports dashboard API/type.

**After:**
- Create `features/portfolio/api/publicPortfolio.api.ts` and `features/portfolio/model/portfolio.dto.ts`.
- Dashboard uses `features/portfolio/api/adminPortfolio.api.ts`.
- Keep shared transport (`shared/api/axios.ts`) in shared; keep domain contracts in feature.

---

## 1.2 Separation of concerns (UI vs logic vs API vs state)

### Findings
- **Good:** UI files mostly do not call axios directly.
- **Needs work:** Auth and game layers combine orchestration + state syncing + side-effects in a way that increases cognitive load.

Examples:
- `AuthProvider` performs bootstrapping, react-query sync to Zustand, auto-refresh trigger, and has an internal logout function (currently not surfaced).
- `GuessNumContext` includes reducer state, timer, score calculation, persistence interactions, and side-effectful score writes.

### Refactor strategy
- Move non-UI orchestration into feature services/hooks:
  - `useAuthSessionController`
  - `useGuessGameEngine`
- Keep providers thin: only wiring and context value exposure.

---

## 1.3 Over-engineering vs missing abstraction

### Over-engineered areas
- **Auth state duplication** (React Query `['me']` + Zustand user/auth flags).
- **Guess game mixed state stores** (Context + Zustand + reducer + timer hook in one provider).

### Missing abstractions
- Backend lacks explicit service/use-case layer for `skill`, `portfolio`, `contact` (controllers are doing everything).

---

## 2) Frontend Optimization (Critical)

## 2.1 Unnecessary re-render risk: GuessNumContext

### Problem
`GuessNumContext` provides one large object containing rapidly changing values (`timeLeft`) and static handlers. Every tick can cause all consumers to re-render.

### Impact
- Components that do not need timer updates still re-render frequently.
- Game section becomes progressively heavier as UI grows.

### Fix
**Before:** single broad context value.

**After options:**
1. Split context into:
   - `GameStateContext` (stable/rare)
   - `TimerContext` (hot path)
   - `GameActionsContext` (stable callbacks)
2. Or move game runtime state into Zustand with selector-based subscriptions (`useStore(selector, shallow)`).

---

## 2.2 Context usage (AuthContext)

### Problem
Auth provider mirrors React Query result into Zustand store; this duplication can drift and increases updates.

### Recommendation
- Prefer **single source of truth**:
  - Keep session/user in React Query (`['me']`) and expose derived selectors via custom hooks.
  - Keep Zustand only for truly local app UI state (if needed).
- If keeping Zustand for auth, avoid duplicating `isLoading`/user transitions from query unless required by non-React consumers.

---

## 2.3 React Query strategy

### Good
- Global defaults are set.
- Feature-level stale time overrides exist where useful.

### Gaps
- Query key contracts are inline string arrays; central factory absent.
- Mutations do broad invalidation (`['skills']`) and miss targeted cache updates.

### Fix
- Introduce `queryKeys` module per feature.
- Use `setQueryData` for optimistic or exact updates where possible.
- Add `meta` labels for observability (devtools/logging).

---

## 2.4 Component splitting/code-splitting

### Good
- Home sections are lazy-loaded.

### Opportunities
- Heavy sections like game and skills can defer *internal* heavy subtrees too.
- Consider lazy-loading `BgScene` only above desktop breakpoint or when section becomes visible.

---

## 2.5 Animation bottlenecks (Hero BgScene)

### Problem
`BgScene` updates potentially many SVG paths each frame and rebuilds long `d` strings repeatedly in JS.

### Impact
- CPU-heavy on low-end devices.
- Can contend with main-thread input responsiveness.

### Recommendations
- Introduce frame-throttling (`if (performance.now() - last < 32) return`) for ~30fps effect.
- Reduce line count/segments adaptively by screen size and `prefers-reduced-motion`.
- Pause animation when tab hidden (`visibilitychange`) and when section not in viewport.
- Consider canvas/WebGL fallback for complex per-frame geometry.

---

## 3) State Management Audit

## 3.1 Correct ownership matrix

Use this as policy:
- **React Query**: server state (auth profile, skills, portfolio, contacts).
- **Zustand**: app/session-local client state with cross-tree use and selector benefits.
- **Context**: dependency injection / low-frequency shared values only.

## 3.2 Detected duplication
- Auth user + flags exist in both React Query and Zustand.
- Game state split across context and Zustand (`scoreHistory` + settings in Zustand; active runtime in context).

## 3.3 Refactor target
- Consolidate auth server-state to Query.
- For game: either
  - fully localize to feature store (Zustand selectors), or
  - keep context but split into granular providers and make `timeLeft` isolated.

---

## 4) API Layer & Data Flow

## 4.1 Axios layer

### Good
- Central axios instance.
- Refresh token queue avoids thundering herd on 401.
- ETag management in interceptor.

### Risks / improvements
- Global interceptors include console logs/warnings that can spam production logs.
- 401 refresh flow assumes `error.config` shape without strict guards.
- Custom header `X-Explicit-ETag` coupling should be documented with typed helpers.

### Refactor
- Add typed request helper wrappers: `apiGet`, `apiPatchWithEtag`, etc.
- Add environment-gated debug logging.
- Enforce error normalization in one place (`ApiError` schema).

## 4.2 UI calling APIs directly
- No major direct API calls in presentational components were found (good).
- Keep side-effects in hooks/services per feature.

---

## 5) UI & Component System

## 5.1 Reusable component health
- Shared components exist and virtualization utility is reused in game and admin contact tables (good).
- Some sections still carry too much orchestration state locally (e.g., `SkillsSection` manages tab state + mapping + effect triggers).

## 5.2 Prop drilling / composition
- No severe prop-drilling crisis detected.
- Watch for handler maps (`chipHandlers`) regenerated from arrays; fine now, but move to memoized child-level handlers if list grows significantly.

---

## 6) Performance Bottlenecks (Home focus)

## 6.1 Hero
- `BgScene` is the biggest front-end runtime cost (per-frame SVG path mutation loop).

## 6.2 SkillsSection
- Good memo usage.
- Could still reduce work by memoizing `SkillChip` individually with stable props and using `useDeferredValue` for expensive code render transitions on low-end devices.

## 6.3 GameSection
- The provider wraps full section; timer-driven updates can ripple through all children.
- Split providers or selector-based store is the most impactful fix.

## 6.4 Contact
- Form path appears straightforward; biggest wins are backend-side anti-spam and response latency rather than render perf.

---

## 7) Backend Review

## 7.1 Controller → Service → DB separation

### Current state
- `skill`, `portfolio`, `contact` controllers include validation, business rules, cache policy, and DB operations directly.

### Why it hurts
- Harder unit testing.
- Harder consistency across modules.
- More merge conflicts as team grows.

### Target
Create service layer per feature:
- `services/skills.service.ts`
- `services/portfolio.service.ts`
- `services/contact.service.ts`

Controller responsibilities:
- parse req
- call service
- map result to response

## 7.2 Prisma efficiency

### Good
- Pagination in contacts.
- Use of `select` in some auth queries.

### Gaps
- Schema lacks explicit indexes for common sort/filter columns (`created_at`, foreign key lookup heavy tables).
- Some list endpoints return full records where projection could reduce payload.

### Recommendations
- Add indexes on hot fields.
- Adopt explicit select/include policies.
- Add query timing instrumentation for slow-query detection.

## 7.3 Error handling consistency

- Global `catchError` exists (good).
- But some handlers still return 304 with body through `send(...)`; 304 should not include body. Normalize this everywhere.

## 7.4 Middleware and security hardening

### High risk findings
1. CORS origin hardcoded to localhost.
2. Rate limiter bypasses when origin is localhost.

### Recommendations
- Use env-driven allowed origins list.
- Remove origin-based bypass in middleware and gate bypass via explicit environment flag.

## 7.5 Caching strategy (Redis + ETag)

### Good
- Sophisticated cache layer with conditional semantics and lock/circuit strategies.

### Watch-outs
- Cache complexity is high for project size; maintainability risk.
- Ensure cache-key invalidation patterns are fully documented and tested.

---

## 8) Code Quality & Scalability

## High-impact anti-patterns
1. Mixed ownership of auth state.
2. Monolithic controller responsibilities.
3. Tight cross-feature imports (home ↔ dashboard).
4. Hot-path broad context updates in game.

## Refactor roadmap (prioritized)

### Phase 1 (Immediate, highest ROI)
1. Split game context/state subscriptions to stop timer-wide re-renders.
2. Remove public↔dashboard coupling for portfolio data access.
3. Harden CORS/rate-limit config via environment.
4. Standardize 304 behavior to empty body for all endpoints.

### Phase 2 (Architecture)
1. Introduce service layer under backend feature modules.
2. Consolidate auth source-of-truth strategy.
3. Introduce query-key factories and typed API wrappers.

### Phase 3 (Scale readiness)
1. Add OpenTelemetry or at least request + query latency metrics.
2. Add DB indexes and slow query monitoring.
3. Add contract tests for ETag + optimistic lock behavior.

---

## Bonus: Target architecture for SaaS-level scaling

## Frontend
- `app/` (composition root, providers, router)
- `features/<feature>/` with strict modules:
  - `api/` (network)
  - `model/` (types, query keys, adapters)
  - `state/` (feature-local client state if needed)
  - `ui/` (components)
  - `hooks/`
- `shared/` only for generic primitives (never feature business types)
- Enforce lint rule for forbidden cross-feature imports.

## Backend
- Vertical slices by feature:
  - `modules/<feature>/{controller,service,repository,validation,route}.ts`
- Shared infra:
  - `infra/prisma`, `infra/cache`, `infra/auth`, `infra/http`
- Add:
  - request correlation IDs
  - standardized error codes
  - background jobs (email/outbox) via queue
  - API versioning once external consumers exist

## Performance posture
- Frontend performance budgets (LCP, INP, CLS targets)
- Backend p95/p99 latency targets per endpoint
- Cache hit-rate SLOs and fallback behavior tests

---

## Quick Wins Checklist

- [ ] Split `GuessNumContext` hot vs cold state.
- [ ] Move public portfolio API contracts into `features/portfolio`.
- [ ] Replace hardcoded CORS origin with env-based allowlist.
- [ ] Remove localhost origin rate-limit bypass.
- [ ] Normalize all 304 responses to empty body.
- [ ] Add Prisma indexes on common sort/filter fields.
- [ ] Add backend service layer for `skill`, `portfolio`, `contact`.
- [ ] Add query key factories and typed API wrappers.

