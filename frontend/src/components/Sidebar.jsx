import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useVoice } from '../context/VoiceContext';
import { useSidebar } from '../context/SidebarContext';
import {
  FileText,
  BookOpen,
  Music,
  Volume2,
  LogOut,
  X,
  Sparkles,
  ShieldCheck,
  Globe,
  Gauge,
  ChevronRight,
  ExternalLink,
  Phone,
  Mail,
  Linkedin,
  Github
} from 'lucide-react';

export default function Sidebar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { language, setLanguage, triggerAudioGuide, playbackSpeed, setPlaybackSpeed, t } = useVoice();
  const { sidebarOpen, closeSidebar } = useSidebar();
  const location = useLocation();

  // Close sidebar on route change
  useEffect(() => {
    closeSidebar();
  }, [location.pathname]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && sidebarOpen) {
        closeSidebar();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [sidebarOpen]);

  // Ensure sidebar never renders on landing page, if user is not authenticated, or if closed
  if (!isAuthenticated || !sidebarOpen || location.pathname === '/') return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      
      {/* Backdrop overlay */}
      <div
        onClick={closeSidebar}
        className="fixed inset-0 bg-black/65 backdrop-blur-md transition-opacity animate-fadeIn cursor-pointer"
        aria-hidden="true"
      />

      {/* Floating Glass Sidebar Drawer */}
      <aside
        className="fixed inset-y-0 left-0 w-full max-w-[340px] sm:max-w-[380px] bg-black/85 backdrop-blur-2xl border-r border-white/15 text-white shadow-[0_20px_80px_rgba(0,0,0,0.9)] flex flex-col justify-between z-50 animate-slideRight overflow-y-auto"
        aria-label="Sidebar Navigation"
      >
        
        {/* TOP SECTION: Header & User Card */}
        <div className="p-5 sm:p-6 space-y-6">
          
          {/* Header Row: Brand + Close Button */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <Link
              to={isAuthenticated ? "/dashboard" : "/"}
              onClick={closeSidebar}
              className="flex items-center gap-3 group focus:outline-none"
            >
              <div className="w-9 h-9 rounded-full p-0.5 bg-gradient-to-br from-amber-500 via-rose-500 to-purple-600 shadow-glow-amber shrink-0 flex items-center justify-center overflow-hidden">
                <img
                  src="/aapan-icon.png"
                  alt="Aapan Logo"
                  className="w-full h-full object-cover rounded-full bg-black"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div className="hidden w-full h-full rounded-full bg-gradient-to-br from-amber-500 to-rose-600 items-center justify-center text-stone-950 font-black text-xs">
                  A
                </div>
              </div>
              <div>
                <span className="text-xl font-headline font-black tracking-tight text-white block">
                  Aapan AI
                </span>
                <span className="text-[10px] text-white/50 block tracking-wider uppercase font-semibold">
                  Indic Voice & Lyrics
                </span>
              </div>
            </Link>

            <button
              onClick={closeSidebar}
              className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white flex items-center justify-center border border-white/10 transition-colors cursor-pointer"
              aria-label="Close Sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Account Card (if logged in) */}
          {isAuthenticated && (
            <div className="p-4 rounded-2xl bg-white/5 border border-white/15 space-y-2.5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-rose-500 text-stone-950 font-black text-sm flex items-center justify-center shrink-0 shadow-md">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="overflow-hidden">
                  <span className="font-bold text-sm text-white block truncate">
                    {user?.name || 'Citizen User'}
                  </span>
                  <span className="text-xs text-white/60 block truncate">
                    {user?.email || 'Logged in'}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 pt-1 text-[11px] text-emerald-400 font-semibold border-t border-white/10">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>
                  {language === 'hi' ? 'सत्यापित खाता • क्लाउड वॉल्ट सक्रिय' : 'Verified Account • Cloud Vault Active'}
                </span>
              </div>
            </div>
          )}

          {/* Primary Navigation Links */}
          <nav className="space-y-1.5">
            <span className="text-[11px] font-bold text-white/40 uppercase tracking-wider block px-2 pb-1">
              {language === 'hi' ? 'मुख्य मेनू' : 'Main Menu'}
            </span>

            <Link
              to="/dashboard"
              className={`w-full px-3.5 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-between transition-colors ${
                location.pathname === '/dashboard'
                  ? 'bg-amber-500 text-stone-950 font-black shadow-md'
                  : 'text-stone-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Music className="w-4 h-4 text-amber-400" />
                <span>{language === 'hi' ? 'मेरे गाने व संगीत' : 'My Songs & Vault'}</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-60" />
            </Link>

            <Link
              to="/lyrics"
              className={`w-full px-3.5 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-between transition-colors ${
                location.pathname === '/lyrics'
                  ? 'bg-amber-500 text-stone-950 font-black shadow-md'
                  : 'text-stone-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Sparkles className="w-4 h-4 text-rose-400" />
                <span>{language === 'hi' ? 'संगीत से बोल स्टूडियो' : 'Music to Lyrics Studio'}</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold">
                {language === 'hi' ? 'लाइव सिंक' : 'Live Sync'}
              </span>
            </Link>
          </nav>

          {/* Featured Sample Songs Section */}
          <div className="space-y-2 pt-2 border-t border-white/10">
            <span className="text-[11px] font-bold text-white/40 uppercase tracking-wider block px-2">
              {language === 'hi' ? 'प्रमुख नमूना गीत' : 'Featured Sample Songs'}
            </span>

            <Link
              to="/lyrics"
              className="w-full p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left block space-y-1 transition-all group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  <Music className="w-3.5 h-3.5" />
                  <span>Kesariya (केसरिया)</span>
                </span>
                <span className="text-[10px] text-white/50">Arijit Singh</span>
              </div>
              <p className="text-[11px] text-white/70 line-clamp-1">
                Brahmastra • Romantic Indic Melodic
              </p>
            </Link>

            <Link
              to="/lyrics"
              className="w-full p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left block space-y-1 transition-all group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-300 flex items-center gap-1.5">
                  <Music className="w-3.5 h-3.5" />
                  <span>Samjhawan (समझावां)</span>
                </span>
                <span className="text-[10px] text-white/50">Punjabi Gurmukhi</span>
              </div>
              <p className="text-[11px] text-white/70 line-clamp-1">
                Main Tenu Samjhawan Ki • Live 3-Script
              </p>
            </Link>
          </div>

          {/* Voice & Accessibility Controls */}
          <div className="space-y-3 pt-2 border-t border-white/10">
            <span className="text-[11px] font-bold text-white/40 uppercase tracking-wider block px-2">
              {language === 'hi' ? 'आवाज़ एवं भाषा विकल्प' : language === 'hinglish' ? 'Voice & Bhasha Features' : 'Voice & Language Features'}
            </span>

            {/* Language Switcher */}
            <div className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/10">
              <span className="text-xs text-white/70 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-amber-400" />
                <span>{language === 'hi' ? 'भाषा:' : language === 'hinglish' ? 'Bhasha:' : 'Language:'}</span>
              </span>
              <div className="flex items-center bg-stone-900 border border-white/10 rounded-lg p-0.5 text-xs">
                <button
                  onClick={() => setLanguage('hinglish')}
                  className={`px-2 py-0.5 rounded font-bold cursor-pointer transition-colors ${
                    language === 'hinglish' ? 'bg-amber-500 text-stone-950' : 'text-stone-400 hover:text-white'
                  }`}
                >
                  Hinglish
                </button>
                <button
                  onClick={() => setLanguage('hi')}
                  className={`px-2 py-0.5 rounded font-bold cursor-pointer transition-colors ${
                    language === 'hi' ? 'bg-amber-500 text-stone-950' : 'text-stone-400 hover:text-white'
                  }`}
                >
                  हिन्दी
                </button>
                <button
                  onClick={() => setLanguage('en')}
                  className={`px-2 py-0.5 rounded font-bold cursor-pointer transition-colors ${
                    language === 'en' ? 'bg-amber-500 text-stone-950' : 'text-stone-400 hover:text-white'
                  }`}
                >
                  EN
                </button>
              </div>
            </div>

            {/* Audio Tour Button */}
            <button
              onClick={() => {
                triggerAudioGuide();
                closeSidebar();
              }}
              className="w-full py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-emerald-300 flex items-center justify-between transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-emerald-400" />
                <span>{language === 'hi' ? 'ऑडियो गाइड टूर' : language === 'hinglish' ? 'Voice Audio Guide Tour' : 'Voice Audio Guide Tour'}</span>
              </div>
              <span className="text-[11px] text-white/50">{language === 'hi' ? 'दबाएं H' : 'Press H'}</span>
            </button>

            {/* Speech Rate Controls */}
            <div className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/10 text-xs">
              <span className="text-white/70 flex items-center gap-1.5">
                <Gauge className="w-3.5 h-3.5 text-amber-400" />
                <span>{language === 'hi' ? 'ऑडियो गति:' : language === 'hinglish' ? 'Audio Speed:' : 'Audio Speed:'}</span>
              </span>
              <div className="flex items-center gap-1">
                {[0.75, 1.0, 1.25].map((spd) => (
                  <button
                    key={spd}
                    onClick={() => setPlaybackSpeed(spd)}
                    className={`px-2 py-0.5 rounded font-bold transition-colors cursor-pointer ${
                      playbackSpeed === spd
                        ? 'bg-amber-500 text-stone-950'
                        : 'text-stone-400 hover:text-white bg-white/5'
                    }`}
                  >
                    {spd}x
                  </button>
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* Contact Developer & Support Strip */}
        <div className="p-4 border-t border-white/10 bg-black/30 space-y-2">
          <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider block">
            {language === 'hi' ? 'संपर्क एवं सहायता' : 'Contact Developer'}
          </span>
          <div className="flex items-center gap-2">
            <a
              href="tel:+918318915349"
              className="flex-1 py-1.5 px-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-stone-300 hover:text-amber-400 text-[11px] font-medium flex items-center justify-center gap-1.5 transition-colors"
              title="Call +91 8318915349"
            >
              <Phone className="w-3 h-3 text-amber-400" />
              <span>Call</span>
            </a>
            <a
              href="mailto:mayankrajput5455@gmail.com"
              className="flex-1 py-1.5 px-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-stone-300 hover:text-rose-400 text-[11px] font-medium flex items-center justify-center gap-1.5 transition-colors"
              title="Email mayankrajput5455@gmail.com"
            >
              <Mail className="w-3 h-3 text-rose-400" />
              <span>Email</span>
            </a>
            <a
              href="https://www.linkedin.com/in/mayank5455"
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-stone-300 hover:text-blue-400 transition-colors"
              title="LinkedIn Profile"
            >
              <Linkedin className="w-3.5 h-3.5 text-blue-400" />
            </a>
            <a
              href="https://github.com/mayankrajput5455"
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-stone-300 hover:text-purple-400 transition-colors"
              title="GitHub Profile"
            >
              <Github className="w-3.5 h-3.5 text-purple-400" />
            </a>
          </div>
        </div>

        {/* BOTTOM SECTION: Dedicated Logout Action & Footer Info */}
        <div className="p-5 sm:p-6 border-t border-white/10 bg-black/40 space-y-3">
          <button
            onClick={() => {
              logout();
              closeSidebar();
            }}
            className="w-full py-3 rounded-xl bg-red-950/60 hover:bg-red-900/80 border border-red-500/40 text-red-200 hover:text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer shadow-sm"
          >
            <LogOut className="w-4 h-4" />
            <span>{t('nav.logout') || 'Log Out'}</span>
          </button>

          <div className="flex items-center justify-between text-[10px] text-white/40 pt-1">
            <span>Aapan AI Studio</span>
            <span>v2.4</span>
          </div>
        </div>

      </aside>

    </div>
  );
}

