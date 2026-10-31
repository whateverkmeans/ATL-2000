import React, { useState } from 'react';
import DrumPad from './DrumPad';

export default function RightPanel({
  pads,
  pressedPadIds,
  loopingPadIds,
  isChokeActive,
  onPadTrigger,
  volume,
  onVolumeChange,
}) {
  const [recGain, setRecGain] = useState(50);

  return (
    <div className="relative flex-[1.25] bg-gradient-to-b from-[#1b1e23] via-[#17191d] to-[#131518] p-3 sm:p-4 md:p-4.5 flex flex-col justify-between select-none">
      
      {/* TOP HEADER - Compact to maximize pad area */}
      <div className="flex items-start justify-between mb-2.5 pb-2 border-b border-[#24272e]">
        
        {/* Left: PAD BANK section */}
        <div className="flex flex-col items-center">
          <span className="text-[9px] sm:text-[10px] font-sans font-bold tracking-widest text-neutral-400 uppercase mb-1">
            PAD BANK
          </span>

          {/* 4 LED Indicators - Bank A in Glowing White */}
          <div className="flex items-center gap-4 sm:gap-5 mb-1">
            {['A', 'B', 'C', 'D'].map((bank, index) => {
              const isLit = index === 0;
              return (
                <div key={bank} className="flex flex-col items-center gap-0.5">
                  <div
                    className={`w-2 h-2 rounded-full transition-all ${
                      isLit
                        ? 'bg-white border border-neutral-100 shadow-[0_0_8px_white,0_0_2px_#ffffff]'
                        : 'bg-[#26282e] border border-[#1b1c20]'
                    }`}
                  />
                  <span className="text-[7.5px] font-sans font-semibold text-neutral-400">
                    {bank}
                  </span>
                </div>
              );
            })}
          </div>

          {/* 4 Dark Bank Buttons */}
          <div className="flex items-center gap-1 mt-0.5">
            {['A', 'B', 'C', 'D'].map((bank, index) => (
              <button
                key={bank}
                type="button"
                className={`w-7 sm:w-7.5 h-3.5 sm:h-4 rounded-[3px] bg-[#22252a] hover:bg-[#282c32] border border-[#333842] hardware-button transition-all ${
                  index === 0 ? 'brightness-125 ring-1 ring-white/30' : 'opacity-85'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Right: ATL-2000 Branding & Knobs */}
        <div className="flex flex-col items-end">
          {/* Logo & Subtitle */}
          <div className="text-right mb-1.5 font-sans">
            <div className="text-sm sm:text-base font-black tracking-tight text-white drop-shadow-sm">
              ATL-2000
            </div>
            <div className="text-[7px] sm:text-[7.5px] font-sans font-bold tracking-widest text-neutral-300 uppercase mt-0.5">
              MIDI PRODUCTION CENTER
            </div>
          </div>

          {/* Rotary Knobs with realistic 3D shadow and knurling */}
          <div className="flex items-center gap-3.5 sm:gap-4">
            {/* REC GAIN */}
            <div className="flex flex-col items-center">
              <span className="text-[7px] font-sans font-bold tracking-wider text-neutral-400 uppercase mb-0.5">
                REC GAIN
              </span>
              <div
                className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-[#24272c] via-[#16181b] to-[#0c0d0f] border border-[#33373f] shadow-[0_4px_8px_rgba(0,0,0,0.7),inset_0_1px_1px_rgba(255,255,255,0.15)] flex items-center justify-center cursor-pointer group"
                onClick={() => setRecGain((prev) => (prev >= 90 ? 30 : prev + 20))}
              >
                <div
                  className="w-full h-full rounded-full flex items-center justify-center transition-transform"
                  style={{ transform: `rotate(${(recGain - 50) * 2.4}deg)` }}
                >
                  <div className="absolute top-1 w-0.5 h-2.5 bg-white rounded-full shadow-[0_0_2px_white]" />
                </div>
              </div>
            </div>

            {/* MAIN VOLUME */}
            <div className="flex flex-col items-center">
              <span className="text-[7px] font-sans font-bold tracking-wider text-neutral-400 uppercase mb-0.5">
                MAIN VOLUME
              </span>
              <div
                className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-[#eae8e1] via-[#c8c5ba] to-[#999589] border border-[#7f7a6e] shadow-[0_4px_8px_rgba(0,0,0,0.6),inset_0_1px_2px_rgba(255,255,255,0.9)] flex items-center justify-center cursor-pointer group"
                title={`Volume: ${Math.round(volume * 100)}%`}
                onClick={() => {
                  const nextVol = volume >= 0.9 ? 0.35 : volume + 0.25;
                  onVolumeChange(Math.min(1, nextVol));
                }}
              >
                <div
                  className="w-full h-full rounded-full flex items-center justify-center transition-transform"
                  style={{ transform: `rotate(${(volume - 0.5) * 260}deg)` }}
                >
                  <div className="absolute top-1 w-0.5 h-2.5 bg-neutral-900 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* 4x4 DRUM PADS GRID - Enlarged with tight spacing */}
      <div className="grid grid-cols-4 gap-1.5 sm:gap-2 my-auto">
        {pads.map((pad) => (
          <DrumPad
            key={pad.id}
            pad={pad}
            isPressed={pressedPadIds.has(pad.id)}
            isLooping={loopingPadIds.has(pad.id)}
            isChokeActive={isChokeActive}
            onTrigger={onPadTrigger}
          />
        ))}
      </div>

    </div>
  );
}
