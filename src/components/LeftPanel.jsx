import React, { useEffect, useRef } from 'react';
import { Play, Square, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { audioEngine } from '../audio/AudioEngine';

export default function LeftPanel({ lcdStatus, activeLoopCount, isChokeActive, isAnyAudioPlaying }) {
  const barsCanvasRef = useRef(null);

  useEffect(() => {
    let animId;
    const freqData = new Uint8Array(64);

    const render = () => {
      const canvas = barsCanvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;

        audioEngine.getByteFrequencyData(freqData);
        ctx.clearRect(0, 0, width, height);

        const numBars = 26;
        const barSpacing = 2;
        const totalSpacing = barSpacing * (numBars - 1);
        const barWidth = (width - totalSpacing) / numBars;

        for (let i = 0; i < numBars; i++) {
          const dataIndex = Math.min(Math.floor(Math.pow(i / numBars, 1.25) * 32), 48);
          let value = freqData[dataIndex] || 0;

          if (value < 4 && !isAnyAudioPlaying) {
            value = Math.sin(Date.now() * 0.003 + i * 0.3) * 2.5 + 3.5;
          }

          const percent = Math.min(1, Math.max(0.06, value / 255));
          const barHeight = percent * height;
          const x = i * (barWidth + barSpacing);
          const y = height - barHeight;

          // Segmented retro LCD dot-matrix look in glowing red
          const segments = 7;
          const segHeight = height / segments;

          for (let s = 0; s < segments; s++) {
            const segY = height - (s + 1) * segHeight;
            if (segY + segHeight > y) {
              if (s >= 5) {
                ctx.fillStyle = '#ffffff'; // White overload peak
              } else if (s >= 4) {
                ctx.fillStyle = '#ff6b6b';
              } else {
                ctx.fillStyle = '#ff2222'; // Phosphor red
              }
              ctx.fillRect(x, segY + 0.8, barWidth, segHeight - 1.2);
            }
          }
        }
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [isAnyAudioPlaying]);

  return (
    <div className="relative flex-1 bg-gradient-to-b from-[#191b1f] via-[#16171b] to-[#121316] p-3.5 sm:p-4.5 flex flex-col justify-between select-none border-b md:border-b-0 md:border-r border-[#24272e]">

      {/* Top Header: ATL-2000 */}
      <div className="flex items-baseline gap-1.5 mb-2">
        <span className="text-lg sm:text-xl font-black tracking-tight text-white font-sans drop-shadow-sm">
          ATL-2000
        </span>
      </div>

      {/* LCD SCREEN AREA - Glowing Red LCD with Integrated Frequency Spectrum Monitor */}
      <div className="mb-3">
        {/* Recessed bezel */}
        <div className="relative p-2 bg-[#0c0d0f] rounded-md shadow-[inset_0_3px_8px_rgba(0,0,0,0.95),0_1px_1px_rgba(255,255,255,0.06)] border border-[#212328]">
          {/* Bezel inner display */}
          <div className="relative bg-[#1a0406] border border-[#3b080a] rounded-sm overflow-hidden p-2.5 sm:p-3 min-h-[116px] flex flex-col justify-between shadow-[inset_0_0_20px_rgba(255,20,30,0.25)]">
            {/* CRT Scanline & grid overlay in subtle red */}
            <div className="absolute inset-0 scanline-overlay z-10 opacity-35 pointer-events-none" />
            <div className="absolute inset-0 lcd-grid-pattern z-10 opacity-20 pointer-events-none" />
            {/* Glass reflection sheen */}
            <div className="absolute -top-12 -right-12 w-48 h-32 bg-gradient-to-b from-white/[0.06] to-transparent rotate-12 z-20 pointer-events-none" />

            {/* Top row & Title */}
            <div className="relative z-20 flex items-start justify-between">
              <div>
                <div className="text-[13px] sm:text-[14.5px] font-sans font-black tracking-wider text-[#ff3333] drop-shadow-[0_0_8px_rgba(255,51,51,0.85)] truncate">
                  ALL THE LOVE (feat. Andre Troutman)
                </div>
                <div className="text-[11px] font-sans font-bold text-[#f87171] tracking-wide mt-0.5">
                  Ye, Kanye West, Andre Troutman
                </div>
              </div>

              {/* Right side: POWERED BY ATL-2000 */}
              <div className="flex flex-col items-end shrink-0 pl-2">
                <span className="text-[7.5px] font-sans font-semibold tracking-wider text-[#f87171]/80 uppercase">
                  POWERED BY
                </span>
                <span className="px-1.5 py-0.5 rounded-sm bg-[#2d070a] border border-[#ef4444]/60 text-[8.5px] font-sans font-black text-[#ff3333] shadow-[0_0_8px_rgba(239,68,68,0.4)]">
                  ATL-2000
                </span>
              </div>
            </div>

            {/* Middle: Integrated Realtime Frequency Chart inside the LCD Panel */}
            <div className="relative z-20 my-1 py-0.5 flex items-center justify-between border-y border-[#3b090c]/70 bg-[#130204]/60 rounded-sm px-1.5">
              <span className="text-[7.5px] font-sans font-bold tracking-widest text-[#f87171]/70 uppercase">
                SPECTRUM
              </span>
              <canvas
                ref={barsCanvasRef}
                width={200}
                height={20}
                className="h-5 w-44 sm:w-48 relative"
              />
              <span className="text-[7.5px] font-sans font-bold tracking-widest text-[#ff3333] uppercase">
                {isAnyAudioPlaying ? 'LIVE' : 'IDLE'}
              </span>
            </div>

            {/* Bottom Row: Bank, BPM & Status */}
            <div className="relative z-20 flex items-center justify-between text-[11px] font-sans font-semibold text-[#f87171] pt-1">
              <div className="flex items-center gap-3.5">
                <span>Pad Bank: A</span>
                <span>BPM: 118</span>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-bold text-[#ff3333] drop-shadow-[0_0_6px_rgba(255,51,51,0.7)]">
                  {lcdStatus || (activeLoopCount > 0 ? `LOOPS: ${activeLoopCount} ON` : (isChokeActive ? 'CHOKE: ON' : 'READY'))}
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* 6 Function Keys (F1 - F6) Below LCD */}
        <div className="grid grid-cols-6 gap-1.5 mt-1.5 px-0.5">
          {['F1', 'F2', 'F3', 'F4', 'F5', 'F6'].map((fnKey) => (
            <div key={fnKey} className="flex flex-col items-center">
              <button
                type="button"
                className="w-full h-3.5 sm:h-4 bg-[#22252a] hover:bg-[#282c32] border border-[#333740] rounded-[3px] hardware-button transition-all"
              />
              <span className="text-[8px] font-sans font-semibold text-neutral-400 mt-0.5">
                {fnKey}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* MIDDLE CONTROLS SECTION */}
      <div className="grid grid-cols-12 gap-2 sm:gap-2.5 items-start my-auto">

        {/* Left: Dark Stealth Numeric / Function Keypad */}
        <div className="col-span-5 flex flex-col">
          <div className="grid grid-cols-3 gap-x-1.5 gap-y-1">
            {/* Row 1 */}
            <div className="flex flex-col items-center">
              <span className="text-[7.5px] font-sans font-bold text-neutral-400 leading-none">7</span>
              <button type="button" className="w-7 sm:w-8 h-4 sm:h-4.5 bg-[#22252a] hover:bg-[#282c32] rounded-[3px] hardware-button border border-[#333740]" />
              <span className="text-[6.5px] font-sans font-bold text-neutral-400 leading-none mt-0.5">OTHER</span>
              <span className="text-[7.5px] font-sans font-bold text-neutral-500 leading-none">4</span>
            </div>

            <div className="flex flex-col items-center">
              <span className="text-[7.5px] font-sans font-bold text-neutral-400 leading-none">8</span>
              <button type="button" className="w-7 sm:w-8 h-4 sm:h-4.5 bg-[#22252a] hover:bg-[#282c32] rounded-[3px] hardware-button border border-[#333740]" />
              <span className="text-[6.5px] font-sans font-bold text-neutral-400 leading-none mt-0.5">MIDI</span>
              <span className="text-[7.5px] font-sans font-bold text-neutral-500 leading-none">5</span>
            </div>

            <div className="flex flex-col items-center">
              <span className="text-[7.5px] font-sans font-bold text-neutral-400 leading-none">9</span>
              <button type="button" className="w-7 sm:w-8 h-4 sm:h-4.5 bg-[#22252a] hover:bg-[#282c32] rounded-[3px] hardware-button border border-[#333740]" />
              <span className="text-[6.5px] font-sans font-bold text-neutral-400 leading-none mt-0.5">SYNC</span>
              <span className="text-[7.5px] font-sans font-bold text-neutral-500 leading-none">6</span>
            </div>

            {/* Row 2 */}
            <div className="flex flex-col items-center mt-0.5">
              <button type="button" className="w-7 sm:w-8 h-4 sm:h-4.5 bg-[#22252a] hover:bg-[#282c32] rounded-[3px] hardware-button border border-[#333740]" />
              <span className="text-[6px] font-sans font-bold text-neutral-400 leading-none mt-0.5">SAMPLING</span>
              <span className="text-[7.5px] font-sans font-bold text-neutral-500 leading-none">1</span>
            </div>

            <div className="flex flex-col items-center mt-0.5">
              <button type="button" className="w-7 sm:w-8 h-4 sm:h-4.5 bg-[#22252a] hover:bg-[#282c32] rounded-[3px] hardware-button border border-[#333740]" />
              <span className="text-[6px] font-sans font-bold text-neutral-400 leading-none mt-0.5">STEP EDIT</span>
              <span className="text-[7.5px] font-sans font-bold text-neutral-500 leading-none">2</span>
            </div>

            <div className="flex flex-col items-center mt-0.5">
              <button type="button" className="w-7 sm:w-8 h-4 sm:h-4.5 bg-[#22252a] hover:bg-[#282c32] rounded-[3px] hardware-button border border-[#333740]" />
              <span className="text-[6px] font-sans font-bold text-neutral-400 leading-none mt-0.5">MIXER</span>
              <span className="text-[7.5px] font-sans font-bold text-neutral-500 leading-none">3</span>
            </div>

            {/* Row 3 */}
            <div className="flex flex-col items-center mt-0.5">
              <button type="button" className="w-7 sm:w-8 h-4 sm:h-4.5 bg-[#22252a] hover:bg-[#282c32] rounded-[3px] hardware-button border border-[#333740]" />
              <span className="text-[5.5px] font-sans font-bold text-neutral-400 leading-tight text-center mt-0.5">MAIN</span>
            </div>

            <div className="flex flex-col items-center mt-0.5">
              <button type="button" className="w-7 sm:w-8 h-4 sm:h-4.5 bg-[#22252a] hover:bg-[#282c32] rounded-[3px] hardware-button border border-[#333740]" />
              <span className="text-[6px] font-sans font-bold text-neutral-400 leading-none mt-0.5">DRUM</span>
              <span className="text-[7.5px] font-sans font-bold text-neutral-500 leading-none">0</span>
            </div>

            <div className="flex flex-col items-center mt-0.5">
              <button type="button" className="w-7 sm:w-8 h-4 sm:h-4.5 bg-[#22252a] hover:bg-[#282c32] rounded-[3px] hardware-button border border-[#333740]" />
              <span className="text-[6px] font-sans font-bold text-neutral-400 leading-none mt-0.5">PGM</span>
            </div>

            {/* Row 4: SHIFT, 0, HELP */}
            <div className="flex flex-col items-center mt-0.5">
              <button type="button" className="w-7 sm:w-8 h-3.5 bg-[#17191d] border border-[#2d313a] rounded-[2px] text-[6.5px] font-sans font-bold text-neutral-300 shadow-inner">
                SHIFT
              </button>
            </div>

            <div className="flex flex-col items-center mt-0.5">
              <button type="button" className="w-7 sm:w-8 h-4 bg-[#22252a] hover:bg-[#282c32] rounded-[3px] hardware-button border border-[#333740]" />
            </div>

            <div className="flex flex-col items-center mt-0.5">
              <span className="text-[7px] font-sans font-bold text-neutral-400 mt-1">
                HELP
              </span>
            </div>
          </div>
        </div>

        {/* Center: Open Window, Jog Wheel, Step & Cursor */}
        <div className="col-span-4 flex flex-col items-center">
          {/* OPEN WINDOW button */}
          <div className="flex flex-col items-center mb-1">
            <span className="text-[6.5px] font-sans font-bold text-neutral-300 uppercase tracking-tight">
              OPEN WINDOW
            </span>
            <button
              type="button"
              className="w-6 sm:w-7 h-3.5 bg-white hover:bg-neutral-100 rounded-[2px] border border-neutral-300 shadow-[0_1.5px_0_#9ca3af] active:translate-y-[1px] active:shadow-none mt-0.5"
            />
          </div>

          {/* Large Black Jog Wheel */}
          <div className="relative w-18 h-18 sm:w-20 sm:h-20 rounded-full jog-wheel-grooves border border-[#2e3138] flex items-center justify-center cursor-pointer group">
            <div className="w-14 h-14 rounded-full border border-neutral-800/80 flex items-center justify-center">
              <div className="w-10 h-10 rounded-full border border-neutral-900 flex items-center justify-center bg-[#090a0c]">
                <div className="w-3.5 h-3.5 rounded-full bg-gradient-to-b from-[#000000] to-[#1a1b1e] shadow-[inset_0_2px_4px_rgba(0,0,0,0.95)] border border-neutral-800" />
              </div>
            </div>
            <div className="absolute top-1 w-0.5 h-2.5 bg-white rounded-full shadow-[0_0_2px_white]" />
          </div>
          <span className="text-[6.5px] font-sans font-bold text-neutral-400 mt-1 uppercase">
            PREV. STEP
          </span>

          {/* STEP & CURSOR Navigation */}
          <div className="flex items-center justify-between w-full mt-1.5 px-0.5">
            {/* STEP < and STEP > */}
            <div className="flex flex-col gap-1">
              <div className="flex flex-col items-center">
                <span className="text-[6px] font-sans font-bold text-neutral-400">STEP &lt;</span>
                <button type="button" className="w-4.5 h-3.5 bg-[#22252a] border border-[#333740] rounded-[2px] hardware-button" />
              </div>
              <div className="flex flex-col items-center">
                <span className="text-[6px] font-sans font-bold text-neutral-400">STEP &gt;</span>
                <button type="button" className="w-4.5 h-3.5 bg-[#22252a] border border-[#333740] rounded-[2px] hardware-button" />
              </div>
            </div>

            {/* CURSOR Cross Pad */}
            <div className="flex flex-col items-center">
              <span className="text-[7px] font-sans font-bold text-neutral-400 mb-0.5">
                CURSOR
              </span>
              <div className="grid grid-cols-3 gap-0.5">
                <div />
                <button type="button" className="w-3.5 h-3.5 bg-[#22252a] border border-[#333740] rounded-[2px] hardware-button flex items-center justify-center text-neutral-300"><ChevronUp size={9} /></button>
                <div />
                <button type="button" className="w-3.5 h-3.5 bg-[#22252a] border border-[#333740] rounded-[2px] hardware-button flex items-center justify-center text-neutral-300"><ChevronLeft size={9} /></button>
                <div className="w-3.5 h-3.5" />
                <button type="button" className="w-3.5 h-3.5 bg-[#22252a] border border-[#333740] rounded-[2px] hardware-button flex items-center justify-center text-neutral-300"><ChevronRight size={9} /></button>
                <div />
                <button type="button" className="w-3.5 h-3.5 bg-[#22252a] border border-[#333740] rounded-[2px] hardware-button flex items-center justify-center text-neutral-300"><ChevronDown size={9} /></button>
                <div />
              </div>
            </div>
          </div>
        </div>

        {/* Right: Note Variation Slider & Locate */}
        <div className="col-span-3 flex flex-col items-center">
          <span className="text-[6.5px] font-sans font-bold text-neutral-400 uppercase tracking-tighter mb-0.5">
            NOTE VARIATION
          </span>

          <div className="flex items-center gap-1">
            {/* Ticks */}
            <div className="flex flex-col justify-between h-18 text-[6px] font-sans text-neutral-500">
              <span>MAX</span>
              <span>MIN</span>
            </div>

            {/* Slider Slot */}
            <div className="relative w-3 h-18 bg-[#0d0e10] rounded-[2px] border border-[#252830] flex items-center justify-center shadow-inner">
              <div className="w-0.5 h-16 bg-black rounded" />
              {/* Slider Knob */}
              <div className="absolute top-6 w-5 h-3.5 bg-gradient-to-b from-[#3a3f47] to-[#202328] rounded-[2px] border border-[#484f5a] shadow-[0_2px_4px_rgba(0,0,0,0.8)] flex items-center justify-center cursor-pointer">
                <div className="w-3 h-0.5 bg-white shadow-sm" />
              </div>
            </div>

            {/* AFTER & UNDO/SEQ */}
            <div className="flex flex-col gap-1.5 ml-0.5">
              <div className="flex flex-col items-center">
                <button type="button" className="w-5.5 h-3 bg-[#22252a] border border-[#333740] rounded-[2px] hardware-button" />
                <span className="text-[6px] font-sans font-bold text-neutral-400 mt-0.5">AFTER</span>
              </div>
              <div className="flex flex-col items-center">
                <button type="button" className="w-5.5 h-3 bg-[#22252a] border border-[#333740] rounded-[2px] hardware-button" />
                <span className="text-[6px] font-sans font-bold text-neutral-400 mt-0.5">UNDO</span>
              </div>
            </div>
          </div>

          {/* LOCATE Section */}
          <div className="mt-1.5 flex flex-col items-center w-full">
            <span className="text-[6.5px] font-sans font-bold text-neutral-400 uppercase">
              LOCATE
            </span>
            <div className="flex items-center gap-0.5 mt-0.5">
              <div className="flex flex-col items-center">
                <span className="text-[5.5px] text-neutral-500">GOTO</span>
                <button type="button" className="w-3.5 h-2.5 bg-[#22252a] border border-[#333740] rounded-[2px] hardware-button" />
              </div>
              <div className="flex flex-col items-center">
                <button type="button" className="w-4.5 h-2.5 bg-[#22252a] border border-[#333740] rounded-[2px] text-[6.5px] font-bold text-neutral-300 hardware-button">&lt;&lt;</button>
                <span className="text-[5.5px] text-neutral-500">BAR-</span>
              </div>
              <div className="flex flex-col items-center">
                <button type="button" className="w-4.5 h-2.5 bg-[#22252a] border border-[#333740] rounded-[2px] text-[6.5px] font-bold text-neutral-300 hardware-button">&gt;&gt;</button>
                <span className="text-[5.5px] text-neutral-500">BAR+</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* BOTTOM TRANSPORT ROW - REC & OVER DUB are RED */}
      <div className="mt-3 pt-2 flex items-center justify-between gap-1.5 border-t border-[#24272e]">
        {/* REC - RED */}
        <div className="flex flex-col items-center flex-1">
          <button
            type="button"
            className="w-full h-7 sm:h-8 bg-gradient-to-b from-[#ef4444] to-[#b91c1c] hover:brightness-110 rounded-[3px] border border-[#991b1b] shadow-[0_2px_0_#7f1d1d,0_3px_5px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.3)] active:translate-y-[1.5px] active:shadow-none flex items-center justify-center transition-all"
          >
            <div className="w-2.5 h-2.5 rounded-full bg-white shadow-[0_0_3px_white]" />
          </button>
          <span className="text-[7.5px] font-sans font-bold text-neutral-300 mt-0.5">REC</span>
        </div>

        {/* OVER DUB - RED */}
        <div className="flex flex-col items-center flex-1">
          <button
            type="button"
            className="w-full h-7 sm:h-8 bg-gradient-to-b from-[#ef4444] to-[#b91c1c] hover:brightness-110 rounded-[3px] border border-[#991b1b] shadow-[0_2px_0_#7f1d1d,0_3px_5px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.3)] active:translate-y-[1.5px] active:shadow-none flex items-center justify-center transition-all"
          >
            <span className="text-[7.5px] font-sans font-black text-white drop-shadow-sm">OVER DUB</span>
          </button>
          <span className="text-[7.5px] font-sans font-bold text-neutral-300 mt-0.5">OVER DUB</span>
        </div>

        {/* STOP */}
        <div className="flex flex-col items-center flex-1">
          <button
            type="button"
            className="w-full h-7 sm:h-8 bg-[#22252a] hover:bg-[#282c32] rounded-[3px] border border-[#333740] hardware-button flex items-center justify-center transition-all"
          >
            <Square size={9} className="fill-neutral-300 text-neutral-300" />
          </button>
          <span className="text-[7.5px] font-sans font-bold text-neutral-400 mt-0.5">STOP</span>
        </div>

        {/* PLAY */}
        <div className="flex flex-col items-center flex-1">
          <button
            type="button"
            className="w-full h-7 sm:h-8 bg-[#22252a] hover:bg-[#282c32] rounded-[3px] border border-[#333740] hardware-button flex items-center justify-center transition-all"
          >
            <Play size={10} className="fill-neutral-300 text-neutral-300 ml-0.5" />
          </button>
          <span className="text-[7.5px] font-sans font-bold text-neutral-400 mt-0.5">PLAY</span>
        </div>

        {/* PLAY START */}
        <div className="flex flex-col items-center flex-1">
          <button
            type="button"
            className="w-full h-7 sm:h-8 bg-[#22252a] hover:bg-[#282c32] rounded-[3px] border border-[#333740] hardware-button flex items-center justify-center transition-all"
          >
            <div className="flex items-center -space-x-0.5">
              <div className="w-0.5 h-2 bg-neutral-300" />
              <Play size={9} className="fill-neutral-300 text-neutral-300" />
            </div>
          </button>
          <span className="text-[7.5px] font-sans font-bold text-neutral-400 mt-0.5">PLAY START</span>
        </div>
      </div>

    </div>
  );
}
