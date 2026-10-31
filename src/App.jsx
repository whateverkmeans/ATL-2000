import React, { useState, useEffect, useCallback, useRef } from 'react';
import MpcChassis from './components/MpcChassis';
import AboutModal from './components/AboutModal';
import { PADS_CONFIG } from './constants/padConfig';
import { audioEngine } from './audio/AudioEngine';

export default function App() {
  const [pressedPadIds, setPressedPadIds] = useState(new Set());
  const [loopingPadIds, setLoopingPadIds] = useState(new Set());
  const [isChokeActive, setIsChokeActive] = useState(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [lcdStatus, setLcdStatus] = useState('');
  const [volume, setVolume] = useState(0.85);

  const statusTimerRef = useRef(null);

  // Helper to flash temporary LCD status messages
  const updateLcdStatus = useCallback((msg, durationMs = 2200) => {
    if (statusTimerRef.current) {
      clearTimeout(statusTimerRef.current);
    }
    setLcdStatus(msg);
    statusTimerRef.current = setTimeout(() => {
      setLcdStatus('');
    }, durationMs);
  }, []);

  // Preload all sample files from /samples/
  useEffect(() => {
    PADS_CONFIG.forEach((pad) => {
      if (pad.file) {
        audioEngine.loadSample(pad.id, pad.file).catch(() => {});
      }
    });
  }, []);

  // Update master volume
  const handleVolumeChange = useCallback((newVol) => {
    setVolume(newVol);
    audioEngine.setMasterVolume(newVol);
    updateLcdStatus(`VOL: ${Math.round(newVol * 100)}%`, 1500);
  }, [updateLcdStatus]);

  // Main Pad Trigger Function
  const handlePadTrigger = useCallback((pad) => {
    // 1. Momentary press visual feedback
    setPressedPadIds((prev) => {
      const next = new Set(prev);
      next.add(pad.id);
      return next;
    });

    setTimeout(() => {
      setPressedPadIds((prev) => {
        const next = new Set(prev);
        next.delete(pad.id);
        return next;
      });
    }, 120);

    // 2. Action based on pad type
    switch (pad.type) {
      case 'loop': {
        const isNowLooping = audioEngine.toggleLoop(pad, (loopState) => {
          setLoopingPadIds((prev) => {
            const next = new Set(prev);
            if (loopState) next.add(pad.id);
            else next.delete(pad.id);
            return next;
          });
        });

        setLoopingPadIds((prev) => {
          const next = new Set(prev);
          if (isNowLooping) next.add(pad.id);
          else next.delete(pad.id);
          return next;
        });

        updateLcdStatus(isNowLooping ? `LOOP ON: ${pad.label}` : `LOOP OFF: ${pad.label}`);
        break;
      }

      case 'one-shot': {
        audioEngine.triggerOneShot(pad, isChokeActive);
        updateLcdStatus(`TRIG: ${pad.label}`);
        break;
      }

      case 'control-stop': {
        audioEngine.stopAll();
        setLoopingPadIds(new Set());
        updateLcdStatus('ALL STOPPED', 3000);
        break;
      }

      case 'control-choke': {
        setIsChokeActive((prev) => {
          const nextVal = !prev;
          if (nextVal) {
            audioEngine.chokeVocals();
          }
          updateLcdStatus(nextVal ? 'CHOKE: ON' : 'CHOKE: OFF');
          return nextVal;
        });
        break;
      }

      case 'control-about': {
        setIsAboutModalOpen(true);
        updateLcdStatus('MENU: ABOUT');
        break;
      }

      default:
        break;
    }
  }, [isChokeActive, updateLcdStatus]);

  // Keyboard Event Listener
  useEffect(() => {
    const keyToPadMap = new Map();
    PADS_CONFIG.forEach((pad) => {
      keyToPadMap.set(pad.key.toUpperCase(), pad);
    });

    const activeHeldKeys = new Set();

    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      const keyChar = e.key.toUpperCase();
      const pad = keyToPadMap.get(keyChar);

      if (pad) {
        e.preventDefault();
        if (activeHeldKeys.has(keyChar)) return;
        activeHeldKeys.add(keyChar);
        handlePadTrigger(pad);
      }
    };

    const handleKeyUp = (e) => {
      const keyChar = e.key.toUpperCase();
      activeHeldKeys.delete(keyChar);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handlePadTrigger]);

  const activeLoopCount = loopingPadIds.size;
  const isAnyAudioPlaying = activeLoopCount > 0 || pressedPadIds.size > 0;

  return (
    <div className="min-h-screen bg-[#0e0f12] text-neutral-100 flex flex-col justify-center items-center py-6 px-3 sm:px-6 select-none overflow-x-hidden font-sans">
      
      {/* Top Header */}
      <header className="w-full max-w-[1040px] mb-4 flex items-center justify-between text-neutral-400 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-2 h-2 rounded-full bg-white shadow-[0_0_8px_white]" />
          <span className="font-extrabold tracking-wider text-white text-sm">ATL-2000</span>
          <span className="text-neutral-600">•</span>
          <span className="text-neutral-300 font-medium text-xs">ALL THE LOVE (feat. Andre Troutman)</span>
        </div>

        <div className="text-[11px] text-neutral-500 font-sans tracking-wide">
          118 BPM • BANK A
        </div>
      </header>

      {/* MAIN HARDWARE CHASSIS */}
      <main className="w-full flex items-center justify-center">
        <MpcChassis
          lcdStatus={lcdStatus}
          activeLoopCount={activeLoopCount}
          isChokeActive={isChokeActive}
          isAnyAudioPlaying={isAnyAudioPlaying}
          pads={PADS_CONFIG}
          pressedPadIds={pressedPadIds}
          loopingPadIds={loopingPadIds}
          onPadTrigger={handlePadTrigger}
          volume={volume}
          onVolumeChange={handleVolumeChange}
        />
      </main>

      {/* About Modal */}
      <AboutModal
        isOpen={isAboutModalOpen}
        onClose={() => setIsAboutModalOpen(false)}
      />

    </div>
  );
}
