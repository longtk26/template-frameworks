/**
 * All of the user's real projects live in ONE repo, on different branches — not one
 * GitHub repo per project. So this port is worktree-based: `ensureRepoMirror` clones the
 * repo once (or fetches if already mirrored) into a shared local path, and `createWorktree`
 * gives each run its own working directory off that one `.git`, so concurrent runs never
 * clobber each other's checkout. There is deliberately no push/PR method anywhere here —
 * the user reviews and pushes manually.
 */
export abstract class IGitService {
  /** Clones `repoUrl` into a shared mirror path if missing, else fetches — always leaves the
   * mirror with fresh refs ("pull exact code") before any worktree is branched off it.
   * `repoUrl` may also be a local filesystem path with no GitHub remote yet — if it doesn't
   * exist, or exists but isn't a git repo yet, it's created/initialized (with an empty commit
   * on `defaultBranch` so there's something to branch off) before cloning from it. */
  abstract ensureRepoMirror(params: {
    repoUrl: string;
    existingMirrorPath: string | null;
    defaultBranch: string;
  }): Promise<string>;

  /** Idempotent: if `worktreePath` is already registered as a worktree, does nothing. */
  abstract createWorktree(params: {
    mirrorPath: string;
    defaultBranch: string;
    branchName: string;
    worktreePath: string;
  }): Promise<void>;

  abstract commitAll(
    worktreePath: string,
    message: string,
  ): Promise<{ sha: string; filesChanged: number }>;

  /** For brand-new projects only (`projects.bootstrapFromTemplate`): if
   * `worktreePath/subdirectory` is otherwise empty, clones `templateBranch` of
   * `templateRepoUrl` and copies its content into that subdirectory (e.g. `backend`/
   * `frontend`, matching the sibling-folder convention real projects use). No-op (returns
   * false) if that subdirectory already has content — safe to call on every new run of a
   * bootstrap-flagged project, once per subdirectory. */
  abstract bootstrapFromTemplate(params: {
    worktreePath: string;
    subdirectory: string;
    templateRepoUrl: string;
    templateBranch: string;
  }): Promise<boolean>;

  /** Unified diff of `worktreePath`'s current branch against `baseRef` (e.g. `origin/main`). */
  abstract getDiff(worktreePath: string, baseRef: string): Promise<string>;

  abstract getCurrentHeadSha(worktreePath: string): Promise<string>;
}
