import type { GlossaryTerm, LangMode } from "../content/types";

export function TermCard({ term, mode }: { readonly term?: GlossaryTerm; readonly mode: LangMode }) {
  if (!term) {
    return null;
  }

  return (
    <aside className="term-card">
      <div className="tc-tag">{term.review ? "待审 · REVIEW" : `SOURCE · ${term.source}`}</div>
      <div className="tc-en">{term.en}</div>
      <div className="tc-zh">{term.zh}</div>
      <p className="tc-def">
        {mode !== "en" ? term.definition.zh : term.definition.en}
        {mode === "bi" ? <span className="en">{term.definition.en}</span> : null}
      </p>
    </aside>
  );
}
