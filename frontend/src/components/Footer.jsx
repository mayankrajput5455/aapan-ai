import React from 'react';
import { Link } from 'react-router-dom';
import { useVoice } from '../context/VoiceContext';
import {
  ShieldCheck,
  Keyboard,
  Sparkles,
  Music,
  Disc3,
  Mic,
  Youtube,
  Heart,
  Globe,
  Radio,
  ExternalLink,
  Volume2,
  CheckCircle2,
  Cpu,
  Layers,
  FileText
} from 'lucide-react';

export default function Footer() {
  const { t, language } = useVoice();

  return (
    <footer className="mt-24 border-t border-white/10 bg-black/75 backdrop-blur-2xl text-stone-300 relative overflow-hidden">
      {/* Subtle top ambient glowing line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/40 to-transparent"></div>

      {/* 1. Accessible Hotkeys & System Status Strip */}
      <div className="border-b border-white/10 bg-black/40 py-3.5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Keyboard className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              {t('footer.hotkeys')}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded-lg border border-white/10 text-stone-200 transition-colors">
              <kbd className="text-amber-400 font-bold">Space</kbd> = {t('footer.speak')}
            </span>
            <span className="bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded-lg border border-white/10 text-stone-200 transition-colors">
              <kbd className="text-emerald-400 font-bold">P</kbd> = {t('footer.playPause')}
            </span>
            <span className="bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded-lg border border-white/10 text-stone-200 transition-colors">
              <kbd className="text-amber-400 font-bold">R</kbd> = {t('footer.repeat')}
            </span>
            <span className="bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded-lg border border-white/10 text-stone-200 transition-colors">
              <kbd className="text-rose-400 font-bold">M</kbd> = Mute / Unmute
            </span>
            <span className="bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded-lg border border-white/10 text-stone-200 transition-colors">
              <kbd className="text-purple-400 font-bold">H</kbd> = Audio Guide
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-[11px] font-semibold text-emerald-400">
              Gnani.ai Prisma & Timbre Active
            </span>
          </div>
        </div>
      </div>

      {/* 2. Main Multi-Column Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          
          {/* Brand & Vision (Spans 2 columns on lg screens) */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="inline-flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-2xl p-0.5 bg-gradient-to-br from-amber-500 via-rose-500 to-purple-600 shadow-glow-amber flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <img
                  src="/aapan-icon.png"
                  alt="Aapan AI Logo"
                  className="w-full h-full object-cover rounded-2xl bg-black"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div className="hidden w-full h-full rounded-2xl bg-gradient-to-br from-amber-500 to-rose-600 items-center justify-center text-stone-950 font-black text-xs">
                  A
                </div>
              </div>
              <div>
                <span className="text-xl font-headline font-black text-white tracking-tight flex items-center gap-2">
                  <span>Aapan AI</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                    PRO
                  </span>
                </span>
                <p className="text-[11px] text-stone-400">
                  {language === 'hi' ? 'भारत का वॉइस-फर्स्ट इंडिक म्यूज़िक स्टूडियो' : 'India’s Voice-First Indic Music & Lyrics Studio'}
                </p>
              </div>
            </Link>

            <p className="text-xs text-stone-400 leading-relaxed max-w-sm">
              Empowering India's 1.4 billion citizens to experience music and poetry without language barriers. Real-time synchronized lyrics, Devanagari to Roman transliteration, and AI-powered multi-script karaoke.
            </p>

            {/* Official Partner Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-stone-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Official Gnani.ai ASR Prisma V3 & Timbre Engine</span>
            </div>

            {/* Indic Script Support Tags */}
            <div className="space-y-1.5 pt-1">
              <p className="text-[10px] uppercase font-bold tracking-wider text-stone-500">
                Supported Indic Languages & Scripts
              </p>
              <div className="flex flex-wrap gap-1.5 text-[11px]">
                {['हिन्दी', 'Hinglish', 'English', 'தமிழ்', 'తెలుగు', 'বাংলা', 'मराठी', 'ગુજરાતી'].map((lang) => (
                  <span
                    key={lang}
                    className="px-2 py-0.5 rounded-md bg-stone-900 border border-white/5 text-stone-400"
                  >
                    {lang}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Column 2: Studio & Features */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <Music className="w-3.5 h-3.5" />
              <span>Studio & Tools</span>
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/lyrics" className="text-stone-400 hover:text-white transition-colors flex items-center gap-1.5">
                  <span>Music to Lyrics Studio</span>
                </Link>
              </li>
              <li>
                <Link to="/lyrics" className="text-stone-400 hover:text-white transition-colors flex items-center gap-1.5">
                  <Youtube className="w-3 h-3 text-red-400" />
                  <span>YouTube Stream Sync</span>
                </Link>
              </li>
              <li>
                <Link to="/lyrics" className="text-stone-400 hover:text-white transition-colors">
                  Synchronized Karaoke Highlighter
                </Link>
              </li>
              <li>
                <Link to="/lyrics" className="text-stone-400 hover:text-white transition-colors flex items-center gap-1.5">
                  <Mic className="w-3 h-3 text-rose-400" />
                  <span>Vocal Hum & Live Audio Sync</span>
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-stone-400 hover:text-white transition-colors">
                  Personal Music Vault
                </Link>
              </li>
              <li>
                <Link to="/lyrics" className="text-stone-400 hover:text-white transition-colors">
                  .LRC Sync File Export
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Indic AI Technology */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-2">
              <Cpu className="w-3.5 h-3.5" />
              <span>Indic AI Engine</span>
            </h4>
            <ul className="space-y-2 text-xs">
              <li className="text-stone-400 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                <span>Gnani Prisma ASR V3</span>
              </li>
              <li className="text-stone-400 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                <span>Timbre Neural TTS</span>
              </li>
              <li className="text-stone-400 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>Phonetic Alignment Engine</span>
              </li>
              <li className="text-stone-400 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                <span>Devanagari Transliteration</span>
              </li>
              <li className="text-stone-400 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                <span>Web Audio Equalizer (28-Bar)</span>
              </li>
              <li className="text-stone-400 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                <span>Global Sound & Mute Sync</span>
              </li>
            </ul>
          </div>

          {/* Column 4: Accessibility & Trust */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Accessibility & Trust</span>
            </h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-1.5 text-stone-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-bold text-white">WCAG 2.2 AAA Standards</span>
              </li>
              <li className="text-stone-400">
                High-Contrast Focus Rings
              </li>
              <li className="text-stone-400">
                Full Voice Screen Reader Ready
              </li>
              <li className="text-stone-400">
                Local Private Audio Vault
              </li>
              <li>
                <Link to="/login" className="text-stone-400 hover:text-white transition-colors">
                  Account Authentication
                </Link>
              </li>
              <li>
                <Link to="/signup" className="text-stone-400 hover:text-white transition-colors">
                  Create Free Account
                </Link>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* 3. Bottom Legal & Made in India Strip */}
      <div className="border-t border-white/10 bg-black/60 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-400">
          
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>© {new Date().getFullYear()} Aapan AI. All rights reserved.</span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline">Engineered for Bharat.</span>
          </div>

          <div className="flex items-center gap-1.5 text-stone-300 font-medium">
            <span>Made with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>in India 🇮🇳</span>
            <span className="mx-1.5 text-white/20">•</span>
            <span className="text-amber-400 font-semibold">Gnani.ai Inside</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-stone-400">
            <span className="hover:text-stone-200 transition-colors cursor-pointer">Privacy Policy</span>
            <span className="hover:text-stone-200 transition-colors cursor-pointer">Terms of Service</span>
            <span className="hover:text-stone-200 transition-colors cursor-pointer">Security Vault</span>
          </div>

        </div>
      </div>
    </footer>
  );
}
