import { useState } from "react";
import { firstAvailableLessonId } from "./content/data";
import { Topbar, type AppView } from "./components/Topbar";
import { DrillsPage } from "./pages/DrillsPage";
import { GlossaryPage } from "./pages/GlossaryPage";
import { HomePage } from "./pages/HomePage";
import { LessonsPage } from "./pages/LessonsPage";
import { PlacementPage } from "./pages/PlacementPage";
import { TablePage } from "./pages/TablePage";
import { useProgressStore } from "./state/progress";

export default function App() {
  const langMode = useProgressStore((state) => state.langMode);
  const setLangMode = useProgressStore((state) => state.setLangMode);
  const progress = useProgressStore();
  const [view, setView] = useState<AppView>("home");
  const [selectedLessonId, setSelectedLessonId] = useState(() => firstAvailableLessonId(progress));

  return (
    <div className={`app-shell mode-${langMode}`}>
      <Topbar view={view} langMode={langMode} onView={setView} onLangMode={setLangMode} />
      {view === "home" ? <HomePage mode={langMode} onView={setView} onLesson={setSelectedLessonId} /> : null}
      {view === "lessons" ? (
        <LessonsPage mode={langMode} selectedLessonId={selectedLessonId} onLesson={setSelectedLessonId} />
      ) : null}
      {view === "drills" ? <DrillsPage mode={langMode} /> : null}
      {view === "table" ? <TablePage mode={langMode} /> : null}
      {view === "glossary" ? <GlossaryPage mode={langMode} /> : null}
      {view === "placement" ? <PlacementPage mode={langMode} onView={setView} onLesson={setSelectedLessonId} /> : null}
      <footer className="footer">
        <div className="container">川麻 Sichuan Mahjong</div>
      </footer>
    </div>
  );
}
