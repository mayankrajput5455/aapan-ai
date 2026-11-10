import React, { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useVoice } from '../context/VoiceContext';
import SoundwaveVisualizer from '../components/SoundwaveVisualizer';
import {
  Volume2,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Music,
  Disc3,
  Database,
  Languages,
  Play,
  Zap,
  Youtube,
  Radio,
  Flame,
  Layers,
  Heart
} from 'lucide-react';

const MUSIC_POSTER_CATALOG = [
  {
    id: 'kesariya',
    title: 'Kesariya (केसरिया)',
    movie: 'Brahmāstra',
    artist: 'Arijit Singh, Pritam',
    posterUrl: '/posters/kesariya.svg',
    genre: 'Romantic',
    tag: 'Trending #1 • Soulful Indic',
    gradient: 'from-amber-500 via-rose-500 to-red-600',
    lyricsHindi: 'केसरिया तेरा इश्क़ है पिया, रंग जाऊं जो मैं हाथ लगाऊं...',
    lyricsRoman: 'Kesariya tera ishq hai piya, rang jaaun jo main hath lagaun...',
    lyricsMeaning: '"Your love is saffron-hued, my beloved; touching it colors my entire soul."',
    time: '00:26.5'
  },
  {
    id: 'samjhawan',
    title: 'Main Tenu Samjhawan Ki',
    movie: 'Humpty Sharma Ki Dulhania',
    artist: 'Arijit Singh & Shreya Ghoshal',
    posterUrl: '/posters/samjhawan.svg',
    genre: 'Punjabi',
    tag: 'Punjabi Romantic Classic',
    gradient: 'from-purple-600 via-pink-600 to-rose-500',
    lyricsHindi: 'मैं तैनूं समझावां की, ना तेरे बाझों लगदा जी...',
    lyricsRoman: 'Main tainu samjhawan ki, na tere baajhon lagda jee...',
    lyricsMeaning: '"How can I express and make you understand? Without you, my heart finds no peace."',
    time: '00:14.2'
  },
  {
    id: 'chaleya',
    title: 'Chaleya (छलेया)',
    movie: 'Jawan',
    artist: 'Arijit Singh, Shilpa Rao, Anirudh',
    posterUrl: '/posters/chaleya.svg',
    genre: 'Bollywood',
    tag: 'Blockbuster Dance Anthem',
    gradient: 'from-blue-600 via-indigo-600 to-violet-500',
    lyricsHindi: 'इश्क में दिल बना है, इश्क में दिल फना है... मन मस्त मगन छलेया!',
    lyricsRoman: 'Ishq me dil bana hai, ishq me dil fana hai... Mann mast magan chaleya!',
    lyricsMeaning: '"In love the heart is forged, in love the heart surrenders... wherever I look, only you appear!"',
    time: '00:32.0'
  },
  {
    id: 'apna-bana-le',
    title: 'Apna Bana Le (अपना बना ले)',
    movie: 'Bhediya',
    artist: 'Arijit Singh, Sachin-Jigar',
    posterUrl: '/posters/apna-bana-le.svg',
    genre: 'Romantic',
    tag: 'Acoustic Love Ballad',
    gradient: 'from-emerald-600 via-teal-600 to-cyan-500',
    lyricsHindi: 'तू मेरा कोई ना हो के भी कुछ लागे... अपना बना ले पिया!',
    lyricsRoman: 'Tu mera koi na hoke bhi kuch laage... Apna bana le piya!',
    lyricsMeaning: '"Though you hold no formal claim on me, my heart belongs entirely to you."',
    time: '00:45.0'
  },
  {
    id: 'kabira',
    title: 'Kabira (कबीरा)',
    movie: 'Yeh Jawaani Hai Deewani',
    artist: 'Tochi Raina, Rekha Bhardwaj, Pritam',
    posterUrl: '/posters/kabira.svg',
    genre: 'Classics',
    tag: 'Soulful Sufi Classic',
    gradient: 'from-amber-600 via-orange-600 to-yellow-500',
    lyricsHindi: 'कैसी तेरी खुदगर्ज़ी, ना धूप चुने ना छांव... रे कबीरा मान जा!',
    lyricsRoman: 'Kaisi teri khudgarzi, na dhoop chune na chhaanv... Re Kabira maan jaa!',
    lyricsMeaning: '"What stubborn wandering is this, choosing neither sun nor shade? Listen, free-spirited wanderer!"',
    time: '01:05.4'
  },
  {
    id: 'raataan-lambiyan',
    title: 'Raataan Lambiyan (रातां लंबियां)',
    movie: 'Shershaah',
    artist: 'Jubin Nautiyal, Asees Kaur, Tanishk Bagchi',
    posterUrl: '/posters/raataan-lambiyan.svg',
    genre: 'Punjabi',
    tag: 'Heartwarming Punjabi Duet',
    gradient: 'from-rose-600 via-pink-600 to-fuchsia-500',
    lyricsHindi: 'काटे तेरे बाझों सांवरे, कटे ना कतईयां... रातां लंबियां लंबियां रे!',
    lyricsRoman: 'Kaate tere baajhon saawre, kate na kataiyan... Raataan lambiyan lambiyan re!',
    lyricsMeaning: '"Without you by my side, these endless nights refuse to pass."',
    time: '00:38.2'
  },
  {
    id: 'tum-hi-ho',
    title: 'Tum Hi Ho (तुम ही हो)',
    movie: 'Aashiqui 2',
    artist: 'Arijit Singh, Mithoon',
    posterUrl: '/posters/tum-hi-ho.svg',
    genre: 'Classics',
    tag: 'All-Time Love Anthem',
    gradient: 'from-blue-700 via-cyan-600 to-sky-500',
    lyricsHindi: 'क्योंकि तुम ही हो, अब तुम ही हो... जिंदगी अब तुम ही हो!',
    lyricsRoman: 'Kyunki tum hi ho, ab tum hi ho... Zindagi ab tum hi ho!',
    lyricsMeaning: '"Because you alone are my love, my solace, my very life."',
    time: '00:52.0'
  },
  {
    id: 'jai-ho',
    title: 'Jai Ho (जय हो)',
    movie: 'Slumdog Millionaire',
    artist: 'A.R. Rahman, Sukhwinder Singh',
    posterUrl: '/posters/jai-ho.svg',
    genre: 'Bollywood',
    tag: 'Oscar-Winning Indic Energy',
    gradient: 'from-emerald-600 via-amber-500 to-yellow-400',
    lyricsHindi: 'जय हो! जय हो! आजा आजा जिंद शामियाने के तले...',
    lyricsRoman: 'Jai Ho! Jai Ho! Aaja aaja jind shaamiyane ke tale...',
    lyricsMeaning: '"Victory to you! Come join under the radiant canopy of life and celebrate!"',
    time: '00:28.0'
  }
];

export default function LandingPage() {
  const { language, speakText, t } = useVoice();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // If user is already logged in, redirect directly to dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  // Selected script view in hero card: 'hi' | 'roman' | 'meaning'
  const [scriptMode, setScriptMode] = useState('hi');
  const [selectedHeroIndex, setSelectedHeroIndex] = useState(0);
  const [selectedGenre, setSelectedGenre] = useState('All');

  const activeTrack = MUSIC_POSTER_CATALOG[selectedHeroIndex] || MUSIC_POSTER_CATALOG[0];

  const filteredPosters = selectedGenre === 'All'
    ? MUSIC_POSTER_CATALOG
    : MUSIC_POSTER_CATALOG.filter((p) => p.genre === selectedGenre);

  const handleProtectedClick = (e, path, songObj = null) => {
    if (!isAuthenticated) {
      e.preventDefault();
      const loginMsg = language === 'hi'
        ? 'कृपया संगीत स्टूडियो का उपयोग करने के लिए पहले लॉगिन करें।'
        : language === 'en'
        ? 'Please login first to access the Karaoke Studio and your music vault.'
        : 'Kripya Karaoke Studio dekhne ke liye pehle login karein.';
      speakText(loginMsg, language);
      navigate('/login', {
        state: {
          from: path,
          message: loginMsg
        }
      });
    } else if (songObj) {
      e.preventDefault();
      navigate('/lyrics', { state: { selectedSong: songObj } });
    }
  };

  const playLandingIntro = () => {
    const introText = language === 'hi'
      ? "नमस्ते! आपण एआई में आपका स्वागत है। यह भारत का सबसे शक्तिशाली इंडिक म्यूजिक टू लिरिक्स और कराओके प्लेटफॉर्म है जो आधिकारिक Gnani.ai द्वारा संचालित है। आप किसी भी गाने या यूट्यूब वीडियो के वास्तविक समय के बोल हिन्दी देवनागरी, रोमन इंग्लिश व काव्यात्मक अंग्रेजी भावार्थ के साथ पा सकते हैं और कराओके का आनंद ले सकते हैं।"
      : language === 'en'
      ? "Welcome to Aapan AI, India's premier voice-first Indic Music to Lyrics platform powered by official Gnani.ai APIs. Extract real-time synchronized song lyrics and sing along in multi-script karaoke with Hindi Devanagari, phonetic English Roman, and poetic English meanings."
      : "Namaste! Aapan AI me aapka swagat hai. Yeh Bharat ka sabse powerful Indic Music to Lyrics aur Karaoke platform hai jo official Gnani.ai se powered hai. Kisi bhi gaane ya YouTube video se synchronized lyrics Hindi, Roman English aur English meaning ke saath paayein.";
    speakText(introText, language);
  };

  return (
    <div className="relative isolate min-h-screen text-white">
      <div className="relative z-10 space-y-16 sm:space-y-24 py-4 sm:py-6">
        
        {/* SIGNATURE ROUNDED GLASS HERO FRAME */}
        <div className="max-w-[1400px] mx-auto px-3 sm:px-6 lg:px-8">
          <div className="relative rounded-[2.5rem] sm:rounded-[3rem] border border-white/20 bg-black/40 backdrop-blur-md p-6 sm:p-10 lg:p-14 shadow-[0_25px_80px_-15px_rgba(0,0,0,0.9)] overflow-hidden">
            
            {/* Ambient Concert Light Glows */}
            <div className="absolute top-1/4 -left-20 w-80 h-80 bg-rose-500/20 blur-[130px] rounded-full pointer-events-none"></div>
            <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-amber-500/20 blur-[150px] rounded-full pointer-events-none"></div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center min-h-[580px]">
              
              {/* Left Column: Atmospheric Typography, Subtext & Vertical Features */}
              <div className="lg:col-span-6 flex flex-col justify-start space-y-7 sm:space-y-8 z-10 py-3 sm:py-6">
                

                {/* Headline & Subtext */}
                <div>
                  <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-[3.5rem] xl:text-[4rem] font-headline font-semibold text-white leading-[1.15] tracking-[-0.03em] drop-shadow-[0_4px_24px_rgba(0,0,0,0.9)]">
                    {language === 'hi' ? (
                      <>
                        गीतों के बोल व<br />
                        लाइव कैरोके,<br />
                        <span className="font-bold bg-gradient-to-r from-amber-300 via-rose-300 to-purple-300 bg-clip-text text-transparent">
                          आपकी भाषा में
                        </span>
                      </>
                    ) : language === 'en' ? (
                      <>
                        Song Lyrics &<br />
                        Live Karaoke,<br />
                        <span className="font-bold bg-gradient-to-r from-amber-300 via-rose-300 to-purple-300 bg-clip-text text-transparent">
                          In Your Tongue
                        </span>
                      </>
                    ) : (
                      <>
                        Song Lyrics Aur<br />
                        Live Karaoke,<br />
                        <span className="font-bold bg-gradient-to-r from-amber-300 via-rose-300 to-purple-300 bg-clip-text text-transparent">
                          Aapki Bhasha Me
                        </span>
                      </>
                    )}
                  </h1>

                  <p className="mt-5 sm:mt-6 text-sm sm:text-base text-white/85 leading-relaxed font-normal max-w-lg drop-shadow-md">
                    {language === 'hi'
                      ? 'भारत का सबसे सशक्त इंडिक म्यूजिक टू लिरिक्स एआई प्लेटफॉर्म। यूट्यूब लिंक या किसी भी ऑडियो से वास्तविक समय में सिंक्रोनाइज़्ड बोल निकालें — हिन्दी देवनागरी, रोमन इंग्लिश और काव्यात्मक अंग्रेजी भावार्थ के साथ।'
                      : language === 'en'
                      ? "India's premier voice-first Indic AI platform. Extract real-time synchronized song lyrics and multi-script karaoke from any YouTube video or audio track."
                      : 'Bharat ka sabse powerful Indic Music to Lyrics AI platform. Kisi bhi YouTube link ya audio se real-time synchronized song lyrics aur multi-script karaoke paayein.'}
                  </p>
                </div>

                {/* Features Vertical Listing */}
                <div className="space-y-4 pt-1">
                  <div className="flex flex-col gap-3 sm:gap-3.5 w-full max-w-sm sm:max-w-md">
                    <button
                      onClick={playLandingIntro}
                      aria-label={t('hero.listenIntro')}
                      className="w-full min-h-[48px] px-5 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white font-medium text-xs sm:text-sm flex items-center justify-between border border-white/20 backdrop-blur-md transition-all active:scale-[0.98] cursor-pointer shadow-sm group"
                    >
                      <div className="flex items-center gap-3">
                        <Volume2 className="w-4 h-4 text-amber-300 stroke-[2.2]" />
                        <span>{t('hero.listenIntro') || 'Listen to Audio Tour'}</span>
                      </div>
                      <span className="text-xs text-amber-300 font-bold group-hover:translate-x-0.5 transition-transform">Play ▶</span>
                    </button>

                    <Link
                      to="/lyrics"
                      onClick={(e) => handleProtectedClick(e, '/lyrics')}
                      className="w-full min-h-[48px] px-5 py-3 rounded-full bg-gradient-to-r from-rose-500 to-amber-500 hover:opacity-95 text-stone-950 font-bold text-xs sm:text-sm flex items-center justify-between shadow-glow-amber transition-all active:scale-[0.98] group"
                    >
                      <div className="flex items-center gap-3">
                        <Music className="w-4 h-4 text-stone-950 stroke-[2.5]" />
                        <span>{t('hero.tryLyrics') || 'Music to Lyrics Studio 🎵'}</span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-stone-950 group-hover:translate-x-1 transition-transform" />
                    </Link>

                    <Link
                      to="/dashboard"
                      onClick={(e) => handleProtectedClick(e, '/dashboard')}
                      className="w-full min-h-[48px] px-5 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white/90 font-medium text-xs sm:text-sm flex items-center justify-between border border-white/20 backdrop-blur-md transition-all active:scale-[0.98] shadow-sm group"
                    >
                      <div className="flex items-center gap-3">
                        <Database className="w-4 h-4 text-cyan-300" />
                        <span>{language === 'hi' ? 'सहेजे गए गाने व म्यूजिक वॉल्ट' : 'My Saved Songs & Vault'}</span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-white/70 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>

                  {/* Trust Rating */}
                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <div className="inline-flex items-center gap-2 bg-black/50 border border-white/15 px-4 py-2 rounded-full backdrop-blur-md shadow-sm">
                      <span className="text-amber-400 text-sm">★</span>
                      <span className="font-bold text-white text-sm">4.9</span>
                      <span className="text-white/70 text-xs">
                        {language === 'hi' ? '2,400+ संगीत प्रेमियों द्वारा अनुशंसित' : language === 'hinglish' ? '2,400+ music lovers dwara trusted' : 'from 2,400+ music lovers'}
                      </span>
                    </div>
                  </div>

                </div>

              </div>

              {/* Right Column: REAL MUSIC POSTER WITH COLLAGE TEMPLATE */}
              <div className="lg:col-span-6 flex justify-center lg:justify-end z-10 w-full">
                
                {/* Collage Container Frame */}
                <div className="relative w-full max-w-md lg:max-w-lg">
                  
                  {/* Layer 1: Left Background Tilted Poster (Chaleya) */}
                  <div
                    onClick={() => setSelectedHeroIndex(2)}
                    className="absolute -top-4 -left-3 sm:-left-6 w-44 sm:w-52 aspect-[3/4] rounded-2xl overflow-hidden border border-white/20 shadow-2xl -rotate-6 transition-all duration-300 hover:rotate-0 hover:z-30 hover:scale-105 cursor-pointer opacity-75 hover:opacity-100 group"
                  >
                    <img
                      src={MUSIC_POSTER_CATALOG[2].posterUrl}
                      alt={MUSIC_POSTER_CATALOG[2].title}
                      onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/posters/chaleya.svg'; }}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>
                    <div className="absolute bottom-3 left-3 right-3 text-left">
                      <span className="text-[10px] font-bold text-cyan-300 uppercase block">Jawan</span>
                      <h5 className="text-xs font-black text-white truncate">Chaleya</h5>
                    </div>
                  </div>

                  {/* Layer 2: Right Background Tilted Poster (Samjhawan) */}
                  <div
                    onClick={() => setSelectedHeroIndex(1)}
                    className="absolute -top-2 -right-3 sm:-right-6 w-44 sm:w-52 aspect-[3/4] rounded-2xl overflow-hidden border border-white/20 shadow-2xl rotate-6 transition-all duration-300 hover:rotate-0 hover:z-30 hover:scale-105 cursor-pointer opacity-75 hover:opacity-100 group"
                  >
                    <img
                      src={MUSIC_POSTER_CATALOG[1].posterUrl}
                      alt={MUSIC_POSTER_CATALOG[1].title}
                      onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/posters/samjhawan.svg'; }}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>
                    <div className="absolute bottom-3 left-3 right-3 text-left">
                      <span className="text-[10px] font-bold text-rose-300 uppercase block">Humpty Sharma</span>
                      <h5 className="text-xs font-black text-white truncate">Samjhawan</h5>
                    </div>
                  </div>

                  {/* Layer 3: Main Active Front Hero Poster Card with Vinyl Peek */}
                  <div className="relative z-20 mx-auto w-full max-w-sm sm:max-w-md rounded-3xl p-5 sm:p-6 bg-black/75 backdrop-blur-2xl border border-white/25 shadow-[0_20px_60px_rgba(0,0,0,0.95)] space-y-4">
                    
                    {/* Poster + Spinning Vinyl Header */}
                    <div className="relative flex items-center justify-between overflow-hidden rounded-2xl p-3 bg-gradient-to-r from-stone-900 to-black border border-white/15">
                      
                      {/* Active Poster Artwork */}
                      <div className="relative z-10 w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden shadow-xl shrink-0 border border-white/20 group">
                        <img
                          src={activeTrack.posterUrl}
                          alt={activeTrack.title}
                          onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = `/posters/${activeTrack.id}.svg`; }}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-[9px] font-bold text-amber-300 border border-white/20">
                          NOW
                        </div>
                      </div>

                      {/* Vinyl Record Peeking Out Behind */}
                      <div className="absolute left-20 sm:left-24 top-1/2 -translate-y-1/2 w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-stone-950 border-4 border-stone-850 shadow-2xl flex items-center justify-center animate-[spin_10s_linear_infinite] pointer-events-none">
                        <div className="w-10 h-10 rounded-full bg-amber-500/80 border-2 border-stone-900 flex items-center justify-center">
                          <Disc3 className="w-5 h-5 text-stone-950 animate-spin" />
                        </div>
                      </div>

                      {/* Track Details */}
                      <div className="relative z-10 pl-6 sm:pl-8 text-right flex-1 space-y-1">
                        <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-bold uppercase tracking-wider inline-block">
                          {activeTrack.movie}
                        </span>
                        <h4 className="font-headline font-black text-white text-base sm:text-lg leading-tight line-clamp-1">
                          {activeTrack.title}
                        </h4>
                        <p className="text-xs text-stone-400 line-clamp-1">
                          {activeTrack.artist}
                        </p>
                        <div className="flex items-center justify-end gap-1.5 pt-1 text-[10px] text-emerald-400 font-bold">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                          <span>Lyrics Synced</span>
                        </div>
                      </div>

                    </div>

                    {/* Quick Collage Mini Track Selectors */}
                    <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 text-xs font-bold scrollbar-none">
                      {MUSIC_POSTER_CATALOG.slice(0, 4).map((track, idx) => (
                        <button
                          key={track.id}
                          onClick={() => setSelectedHeroIndex(idx)}
                          className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer truncate shrink-0 ${
                            selectedHeroIndex === idx
                              ? 'bg-amber-400 text-stone-950 shadow-md font-black'
                              : 'bg-white/10 hover:bg-white/15 text-stone-300'
                          }`}
                        >
                          {track.movie}
                        </button>
                      ))}
                    </div>

                    {/* 3-Script Mode Pill Switcher */}
                    <div className="grid grid-cols-3 p-1 rounded-xl bg-black/60 border border-white/15 text-[11px] font-bold text-center">
                      <button
                        onClick={() => setScriptMode('hi')}
                        className={`py-1.5 rounded-lg transition-all cursor-pointer ${
                          scriptMode === 'hi' ? 'bg-amber-500 text-stone-950 font-black' : 'text-stone-300 hover:text-white'
                        }`}
                      >
                        देवनागरी
                      </button>
                      <button
                        onClick={() => setScriptMode('roman')}
                        className={`py-1.5 rounded-lg transition-all cursor-pointer ${
                          scriptMode === 'roman' ? 'bg-amber-500 text-stone-950 font-black' : 'text-stone-300 hover:text-white'
                        }`}
                      >
                        Roman English
                      </button>
                      <button
                        onClick={() => setScriptMode('meaning')}
                        className={`py-1.5 rounded-lg transition-all cursor-pointer ${
                          scriptMode === 'meaning' ? 'bg-amber-500 text-stone-950 font-black' : 'text-stone-300 hover:text-white'
                        }`}
                      >
                        English Meaning
                      </button>
                    </div>

                    {/* Dynamic Lyrics Preview Box */}
                    <div className="bg-amber-500/15 border-l-4 border-amber-400 p-4 rounded-r-2xl space-y-1.5 transition-all">
                      <p className="text-[10px] text-amber-300 font-bold uppercase tracking-wider flex items-center justify-between">
                        <span>
                          {scriptMode === 'hi'
                            ? 'हिन्दी देवनागरी'
                            : scriptMode === 'roman'
                            ? 'Phonetic Roman English'
                            : 'Strictly English Meaning'}
                        </span>
                        <span className="font-mono text-white/50">{activeTrack.time}</span>
                      </p>
                      <p className="text-sm font-bold text-white leading-relaxed">
                        {scriptMode === 'hi'
                          ? activeTrack.lyricsHindi
                          : scriptMode === 'roman'
                          ? activeTrack.lyricsRoman
                          : activeTrack.lyricsMeaning}
                      </p>
                    </div>

                    {/* Soundwave Visualizer */}
                    <div className="py-1 flex items-center justify-between border-t border-white/10 pt-3">
                      <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                        Gnani Prisma ASR Synced
                      </span>
                      <SoundwaveVisualizer isPlaying={true} color="amber" barCount={18} />
                    </div>

                    {/* Big White CTA Button to Launch Karaoke Studio */}
                    <button
                      onClick={(e) => handleProtectedClick(e, '/lyrics', activeTrack)}
                      className="w-full py-3.5 rounded-full bg-white hover:bg-stone-200 text-stone-950 font-black text-sm tracking-wide shadow-xl text-center block transition-all active:scale-95 cursor-pointer mt-2"
                    >
                      Open in Karaoke Studio 🎵
                    </button>

                  </div>

                </div>

              </div>

            </div>
          </div>
        </div>

        {/* 2. REAL MUSIC POSTER COLLAGE GALLERY TEMPLATE */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6">
          
          {/* Section Header */}
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 mb-10">
            <div className="space-y-2">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider bg-black/40 border border-white/15 px-3 py-1 rounded-full backdrop-blur-md">
                Indic Music Showcase • पोस्टर कोलाज
              </span>
              <h2 className="text-2xl sm:text-4xl font-headline font-black text-white drop-shadow-md">
                {language === 'hi' ? 'प्रमुख संगीत पोस्टर कोलाज' : 'Featured Music Poster Collage'}
              </h2>
              <p className="text-xs sm:text-sm text-stone-300 max-w-xl">
                {language === 'hi'
                  ? 'किसी भी संगीत पोस्टर पर क्लिक करें और सीधे 3-स्क्रिप्ट कैरोके लिरिक्स के साथ गाना शुरू करें।'
                  : 'Tap any music poster to launch synchronized karaoke with Hindi Devanagari, Roman English & poetic meanings.'}
              </p>
            </div>

            {/* Genre Filter Pills */}
            <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-black/60 border border-white/15 text-xs font-bold">
              {['All', 'Romantic', 'Bollywood', 'Punjabi', 'Classics'].map((genre) => (
                <button
                  key={genre}
                  onClick={() => setSelectedGenre(genre)}
                  className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                    selectedGenre === genre
                      ? 'bg-amber-400 text-stone-950 font-black shadow'
                      : 'text-stone-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {genre}
                </button>
              ))}
            </div>
          </div>

          {/* Collage Grid of 8 High-Impact Posters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredPosters.map((poster) => (
              <div
                key={poster.id}
                onClick={(e) => handleProtectedClick(e, '/lyrics', poster)}
                className="group relative rounded-3xl overflow-hidden border border-white/15 bg-black/55 backdrop-blur-md shadow-2xl hover:border-amber-400/60 hover:shadow-[0_20px_50px_rgba(245,158,11,0.25)] transition-all duration-300 cursor-pointer flex flex-col justify-between"
              >
                {/* Poster Image Container */}
                <div className="relative aspect-[4/5] w-full overflow-hidden bg-stone-950">
                  <img
                    src={poster.posterUrl}
                    alt={poster.title}
                    onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = `/posters/${poster.id}.svg`; }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md text-[10px] font-bold text-amber-300 border border-white/15 uppercase tracking-wider">
                      {poster.movie}
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-rose-500/80 backdrop-blur-md text-[10px] font-black text-white shadow-md">
                      4K HDR
                    </span>
                  </div>

                  {/* Play Button Overlay on Hover */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-[2px]">
                    <div className="w-14 h-14 rounded-full bg-white text-stone-950 flex items-center justify-center shadow-2xl scale-75 group-hover:scale-100 transition-transform">
                      <Play className="w-6 h-6 fill-current ml-0.5" />
                    </div>
                  </div>

                  {/* Bottom Info on Poster */}
                  <div className="absolute bottom-3 left-3 right-3 space-y-1">
                    <span className="text-[11px] font-semibold text-rose-300 block">
                      {poster.tag}
                    </span>
                    <h3 className="text-base font-headline font-black text-white group-hover:text-amber-300 transition-colors line-clamp-1">
                      {poster.title}
                    </h3>
                    <p className="text-xs text-white/70 line-clamp-1">
                      {poster.artist}
                    </p>
                  </div>
                </div>

                {/* Card Footer: Script Badges + Action */}
                <div className="p-4 bg-stone-900/90 border-t border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[10px] text-stone-300">
                    <span className="px-2 py-0.5 rounded bg-white/10 font-bold">हिन्दी</span>
                    <span className="px-2 py-0.5 rounded bg-white/10 font-bold">EN</span>
                    <span className="text-emerald-400 font-bold">● Synced</span>
                  </div>

                  <span className="text-xs font-bold text-amber-400 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                    Sing ▶
                  </span>
                </div>
              </div>
            ))}
          </div>

        </section>

        {/* 3. DUAL AI SUPERPOWERS (FEATURES GRID IN TRANSPARENT GLASS) */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-14">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider bg-black/40 border border-white/15 px-3 py-1 rounded-full backdrop-blur-md">
              {t('features.badge')}
            </span>
            <h2 className="text-2xl sm:text-4xl font-headline font-black text-white drop-shadow-md">
              {t('features.title')}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Feature 1: Music to Lyrics Studio */}
            <div className="glass-panel rounded-3xl p-6 space-y-4 hover:border-rose-400/50 transition-all group flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 to-amber-500 text-stone-950 font-black flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                  <Music className="w-6 h-6 text-stone-950 stroke-[2.5]" />
                </div>
                <h3 className="text-lg font-bold text-white group-hover:text-amber-300 transition-colors">
                  {t('features.feat1Title')}
                </h3>
                <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
                  {t('features.feat1Desc')}
                </p>
              </div>
              <Link
                to="/lyrics"
                onClick={(e) => handleProtectedClick(e, '/lyrics')}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-300 hover:text-white pt-2"
              >
                <span>Explore Karaoke Studio</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Feature 2: Direct YouTube Video Sync */}
            <div className="glass-panel rounded-3xl p-6 space-y-4 hover:border-red-400/50 transition-all group flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 text-white font-black flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                  <Youtube className="w-6 h-6 text-white stroke-[2.5]" />
                </div>
                <h3 className="text-lg font-bold text-white group-hover:text-rose-300 transition-colors">
                  {t('features.feat2Title')}
                </h3>
                <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
                  {t('features.feat2Desc')}
                </p>
              </div>
              <Link
                to="/lyrics"
                onClick={(e) => handleProtectedClick(e, '/lyrics')}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-300 hover:text-white pt-2"
              >
                <span>Paste YouTube Link</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Feature 3: Personal Music Cloud Vault */}
            <div className="glass-panel rounded-3xl p-6 space-y-4 hover:border-emerald-400/50 transition-all group flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 text-stone-950 font-black flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                  <Database className="w-6 h-6 text-stone-950 stroke-[2.5]" />
                </div>
                <h3 className="text-lg font-bold text-white group-hover:text-emerald-300 transition-colors">
                  {t('features.feat3Title')}
                </h3>
                <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
                  {t('features.feat3Desc')}
                </p>
              </div>
              <Link
                to="/dashboard"
                onClick={(e) => handleProtectedClick(e, '/dashboard')}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-300 hover:text-white pt-2"
              >
                <span>View Music Vault</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Feature 4: 100% Indic Audio Intelligence */}
            <div className="glass-panel rounded-3xl p-6 space-y-4 hover:border-violet-400/50 transition-all group flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-rose-500 text-white font-black flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Languages className="w-6 h-6 text-white stroke-[2.5]" />
                </div>
                <h3 className="text-lg font-bold text-white group-hover:text-violet-300 transition-colors">
                  {t('features.feat4Title')}
                </h3>
                <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
                  {t('features.feat4Desc')}
                </p>
              </div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-300 pt-2">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Official Gnani API</span>
              </div>
            </div>

          </div>
        </section>

        {/* 4. HOW IT WORKS */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider bg-black/40 border border-white/15 px-3 py-1 rounded-full backdrop-blur-md">
              {t('steps.badge')}
            </span>
            <h2 className="text-2xl sm:text-4xl font-headline font-black text-white drop-shadow-md">
              {t('steps.title')}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass-panel rounded-3xl p-7 space-y-4 relative group">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-sunset text-stone-950 font-black text-lg flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                1
              </div>
              <h3 className="text-lg font-bold text-white">
                {t('steps.step1Title')}
              </h3>
              <p className="text-sm text-white/80 leading-relaxed">
                {t('steps.step1Desc')}
              </p>
            </div>

            <div className="glass-panel rounded-3xl p-7 space-y-4 relative group">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 text-stone-950 font-black text-lg flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                2
              </div>
              <h3 className="text-lg font-bold text-white">
                {t('steps.step2Title')}
              </h3>
              <p className="text-sm text-white/80 leading-relaxed">
                {t('steps.step2Desc')}
              </p>
            </div>

            <div className="glass-panel rounded-3xl p-7 space-y-4 relative group">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 to-amber-500 text-stone-950 font-black text-lg flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                3
              </div>
              <h3 className="text-lg font-bold text-white">
                {t('steps.step3Title')}
              </h3>
              <p className="text-sm text-white/80 leading-relaxed">
                {t('steps.step3Desc')}
              </p>
            </div>
          </div>
        </section>

        {/* 5. ABOUT US */}
        <section id="about" className="max-w-7xl mx-auto px-4 sm:px-6 scroll-mt-20">
          <div className="glass-panel rounded-3xl p-8 sm:p-12 border border-white/15">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              
              <div className="lg:col-span-6 space-y-5">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider bg-black/40 border border-white/15 px-3 py-1 rounded-full backdrop-blur-md">
                  {t('about.badge')}
                </span>
                <h2 className="text-2xl sm:text-4xl font-headline font-black text-white drop-shadow">
                  {t('about.title')}
                </h2>
                <p className="text-sm sm:text-base text-white/85 leading-relaxed">
                  {t('about.desc')}
                </p>
                
                <ul className="space-y-3.5 pt-1 text-sm text-white/90">
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    <span>{t('about.p1')}</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0" />
                    <span>{t('about.p2')}</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-rose-400 shrink-0" />
                    <span>{t('about.p3')}</span>
                  </li>
                </ul>
              </div>

              <div className="lg:col-span-6 grid grid-cols-2 gap-4">
                <div className="bg-black/40 p-6 rounded-2xl space-y-2.5 border border-white/10 backdrop-blur-md">
                  <Music className="w-7 h-7 text-amber-400" />
                  <h4 className="text-base font-bold text-white">{t('about.card1Title')}</h4>
                  <p className="text-xs text-white/75 leading-relaxed">
                    {t('about.card1Desc')}
                  </p>
                </div>

                <div className="bg-black/40 p-6 rounded-2xl space-y-2.5 border border-white/10 backdrop-blur-md">
                  <Languages className="w-7 h-7 text-emerald-400" />
                  <h4 className="text-base font-bold text-white">{t('about.card2Title')}</h4>
                  <p className="text-xs text-white/75 leading-relaxed">
                    {t('about.card2Desc')}
                  </p>
                </div>

                <div className="bg-black/40 p-6 rounded-2xl space-y-2.5 border border-white/10 backdrop-blur-md">
                  <Disc3 className="w-7 h-7 text-rose-400" />
                  <h4 className="text-base font-bold text-white">{t('about.card3Title')}</h4>
                  <p className="text-xs text-white/75 leading-relaxed">
                    {t('about.card3Desc')}
                  </p>
                </div>

                <div className="bg-black/40 p-6 rounded-2xl space-y-2.5 border border-white/10 backdrop-blur-md">
                  <Database className="w-7 h-7 text-cyan-400" />
                  <h4 className="text-base font-bold text-white">{t('about.card4Title')}</h4>
                  <p className="text-xs text-white/75 leading-relaxed">
                    {t('about.card4Desc')}
                  </p>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* 6. CALL TO ACTION (Only shown to guest visitors, hidden when logged in) */}
        {!isAuthenticated && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="glass-panel-elevated rounded-3xl p-8 sm:p-14 text-center space-y-6 shadow-2xl relative overflow-hidden">
              <h2 className="text-2xl sm:text-4xl font-headline font-black text-white drop-shadow">
                {t('cta.title')}
              </h2>
              <p className="text-sm sm:text-base text-white/85 max-w-xl mx-auto font-normal">
                {t('cta.desc')}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
                <Link
                  to="/signup"
                  className="min-h-[50px] px-8 rounded-full bg-white hover:bg-stone-100 text-stone-950 font-black text-sm flex items-center gap-2 shadow-2xl transition-all active:scale-95"
                >
                  {t('cta.signUp')}
                </Link>
                <Link
                  to="/dashboard"
                  onClick={(e) => handleProtectedClick(e, '/dashboard')}
                  className="min-h-[50px] px-8 rounded-full bg-white/15 hover:bg-white/25 text-white font-bold text-sm flex items-center gap-2 border border-white/20 backdrop-blur-md transition-all active:scale-95"
                >
                  {t('cta.dashboard')}
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* 7. CONTACT US */}
        <section id="contact" className="max-w-7xl mx-auto px-4 sm:px-6 py-6 scroll-mt-20">
          <div className="glass-panel rounded-3xl p-8 sm:p-12 border border-white/15 relative overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider bg-black/40 border border-white/15 px-3 py-1 rounded-full backdrop-blur-md">
                  {t('contact.badge')}
                </span>
                <h2 className="text-2xl sm:text-3xl font-headline font-black text-white">
                  {t('contact.title')}
                </h2>
                <p className="text-sm text-white/80 leading-relaxed">
                  {t('contact.desc')}
                </p>
                <div className="space-y-3 text-sm text-white/90 pt-2">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">✉</span>
                    <span>{t('contact.email')}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">📞</span>
                    <span>{t('contact.helpline')}</span>
                  </div>
                </div>
              </div>

              <div className="bg-black/50 p-6 rounded-2xl border border-white/15 space-y-4 backdrop-blur-md">
                <h3 className="text-base font-bold text-white">{t('contact.formTitle')}</h3>
                <input
                  type="text"
                  placeholder={t('contact.namePlaceholder')}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/15 text-sm text-white placeholder-white/50 focus:outline-none focus:border-amber-400"
                />
                <textarea
                  rows="3"
                  placeholder={t('contact.msgPlaceholder')}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/15 text-sm text-white placeholder-white/50 focus:outline-none focus:border-amber-400 resize-none"
                ></textarea>
                <button
                  type="button"
                  onClick={() => alert(language === 'hi' ? 'धन्यवाद! आपका संदेश प्राप्त हो गया है।' : language === 'en' ? 'Thank you! Your message has been received.' : 'Dhanyawad! Aapka message receive ho gaya hai.')}
                  className="w-full py-2.5 rounded-xl bg-white hover:bg-stone-100 text-stone-950 font-bold text-sm transition-all cursor-pointer shadow-md"
                >
                  {t('contact.sendBtn')}
                </button>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
