import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useVoice } from '../context/VoiceContext';
import { useSidebar } from '../context/SidebarContext';
import {
  Menu,
  Volume2,
  VolumeX,
  LogOut,
  LogIn,
  UserPlus
} from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const {
    language,
    setLanguage,
    t,
    isMuted,
    toggleMute
  } = useVoice();
  const { toggleSidebar } = useSidebar();
  const location = useLocation();
  const isLandingPage = location.pathname === '/';

  return (
    <header className="sticky top-0 z-40 shadow-glass transition-all duration-200">
      
      {/* Single Main Navbar (Transparent Floating Glass Style) */}
      <nav className="bg-black/35 backdrop-blur-xl border-b border-white/10 text-white px-3 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-3 sm:gap-4">
        
        {/* Left: Sidebar Toggle Button (Only when Logged In and outside Landing Page) + Circular Logo + "Aapan" text */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          
          {/* Dedicated Sidebar Toggle Button (Hidden on Landing Page) */}
          {isAuthenticated && !isLandingPage && (
            <button
              onClick={toggleSidebar}
              className="h-9 sm:h-10 px-2.5 sm:px-3.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 text-white flex items-center gap-2 font-bold text-xs transition-all cursor-pointer shadow-sm active:scale-95 group"
              aria-label="Toggle Sidebar Navigation"
              title="Toggle Sidebar Navigation"
            >
              <Menu className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
              <span className="hidden sm:inline text-white/90">{language === 'hi' ? 'मेनू' : 'Menu'}</span>
            </button>
          )}

          <Link
            to={isAuthenticated ? "/dashboard" : "/"}
            className="flex items-center gap-2.5 sm:gap-3 group focus:outline-none focus:ring-2 focus:ring-amber-400 rounded-2xl p-1"
            aria-label={isAuthenticated ? "Aapan Dashboard" : "Aapan Home"}
          >
            {/* Circular Logo Icon */}
            <div className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-full p-0.5 bg-gradient-to-br from-amber-500 via-rose-500 to-purple-600 shadow-glow-amber shrink-0 group-hover:scale-105 transition-transform overflow-hidden flex items-center justify-center">
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

            {/* Aapan Brand Text */}
            <span className="text-lg sm:text-2xl font-headline font-extrabold tracking-tight text-white">
              Aapan AI
            </span>
          </Link>
        </div>

        {/* Center: Dynamic Navigation (Public Only; Clean after Login) */}
        {!isAuthenticated && (
          <div className="hidden md:flex items-center gap-6 lg:gap-8 text-[14.5px] font-medium text-stone-300 shrink-0">
            <Link
              to="/"
              className="hover:text-amber-400 transition-colors focus:ring-2 focus:ring-amber-400 rounded px-2 py-1"
            >
              {t('nav.home')}
            </Link>
            <Link
              to="/dashboard"
              className="hover:text-amber-400 transition-colors focus:ring-2 focus:ring-amber-400 rounded px-2 py-1"
            >
              {t('nav.songs') || 'My Songs'}
            </Link>
            <Link
              to="/lyrics"
              className="hover:text-amber-400 transition-colors focus:ring-2 focus:ring-amber-400 rounded px-2 py-1 flex items-center gap-1.5"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
              <span>{t('nav.lyrics') || 'Music to Lyrics'}</span>
            </Link>
            <a
              href="/#about"
              className="hover:text-amber-400 transition-colors focus:ring-2 focus:ring-amber-400 rounded px-2 py-1"
            >
              {t('nav.about')}
            </a>
            <a
              href="/#contact"
              className="hover:text-amber-400 transition-colors focus:ring-2 focus:ring-amber-400 rounded px-2 py-1"
            >
              {t('nav.contact')}
            </a>
          </div>
        )}

        {/* Right: Accessibility, Other Features & Auth Actions */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          
          {/* Integrated Language Switcher Pill */}
          <div className="hidden sm:flex items-center bg-stone-900/90 border border-white/10 rounded-xl p-0.5 text-xs">
            <button
              onClick={() => setLanguage('hinglish')}
              className={`px-2 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                language === 'hinglish' ? 'bg-amber-500 text-stone-950 shadow-sm' : 'text-stone-400 hover:text-white'
              }`}
            >
              Hinglish
            </button>
            <button
              onClick={() => setLanguage('hi')}
              className={`px-2 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                language === 'hi' ? 'bg-amber-500 text-stone-950 shadow-sm' : 'text-stone-400 hover:text-white'
              }`}
            >
              हिन्दी
            </button>
            <button
              onClick={() => setLanguage('en')}
              className={`px-2 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                language === 'en' ? 'bg-amber-500 text-stone-950 shadow-sm' : 'text-stone-400 hover:text-white'
              }`}
            >
              EN
            </button>
          </div>

          {/* Global Mute / Unmute Audio Toggle Button */}
          <button
            onClick={toggleMute}
            aria-label={isMuted ? (language === 'hi' ? 'आवाज़ चालू करें' : 'Unmute audio') : (language === 'hi' ? 'आवाज़ बंद करें' : 'Mute audio')}
            title={isMuted ? (language === 'hi' ? 'अनम्यूट करें (Muted - Press M)' : 'Unmute audio (Press M)') : (language === 'hi' ? 'म्यूट करें (Mute - Press M)' : 'Mute audio (Press M)')}
            className={`w-9 h-9 border rounded-xl flex items-center justify-center focus:ring-2 focus:ring-amber-400 transition-all cursor-pointer ${
              isMuted
                ? 'bg-rose-500/20 hover:bg-rose-500/30 border-rose-500/40 text-rose-400 shadow-sm'
                : 'bg-white/10 hover:bg-white/20 border-white/15 text-emerald-400 hover:text-emerald-300'
            }`}
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 stroke-[2.2]" />
            ) : (
              <Volume2 className="w-4 h-4 stroke-[2.2]" />
            )}
          </button>

          {/* Auth State Action Buttons */}
          {isAuthenticated ? (
            /* Logged In State: User Avatar + Dedicated Logout */
            <div className="flex items-center gap-2 pl-1.5 border-l border-white/10">
              
              {/* User Avatar Chip */}
              <Link
                to="/dashboard"
                className="h-9 px-2.5 sm:px-3 bg-white/10 hover:bg-white/15 border border-white/15 text-stone-200 hover:text-white rounded-full text-xs font-semibold flex items-center gap-2 transition-all shadow-sm"
                title={language === 'hi' ? 'डैशबोर्ड खोलें' : 'Go to Dashboard'}
              >
                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-amber-400 to-rose-500 text-stone-950 font-black text-[10px] flex items-center justify-center shrink-0">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="hidden sm:inline max-w-[100px] truncate">
                  {user?.name?.split(' ')[0] || 'User'}
                </span>
              </Link>

              {/* Dedicated Logout Button */}
              <button
                onClick={logout}
                title={t('nav.logout') || 'Log Out'}
                className="h-9 px-3.5 sm:px-4 bg-red-950/60 hover:bg-red-900/80 border border-red-500/40 text-red-200 hover:text-white rounded-full text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-sm"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{t('nav.logout') || 'Logout'}</span>
              </button>
            </div>
          ) : (
            /* Not Logged In State: Sign In & Sign Up */
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="h-9 px-3.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-full text-xs font-semibold flex items-center justify-center transition-all shadow-sm focus:ring-2 focus:ring-amber-400 active:scale-95"
              >
                {t('nav.login')}
              </Link>

              <Link
                to="/signup"
                className="h-9 px-4 sm:px-5 bg-white hover:bg-stone-100 text-stone-950 rounded-full text-xs sm:text-sm font-black flex items-center justify-center transition-all shadow-md focus:ring-2 focus:ring-amber-400 active:scale-95"
              >
                {t('nav.signup')}
              </Link>
            </div>
          )}

        </div>

      </nav>

    </header>
  );
}
