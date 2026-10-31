import React from 'react';
import LeftPanel from './LeftPanel';
import RightPanel from './RightPanel';

export default function MpcChassis({
  lcdStatus,
  activeLoopCount,
  isChokeActive,
  isAnyAudioPlaying,
  pads,
  pressedPadIds,
  loopingPadIds,
  onPadTrigger,
  volume,
  onVolumeChange,
}) {
  return (
    <div className="relative w-full max-w-[1040px] mx-auto rounded-xl p-2.5 sm:p-3 bg-[#131417] border border-[#272a31] hardware-chassis-shadow select-none">
      
      {/* Top Edge Specular Lighting */}
      <div className="absolute inset-x-6 top-1 h-[1px] bg-gradient-to-r from-transparent via-white/[0.12] to-transparent pointer-events-none" />

      {/* Inner MPC Surface: Left (Dark Charcoal) + Seam + Right (Dark Slate-Charcoal) */}
      <div className="relative flex flex-col md:flex-row rounded-lg overflow-hidden shadow-md border border-[#22242a]">
        
        {/* Left Panel */}
        <LeftPanel
          lcdStatus={lcdStatus}
          activeLoopCount={activeLoopCount}
          isChokeActive={isChokeActive}
          isAnyAudioPlaying={isAnyAudioPlaying}
        />

        {/* Realistic Vertical Faceplate Joining Seam */}
        <div className="hidden md:block w-[1px] bg-black shadow-[1px_0_0_rgba(255,255,255,0.06)]" />

        {/* Right Panel */}
        <RightPanel
          pads={pads}
          pressedPadIds={pressedPadIds}
          loopingPadIds={loopingPadIds}
          isChokeActive={isChokeActive}
          onPadTrigger={onPadTrigger}
          volume={volume}
          onVolumeChange={onVolumeChange}
        />

      </div>

      {/* Subtle Debossed Bottom Chassis Logo: ATL-2000 */}
      <div className="mt-1 flex items-center justify-center">
        <span className="text-[10px] font-sans font-extrabold tracking-widest text-neutral-500/40 select-none drop-shadow-[0_1px_1px_rgba(255,255,255,0.05)]">
          ATL-2000
        </span>
      </div>

    </div>
  );
}
