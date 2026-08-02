import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { ArtifactType } from '../../../shared/domain/types';

const ARTIFACT_FILENAMES: Partial<Record<ArtifactType, string>> = {
  plan_md: 'PLAN.md',
  design_md: 'DESIGN.md',
  review_report: 'REVIEW.md',
};

/** Agents write their PLAN.md/DESIGN.md/REVIEW.md as a real file in the worktree (per their
 * system prompt) — reading it back is more robust than parsing the chat transcript's final
 * text. Falls back to `fallback` (the SDK's summary text) if the file wasn't created, which
 * is always the case for FakeAgentRunner in dev/tests. */
export function readArtifactFileOrFallback(
  worktreePath: string,
  artifactType: ArtifactType,
  fallback: string,
): string {
  const filename = ARTIFACT_FILENAMES[artifactType];
  if (!filename) return fallback;
  const filePath = join(worktreePath, filename);
  return existsSync(filePath) ? readFileSync(filePath, 'utf-8') : fallback;
}

/** The Reviewer is asked to start REVIEW.md with a `STATUS: BLOCKING`/`STATUS: READY`
 * sentinel line — this is a much more reliable signal than trying to infer intent from
 * free-form review prose. */
export function reviewReportHasBlockingIssues(reviewReportContent: string): boolean {
  return /^STATUS:\s*BLOCKING/m.test(reviewReportContent);
}

/** The Researcher writes its plan as multiple files under `pdm/` (one folder per epic, one
 * file per story) rather than a single PLAN.md, so a large plan can be reviewed incrementally
 * and Backend/Frontend get clear discrete units to reference. Returns `[]` if `pdm/` doesn't
 * exist (always true for FakeAgentRunner) — the caller falls back to a single summary-text
 * artifact in that case. */
export function readPdmMarkdownFiles(
  worktreePath: string,
): Array<{ relativePath: string; content: string }> {
  const pdmDir = join(worktreePath, 'pdm');
  if (!existsSync(pdmDir)) return [];

  const results: Array<{ relativePath: string; content: string }> = [];
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir).sort()) {
      const fullPath = join(dir, entry);
      if (statSync(fullPath).isDirectory()) {
        walk(fullPath);
      } else if (entry.endsWith('.md')) {
        results.push({
          relativePath: relative(worktreePath, fullPath),
          content: readFileSync(fullPath, 'utf-8'),
        });
      }
    }
  };
  walk(pdmDir);
  return results;
}
