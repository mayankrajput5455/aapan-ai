import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useVoice } from '../context/VoiceContext';
import {
  LogIn,
  Key,
  Mail,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Music,
  ArrowRight
} from 'lucide-react';

export default function LoginPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const { speakText, language } = useVoice();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [successNotice, setSuccessNotice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if redirected with registration success or sample notice
  useEffect(() => {
    if (location.state?.registeredEmail) {
      setEmail(location.state.registeredEmail);
    }
    if (location.state?.message) {
      setSuccessNotice(location.state.message);
    }
  }, [location.state]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await login(email.trim().toLowerCase(), password);
      speakText('सफलतापूर्वक लॉगिन हो गए हैं। डैशबोर्ड पर आपका स्वागत है।', language);
      
      // Navigate to destination (or /dashboard by default)
      const target = location.state?.from || '/dashboard';
      navigate(target);
    } catch (err) {
      setError(err.message || 'लॉगिन असफल रहा। कृपया ईमेल और पासवर्ड की जांच करें।');
      speakText('लॉगिन असफल रहा। कृपया पुनः प्रयास करें।', language);
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className="max-w-md mx-auto px-4 py-10 sm:py-16 relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-amber-500/10 blur-[100px] rounded-full pointer-events-none -z-10"></div>

      <div className="glass-panel-elevated rounded-3xl p-6 sm:p-9 space-y-6 shadow-2xl border border-white/10">
        
        {/* Switcher Tabs at top */}
        <div className="grid grid-cols-2 p-1 bg-stone-950/80 rounded-2xl border border-white/10 text-xs font-bold">
          <div className="py-2.5 text-center bg-gradient-to-r from-amber-500 to-rose-500 text-stone-950 font-black rounded-xl shadow-glow-amber">
            {language === 'en' ? 'Sign In' : language === 'hi' ? 'लॉगिन करें' : 'Sign In'}
          </div>
          <Link
            to="/signup"
            className="py-2.5 text-center text-stone-400 hover:text-white rounded-xl transition-all"
          >
            {language === 'en' ? 'Sign Up' : language === 'hi' ? 'नया खाता' : 'Sign Up'}
          </Link>
        </div>

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-rose-500 text-stone-950 mx-auto flex items-center justify-center font-black shadow-glow-amber">
            <LogIn className="w-6 h-6 stroke-[2.5]" />
          </div>
          <h1 className="text-2xl font-headline font-black text-white">
            {language === 'en' ? 'Sign in to Account' : language === 'hi' ? 'खाते में लॉगिन करें' : 'Account me Login Karein'}
          </h1>
          <p className="text-xs text-stone-400">
            {language === 'en' ? 'Sign in to access your personal uploaded music, documents & lyrics' : language === 'hi' ? 'अपनी व्यक्तिगत फाइलों, गानों व बोल तक पहुंचने के लिए लॉगिन करें' : 'Apne personal uploaded music, documents aur bol access karne ke liye login karein'}
          </p>
        </div>

        {/* Success Notice (e.g. from Signup redirect or sample redirect) */}
        {successNotice && (
          <div className="p-3.5 bg-emerald-950/70 border border-emerald-500/40 rounded-xl flex items-center gap-2.5 text-xs text-emerald-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successNotice}</span>
          </div>
        )}

        {/* Error Notice */}
        {error && (
          <div className="p-3.5 bg-red-950/60 border border-red-500/40 rounded-xl flex items-center gap-2.5 text-xs text-red-200">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Email */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-stone-200" htmlFor="email-input">
              {language === 'en' ? 'Email Address' : language === 'hi' ? 'ईमेल पता' : 'Email Address'}
            </label>
            <div className="relative flex items-center">
              <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 pointer-events-none" />
              <input
                id="email-input"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="rameshwar@example.com"
                className="w-full bg-stone-900/90 border border-white/10 focus:border-amber-400 text-white text-sm rounded-xl pl-10 pr-4 py-2.5 placeholder-stone-500 focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-stone-200" htmlFor="password-input">
                {language === 'en' ? 'Password' : language === 'hi' ? 'पासवर्ड' : 'Password'}
              </label>
            </div>
            <div className="relative flex items-center">
              <Key className="w-4 h-4 text-stone-400 absolute left-3.5 pointer-events-none" />
              <input
                id="password-input"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={language === 'en' ? 'Enter password...' : language === 'hi' ? 'पासवर्ड दर्ज करें...' : 'Password enter karein...'}
                className="w-full bg-stone-900/90 border border-white/10 focus:border-amber-400 text-white text-sm rounded-xl pl-10 pr-10 py-2.5 placeholder-stone-500 focus:outline-none transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 text-stone-400 hover:text-white cursor-pointer"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full min-h-[48px] bg-gradient-to-r from-amber-500 to-rose-500 hover:opacity-95 text-stone-950 font-black text-sm rounded-xl flex items-center justify-center gap-2 shadow-glow-amber focus:ring-4 focus:ring-amber-400 active:scale-95 transition-all cursor-pointer mt-2"
          >
            <LogIn className="w-4 h-4" />
            <span>{isSubmitting ? (language === 'en' ? 'Signing in...' : language === 'hi' ? 'लॉगिन हो रहा है...' : 'Logging in...') : (language === 'en' ? 'Sign In' : language === 'hi' ? 'लॉगिन करें' : 'Sign In')}</span>
          </button>
        </form>



        <p className="text-center text-xs text-stone-400 pt-3 border-t border-white/10">
          {language === 'en' ? "Don't have an account? " : language === 'hi' ? 'खाता नहीं है? ' : 'Account nahi hai? '}
          <Link to="/signup" className="text-amber-400 font-bold hover:underline inline-flex items-center gap-1">
            <span>{language === 'en' ? 'Create Account' : language === 'hi' ? 'यहाँ नया खाता बनाएं' : 'Create Account'}</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </p>

      </div>
    </div>
  );
}
