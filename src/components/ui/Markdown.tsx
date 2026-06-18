function renderInline(text: string, key: number) {
  const parts = text.split(/\*\*(.+?)\*\*/g);
  return (
    <span key={key}>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <strong key={i} className="font-semibold text-foreground">
            {part}
          </strong>
        ) : (
          part
        )
      )}
    </span>
  );
}

/** Renders a small, safe subset of Markdown (bold, headings, bullets, numbered lines) without a markdown library. */
export function Markdown({ text }: { text: string }) {
  const lines = text.split("\n");
  return (
    <div className="space-y-1.5 text-sm leading-relaxed text-muted-foreground" dir="auto">
      {lines.map((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={i} className="h-1" />;
        if (/^#{1,6}\s/.test(trimmed)) {
          return (
            <p key={i} className="mt-2 text-sm font-bold text-foreground">
              {renderInline(trimmed.replace(/^#{1,6}\s/, ""), i)}
            </p>
          );
        }
        if (/^(\*\*[^*]+\*\*:?)$/.test(trimmed)) {
          return (
            <p key={i} className="mt-2 font-bold text-foreground">
              {renderInline(trimmed, i)}
            </p>
          );
        }
        if (/^[-*•]\s/.test(trimmed)) {
          return (
            <p key={i} className="flex gap-2 pr-1">
              <span className="text-primary">•</span>
              <span>{renderInline(trimmed.replace(/^[-*•]\s/, ""), i)}</span>
            </p>
          );
        }
        if (/^\d+\.\s/.test(trimmed)) {
          return (
            <p key={i} className="pr-1">
              {renderInline(trimmed, i)}
            </p>
          );
        }
        return <p key={i}>{renderInline(trimmed, i)}</p>;
      })}
    </div>
  );
}
