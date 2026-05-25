import { useState } from "react"
import AudioDSPTest from "./pages/AudioDSPTest"
import AudioStreamTest from "./pages/AudioStreamTest"

type View = "quality" | "stream"

function App() {
  const [view, setView] = useState<View>("quality")

  return (
    <main className="app-shell">
      <section className="app-header">
        <div>
          <p className="eyebrow">Voice Brain tools</p>
          <h1>Audio Test Console</h1>
        </div>

        <div className="tabs" role="tablist" aria-label="Audio test views">
          <button
            className={view === "quality" ? "active" : ""}
            onClick={() => setView("quality")}
            role="tab"
            aria-selected={view === "quality"}
          >
            Quality
          </button>
          <button
            className={view === "stream" ? "active" : ""}
            onClick={() => setView("stream")}
            role="tab"
            aria-selected={view === "stream"}
          >
            Stream
          </button>
        </div>
      </section>

      {view === "quality" ? <AudioDSPTest /> : <AudioStreamTest />}
    </main>
  )
}

export default App
