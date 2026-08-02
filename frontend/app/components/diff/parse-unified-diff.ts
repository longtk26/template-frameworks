export type DiffLineType = "context" | "add" | "remove" | "hunk";

export interface DiffLine {
  type: DiffLineType;
  oldLineNo: number | null;
  newLineNo: number | null;
  content: string;
}

export interface DiffFile {
  filePath: string;
  lines: DiffLine[];
}

/** Minimal unified-diff parser — the backend delivers `git diff` output directly, so there's
 * no need for a diff-computing library, only enough parsing to render it with +/- coloring. */
export function parseUnifiedDiff(diffText: string): DiffFile[] {
  if (!diffText.trim()) return [];

  const files: DiffFile[] = [];
  let currentFile: DiffFile | null = null;
  let oldLineNo = 0;
  let newLineNo = 0;

  for (const line of diffText.split("\n")) {
    if (line.startsWith("diff --git")) {
      if (currentFile) files.push(currentFile);
      const match = /diff --git a\/(.+?) b\/(.+)/.exec(line);
      currentFile = { filePath: match?.[2] ?? line, lines: [] };
      continue;
    }
    if (line.startsWith("index ") || line.startsWith("--- ") || line.startsWith("+++ ")) {
      continue;
    }
    if (line.startsWith("@@")) {
      const match = /@@ -(\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@/.exec(line);
      oldLineNo = match ? parseInt(match[1], 10) : 0;
      newLineNo = match ? parseInt(match[2], 10) : 0;
      currentFile ??= { filePath: "(unknown file)", lines: [] };
      currentFile.lines.push({ type: "hunk", oldLineNo: null, newLineNo: null, content: line });
      continue;
    }
    if (!currentFile) continue;

    if (line.startsWith("+")) {
      currentFile.lines.push({
        type: "add",
        oldLineNo: null,
        newLineNo: newLineNo++,
        content: line.slice(1),
      });
    } else if (line.startsWith("-")) {
      currentFile.lines.push({
        type: "remove",
        oldLineNo: oldLineNo++,
        newLineNo: null,
        content: line.slice(1),
      });
    } else {
      currentFile.lines.push({
        type: "context",
        oldLineNo: oldLineNo++,
        newLineNo: newLineNo++,
        content: line.startsWith(" ") ? line.slice(1) : line,
      });
    }
  }
  if (currentFile) files.push(currentFile);
  return files;
}
