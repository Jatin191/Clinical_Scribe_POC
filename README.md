# Audio Test Console

React + TypeScript + Vite frontend for microphone quality testing and realtime audio streaming.

## What It Includes

- **Quality** tab: reads microphone input and shows RMS, peak level, speaking status, clipping, and quality.
- **Stream** tab: sends microphone audio chunks to a backend WebSocket at `ws://127.0.0.1:8001/ws/audio`.

## Requirements

- Node.js installed
- A browser with microphone access
- The backend running on `127.0.0.1:8001` if you want to use the Stream tab

## Install
cd audio-dsp-test
npm install

## Run

npm run dev

Open the local URL Vite prints. In this verified run it is:

http://127.0.0.1:5176/


Vite may choose a different port if `5176` is already in use.

## Checks

```powershell
npm run build
npm run lint
```

## Main Files

- `src/App.tsx` switches between Quality and Stream tabs.
- `src/pages/AudioDSPTest.tsx` contains the microphone quality UI.
- `src/pages/AudioStreamTest.tsx` contains the WebSocket streaming UI.
- `src/hooks/useAudioStream.ts` manages microphone capture and WebSocket streaming.
- `src/utils/audioQuality.ts` calculates audio quality metrics.
- `src/index.css` contains the app styling.
