# Story 4 — Review pages, diff viewer, notifications

Built `app/routes/runs/plan-review.tsx` and `code-review.tsx` (Approve / Request-changes with a
note dialog), `app/components/markdown-view.tsx` (`react-markdown`, hand-rolled Tailwind
styling since no typography plugin is installed), and `app/components/diff/` (a ~60-line
unified-diff parser + renderer — the backend sends raw `git diff` text, so no diff-computing
library was needed). Built `app/components/notifications/notification-bell.tsx` (custom
dropdown, no Popover/DropdownMenu primitive installed) and mounted `sonner`'s `<Toaster/>` in
`root.tsx` (installed by the template but not previously wired up).

Verified via `bun run typecheck` (clean) and SSR curl smoke tests of every route (correct
titles, no errors in the payload) — not yet clicked through in an actual browser.

**Outcome:** both human checkpoints are fully actionable from the UI, with live toast
notifications when a new one becomes ready.
