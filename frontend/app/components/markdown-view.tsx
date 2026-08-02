import ReactMarkdown from "react-markdown";

/** Lightweight Markdown rendering for plan/design/review artifacts — no typography plugin
 * installed, so headings/lists/code get their spacing from these arbitrary child selectors
 * instead of a `prose` class. */
export function MarkdownView({ content }: { content: string }) {
  return (
    <div
      className="max-w-none text-sm leading-relaxed
        [&_h1]:mt-4 [&_h1]:mb-2 [&_h1]:text-lg [&_h1]:font-semibold [&_h1:first-child]:mt-0
        [&_h2]:mt-4 [&_h2]:mb-2 [&_h2]:text-base [&_h2]:font-semibold
        [&_h3]:mt-3 [&_h3]:mb-1.5 [&_h3]:font-semibold
        [&_p]:mb-3 [&_ul]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:mb-3 [&_ol]:list-decimal [&_ol]:pl-5
        [&_li]:mb-1 [&_a]:underline [&_a]:underline-offset-4
        [&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-xs
        [&_pre]:mb-3 [&_pre]:overflow-x-auto [&_pre]:rounded-md [&_pre]:bg-muted [&_pre]:p-3
        [&_pre_code]:bg-transparent [&_pre_code]:p-0"
    >
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
}
