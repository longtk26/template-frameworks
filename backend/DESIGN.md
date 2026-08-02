# DESIGN.md — Agent Orchestrator Frontend

## 0. Design read

**Reading this as:** an internal developer-tool dashboard for engineering users who register a
repo, kick off an AI-agent pipeline run, and supervise six agent roles
(Researcher → Designer → Frontend → Backend → Tester → Reviewer) through two human checkpoints
(plan review, code review). This is **product/dashboard UI, not a marketing surface** — per the
landing-page taste skill's own scope note (Section 13), the landing-page playbook (hero
composition, eyebrow rationing, marquee limits, etc.) does not apply here. What *does* carry over
and is applied throughout: the anti-slop discipline (no AI-purple glow, no fake precision, real
empty/loading/error states, one accent color, one radius system, accessible contrast, dark-mode-first,
no decorative dots except real semantic state).

**System choice (taste skill Section 2.A):** "Modern SaaS where you own the components" →
**shadcn/ui** on **Tailwind v4**, **Radix primitives** underneath (dialogs, tooltips, tabs,
dropdowns), **Motion** (`motion/react`) for the handful of motivated transitions. This is a
devtool audience (like Linear, Vercel, GitHub Actions, Render) — dark mode is the default surface,
light mode is fully supported, not an afterthought.

**Product-UI dial reading** (adapted from the taste skill's dials, since this is data-dense product
UI rather than a landing page):
- **Layout predictability:** high (grid-driven, not asymmetric) — a pipeline dashboard must be
  scannable at a glance, not "designed."
- **Motion:** restrained — status transitions, SSE event arrivals, and checkpoint state changes
  animate (feedback + hierarchy); nothing decorative or looping.
- **Density:** medium-high — run history and event timelines are genuinely data-dense; the
  Projects/Runs list stays airy, the Run Detail timeline is dense but never a raw unstyled table.

---

## 1. Information architecture

```
┌─ Sidebar ──────────────┬─ Main ───────────────────────────────────────┐
│ Agent Orchestrator      │  Top bar: breadcrumb · global "New Run" · 🔔 │
│ ─────────────────────  │ ──────────────────────────────────────────── │
│ ▸ Projects              │  <screen content>                            │
│ ▸ Runs                  │                                               │
│ ▸ Role Configs           │                                               │
│ ▸ Notifications (badge)  │                                               │
│ ─────────────────────  │                                               │
│ Settings · Account      │                                               │
└─────────────────────────┴───────────────────────────────────────────────┘
```

Five screens, one persistent shell:

1. **Projects** — registry of repos the orchestrator knows about.
2. **Project Detail** — one project's settings + its run history.
3. **New Run** (drawer, launched from Projects/Project Detail/global top bar).
4. **Run Detail** — the centerpiece: pipeline stepper, live event timeline, artifact viewer,
   checkpoint actions.
5. **Role Configs** — the 6 global default role configs, with per-project override affordance.
6. **Notifications** — center-wide notification list (also available as a top-bar flyout).

---

## 2. Screens

### 2.1 Projects (home)

**Purpose:** the landing screen after opening the app. Answers "what repos do I have wired up,
and what's running right now."

- Header: `Projects` title + `Register project` primary button (top-right, one CTA, no duplicate
  "Add repo" button anywhere else on this screen).
- Body: card grid (not a dense table — this list is small by nature, one row per repo). Each
  project card shows: repo name (parsed from `repoUrl`), default branch as a monospace pill,
  mirror path in muted small text, and a compact strip of its 3 most recent runs as small status
  dots + relative time (`2h ago`, real semantic-state dots, not decorative).
- Clicking a card opens **Project Detail**.
- Empty state (no projects yet): centered illustration-free panel — icon (Phosphor `GitBranch`),
  "No projects registered yet," one sentence of explanation, and the same `Register project` CTA
  reused (no second wording for the same intent).
- Loading state: skeleton cards matching the exact card shape (image-free, so skeleton is just
  three shimmering text bars + a pill), never a spinner.

### 2.2 Register Project (modal)

Form fields, label-above-input, helper text under each:
- Repo URL (validated as a git URL; inline error below field on blur if malformed)
- Default branch (text input, prefilled `main`)
- Mirror path (optional, helper text: "Defaults to `.workspaces/<project-id>`")
- Bootstrap toggle: "Scaffold from template-frameworks" (switch) — when on, reveals a read-only
  note showing the `TEMPLATE_FRAMEWORKS_REPO_URL` that will be cloned into `backend/`/`frontend/`.
- Footer: `Cancel` (ghost) / `Register project` (primary, disabled until repo URL validates).
- Submit state: button shows inline spinner + "Registering…", modal cannot be dismissed mid-submit.
- Error state: form-level inline banner above the fields (e.g. "That repo URL is already
  registered"), not a toast — the user needs to fix a field.

### 2.3 Project Detail

- Header: project name, repo URL (copyable, monospace, truncated with tooltip on overflow),
  default branch pill, `New run` primary button.
- Two tabs (Radix `Tabs`, not a second nav): **Runs** (default) and **Settings**.
  - **Runs tab:** table of this project's runs — columns: status badge, request description
    (truncated to one line), current role, started, duration. Row click → Run Detail. Sorted
    newest first. Empty state: "No runs yet for this project" + `New run` CTA.
  - **Settings tab:** editable repo URL / default branch / mirror path (same field shapes as the
    register form), plus a `Role config overrides` section that deep-links into Role Configs
    filtered to this project.
- Destructive action (`Remove project`) lives in a low-emphasis position at the bottom of Settings,
  ghost/red text button, confirmation dialog required (typed confirmation of the project name for
  safety, since this cannot be undone).

### 2.4 New Run (drawer, right-side slide-in)

Kept as a drawer, not a full page, since it's a 2-field action fired from multiple entry points:
- Project (pre-filled if launched from Project Detail, otherwise a searchable select)
- Request description (multi-line textarea, "describe the feature or change" placeholder text —
  not placeholder-as-label, a real label sits above it)
- Footer: `Cancel` / `Start run` (primary). On submit, drawer closes and the app navigates straight
  to the new Run Detail screen showing the `queued` state — the user should immediately see their
  run enter the pipeline, not land back on a list.

### 2.5 Run Detail (the centerpiece screen)

This is where users spend most of their time. Vertical composition, top to bottom:

**A. Run header (sticky-lite, scrolls with a bit of a persistent bar below it)**
- Run id (monospace, copyable), request description as the de-facto page title, project name as
  a breadcrumb crumb, overall status badge (large, semantic-colored pill), `Cancel run` (ghost,
  only enabled while active) top-right.

**B. Pipeline stepper**
- Horizontal row of 6 nodes on desktop (`≥768px`): Researcher → Designer → Frontend → Backend →
  Tester → Reviewer. Each node: role icon (see Section 4) in a circle + role label underneath.
- Node visual states (this is the state machine made visible):
  - **Pending:** neutral outline circle, muted label.
  - **Running:** filled circle with a soft pulsing ring (the *one* justified continuous animation
    on this screen — it communicates "the agent is actively working right now"; collapses to a
    static filled circle under `prefers-reduced-motion`).
  - **Done:** filled circle, checkmark glyph, emerald accent.
  - **Needs input (paused at a checkpoint):** amber outline, small dot badge with a clock glyph.
  - **Blocked / failed:** red outline, alert-triangle glyph.
  - **Fix-loop iterating** (Reviewer sent it back): the affected node(s) show a small looping-arrow
    glyph + "iteration 2 of 3" caption underneath, so the user understands *why* an earlier node
    lit up again instead of assuming a bug.
- Connecting lines between nodes fill left-to-right as steps complete (progress made visible, not
  just per-node state).
- Mobile (`<768px`): the stepper collapses to a vertical list, current node expanded, others
  condensed to a single row (icon + label + state glyph).

**C. Checkpoint action bar** (appears only when `status` is `paused_plan_review` or
`paused_code_review`; otherwise this whole region is absent, not a disabled ghost of itself)
- A distinct bordered panel (not just another timeline entry) so it cannot be missed:
  "Plan ready for review" / "Code ready for review" headline, the relevant artifact surfaced
  directly above the fold (PLAN.md or the diff summary), and two actions:
  `Request changes` (secondary, opens inline feedback textarea before it will submit — feedback is
  required, submit disabled until non-empty) and `Approve` (primary). Only one pair of these verbs
  exists in the whole app — no "Looks good" / "Continue" synonyms elsewhere.

**D. Artifact viewer**
- Tabs: `Plan` / `Design` / `Review` (only tabs for artifacts that exist yet appear, greyed +
  disabled for ones not produced yet, not hidden — so the user can see what's still coming).
  Each tab renders the markdown file read back from the worktree, in a scrollable reading pane
  (`max-w-[75ch]`, real markdown typography, code blocks in mono).

**E. Live event timeline**
- Chronological feed of step/agent events, streamed over the existing SSE endpoint. Each entry:
  timestamp (mono, relative + absolute on hover), role icon, short event text. Auto-scrolls to
  newest while the user is at the bottom; stops auto-scrolling (with a "Jump to latest" pill) the
  moment the user manually scrolls up, so they can read history without fighting the stream.
- **Connection state is always visible**, small and unobtrusive, top-right of this panel: a real
  semantic dot ("Live" emerald / "Reconnecting…" amber / "Disconnected" red) — this is the one
  place in the whole app a colored status dot is justified, because it reflects a real live
  connection state.
- Empty state before the first event arrives: "Waiting for the run to start…" with a skeleton line
  matching an event row's shape.

### 2.6 Role Configs

- Table (this one genuinely is tabular data: 6 rows, few columns, no benefit from cards): role
  name + icon, model, short prompt-template excerpt, tool count, MCP servers (small pill list),
  skills (small pill list), `Edit` action per row.
- Scope switcher at the top: `Global defaults` / a project picker to view that project's
  overrides — never both shown fused into one ambiguous table.
- Editing a role opens a right-side drawer: model select, system prompt template (large code-style
  textarea with `{{projectName}}` / `{{requestDescription}}` / `{{planMd}}` / `{{designMd}}`
  placeholder tokens shown as an inline legend above it), tools multi-select, MCP servers list
  (each with an enabled toggle; "config: null" servers show a small "resolved from local `claude`
  CLI config" caption instead of an editable field, since the backend intentionally treats those
  as unmanaged), skills multi-select with a note that skills are validated against the live
  `system/init` message at run time, not the filesystem.
- Project-level rows that are still inheriting the global default show a muted "Inherited" pill
  instead of a filled value; overriding a role is an explicit `Override for this project` action,
  not a hidden side effect of editing.

### 2.7 Notifications

- Top-bar bell opens a flyout (Radix `Popover`) with the 6 most recent notifications + "View all."
- Full screen: a simple reverse-chronological list, unread rows have a filled dot (real semantic
  state — unread/read) + subtly different background weight, read rows are visually quieter.
  `Mark all read` top-right. Each item deep-links to the run/project it concerns.
- Empty state: "You're all caught up" + muted icon, no CTA needed since there's nothing to do here.

---

## 3. Key components (shared library)

| Component | Notes |
|---|---|
| **Status badge** | One shared component for every status anywhere in the app (run status, node status, notification read-state, SSE connection state). Same shape (full-pill), same 5-color semantic palette everywhere — never a one-off badge styled locally. |
| **Pipeline stepper** | Used only on Run Detail, but built as an isolated component so the same 6-node logic can render a compact version (icon row only) inside Project Detail's run table row if needed later. |
| **Event timeline** | SSE-driven, virtualized once event count is large; auto-scroll + "jump to latest" behavior is a hook (`useStickToBottom`), not re-implemented per screen. |
| **Artifact tab viewer** | Wraps a markdown renderer; shared between Run Detail and any future "compare artifacts across runs" surface. |
| **Data table** | One shared table primitive (built on `@tanstack/react-table` per the taste skill's "use TanStack Table for data tables" guidance) with built-in skeleton/empty/error slots, used for Runs and Role Configs. |
| **Drawer / Dialog** | Radix primitives via shadcn/ui `Sheet` (drawer) and `Dialog` (modal). Drawers for create/edit flows launched from a list; dialogs for destructive confirmations. |
| **Toast** | Transient, non-blocking confirmations only ("Project registered", "Marked as read"). Never used for anything the user must act on — those get inline banners or the checkpoint panel instead. |
| **Empty/Loading/Error slot** | Every list-shaped screen (Projects, Runs tab, Role Configs, Notifications) implements the same three-state contract: skeleton matching final shape → real content → inline error banner with a `Retry` action. No bare spinners anywhere in the app. |

---

## 4. Iconography & role identity

Icon set: **Phosphor Icons** (`@phosphor-icons/react`), `regular` weight, stroke-equivalent
`1.5`, one family for the whole app (per taste-skill Section 3.C — no mixing in a second icon set).

Roles are told apart **by icon and label, not by color** (color is reserved for status, per the
Color Consistency Lock — six rainbow role colors next to five status colors would be
unreadable):

| Role | Icon |
|---|---|
| Researcher | `MagnifyingGlass` |
| Designer | `PenNib` |
| Frontend | `BrowserChrome` |
| Backend | `HardDrives` |
| Tester | `Bug` |
| Reviewer | `ClipboardText` |

Status glyphs (paired with the shared status-badge color): `CircleDashed` (pending),
`CircleNotch` (running, spinning only outside reduced-motion), `CheckCircle` (done),
`Clock` (needs input), `WarningCircle` (blocked/failed), `ArrowCounterClockwise` (fix-loop
iterating).

---

## 5. Visual direction

**Theme:** dark-mode-first, light mode fully specified alongside it (Tailwind `dark:` variant,
theme set once at the root, never flipped per-section — Page Theme Lock). Respect
`prefers-color-scheme`, with a manual toggle in the sidebar footer since some users will run this
in a bright office.

**Neutrals:** Zinc scale for both modes. Dark surfaces step from `zinc-950` (page) → `zinc-900`
(sidebar/panels) → `zinc-800` (cards/inputs), never pure `#000`. Light mode mirrors with
`zinc-50` → `white` → `zinc-100`.

**Accent (one, locked across the whole app):** a restrained **electric blue** (`#2F6FED`-family,
flat fill, no glow, no gradient) for primary actions and the "running" pipeline state. This is
deliberately *not* the AI-purple-glow default the taste skill bans, and it is not reused for
anything else — status meaning stays with the semantic 5-color status system (gray/blue/amber/
red/emerald), and the blue accent for primary buttons is a shade distinct enough from "running
blue" that the two are never confused (running state uses a slightly deeper, desaturated blue;
primary actions use the brighter accent).

**Typography:** `Geist` for UI text and headlines, `Geist Mono` for run ids, timestamps, branch
names, repo paths, status codes, and any log/event text. (Inter is explicitly not the default
here per the taste skill's serif/sans guidance — Geist reads as a modern devtool without being
the templated Inter-everywhere default. This is not a case that calls for serif at all: it's a
utility product, not editorial.) Display sizes stay modest (`text-2xl`/`text-3xl` max for page
titles) — this is a working tool, not a marketing headline.

**Shape:** one radius system, locked: `8px` for cards/inputs/panels/drawers, full-pill only for
status badges and the theme toggle — documented once, followed everywhere (Shape Consistency
Lock).

**Motion:** Motion (`motion/react`) for: pipeline node state transitions (color/glyph
cross-fade), the running-node pulse, event-timeline row enter (`whileInView`, subtle
fade + 8px rise), and drawer/dialog enter-exit. Nothing loops except the single running-state
pulse, and that collapses to static under `prefers-reduced-motion`. No parallax, no scroll-hijack,
no marquee — none of that vocabulary fits a dashboard.

**Layout:** predictable CSS Grid throughout (sidebar + main, card grids, table columns) —
this is the one place the taste skill's "anti-center-bias / asymmetric" instinct is deliberately
overridden, because a pipeline dashboard's entire job is to be scannable at a glance, not
"designed."

**Accessibility:** WCAG AA minimum on every status badge, button, and form field in both themes
(status colors are never the only signal — every badge pairs color with an icon and a text label,
so colorblind users aren't reading pipeline state from hue alone). All interactive elements keyboard
reachable; the checkpoint Approve/Request-changes actions are also exposed as a keyboard shortcut
hint (`⌘⏎` / `⌘⇧⏎`) since reviewers will live in this screen.

---

## 6. What's explicitly out of scope for this pass

- No end-user auth/login screen — the backend as described is single-tenant/local-first; if
  multi-user auth is added later it gets its own design pass.
- No mobile-native app; the web app is responsive down to phone widths (Section 2.5's stepper
  collapse) but is not designed as a mobile-first product.
- No dedicated "compare two runs" or analytics/reporting screen — noted as a natural Phase 2 once
  there's enough run history to make comparison useful.
