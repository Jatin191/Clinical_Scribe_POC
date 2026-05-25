import { useEffect, useRef, useState } from "react"
import { AudioQualityAnalyzer, type AudioMetrics } from "../utils/audioQuality"

export default function AudioDSPTest() {
  const analyzerRef = useRef<AudioQualityAnalyzer | null>(null)
  const rafRef = useRef<number | null>(null)
  const [metrics, setMetrics] = useState<AudioMetrics | null>(null)
  const [running, setRunning] = useState(false)
  const [starting, setStarting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [patientPromptsEnabled, setPatientPromptsEnabled] = useState(true)

  const stopTest = () => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    rafRef.current = null
    analyzerRef.current?.stop()
    analyzerRef.current = null
    setRunning(false)
  }

  const startTest = async () => {
    if (running || starting) return

    setStarting(true)
    setError(null)

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      })

      analyzerRef.current = new AudioQualityAnalyzer(stream)
      setRunning(true)

      const loop = () => {
        if (!analyzerRef.current) return
        setMetrics(analyzerRef.current.getMetrics())
        rafRef.current = requestAnimationFrame(loop)
      }

      loop()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to start microphone test.")
    } finally {
      setStarting(false)
    }
  }

  useEffect(() => stopTest, [])

  return (
    <section className="audio-panel">
        <div>
          <p className="eyebrow">Microphone analyzer</p>
          <h1>Audio DSP Test</h1>
        </div>

        <div className="controls">
          {!running ? (
            <button onClick={startTest} disabled={starting}>
              {starting ? "Starting..." : "Start Mic Test"}
            </button>
          ) : (
            <button className="stop" onClick={stopTest}>
              Stop
            </button>
          )}
        </div>

        <label className="option-toggle">
          <input
            type="checkbox"
            checked={patientPromptsEnabled}
            onChange={(event) => setPatientPromptsEnabled(event.target.checked)}
          />
          <span>
            Prompt patient to repeat or adjust microphone when audio is low, distorted, or noisy
          </span>
        </label>

        {error && <p className="error">{error}</p>}

        <div className="meter" aria-label="Input level">
          <span style={{ width: `${Math.min((metrics?.peak ?? 0) * 100, 100)}%` }} />
        </div>

        {metrics ? (
          <section className="metrics" aria-live="polite">
            <div className="quality">
              <span>Quality</span>
              <strong>{metrics.quality}</strong>
            </div>
            <div>
              <span>RMS</span>
              <strong>{metrics.rms.toFixed(4)}</strong>
            </div>
            <div>
              <span>Peak</span>
              <strong>{metrics.peak.toFixed(4)}</strong>
            </div>
            <div>
              <span>Speaking</span>
              <strong>{metrics.speaking ? "Yes" : "No"}</strong>
            </div>
            <div>
              <span>Clipping</span>
              <strong>{metrics.clipping ? "Yes" : "No"}</strong>
            </div>
            <div>
              <span>Background noise</span>
              <strong>{metrics.noisyBackground ? "Yes" : "No"}</strong>
            </div>
          </section>
        ) : (
          <p className="empty">Start the mic test to read input level and signal quality.</p>
        )}

        {patientPromptsEnabled && metrics?.patientPrompt && (
          <aside className="patient-prompt" aria-live="assertive">
            <span>Patient prompt</span>
            <strong>{metrics.patientPrompt}</strong>
          </aside>
        )}
    </section>
  )
}
