import React from 'react';
import { useVoice } from '../context/VoiceContext';

export default function SoundwaveVisualizer({ active = false }) {
  const { isListening, isSpeaking } = useVoice();
  const isAnimating = active || isListening || isSpeaking;

  return (
    <div
      aria-label="ऑडियो तरंगें (Acoustic Soundwave Visualizer)"
      className={`h-16 bg-stone-950/70 backdrop-blur-md rounded-2xl border border-white/10 flex items-center justify-center gap-2.5 px-6 shadow-inner ${isAnimating ? 'animating' : ''}`}
    >
      <span className="wave-bar w-2 bg-gradient-to-t from-amber-500 to-amber-sunset rounded-full h-3 transition-all"></span>
      <span className="wave-bar w-2 bg-gradient-to-t from-emerald-500 to-teal-400 rounded-full h-6 transition-all"></span>
      <span className="wave-bar w-2 bg-gradient-to-t from-amber-glow to-amber-500 rounded-full h-10 transition-all"></span>
      <span className="wave-bar w-2 bg-gradient-to-t from-emerald-400 to-emerald-600 rounded-full h-4 transition-all"></span>
      <span className="wave-bar w-2 bg-gradient-to-t from-amber-500 to-amber-sunset rounded-full h-8 transition-all"></span>
      <span className="wave-bar w-2 bg-gradient-to-t from-emerald-300 to-emerald-500 rounded-full h-5 transition-all"></span>
      <span className="wave-bar w-2 bg-gradient-to-t from-amber-glow to-amber-500 rounded-full h-3 transition-all"></span>
    </div>
  );
}
