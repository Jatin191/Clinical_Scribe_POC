import { useCallback, useEffect, useRef, useState } from "react"

const STREAM_URL = "ws://127.0.0.1:8001/ws/audio"

export const useAudioStream = () => {
  const wsRef = useRef<WebSocket | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [isStreaming, setIsStreaming] = useState(false)
  const [status, setStatus] = useState("Idle")
  const [error, setError] = useState<string | null>(null)

  const stopStreaming = useCallback(() => {
    if (mediaRecorderRef.current?.state !== "inactive") {
      mediaRecorderRef.current?.stop()
    }

    mediaRecorderRef.current = null
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    wsRef.current?.close()
    wsRef.current = null
    setIsStreaming(false)
    setStatus("Idle")
  }, [])

  const startStreaming = useCallback(async () => {
    if (isStreaming) return

    setError(null)
    setStatus("Requesting microphone")

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const websocket = new WebSocket(STREAM_URL)

      streamRef.current = stream
      wsRef.current = websocket

      websocket.onopen = () => {
        const mimeType = MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : ""
        const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined)

        recorder.ondataavailable = (event) => {
          if (event.data.size > 0 && websocket.readyState === WebSocket.OPEN) {
            websocket.send(event.data)
          }
        }

        recorder.onerror = () => {
          setError("Audio recorder failed.")
          stopStreaming()
        }

        mediaRecorderRef.current = recorder
        recorder.start(250)
        setIsStreaming(true)
        setStatus("Streaming to backend")
      }

      websocket.onerror = () => {
        setError(`Could not connect to ${STREAM_URL}. Start the audio backend and try again.`)
        stopStreaming()
      }

      websocket.onclose = () => {
        setIsStreaming(false)
        setStatus("Idle")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to start audio streaming.")
      stopStreaming()
    }
  }, [isStreaming, stopStreaming])

  useEffect(() => stopStreaming, [stopStreaming])

  return { startStreaming, stopStreaming, isStreaming, status, error }
}
