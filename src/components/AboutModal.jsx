import React from 'react';
import { PADS_CONFIG, TRACK_INFO } from '../constants/padConfig';

export default function AboutModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200 select-none">
      
      {/* Modal Container */}
      <div className="relative w-full max-w-2xl bg-[#16181b] border border-[#2b2e35] rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header - Closed with X */}
        <div className="bg-[#1b1e22] border-b border-[#292d34] px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-bold tracking-tight text-white font-sans">
              ATL-2000 Guide &amp; Credits
            </h2>
            <p className="text-xs text-neutral-400 font-sans mt-0.5">
              ALL THE LOVE (feat. Andre Troutman)
            </p>
          </div>

          {/* Close button X */}
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-md bg-[#23272d] text-neutral-400 hover:text-white hover:bg-neutral-700 transition-colors text-sm font-bold"
            title="Close"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5 font-sans text-neutral-200 text-sm">
          
          {/* TRACK INFO BANNER */}
          <div className="p-4 rounded-lg bg-[#1f2227] border border-[#2c3038] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-neutral-400 font-bold">
                TRACK TITLE
              </div>
              <div className="text-lg font-bold text-white mt-0.5">
                {TRACK_INFO.title}
              </div>
              <div className="text-xs text-neutral-300 mt-0.5">
                Artist: <span className="text-white font-medium">{TRACK_INFO.artist}</span>
              </div>
            </div>

            <div className="flex sm:flex-col items-center sm:items-end gap-1.5 text-right">
              <span className="px-2.5 py-1 rounded bg-[#101214] border border-neutral-700 text-white font-bold text-xs">
                {TRACK_INFO.bpm} BPM
              </span>
              <span className="text-[11px] text-neutral-400">
                Bank: {TRACK_INFO.bank}
              </span>
            </div>
          </div>

          {/* AUDIO COPYRIGHT & DEDICATION TO YE */}
          <div className="p-4 rounded-lg bg-[#1a1c20] border border-[#2e323a]">
            <div className="text-xs font-bold uppercase tracking-wider text-white mb-1.5">
              Audio Credits &amp; Copyright
            </div>
            <p className="text-xs text-neutral-300 leading-relaxed">
              All audio copyrights, master recordings, and creative credits are solely and fully dedicated to <strong>Ye</strong> (Kanye West) and <strong>Andre Troutman</strong> as the original owners and creators of <em>"ALL THE LOVE"</em>. This <strong>ATL-2000</strong> interactive sampler interface was created purely as a creative tribute, educational project, and artistic appreciation of their music.
            </p>
          </div>

          {/* PAD LEGEND */}
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-neutral-300 mb-2">
              Pad Playback Behaviors
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-[#1f2227] border border-[#2c3038]">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 rounded-full bg-white shadow-sm" />
                  <span className="font-bold text-xs text-white">
                    Toggleable Loops (Stems)
                  </span>
                </div>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Pressing starts continuous seamless looping playback. The pad stays illuminated with a glowing white border. Press the pad again to stop and reset. Supports multi-track layered stem arrangements.
                </p>
                <div className="mt-2 text-[11px] text-white font-medium">
                  Pads: Drum Loop (1), Bass 1 (3), Bass 2 (4), Piano 2 (5), Piano 1 (6), String (7), Loop Fayek Alaya (13)
                </div>
              </div>

              <div className="p-3 rounded-lg bg-[#1f2227] border border-[#2c3038]">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 rounded-full bg-neutral-500" />
                  <span className="font-bold text-xs text-white">
                    One-Shots &amp; Chops
                  </span>
                </div>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Triggered instantaneously from the start. Rapid tapping cleanly retriggers the sample. When <strong>Choke Mode</strong> is active, triggering any vocal chop automatically cuts off other vocal chops.
                </p>
                <div className="mt-2 text-[11px] text-neutral-400 font-medium">
                  Pads: Fayek Alaya (2), Andre Vocal (8), Kick (9), Clap (10), Alayi (11), Andre Vocal 2 (12)
                </div>
              </div>
            </div>
          </div>

          {/* KEYBOARD SHORTCUTS */}
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-neutral-300 mb-2">
              Keyboard Shortcuts
            </div>

            <div className="bg-[#121316] p-3 rounded-lg border border-[#252830]">
              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                {PADS_CONFIG.map((pad) => (
                  <div
                    key={pad.id}
                    className="p-2 rounded bg-[#1d2025] border border-[#2a2e36] flex flex-col items-center justify-center gap-0.5"
                  >
                    <span className="px-1.5 py-0.2 rounded bg-neutral-800 text-white font-bold text-[10px] border border-neutral-700">
                      [{pad.key}]
                    </span>
                    <span className="text-[11px] font-bold text-neutral-200 truncate max-w-full">
                      {pad.label}
                    </span>
                    <span className="text-[9px] text-neutral-400">
                      {pad.type === 'loop' ? 'Loop' : pad.type === 'one-shot' ? 'Hit' : 'Control'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
