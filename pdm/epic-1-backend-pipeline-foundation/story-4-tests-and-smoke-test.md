# Story 4 — Tests and end-to-end smoke test

Wrote unit tests: `run-state-machine.spec.ts` (exhaustive coverage of every transition table
row), `read-artifact-file.spec.ts` (the `STATUS: BLOCKING`/`READY` sentinel parser), and
`approve-plan-review.usecase.spec.ts` (representative usecase test with mocked repos, showing
the plain-`new Usecase(mocks)` pattern — no NestJS `TestingModule` needed).

Ran a real end-to-end smoke test against a cloned local repo with `FakeAgentRunner`: created a
project and two runs (one skipping Researcher, one exercising the plan-review checkpoint),
confirmed the pipeline walked through all roles, checkpoints paused/resumed correctly on
approve, notifications fired, the diff endpoint worked, and `git log` in the worktree showed
the expected commits with **no push ever attempted**.

**Outcome:** 36 tests passing, `pnpm build` clean, full pipeline verified live before writing
any frontend code.
