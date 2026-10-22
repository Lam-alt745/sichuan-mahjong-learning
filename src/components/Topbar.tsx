import { BookOpen, Dumbbell, Home, Languages, Library, Table2 } from "lucide-react";
import type { LangMode } from "../content/types";

export type AppView = "home" | "lessons" | "drills" | "table" | "glossary" | "placement";

const navItems: Array<{ view: AppView; label: string; icon: typeof Home }> = [
  { view: "home", label: "首页 Home", icon: Home },
  { view: "lessons", label: "课程 Lessons", icon: BookOpen },
  { view: "drills", label: "练习 Drills", icon: Dumbbell },
  { view: "table", label: "牌桌 Table", icon: Table2 },
  { view: "glossary", label: "词典 Glossary", icon: Library }
];

export function Topbar({
  view,
  langMode,
  onView,
  onLangMode
}: {
  readonly view: AppView;
  readonly langMode: LangMode;
  readonly onView: (view: AppView) => void;
  readonly onLangMode: (mode: LangMode) => void;
}) {
  return (
    <header className="topbar">
      <div className="container">
        <button className="brand" type="button" onClick={() => onView("home")}>
          <span className="mark">川</span>
          <span>
            <b>川麻</b> Sichuan Mahjong
            <span>双语对照 · BILINGUAL GUIDE</span>
          </span>
        </button>
        <nav className="topnav" aria-label="main navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.view}
                type="button"
                className={view === item.view ? "on" : ""}
                onClick={() => onView(item.view)}
              >
                <Icon size={15} strokeWidth={1.8} />
                {item.label}
              </button>
            );
          })}
        </nav>
        <div className="lang-switch" aria-label="language mode">
          <Languages size={14} strokeWidth={1.8} />
          {[
            ["zh", "中"],
            ["bi", "双语"],
            ["en", "EN"]
          ].map(([mode, label]) => (
            <button
              key={mode}
              type="button"
              className={langMode === mode ? "on" : ""}
              onClick={() => onLangMode(mode as LangMode)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
