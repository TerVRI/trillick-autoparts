import { normalizeContentHtml } from "@/lib/site-content";

interface ContentHtmlProps {
  html: string;
  className?: string;
}

export function ContentHtml({ html, className = "site-content" }: ContentHtmlProps) {
  const safe = normalizeContentHtml(html);

  return (
    <div
      className={`prose prose-stone max-w-none text-stone-600 ${className}`}
      dangerouslySetInnerHTML={{ __html: safe }}
    />
  );
}
