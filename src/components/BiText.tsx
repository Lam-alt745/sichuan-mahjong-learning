import type { BiText as BiTextValue, LangMode } from "../content/types";
import { TermText } from "./TermText";

export function BiText({
  value,
  mode,
  className = "",
  onTerm
}: {
  readonly value: BiTextValue;
  readonly mode: LangMode;
  readonly className?: string;
  readonly onTerm?: (termId: string) => void;
}) {
  if (mode === "zh") {
    return (
      <div className={["bi-block", className].filter(Boolean).join(" ")}>
        <p className="zh">
          <TermText text={value.zh} onTerm={onTerm} />
        </p>
      </div>
    );
  }

  if (mode === "en") {
    return (
      <div className={["bi-block", "mode-en-only", className].filter(Boolean).join(" ")}>
        <p className="en">
          <TermText text={value.en} onTerm={onTerm} />
        </p>
      </div>
    );
  }

  return (
    <div className={["bi-block", className].filter(Boolean).join(" ")}>
      <p className="zh">
        <TermText text={value.zh} onTerm={onTerm} />
      </p>
      <p className="en">
        <TermText text={value.en} onTerm={onTerm} />
      </p>
    </div>
  );
}
