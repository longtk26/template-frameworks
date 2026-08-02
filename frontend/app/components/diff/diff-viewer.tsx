import { ScrollArea } from "~/components/ui/scroll-area";
import { cn } from "~/lib/utils";
import { parseUnifiedDiff } from "./parse-unified-diff";

const LINE_CLASS = {
  add: "bg-emerald-500/10 text-emerald-800 dark:text-emerald-300",
  remove: "bg-destructive/10 text-destructive",
  context: "",
  hunk: "bg-muted text-muted-foreground",
} as const;

export function DiffViewer({ diff }: { diff: string }) {
  const files = parseUnifiedDiff(diff);

  if (files.length === 0) {
    return <p className="text-sm text-muted-foreground">No changes yet.</p>;
  }

  return (
    <ScrollArea className="h-[32rem] rounded-md border">
      <div className="font-mono text-xs">
        {files.map((file) => (
          <div key={file.filePath} className="border-b last:border-b-0">
            <p className="sticky top-0 border-b bg-muted px-3 py-1.5 font-medium">
              {file.filePath}
            </p>
            {file.lines.map((line, i) => (
              <div key={i} className={cn("flex gap-3 px-3 py-0.5", LINE_CLASS[line.type])}>
                <span className="w-8 shrink-0 select-none text-right text-muted-foreground">
                  {line.oldLineNo ?? ""}
                </span>
                <span className="w-8 shrink-0 select-none text-right text-muted-foreground">
                  {line.newLineNo ?? ""}
                </span>
                <span className="whitespace-pre-wrap">
                  {line.type === "add" ? "+" : line.type === "remove" ? "-" : " "}
                  {line.content}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
