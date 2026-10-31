import React, { useEffect, useRef } from 'react';
import { audioEngine } from '../audio/AudioEngine';

export default function TopVisualizer({ isAnyAudioPlaying }) {
  const barsCanvasRef = useRef(null);
  const vuNeedleRef = useRef(null);
  const vuPeakLedRef = useRef(null);

  const vuState = useRef({
    currentAngle: -42,
    targetAngle: -42,
    velocity: 0,
    peakHold: 0,
  });

  useEffect(() => {
    let animId;
    const freqData = new Uint8Array(64);

    const render = () => {
      // 1. Draw Spectrum Frequency Bars (White/Silver themed)
      const canvas = barsCanvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;

        audioEngine.getByteFrequencyData(freqData);
        ctx.clearRect(0, 0, width, height);

        const numBars = 32;
        const barSpacing = 2.5;
        const totalSpacing = barSpacing * (numBars - 1);
        const barWidth = (width - totalSpacing) / numBars;

        for (let i = 0; i < numBars; i++) {
          const dataIndex = Math.min(Math.floor(Math.pow(i / numBars, 1.25) * 32), 48);
          let value = freqData[dataIndex] || 0;

          if (value < 4 && !isAnyAudioPlaying) {
            value = Math.sin(Date.now() * 0.003 + i * 0.25) * 3 + 4;
          }

          const percent = Math.min(1, Math.max(0.04, value / 255));
          const barHeight = percent * height;
          const x = i * (barWidth + barSpacing);
          const y = height - barHeight;

          const segments = 10;
          const segHeight = height / segments;

          for (let s = 0; s < segments; s++) {
            const segY = height - (s + 1) * segHeight;
            if (segY + segHeight > y) {
              if (s >= 8) {
                ctx.fillStyle = '#ffffff'; // White peak
              } else if (s >= 6) {
                ctx.fillStyle = '#d1d5db'; // Silver warn
              } else {
                ctx.fillStyle = '#9ca3af'; // Charcoal/light grey
              }
              ctx.fillRect(x, segY + 1, barWidth, segHeight - 1.5);
            }
          }
        }
      }

      // 2. Analog VU Meter Needle
      const level = audioEngine.getAudioLevel();
      const state = vuState.current;

      let target = -42 + Math.min(1, level * 1.25) * 80;
      if (!isAnyAudioPlaying && level < 0.02) {
        target = -42;
      }
      state.targetAngle = target;

      const springConstant = 0.22;
      const damping = 0.72;
      const force = (state.targetAngle - state.currentAngle) * springConstant;
      state.velocity = (state.velocity + force) * damping;
      state.currentAngle += state.velocity;

      if (vuNeedleRef.current) {
        vuNeedleRef.current.style.transform = `rotate(${state.currentAngle.toFixed(2)}deg)`;
      }

      // Peak LED (White LED)
      if (vuPeakLedRef.current) {
        if (level > 0.82) {
          state.peakHold = 10;
        }
        if (state.peakHold > 0) {
          state.peakHold--;
          vuPeakLedRef.current.style.opacity = '1';
        } else {
          vuPeakLedRef.current.style.opacity = '0.2';
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
    <div className="w-full max-w-[1040px] mx-auto mb-5 sm:mb-6 px-3 py-2 bg-[#15171a] border border-[#24272e] rounded-lg shadow-lg flex items-center justify-between gap-4 select-none">
      
      {/* Left: Geometric Diamond Badge */}
      <div className="flex items-center gap-3 pl-1">
        <div className="w-7 h-7 rotate-45 border border-white/60 bg-neutral-900 flex items-center justify-center">
          <div className="w-3.5 h-3.5 bg-white shadow-[0_0_6px_rgba(255,255,255,0.7)]" />
        </div>
        <div className="hidden sm:flex flex-col font-sans">
          <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-bold">
            ATL-2000
          </span>
          <span className="text-xs font-semibold tracking-wide text-neutral-200">
            Realtime Monitor
          </span>
        </div>
      </div>

      {/* Center: Frequency Spectrum Bars */}
      <div className="flex-1 flex flex-col items-center justify-center px-2">
        <div className="relative w-full max-w-md h-10 bg-[#0c0d0f] border border-neutral-800 rounded px-2 py-1 flex items-center justify-center shadow-inner overflow-hidden">
          <canvas
            ref={barsCanvasRef}
            width={340}
            height={36}
            className="w-full h-full relative z-0"
          />
        </div>
      </div>

      {/* Right: Analog VU Meter */}
      <div className="flex items-center gap-2 pr-1">
        <div className="relative w-36 sm:w-40 h-14 bg-[#1c1f24] border border-[#31353e] rounded shadow-inner overflow-hidden flex flex-col justify-between p-1.5">
          {/* Glass reflection */}
          <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/10 to-transparent pointer-events-none z-20" />

          {/* Scale Markings */}
          <div className="relative z-10 flex justify-between items-start pt-0.5 px-2 text-[7px] font-sans font-bold text-neutral-400">
            <span>-20</span>
            <span>-10</span>
            <span>-5</span>
            <span className="text-white font-extrabold">0</span>
            <span className="text-white font-extrabold">+3</span>
          </div>

          {/* Arc SVG */}
          <svg className="absolute inset-x-0 top-1 w-full h-8 z-10 pointer-events-none" viewBox="0 0 160 32">
            <path d="M 22 26 A 80 80 0 0 1 115 14" fill="none" stroke="#6b7280" strokeWidth="1" />
            <path d="M 115 14 A 80 80 0 0 1 140 20" fill="none" stroke="#ffffff" strokeWidth="1.6" />
          </svg>

          {/* Center text VU */}
          <div className="relative z-10 text-center font-sans font-bold text-[8px] text-neutral-400 tracking-wider -mt-1">
            VU dB
          </div>

          {/* Needle - White */}
          <div className="absolute left-1/2 bottom-[-10px] w-0 h-0 z-15">
            <div
              ref={vuNeedleRef}
              className="origin-bottom will-change-transform"
              style={{
                width: '1.5px',
                height: '46px',
                backgroundColor: '#ffffff',
                boxShadow: '0 0 3px rgba(255,255,255,0.7)',
                position: 'absolute',
                bottom: '10px',
                left: '-0.75px',
                transform: 'rotate(-42deg)',
              }}
            />
            <div className="absolute -left-2.5 -top-1 w-5 h-5 rounded-full bg-neutral-900 border border-neutral-600 shadow-sm z-20" />
          </div>

          {/* Peak LED - White LED */}
          <div className="relative z-20 flex items-center justify-end gap-1">
            <span className="text-[6.5px] font-sans font-bold text-neutral-300">PEAK</span>
            <div
              ref={vuPeakLedRef}
              className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_6px_white] transition-opacity"
              style={{ opacity: 0.2 }}
            />
          </div>
        </div>
      </div>

    </div>
  );
}
