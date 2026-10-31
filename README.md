<div align="center">

# ATL-2000

**ALL THE LOVE (feat. Andre Troutman)**


[![License](https://img.shields.io/badge/License-MIT-black?style=for-the-badge)](LICENSE)
[![React](https://img.shields.io/badge/React_18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)


An interactive, skeuomorphic web-based Vintage MIDI Production Center (MPC) sampler dedicated to the track **"ALL THE LOVE" (feat. Andre Troutman)** by **Ye**.

</div>

---

## Overview

The ATL-2000 replicates the tactile experience, aesthetic, and workflow of classic hardware samplers right in the browser. Users can arrange stems, layer loops, chop vocal riffs, and trigger one-shot drum hits in real-time using either tactile on-screen controls or keyboard shortcuts.

Engineered around the 118 BPM arrangement of "ALL THE LOVE", it combines authentic vintage hardware design with low-latency modern web audio synthesis and sample playback.

The interface features a dark stealth chassis, a glowing red CRT dot-matrix LCD panel with an integrated live frequency spectrum analyzer, rotary gain and volume controls, and a dedicated 4x4 grid of responsive velocity-style rubber pads.

---

## Tech Stack

- **Framework:** React 18
- **Build Tool:** Vite
- **Styling & Design:** Tailwind CSS
- **Typography:** Plus Jakarta Sans (Google Fonts)
- **Audio Architecture:** Web Audio API (AudioContext, AnalyserNode, GainNode, AudioBufferSourceNode)
- **Deployment Target:** Vercel (Configured with `vercel.json`)

---

## Key Features

### 1. Dual Playback Engine
- **Toggleable Loops:** Stems (Drum loop, Basslines, Pianos, Strings, and Fayek Loop) can be toggled on and off. Active loops stay highlighted with a glowing white perimeter border, enabling polyphonic layered playback in sync with the 118 BPM tempo.
- **One-Shot Chops:** Vocal chops and drum hits trigger immediately from the start point (`currentTime = 0`) with zero latency, re-triggering cleanly on rapid presses.

### 2. Vocal Choke Mode
When Choke Mode (Pad 15) is engaged, triggering any vocal chop (`Fayek Alaya`, `Andre Vocal`, `Alayi`, or `Andre Vocal 2`) automatically cuts off any other playing vocal sample. This mimics the classic MPC mono-voice voice-stealing behavior.

### 3. Integrated LCD Screen & Real-Time Spectrum Analyzer
The recessed red dot-matrix screen displays:
- Song Title and Artist metadata
- Current Bank and 118 BPM tempo indicator
- Real-time animated 26-band audio frequency spectrum analyzer reacting dynamically to the master output
- Live trigger status (`LOOPS ON`, `TRIG: [SAMPLE]`, `CHOKE: ON`, `ALL STOPPED`)

### 4. Hybrid Audio Engine with Procedural Synthesizer Fallback
The application prioritizes loading high-fidelity master `.mp3` stems from `/samples/`. If any audio files are missing, the built-in procedural Web Audio synthesizer automatically generates synchronized 118 BPM drum patterns, 808 subs, Rhodes chords, analog strings, and formant vocal leads, ensuring the unit remains audible and playable in any environment.

---

## Pad & Keyboard Mapping

| Pad | Key | Label | Type | Audio File | Function |
| :---: | :---: | :--- | :--- | :--- | :--- |
| 01 | **A** | Drum Loop | Toggleable Loop | `/samples/1-drum-loop.mp3` | Continuous 118 BPM drum break |
| 02 | **S** | Fayek Alaya | One-Shot | `/samples/2-fayek-alaya.mp3` | Vocal phrase chop (Chokeable) |
| 03 | **D** | Bass 1 | Toggleable Loop | `/samples/3-bass-1.mp3` | Sub analog bassline |
| 04 | **F** | Bass 2 | Toggleable Loop | `/samples/4-bass-2.mp3` | Melodic synth bassline |
| 05 | **G** | Piano 2 | Toggleable Loop | `/samples/5-piano-2.mp3` | Electric piano chord progression |
| 06 | **H** | Piano 1 | Toggleable Loop | `/samples/6-piano-1.mp3` | Acoustic soul piano chords |
| 07 | **J** | String | Toggleable Loop | `/samples/7-string.mp3` | Analog string ensemble pad |
| 08 | **K** | Andre Vocal | One-Shot | `/samples/8-andre-vocal.mp3` | Talkbox vocal riff (Chokeable) |
| 09 | **Z** | Kick | One-Shot | `/samples/9-kick.mp3` | Punchy 808 kick drum |
| 10 | **X** | Clap | One-Shot | `/samples/10-clap.mp3` | Vintage 808/909 snare-clap |
| 11 | **C** | Alayi | One-Shot | `/samples/11-alayi.mp3` | High vocal chop (Chokeable) |
| 12 | **V** | Andre Vocal 2 | One-Shot | `/samples/12-andre-vocal-2.mp3` | Harmonic talkbox lead (Chokeable) |
| 13 | **B** | Loop Fayek Alaya | Toggleable Loop | `/samples/13-fayek-loop.mp3` | Looped soul vocal hook (Balanced Gain: 0.55) |
| 14 | **N** | Stop | Master Control | - | Instantly stops and resets all audio stems |
| 15 | **M** | Choke Mode | Toggle Control | - | Toggles voice choke on vocal chop pads |
| 16 | **,** | About | Info Overlay | - | Opens track credits, legend, and shortcut guide |

---

## Getting Started

### Prerequisites
- Node.js (version 18 or higher recommended)
- npm or pnpm

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/whateverkmeans/ATL-2000.git
   cd ATL-2000
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open `http://localhost:3000` in your browser.

### Building for Production
```bash
npm run build
```
The optimized bundle will be generated in the `dist` directory.

---

## Deployment to Vercel

This project is pre-configured for zero-configuration deployment on Vercel via the included `vercel.json` file.

1. Push your repository to GitHub.
2. Go to Vercel and click **Add New Project**.
3. Import your repository and click **Deploy**.
4. Vercel will automatically detect the Vite configuration and deploy the application.

---

## Audio Credits & Copyright Notice

All master recordings, song compositions, musical elements, and audio copyrights are solely and exclusively owned by **Ye (Kanye West)** and **Andre Troutman** as the original creators of **"ALL THE LOVE"**.

This interactive sampler project (**ATL-2000**) is an unofficial fan tribute developed strictly for educational, creative, and non-commercial demonstration purposes. No copyright infringement is intended.
