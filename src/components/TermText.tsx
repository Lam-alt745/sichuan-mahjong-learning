import { getTerm } from "../content/data";

export function TermText({
  text,
  onTerm
}: {
  readonly text: string;
  readonly onTerm?: (termId: string) => void;
}) {
  const parts = text.split(/(\[\[term:[a-z0-9-]+\]\])/g).filter(Boolean);
  return (
    <>
      {parts.map((part, index) => {
        const match = part.match(/^\[\[term:([a-z0-9-]+)\]\]$/);
        if (!match) {
          return <span key={`${part}-${index}`}>{part}</span>;
        }

        const termId = match[1];
        const term = getTerm(termId);
        const label = term ? `${term.zh} ${term.en}` : termId;
        return (
          <button key={`${termId}-${index}`} className="term" type="button" onClick={() => onTerm?.(termId)}>
            {label}
          </button>
        );
      })}
    </>
  );
}
