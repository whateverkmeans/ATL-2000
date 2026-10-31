Build an interactive web-based Vintage MPC (MIDI Production Center) Sampler application using React, Tailwind CSS, and Lucide React (for subtle icons if needed). Use the attached image as the strict visual and layout reference.

### 1. Visual Design & Layout (Skeuomorphic Vintage MPC)
- **Overall Theme:** Dark background (`#121214`) with a centered, realistic vintage hardware MPC casing featuring subtle drop shadows, bevels, and 3D button textures.
- **Top Visualizer Bar (Above MPC):** Include the geometric diamond icon on the left, a vertical bar frequency/beat grid visualizer in the center that reacts when audio plays, and an analog VU meter with an orange needle on the right.
- **Split Casing Layout:**
  - **Left Panel (Cream/Off-White `#e4e2dd`):**
    - **LCD Screen:** Dark recessed bezel containing a retro green dot-matrix/pixelated LCD screen (`#0d2612` background with glowing `#39ff14` / `#4ade80` monospace text).
    - **LCD Content:**
      - Title: `ALL THE LOVE (feat. Andre Troutman)`
      - Artist: `Ye, Andre Troutman`
      - Bottom Left: `Pad Bank: A`
      - Bottom Center: `BPM: 118`
      - Right Side: Dynamic status display showing the currently triggered pad name or active loop count.
    - **Decorative Hardware Controls (Non-functional, purely aesthetic):**
      - 6 white rectangular function keys (`F1` to `F6`) directly below the LCD.
      - 3x3 blue numeric/function keypad (`1` to `9`, `0`, `SHIFT`, `HELP`) on the middle-left.
      - Large black rotary jog wheel/data dial on the middle-right, accompanied by `OPEN WINDOW` (orange button), `PREV. STEP`, `STEP <`, `STEP >`, and a 4-way directional `CURSOR` pad.
      - Vertical `NOTE VARIATION` slider with `AFTER` and `UNDO/SEQ` buttons, plus `LOCATE` (`GO TO`, `BAR -`, `BAR +`) buttons.
      - Bottom transport row: `REC` (red), `OVER DUB` (red), `STOP`, `PLAY`, and `PLAY START` buttons with realistic 3D bevels.
  - **Right Panel (Muted Slate/Teal Green `#739086`):**
    - Top header: `PAD BANK` indicator LEDs (`A` lit in green, `B`, `C`, `D` off) with 4 grey bank buttons on the left, and two rotary knobs (`REC GAIN` in black, `MAIN VOLUME` in silver) on the top right.
    - Main interactive area: A **4x4 Grid of MPC Drum Pads** (`#5a786d` surface with dark borders, inner shadows, and tactile active-press states).

### 2. Interactive 4x4 Pad Configuration & Audio Mapping
ONLY the 4x4 pads on the right panel should be interactive. Users must be able to trigger them either by **clicking/tapping on the pads** OR by **pressing the corresponding keyboard keys**.

Use the HTML5 Web Audio API (or standard `Audio` objects with overlapping/polyphonic playback support and zero-latency preloading). Store and reference all audio files from the `/samples/` directory in the `public` folder.

**Playback Behavior Types:**
1. **Toggleable Loop (`Loopable`):** Pressing the pad starts continuous looping playback (`audio.loop = true`). The pad stays visually illuminated (glowing green indicator/border and `click on/off` or `LOOPING` subtext) while playing. Pressing the same pad again stops that specific loop and resets it to the beginning. Multiple loopable pads can play simultaneously (layered stems).
2. **One-Shot (`One-shot`):** Pressing the pad immediately plays the sample once from the beginning (`currentTime = 0`). Rapidly pressing the pad re-triggers it cleanly.

Map the 4x4 grid (Row by Row, Left to Right) as follows:

**Row 1 (Keyboard: `A`, `S`, `D`, `F`):**
- **Pad 1 (Key: `A`)** | Label: `Drum Loop` (Subtext: `loop on/off`) | File: `/samples/1-drum-loop.mp3` | Behavior: **Toggleable Loop**
- **Pad 2 (Key: `S`)** | Label: `Fayek Alaya` | File: `/samples/2-fayek-alaya.mp3` | Behavior: **One-shot**
- **Pad 3 (Key: `D`)** | Label: `Bass 1` (Subtext: `loop on/off`) | File: `/samples/3-bass-1.mp3` | Behavior: **Toggleable Loop**
- **Pad 4 (Key: `F`)** | Label: `Bass 2` (Subtext: `loop on/off`) | File: `/samples/4-bass-2.mp3` | Behavior: **Toggleable Loop**

**Row 2 (Keyboard: `G`, `H`, `J`, `K`):**
- **Pad 5 (Key: `G`)** | Label: `Piano 2` (Subtext: `loop on/off`) | File: `/samples/5-piano-2.mp3` | Behavior: **Toggleable Loop**
- **Pad 6 (Key: `H`)** | Label: `Piano 1` (Subtext: `loop on/off`) | File: `/samples/6-piano-1.mp3` | Behavior: **Toggleable Loop**
- **Pad 7 (Key: `J`)** | Label: `String` (Subtext: `loop on/off`) | File: `/samples/7-string.mp3` | Behavior: **Toggleable Loop**
- **Pad 8 (Key: `K`)** | Label: `Andre Vocal` | File: `/samples/8-andre-vocal.mp3` | Behavior: **One-shot**

**Row 3 (Keyboard: `Z`, `X`, `C`, `V`):**
- **Pad 9 (Key: `Z`)** | Label: `Kick` | File: `/samples/9-kick.mp3` | Behavior: **One-shot**
- **Pad 10 (Key: `X`)** | Label: `Clap` | File: `/samples/10-clap.mp3` | Behavior: **One-shot**
- **Pad 11 (Key: `C`)** | Label: `Alayi` | File: `/samples/11-alayi.mp3` | Behavior: **One-shot**
- **Pad 12 (Key: `V`)** | Label: `Andre Vocal 2` | File: `/samples/12-andre-vocal-2.mp3` | Behavior: **One-shot**

**Row 4 - Special Loop, Control & Info Pads (Keyboard: `B`, `N`, `M`, `,`):**
- **Pad 13 (Key: `B`)** | Label: `Loop Fayek Alaya` (Subtext: `loop on/off`) | File: `/samples/2-fayek-alaya.mp3` | Behavior: **Toggleable Loop** (Loops the `Fayek Alaya` sample continuously until toggled off or stopped).
- **Pad 14 (Key: `N`)** | Label: `Stop` | Function: Immediately stops and resets ALL currently playing audio samples and turns off all active loops (`Drum Loop`, `Bass 1`, `Bass 2`, `Piano 2`, `Piano 1`, `String`, and `Loop Fayek Alaya`).
- **Pad 15 (Key: `M`)** | Label: `Choke Mode` (Subtext: `click on/off`) | Function: Toggleable mono-choke mode. When ON, triggering any one-shot vocal/chop pad (`Fayek Alaya`, `Alayi`, `Andre Vocal`, `Andre Vocal 2`) automatically cuts off the previously playing one-shot vocal sample so they don't overlap.
- **Pad 16 (Key: `,`)** | Label: `About` (Subtext: `Click for Info`) | Function: Opens a sleek retro-styled modal overlay displaying track credits (`ALL THE LOVE (feat. Andre Troutman) - Ye, Andre Troutman | 118 BPM`), a visual guide showing which pads are Loopable vs. One-Shot, keyboard shortcuts, and project info.

### 3. Interactive Polish & UX Details
- **Pad Visual Feedback:** 
  - **One-shot pads (`Pad 2, 8, 9, 10, 11, 12`):** Animate pressing down (`scale-[0.97]`, darker background, momentary green flash) and update the LCD screen with `TRIG: [PAD NAME]`.
  - **Loopable pads (`Pad 1, 3, 4, 5, 6, 7, 13`):** Display a persistent glowing green LED indicator dot and highlighted border while the loop is actively playing, and update the LCD screen with `LOOP ON: [PAD NAME]` or `LOOP OFF: [PAD NAME]`.
- **Audio Fallback / Synthesizer Mock:** In case the local `/samples/*.mp3` files are not yet placed in the `public/samples/` folder during preview, implement a graceful fallback using the **Web Audio API Synthesizer** (generating distinct drum/bass/piano/string/vocal tones, with continuous interval loop playback for the loopable pads) so every pad is 100% testable and audible right out of the box without throwing unhandled errors, while always prioritizing loading the real `.mp3` files first.
- **Responsive Scaling:** Ensure the MPC hardware unit scales cleanly on desktop and laptop screens while preserving its fixed hardware aspect ratio.