import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useVoice } from '../context/VoiceContext';
import {
  UserPlus,
  User,
  Mail,
  Key,
  Globe,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Lock,
  ArrowRight
} from 'lucide-react';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [preferredLang, setPreferredLang] = useState('hinglish');
  const [highContrastPreferred, setHighContrastPreferred] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register } = useAuth();
  const { speakText, language } = useVoice();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('कृपया अपना पूरा नाम दर्ज करें (Please enter your name)');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('कृपया एक मान्य ईमेल पता दर्ज करें (Please enter a valid email)');
      return;
    }
    if (password.length < 6) {
      setError('पासवर्ड कम से कम 6 अक्षरों का होना चाहिए (Password must be at least 6 characters)');
      return;
    }
    if (password !== confirmPassword) {
      setError('दोनों पासवर्ड मेल नहीं खा रहे हैं (Passwords do not match)');
      return;
    }

    setIsSubmitting(true);
    try {
      await register({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        language: preferredLang,
        accessibilityMode: {
          highContrast: highContrastPreferred,
          fontScale: 1.0,
          speechRate: 1.0,
          voiceGuideEnabled: true
        }
      });

      speakText('खाता सफलतापूर्वक बन गया है। आपण एआई में आपका स्वागत है।', preferredLang);
      
      // Auto-login: User is now authenticated, navigate directly to dashboard or target
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'साइन अप में त्रुटि आई। कृपया पुनः प्रयास करें।');
      speakText('पंजीकरण असफल रहा। कृपया पुनः प्रयास करें।', language);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-10 sm:py-14 relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 blur-[110px] rounded-full pointer-events-none -z-10"></div>

      <div className="glass-panel-elevated rounded-3xl p-6 sm:p-9 space-y-6 shadow-2xl border border-white/10">
        
        {/* Switcher Tabs at top */}
        <div className="grid grid-cols-2 p-1 bg-stone-950/80 rounded-2xl border border-white/10 text-xs font-bold">
          <Link
            to="/login"
            className="py-2.5 text-center text-stone-400 hover:text-white rounded-xl transition-all"
          >
            {language === 'en' ? 'Sign In' : language === 'hi' ? 'लॉगिन करें' : 'Sign In'}
          </Link>
          <div className="py-2.5 text-center bg-gradient-to-r from-amber-500 to-rose-500 text-stone-950 font-black rounded-xl shadow-glow-amber">
            {language === 'en' ? 'Sign Up' : language === 'hi' ? 'नया खाता' : 'Sign Up'}
          </div>
        </div>

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-rose-500 text-stone-950 mx-auto flex items-center justify-center font-black shadow-glow-amber">
            <UserPlus className="w-6 h-6 stroke-[2.5]" />
          </div>
          <h1 className="text-2xl font-headline font-black text-white">
            {language === 'en' ? 'Create New Account' : language === 'hi' ? 'नया खाता बनाएं' : 'Naya Account Banayein'}
          </h1>
          <p className="text-xs text-stone-400">
            {language === 'en' ? 'Create your Aapan AI account with real-time Indic voice & lyrics studio' : language === 'hi' ? 'इंडिक वॉयस और म्यूजिक स्टूडियो के साथ अपना आपण एआई खाता बनाएं' : 'Indic voice aur music studio ke saath Aapan AI account banayein'}
          </p>
        </div>

        {/* Error Notice */}
        {error && (
          <div className="p-3.5 bg-red-950/60 border border-red-500/40 rounded-xl flex items-center gap-2.5 text-xs text-red-200">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-stone-200" htmlFor="name-input">
              {language === 'en' ? 'Full Name' : language === 'hi' ? 'पूरा नाम' : 'Poora Naam'} <span className="text-amber-400">*</span>
            </label>
            <div className="relative flex items-center">
              <User className="w-4 h-4 text-stone-400 absolute left-3.5 pointer-events-none" />
              <input
                id="name-input"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={language === 'en' ? 'e.g. Rameshwar Prasad' : 'रामेश्वर प्रसाद'}
                className="w-full bg-stone-900/90 border border-white/10 focus:border-amber-400 text-white text-sm rounded-xl pl-10 pr-4 py-2.5 placeholder-stone-500 focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-stone-200" htmlFor="email-input">
              {language === 'en' ? 'Email Address' : language === 'hi' ? 'ईमेल पता' : 'Email Address'} <span className="text-amber-400">*</span>
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
            <label className="block text-xs font-bold text-stone-200" htmlFor="password-input">
              {language === 'en' ? 'Create Password' : language === 'hi' ? 'पासवर्ड बनाएं' : 'Password Banayein'} <span className="text-amber-400">*</span>
            </label>
            <div className="relative flex items-center">
              <Key className="w-4 h-4 text-stone-400 absolute left-3.5 pointer-events-none" />
              <input
                id="password-input"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={language === 'en' ? 'Minimum 6 characters...' : language === 'hi' ? 'न्यूनतम 6 अक्षर...' : 'Minimum 6 characters...'}
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

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-stone-200" htmlFor="confirm-password-input">
              {language === 'en' ? 'Confirm Password' : language === 'hi' ? 'पासवर्ड की पुष्टि करें' : 'Confirm Password'} <span className="text-amber-400">*</span>
            </label>
            <div className="relative flex items-center">
              <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 pointer-events-none" />
              <input
                id="confirm-password-input"
                type={showPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={language === 'en' ? 'Re-enter password...' : language === 'hi' ? 'पासवर्ड दोबारा दर्ज करें...' : 'Password dobara enter karein...'}
                className="w-full bg-stone-900/90 border border-white/10 focus:border-amber-400 text-white text-sm rounded-xl pl-10 pr-10 py-2.5 placeholder-stone-500 focus:outline-none transition-colors"
              />
            </div>
            {confirmPassword && password !== confirmPassword && (
              <p className="text-[11px] text-rose-400 font-semibold">{language === 'en' ? 'Passwords do not match' : language === 'hi' ? 'पासवर्ड मेल नहीं खा रहे हैं' : 'Passwords match nahi kar rahe hain'}</p>
            )}
          </div>

          {/* Preferred Language Radio */}
          <div className="space-y-1.5 pt-1">
            <label className="block text-xs font-bold text-stone-200 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-amber-400" />
              <span>{language === 'en' ? 'Preferred Language' : language === 'hi' ? 'पसंदीदा भाषा' : 'Preferred Bhasha'}</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPreferredLang('hinglish')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  preferredLang === 'hinglish'
                    ? 'bg-amber-500 text-stone-950 border-amber-400 shadow-sm font-black'
                    : 'bg-stone-900/80 text-stone-400 border-white/10 hover:text-white'
                }`}
              >
                Hinglish
              </button>
              <button
                type="button"
                onClick={() => setPreferredLang('hi')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  preferredLang === 'hi'
                    ? 'bg-amber-500 text-stone-950 border-amber-400 shadow-sm font-black'
                    : 'bg-stone-900/80 text-stone-400 border-white/10 hover:text-white'
                }`}
              >
                हिन्दी
              </button>
              <button
                type="button"
                onClick={() => setPreferredLang('en')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  preferredLang === 'en'
                    ? 'bg-amber-500 text-stone-950 border-amber-400 shadow-sm font-black'
                    : 'bg-stone-900/80 text-stone-400 border-white/10 hover:text-white'
                }`}
              >
                English
              </button>
            </div>
          </div>

          {/* High Contrast Preference */}
          <label className="flex items-center gap-3 p-3 bg-stone-900/80 rounded-xl border border-white/10 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={highContrastPreferred}
              onChange={(e) => setHighContrastPreferred(e.target.checked)}
              className="w-4 h-4 rounded text-amber-500 accent-amber-500 cursor-pointer"
            />
            <div className="text-xs">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-amber-400" />
                {language === 'en' ? 'Enable High Contrast Mode by default' : language === 'hi' ? 'उच्च कंट्रास्ट मोड स्वतः चालू रखें' : 'High Contrast Mode auto enable rakhein'}
              </span>
              <p className="text-stone-400 text-[11px]">
                {language === 'en' ? 'For enhanced visibility and reading clarity' : language === 'hi' ? 'बेहतर दृश्यता और स्पष्ट पढ़ने के लिए' : 'Behtar visibility aur padhne ke liye'}
              </p>
            </div>
          </label>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full min-h-[48px] bg-gradient-to-r from-amber-500 to-rose-500 hover:opacity-95 text-stone-950 font-black text-sm rounded-xl flex items-center justify-center gap-2 shadow-glow-amber focus:ring-4 focus:ring-amber-400 active:scale-95 transition-all cursor-pointer mt-2"
          >
            <UserPlus className="w-4 h-4" />
            <span>{isSubmitting ? (language === 'en' ? 'Creating account...' : language === 'hi' ? 'खाता बनाया जा रहा है...' : 'Account ban raha hai...') : (language === 'en' ? 'Create Account' : language === 'hi' ? 'खाता बनाएं' : 'Create Account')}</span>
          </button>
        </form>

        <p className="text-center text-xs text-stone-400 pt-3 border-t border-white/10">
          {language === 'en' ? 'Already have an account? ' : language === 'hi' ? 'पहले से खाता है? ' : 'Pehle se account hai? '}
          <Link to="/login" className="text-amber-400 font-bold hover:underline inline-flex items-center gap-1">
            <span>{language === 'en' ? 'Sign In Here' : language === 'hi' ? 'यहाँ लॉगिन करें' : 'Yahan Sign In Karein'}</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </p>

      </div>
    </div>
  );
}
