export type AudioQuality = "Silent" | "Low Volume" | "Good" | "Background Noise" | "Distorted"

export interface AudioMetrics {
  rms: number
  peak: number
  clipping: boolean
  noisyBackground: boolean
  speaking: boolean
  quality: AudioQuality
  patientPrompt: string | null
}

export class AudioQualityAnalyzer {
  private readonly audioContext: AudioContext
  private readonly analyser: AnalyserNode
  private readonly dataArray: Uint8Array<ArrayBuffer>
  private readonly source: MediaStreamAudioSourceNode
  private readonly stream: MediaStream

  constructor(stream: MediaStream) {
    this.stream = stream
    this.audioContext = new AudioContext()
    this.analyser = this.audioContext.createAnalyser()
    this.analyser.fftSize = 2048
    this.analyser.smoothingTimeConstant = 0.8
    this.dataArray = new Uint8Array(new ArrayBuffer(this.analyser.fftSize))
    this.source = this.audioContext.createMediaStreamSource(stream)
    this.source.connect(this.analyser)
  }

  getMetrics(): AudioMetrics {
    this.analyser.getByteTimeDomainData(this.dataArray)

    let sumSquares = 0
    let peak = 0
    let clipping = false

    for (const value of this.dataArray) {
      const normalized = (value - 128) / 128
      const abs = Math.abs(normalized)

      sumSquares += normalized * normalized
      peak = Math.max(peak, abs)
      clipping = clipping || abs > 0.98
    }

    const rms = Math.sqrt(sumSquares / this.dataArray.length)
    const speaking = rms > 0.02
    const noisyBackground = !speaking && rms >= 0.012
    let quality: AudioQuality = "Good"
    let patientPrompt: string | null = null

    if (rms < 0.01) {
      quality = "Silent"
    } else if (noisyBackground) {
      quality = "Background Noise"
      patientPrompt = "There seems to be background noise. Please move to a quieter place and repeat your response."
    } else if (rms < 0.03) {
      quality = "Low Volume"
      patientPrompt = "Your voice is a little low. Please move closer to the microphone and repeat your response."
    }

    if (clipping) {
      quality = "Distorted"
      patientPrompt = "Your audio sounds distorted. Please move the microphone slightly away and repeat your response."
    }

    return { rms, peak, clipping, noisyBackground, speaking, quality, patientPrompt }
  }

  stop() {
    this.source.disconnect()
    this.stream.getTracks().forEach((track) => track.stop())

    if (this.audioContext.state !== "closed") {
      void this.audioContext.close()
    }
  }
}
