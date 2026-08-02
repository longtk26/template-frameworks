import { Injectable } from '@nestjs/common';
import { cpSync, existsSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { randomUUID } from 'node:crypto';
import simpleGit from 'simple-git';
import { EnvService } from '../../../configs/env.service';
import { IGitService } from '../ports/output/git-service.port';

function slugifyRepoUrl(repoUrl: string): string {
  return repoUrl
    .replace(/^https?:\/\//, '')
    .replace(/\.git$/, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
}

const REMOTE_URL_PATTERN = /^(https?:\/\/|git@|ssh:\/\/)/;

@Injectable()
export class SimpleGitService implements IGitService {
  constructor(private readonly envService: EnvService) {}

  async ensureRepoMirror(params: {
    repoUrl: string;
    existingMirrorPath: string | null;
    defaultBranch: string;
  }): Promise<string> {
    const mirrorPath =
      params.existingMirrorPath ??
      join(resolve(this.envService.gitWorkspacesDir), 'mirrors', slugifyRepoUrl(params.repoUrl));

    if (existsSync(mirrorPath)) {
      await simpleGit(mirrorPath).fetch(['--all', '--prune']);
      return mirrorPath;
    }

    await this.ensureLocalSourceIsGitRepo(params.repoUrl, params.defaultBranch);

    mkdirSync(dirname(mirrorPath), { recursive: true });
    await simpleGit().clone(params.repoUrl, mirrorPath, ['--origin', 'origin']);
    return mirrorPath;
  }

  /** `repoUrl` doesn't have to be a remote yet — if it's a local path that doesn't exist, or
   * exists but has no `.git`, create it and give it one empty commit on `defaultBranch` so
   * there's something for `ensureRepoMirror`'s clone (and later, worktree creation) to work
   * with. No-op for remote URLs, and for local paths that are already a git repo. */
  private async ensureLocalSourceIsGitRepo(repoUrl: string, defaultBranch: string): Promise<void> {
    if (REMOTE_URL_PATTERN.test(repoUrl)) return;

    if (!existsSync(repoUrl)) {
      mkdirSync(repoUrl, { recursive: true });
    }
    if (existsSync(join(repoUrl, '.git'))) return;

    const git = simpleGit(repoUrl);
    await git.init(['-b', defaultBranch]);
    await git.raw(['commit', '--allow-empty', '-m', 'Initial commit']);
  }

  async createWorktree(params: {
    mirrorPath: string;
    defaultBranch: string;
    branchName: string;
    worktreePath: string;
  }): Promise<void> {
    if (existsSync(params.worktreePath)) {
      return; // idempotent — re-running a step reuses the same worktree/branch
    }
    mkdirSync(dirname(params.worktreePath), { recursive: true });

    const git = simpleGit(params.mirrorPath);
    const worktrees = await git.raw(['worktree', 'list', '--porcelain']);
    if (worktrees.includes(params.worktreePath)) {
      return;
    }

    const branches = await git.branch(['-a']);
    const branchExistsLocally = branches.all.includes(params.branchName);

    if (branchExistsLocally) {
      await git.raw(['worktree', 'add', params.worktreePath, params.branchName]);
    } else {
      await git.raw([
        'worktree',
        'add',
        params.worktreePath,
        '-b',
        params.branchName,
        `origin/${params.defaultBranch}`,
      ]);
    }
  }

  async commitAll(
    worktreePath: string,
    message: string,
  ): Promise<{ sha: string; filesChanged: number }> {
    const git = simpleGit(worktreePath);
    await git.add(['-A']);

    const status = await git.status();
    if (status.files.length === 0) {
      const sha = await this.getCurrentHeadSha(worktreePath);
      return { sha, filesChanged: 0 };
    }

    const result = await git.commit(message);
    return { sha: result.commit, filesChanged: status.files.length };
  }

  async bootstrapFromTemplate(params: {
    worktreePath: string;
    subdirectory: string;
    templateRepoUrl: string;
    templateBranch: string;
  }): Promise<boolean> {
    const targetDir = join(params.worktreePath, params.subdirectory);
    const existingEntries = existsSync(targetDir)
      ? readdirSync(targetDir).filter((entry) => entry !== '.git')
      : [];
    if (existingEntries.length > 0) {
      return false; // subdirectory already has content — never overwrite real work
    }

    const tmpDir = join(
      resolve(this.envService.gitWorkspacesDir),
      'tmp',
      `bootstrap-${randomUUID()}`,
    );
    mkdirSync(dirname(tmpDir), { recursive: true });

    try {
      await simpleGit().clone(params.templateRepoUrl, tmpDir, [
        '--branch',
        params.templateBranch,
        '--single-branch',
        '--depth',
        '1',
      ]);

      mkdirSync(targetDir, { recursive: true });
      for (const entry of readdirSync(tmpDir)) {
        if (entry === '.git') continue;
        cpSync(join(tmpDir, entry), join(targetDir, entry), { recursive: true });
      }
    } finally {
      rmSync(tmpDir, { recursive: true, force: true });
    }

    return true;
  }

  async getDiff(worktreePath: string, baseRef: string): Promise<string> {
    const git = simpleGit(worktreePath);
    return git.diff([`${baseRef}...HEAD`]);
  }

  async getCurrentHeadSha(worktreePath: string): Promise<string> {
    const git = simpleGit(worktreePath);
    const sha = await git.revparse(['HEAD']);
    return sha.trim();
  }
}
