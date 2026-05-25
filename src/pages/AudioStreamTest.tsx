import { useAudioStream } from "../hooks/useAudioStream"

export default function AudioStreamTest() {
  const { startStreaming, stopStreaming, isStreaming, status, error } = useAudioStream()

  return (
    <section className="audio-panel">
      <div>
        <p className="eyebrow">Backend stream</p>
        <h2>Realtime Audio Streaming</h2>
      </div>

      <div className="controls">
        {!isStreaming ? (
          <button onClick={startStreaming}>Start Streaming</button>
        ) : (
          <button className="stop" onClick={stopStreaming}>
            Stop Streaming
          </button>
        )}
      </div>

      {error && <p className="error">{error}</p>}

      <div className="status-card">
        <span>Status</span>
        <strong>{status}</strong>
      </div>
    </section>
  )
}
