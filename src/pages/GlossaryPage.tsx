import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { glossary } from "../content/data";
import type { LangMode } from "../content/types";

export function GlossaryPage({ mode }: { readonly mode: LangMode }) {
  const [query, setQuery] = useState("");
  const normalized = query.trim().toLowerCase();
  const terms = useMemo(() => {
    if (!normalized) {
      return glossary;
    }
    return glossary.filter((term) =>
      [term.zh, term.en, term.definition.zh, term.definition.en].some((value) => value.toLowerCase().includes(normalized))
    );
  }, [normalized]);

  return (
    <main className="container glossary-page">
      <section className="page-head">
        <h1>词典 · Glossary</h1>
        <label className="search-box">
          <Search size={16} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索中英术语 Search terms" />
        </label>
      </section>
      <div className="glossary-grid">
        {terms.map((term) => (
          <article className="term-card glossary-term" key={term.id}>
            <div className="tc-tag">{term.review ? "待审 · REVIEW" : `SOURCE · ${term.source}`}</div>
            <div className="tc-en">{term.en}</div>
            <div className="tc-zh">{term.zh}</div>
            <p className="tc-def">
              {mode !== "en" ? term.definition.zh : term.definition.en}
              {mode === "bi" ? <span className="en">{term.definition.en}</span> : null}
            </p>
          </article>
        ))}
      </div>
    </main>
  );
}
