import React from 'react';

export default function DrumPad({
  pad,
  isPressed,
  isLooping,
  isChokeActive,
  onTrigger,
}) {
  const isLoopable = pad.type === 'loop';
  const isStop = pad.type === 'control-stop';
  const isChoke = pad.type === 'control-choke';
  const isAbout = pad.type === 'control-about';
  const isOneShot = pad.type === 'one-shot';

  const isActive = (isLoopable && isLooping) || (isChoke && isChokeActive);

  return (
    <div className="p-[2px] bg-[#111215] rounded-md shadow-[inset_1px_1px_3px_rgba(0,0,0,0.9),inset_-1px_-1px_1px_rgba(255,255,255,0.05)] flex items-center justify-center">
      <button
        type="button"
        onPointerDown={(e) => {
          e.preventDefault();
          onTrigger(pad);
        }}
        className={`relative w-full aspect-square rounded-[5px] flex flex-col items-center justify-center p-1.5 sm:p-2 text-center select-none outline-none transition-all duration-75 overflow-hidden ${
          isPressed
            ? 'pad-pressed'
            : 'pad-surface hover:brightness-105'
        } ${
          isActive
            ? 'ring-2 ring-white shadow-[0_0_15px_rgba(255,255,255,0.7),inset_0_0_8px_rgba(255,255,255,0.25)] brightness-110'
            : 'border-t border-white/[0.08] border-b border-black/60'
        }`}
      >
        {/* Subtle rubber micro-texture highlight */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.04] via-transparent to-black/20 pointer-events-none" />

        {/* Pad Content - Sleek compact layout with smaller, refined font sizes */}
        <div className="relative z-10 flex flex-col items-center justify-center w-full px-0.5 pointer-events-none">
          {/* Key Shortcut */}
          <span className="text-[9px] sm:text-[10px] font-sans font-medium text-neutral-400 tracking-normal mb-0.5 leading-none">
            {pad.key}
          </span>

          {/* Sample / Pad Label - Compact & Neatly Sized */}
          <span className="font-sans font-bold text-[10.5px] sm:text-[11.5px] md:text-xs text-white leading-tight tracking-tight line-clamp-2 drop-shadow-sm">
            {pad.label}
          </span>

          {/* Subtext */}
          {(pad.subtext || isLooping || (isChoke && isChokeActive)) && (
            <span
              className={`text-[8px] sm:text-[8.5px] font-sans font-normal mt-0.5 tracking-tight leading-none truncate max-w-full ${
                isLooping
                  ? 'text-white font-semibold drop-shadow-[0_0_4px_rgba(255,255,255,0.8)]'
                  : isChoke && isChokeActive
                  ? 'text-neutral-200 font-semibold'
                  : 'text-neutral-400'
              }`}
            >
              {isLooping ? 'looping' : pad.subtext}
            </span>
          )}
        </div>
      </button>
    </div>
  );
}
