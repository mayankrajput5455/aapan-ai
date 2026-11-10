import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { translations } from '../utils/translations';
import { hasDevanagari, transliterateDevanagariToHinglish } from '../utils/transliterate';

const VoiceContext = createContext(null);

export const VoiceProvider = ({ children }) => {
  const [language, setLanguageState] = useState(() => localStorage.getItem('aapan_lang') || 'hinglish'); // 'hinglish', 'hi', 'en'
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [fontScale, setFontScale] = useState(1.0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [availableVoices, setAvailableVoices] = useState([]);
  const [isMuted, setIsMuted] = useState(() => localStorage.getItem('aapan_muted') === 'true');

  // Sync mute state across all media and synthesis
  useEffect(() => {
    localStorage.setItem('aapan_muted', isMuted);

    // Mute/unmute all HTML <audio> and <video> elements on the page
    if (typeof document !== 'undefined') {
      document.querySelectorAll('audio, video').forEach((el) => {
        el.muted = isMuted;
      });
    }

    // Stop active speech synthesis and audio if muted
    if (isMuted) {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        try { window.speechSynthesis.cancel(); } catch (e) {}
      }
      if (gnaniAudioRef.current) {
        try { gnaniAudioRef.current.pause(); } catch (e) {}
      }
      setIsSpeaking(false);
    }

    // Notify any components listening for mute change (e.g. YouTube iframe)
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('aapan-mute-change', { detail: { isMuted } }));
    }
  }, [isMuted]);

  const toggleMute = () => {
    setIsMuted((prev) => !prev);
  };

  // Ensure clean transparent atmospheric aesthetic on mount
  useEffect(() => {
    if (typeof document !== 'undefined') {
      localStorage.removeItem('aapan_theme');
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
      document.documentElement.classList.remove('light-theme', 'high-contrast');
      document.body.classList.remove('light-theme', 'high-contrast');
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      const loadVoices = () => {
        try {
          const v = window.speechSynthesis.getVoices();
          if (v && v.length > 0) setAvailableVoices(v);
        } catch (e) {
          // ignore
        }
      };
      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  const setLanguage = (newLang) => {
    setLanguageState(newLang);
    localStorage.setItem('aapan_lang', newLang);
  };

  // Translation function: t('nav.home')
  const t = (path) => {
    const langPack = translations[language] || translations.hinglish;
    const parts = path.split('.');
    let current = langPack;
    for (const part of parts) {
      if (!current || current[part] === undefined) {
        // fallback to hinglish
        let fb = translations.hinglish;
        for (const p of parts) {
          if (!fb || fb[p] === undefined) return path;
          fb = fb[p];
        }
        return fb;
      }
      current = current[part];
    }
    return current;
  };
  
  const recognitionRef = useRef(null);
  const audioCtxRef = useRef(null);
  const gnaniAudioRef = useRef(null);

  // Initialize Web Audio Context
  const getAudioContext = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  };

  const playTone = (freq, type = 'sine', duration = 0.15, gainVal = 0.1) => {
    if (isMuted) return;
    try {
      const ctx = getAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(gainVal, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      // Audio cue fallback
    }
  };

  const playMicChime = () => {
    playTone(440, 'sine', 0.12, 0.15);
    setTimeout(() => playTone(880, 'sine', 0.18, 0.15), 100);
  };

  const playSuccessChime = () => {
    playTone(523.25, 'triangle', 0.1, 0.12);
    setTimeout(() => playTone(659.25, 'triangle', 0.1, 0.12), 100);
    setTimeout(() => playTone(783.99, 'triangle', 0.2, 0.15), 200);
  };

  // Client-side fallback speech synthesis with phonetic transliteration
  const speakClientFallback = (text, customLang, onEnd) => {
    if (isMuted || !window.speechSynthesis || !text) return;
    window.speechSynthesis.cancel();

    const voices = (availableVoices && availableVoices.length > 0)
      ? availableVoices
      : window.speechSynthesis.getVoices();

    const trueHindiVoice = voices.find(v => {
      const lang = (v.lang || '').toLowerCase();
      const name = (v.name || '').toLowerCase();
      const isHindiLang = lang === 'hi-in' || lang === 'hi_in' || lang.startsWith('hi');
      const isHindiName = name.includes('hindi') || name.includes('हिन्दी') || name.includes('kalpana') || name.includes('swara') || name.includes('hemant');
      const isEnglish = name.includes('english') || lang.startsWith('en');
      return (isHindiLang || isHindiName) && !isEnglish;
    });

    const indianEnglishVoice = voices.find(v => {
      const lang = (v.lang || '').toLowerCase();
      const name = (v.name || '').toLowerCase();
      return lang === 'en-in' || name.includes('india') || name.includes('heera') || name.includes('ravi') || name.includes('neerja');
    });

    const defaultVoice = voices.find(v => (v.lang || '').toLowerCase().startsWith('en')) || voices[0];
    const containsDevanagari = hasDevanagari(text);
    let textToSpeak = text;
    let selectedVoice = null;
    let langCode = 'hi-IN';

    if (customLang === 'hi') {
      if (trueHindiVoice) {
        selectedVoice = trueHindiVoice;
        langCode = 'hi-IN';
        textToSpeak = text;
      } else {
        textToSpeak = containsDevanagari ? transliterateDevanagariToHinglish(text) : text;
        selectedVoice = indianEnglishVoice || defaultVoice;
        langCode = 'en-IN';
      }
    } else if (customLang === 'hinglish') {
      textToSpeak = containsDevanagari ? transliterateDevanagariToHinglish(text) : text;
      selectedVoice = trueHindiVoice || indianEnglishVoice || defaultVoice;
      langCode = trueHindiVoice ? 'hi-IN' : 'en-IN';
    } else {
      textToSpeak = containsDevanagari ? transliterateDevanagariToHinglish(text) : text;
      selectedVoice = indianEnglishVoice || defaultVoice;
      langCode = 'en-IN';
    }

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = playbackSpeed;
    utterance.lang = langCode;
    if (selectedVoice) utterance.voice = selectedVoice;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      setIsSpeaking(false);
      if (onEnd) onEnd();
    };
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  // High-Performance Speech Synthesizer (Instant Local Voice & Direct Audio)
  const speakText = async (text, customLang, onEnd, audioBase64) => {
    if (isMuted || !text) return;
    const targetLang = customLang || language;

    if (gnaniAudioRef.current) {
      try { gnaniAudioRef.current.pause(); } catch (e) {}
      gnaniAudioRef.current = null;
    }
    if (window.speechSynthesis) {
      try { window.speechSynthesis.cancel(); } catch (e) {}
    }

    setIsSpeaking(true);

    // If pre-synthesized audio exists (e.g. from Gnani API), play directly!
    if (audioBase64) {
      try {
        const audio = new Audio(audioBase64);
        gnaniAudioRef.current = audio;
        audio.onplay = () => setIsSpeaking(true);
        audio.onended = () => {
          setIsSpeaking(false);
          gnaniAudioRef.current = null;
          if (onEnd) onEnd();
        };
        audio.onerror = () => {
          setIsSpeaking(false);
          gnaniAudioRef.current = null;
          speakClientFallback(text, targetLang, onEnd);
        };
        await audio.play();
        return;
      } catch (audioErr) {
        // Fallback immediately to instant client speech
      }
    }

    // Zero-lag instant client speech synthesis
    speakClientFallback(text, targetLang, onEnd);
  };

  const stopSpeaking = () => {
    if (gnaniAudioRef.current) {
      try { gnaniAudioRef.current.pause(); } catch (e) {}
      gnaniAudioRef.current = null;
    }
    if (window.speechSynthesis) {
      try { window.speechSynthesis.cancel(); } catch (e) {}
    }
    setIsSpeaking(false);
  };

  // Ultra-Responsive Speech-to-Text with Auto-Silence Commit (Zero Mic Lag)
  const startListening = (onFinalResult) => {
    stopSpeaking();
    playMicChime();

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Your browser does not support Speech Recognition. Please use Google Chrome or Microsoft Edge.');
      return;
    }

    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch (e) {}
    }

    const rec = new SpeechRecognition();
    recognitionRef.current = rec;
    rec.continuous = true;
    rec.interimResults = true;

    if (language === 'hi') {
      rec.lang = 'hi-IN';
    } else if (language === 'en') {
      rec.lang = 'en-IN';
    } else {
      rec.lang = 'hi-IN';
    }

    let silenceTimer = null;
    let accumulatedText = '';
    let hasDelivered = false;

    const deliverResult = (text) => {
      if (hasDelivered) return;
      const clean = (text || '').trim();
      if (!clean) return;
      hasDelivered = true;
      if (silenceTimer) clearTimeout(silenceTimer);
      playSuccessChime();
      setIsListening(false);
      try { rec.stop(); } catch (e) {}
      if (onFinalResult) onFinalResult(clean);
    };

    rec.onstart = () => {
      setIsListening(true);
      setTranscript('');
    };

    rec.onresult = (e) => {
      let interim = '';
      let final = '';

      for (let i = 0; i < e.results.length; ++i) {
        const item = e.results[i];
        if (item.isFinal) {
          final += item[0].transcript + ' ';
        } else {
          interim += item[0].transcript;
        }
      }

      const currentLive = (final + interim).trim();
      setTranscript(currentLive);
      accumulatedText = currentLive;

      // Smart silence detector: 850ms of quiet after speaking auto-commits question immediately!
      if (silenceTimer) clearTimeout(silenceTimer);
      if (currentLive.length > 2) {
        silenceTimer = setTimeout(() => {
          deliverResult(accumulatedText);
        }, 850);
      }
    };

    rec.onerror = (err) => {
      if (silenceTimer) clearTimeout(silenceTimer);
      setIsListening(false);
      if (accumulatedText && !hasDelivered) {
        deliverResult(accumulatedText);
      }
    };

    rec.onend = () => {
      if (silenceTimer) clearTimeout(silenceTimer);
      setIsListening(false);
      if (accumulatedText && !hasDelivered) {
        deliverResult(accumulatedText);
      }
    };

    try {
      rec.start();
    } catch (e) {
      console.warn('Speech rec error:', e);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
    }
    setIsListening(false);
  };

  const cycleFontScale = () => {
    const scales = [0.9, 1.0, 1.15, 1.25];
    const nextIdx = (scales.indexOf(fontScale) + 1) % scales.length;
    const nextScale = scales[nextIdx];
    setFontScale(nextScale);
    document.documentElement.style.setProperty('--font-scale', nextScale);
    playSuccessChime();
    speakText(`फॉन्ट साइज सेट: ${nextScale}x`, language);
  };

  const toggleHighContrast = () => {};
  const highContrast = false;

  const triggerAudioGuide = () => {
    if (isMuted) return;
    playMicChime();
    const guide = language === 'hi'
      ? 'नमस्ते! आपण एआई में आपका स्वागत है। किसी भी गाने के वास्तविक समय के बोल देखने के लिए म्यूजिक टू लिरिक्स में जाएं। सवाल पूछने के लिए स्पेसबार दबाएं या माइक पर टैप करें।'
      : language === 'en'
      ? 'Welcome to Aapan AI. Extract real-time song lyrics and sing karaoke. To ask questions, press the spacebar or tap the microphone.'
      : 'Namaste! Aapan AI me aapka swagat hai. Kisi bhi gaane ke real-time lyrics paane ke liye Music Studio me jaayein. Sawaal puchne ke liye spacebar dabayein ya mic par tap karein.';
    speakText(guide, language);
  };

  return (
    <VoiceContext.Provider value={{
      language,
      setLanguage,
      t,
      isMuted,
      toggleMute,
      setIsMuted,
      isListening,
      isSpeaking,
      transcript,
      fontScale,
      highContrast,
      playbackSpeed,
      setPlaybackSpeed,
      speakText,
      stopSpeaking,
      startListening,
      stopListening,
      cycleFontScale,
      toggleHighContrast,
      triggerAudioGuide,
      playSuccessChime
    }}>
      {children}
    </VoiceContext.Provider>
  );
};

export const useVoice = () => useContext(VoiceContext);
