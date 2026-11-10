import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useVoice } from '../context/VoiceContext';
import { api, API_BASE } from '../services/api';
import { sampleSongs } from '../utils/sampleSongs';
import {
  Music,
  Trash2,
  Play,
  Disc3,
  Clock,
  Sparkles,
  Youtube,
  Plus,
  ArrowRight,
  ShieldCheck,
  Languages,
  CheckCircle2,
  X
} from 'lucide-react';

export default function DashboardPage() {
  const { user, token } = useAuth();
  const { speakText, language } = useVoice();
  const navigate = useNavigate();

  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Upload Music Modal State
  const [showUploadMusicModal, setShowUploadMusicModal] = useState(false);
  const [musicMode, setMusicMode] = useState('youtube'); // 'youtube' | 'file' | 'text'
  const [musicYoutubeUrl, setMusicYoutubeUrl] = useState('');
  const [musicTitle, setMusicTitle] = useState('');
  const [musicFile, setMusicFile] = useState(null);
  const [musicPastedLyrics, setMusicPastedLyrics] = useState('');
  const [musicIsProcessing, setMusicIsProcessing] = useState(false);
  const [musicProcessingStatus, setMusicProcessingStatus] = useState('');

  useEffect(() => {
    loadAllUserData();
  }, [token]);

  const loadAllUserData = async () => {
    setLoading(true);
    try {
      const activeToken = token || localStorage.getItem('aapan_token');
      if (activeToken) {
        const songsRes = await api.getMySongs(activeToken);
        if (songsRes?.songs && songsRes.songs.length > 0) {
          setSongs(songsRes.songs);
        }
      }
    } catch (e) {
      console.warn('Load dashboard songs error:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleMusicUploadSubmit = async (e) => {
    e.preventDefault();
    const activeToken = token || localStorage.getItem('aapan_token');

    // YouTube Mode
    if (musicMode === 'youtube') {
      if (!musicYoutubeUrl.trim()) {
        alert(language === 'hi' ? 'कृपया YouTube वीडियो लिंक दर्ज करें' : 'Please enter a YouTube video URL');
        return;
      }
      setMusicIsProcessing(true);
      setMusicProcessingStatus('यूट्यूब वीडियो से बोल निकाले जा रहे हैं...');
      try {
        const res = await api.extractLyricsFromYouTube({
          youtubeUrl: musicYoutubeUrl,
          title: musicTitle
        }, activeToken);
        if (res.success && res.extractedSong) {
          setSongs((prev) => [res.extractedSong, ...prev.filter((s) => (s._id || s.id) !== (res.extractedSong._id || res.extractedSong.id))]);
          setShowUploadMusicModal(false);
          setMusicYoutubeUrl('');
          setMusicTitle('');
          speakText('यूट्यूब गीत सफलतापूर्वक सहेजा गया।', language);
          navigate('/lyrics', { state: { selectedSong: res.extractedSong } });
        }
      } catch (err) {
        alert('यूट्यूब लिंक प्रोसेस करने में त्रुटि: ' + err.message);
      } finally {
        setMusicIsProcessing(false);
        setMusicProcessingStatus('');
      }
      return;
    }

    if (!musicFile && !musicPastedLyrics.trim()) return;

    setMusicIsProcessing(true);
    setMusicProcessingStatus('ऑडियो फाइल का विश्लेषण किया जा रहा है...');

    if (musicFile) {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Audio = (reader.result || '').split(',')[1];
        setMusicProcessingStatus('Gnani Prisma ASR से बोल निकाले जा रहे हैं...');

        try {
          const res = await fetch(`${API_BASE}/lyrics/extract`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(activeToken ? { Authorization: `Bearer ${activeToken}` } : {})
            },
            body: JSON.stringify({
              audioFileName: musicFile.name,
              title: musicTitle || musicFile.name.replace(/\.[^/.]+$/, ''),
              audioBase64: base64Audio,
              mimeType: musicFile.type || 'audio/mpeg',
              duration: 180
            })
          });
          const data = await res.json();
          if (data.success && data.extractedSong) {
            setSongs((prev) => [data.extractedSong, ...prev.filter((s) => (s._id || s.id) !== (data.extractedSong._id || data.extractedSong.id))]);
            setShowUploadMusicModal(false);
            setMusicFile(null);
            setMusicTitle('');
            speakText('गाना सफलतापूर्वक डेटाबेस में सहेजा गया।', language);
            navigate('/lyrics', { state: { selectedSong: data.extractedSong } });
          }
        } catch (err) {
          alert('गाना अपलोड करने में त्रुटि: ' + err.message);
        } finally {
          setMusicIsProcessing(false);
          setMusicProcessingStatus('');
        }
      };
      reader.readAsDataURL(musicFile);
    } else if (musicPastedLyrics.trim()) {
      try {
        const res = await fetch(`${API_BASE}/lyrics/extract`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(activeToken ? { Authorization: `Bearer ${activeToken}` } : {})
          },
          body: JSON.stringify({
            title: musicTitle || 'कस्टम कविता / बोल',
            rawLyrics: musicPastedLyrics
          })
        });
        const data = await res.json();
        if (data.success && data.extractedSong) {
          setSongs((prev) => [data.extractedSong, ...prev.filter((s) => (s._id || s.id) !== (data.extractedSong._id || data.extractedSong.id))]);
          setShowUploadMusicModal(false);
          setMusicPastedLyrics('');
          setMusicTitle('');
          speakText('बोल सफलतापूर्वक सहेजे गए।', language);
          navigate('/lyrics', { state: { selectedSong: data.extractedSong } });
        }
      } catch (err) {
        alert('त्रुटि: ' + err.message);
      } finally {
        setMusicIsProcessing(false);
        setMusicProcessingStatus('');
      }
    }
  };

  const handleDeleteSong = async (id) => {
    if (!window.confirm('क्या आप वाकई इस अपलोड किए गए गाने को हटाना चाहते हैं?')) return;
    try {
      await api.deleteMySong(token, id);
      setSongs(prev => prev.filter(s => (s._id || s.id) !== id));
      speakText('गाना हटा दिया गया है।', language);
    } catch (err) {
      alert('गाना हटाने में समस्या आई: ' + err.message);
    }
  };

  const handlePlayInStudio = (song) => {
    navigate('/lyrics', { state: { selectedSong: song } });
  };

  const formatTime = (secs) => {
    const s = Math.max(0, Math.floor(secs || 0));
    const mins = Math.floor(s / 60);
    const remainder = Math.floor(s % 60);
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  const allDisplaySongs = songs.length > 0 ? songs : sampleSongs;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      
      {/* Top Welcome Banner */}
      <div className="glass-panel-elevated rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-2xl border border-white/10 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-rose-500/15 blur-[70px] rounded-full pointer-events-none"></div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-bold uppercase tracking-wider">
            <Music className="w-3.5 h-3.5" />
            <span>Indic Karaoke & Lyrics Vault</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-headline font-black text-white">
            {language === 'en' ? `Welcome, ${user?.name || 'Citizen'}!` : language === 'hi' ? `नमस्ते, ${user?.name || 'साथी'}!` : `Namaste, ${user?.name || 'Saathi'}!`}
          </h1>
          <p className="text-xs sm:text-sm text-stone-300 max-w-xl">
            {language === 'en'
              ? 'Your personal cloud music vault. Synchronize YouTube videos, upload songs, and sing along in multi-script Indic karaoke.'
              : language === 'hi'
              ? 'आपका व्यक्तिगत संगीत क्लाउड वॉल्ट। यूट्यूब वीडियो सिंक करें, गाने जोड़ें और मल्टी-स्क्रिप्ट इंडिक कैरोके में साथ गाएं।'
              : 'Aapka personal music cloud vault. YouTube video sync karein, gaane jodein aur multi-script karaoke me gaayein.'}
          </p>
          
          {/* Quick Stats Badges */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-bold">
              <Music className="w-3.5 h-3.5" />
              <span>{allDisplaySongs.length} {language === 'hi' ? 'गाने उपलब्ध' : 'Tracks Ready'}</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold">
              <Languages className="w-3.5 h-3.5" />
              <span>3-Script Live Sync</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Cloud Vault Active</span>
            </span>
          </div>
        </div>

        {/* Action Triggers */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowUploadMusicModal(true)}
            className="min-h-[46px] px-5 rounded-2xl bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 hover:opacity-95 text-stone-950 font-black text-xs sm:text-sm flex items-center gap-2 shadow-glow-amber focus:ring-4 focus:ring-amber-400 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>{language === 'en' ? 'Add Song / YouTube' : language === 'hi' ? 'गीत या यूट्यूब लिंक जोड़ें' : 'Gaana / YouTube Jodein'}</span>
          </button>

          <Link
            to="/lyrics"
            className="min-h-[46px] px-5 rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-xs sm:text-sm flex items-center gap-2 shadow backdrop-blur-md active:scale-95 transition-all"
          >
            <Disc3 className="w-4 h-4 text-amber-400 animate-spin" />
            <span>{language === 'hi' ? 'स्टूडियो खोलें' : 'Open Studio'}</span>
          </Link>
        </div>
      </div>

      {/* Songs Library Grid Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <h2 className="text-xl font-headline font-black text-white flex items-center gap-2">
            <Music className="w-5 h-5 text-rose-400" />
            <span>{language === 'hi' ? 'मेरे सहेजे गए गाने व कैरोके लाइब्रेरी' : 'My Songs & Karaoke Library'}</span>
          </h2>
          <p className="text-xs text-stone-400">
            {songs.length > 0
              ? (language === 'hi' ? 'आपके व्यक्तिगत क्लाउड वॉल्ट में सहेजे गए ट्रैक' : 'Saved in your personal cloud vault')
              : (language === 'hi' ? 'प्रमुख फीचर गीत — किसी भी गाने पर क्लिक कर तुरंत कैरोके गाएं' : 'Featured Tracks — Tap any track to sing along in Karaoke Studio')}
          </p>
        </div>

        <button
          onClick={() => setShowUploadMusicModal(true)}
          className="text-xs font-bold text-amber-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{language === 'hi' ? 'नया गाना जोड़ें' : 'Add New Track'}</span>
        </button>
      </div>

      {/* Grid of Song Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {allDisplaySongs.map((song) => {
          const songId = song._id || song.id;
          const isUploaded = Boolean(song.isUserSong || song.user);

          return (
            <div
              key={songId}
              className="glass-panel rounded-3xl p-5 flex flex-col justify-between hover:border-amber-400/50 hover:shadow-2xl transition-all group relative overflow-hidden"
            >
              {/* Cover Music Poster Art */}
              <div
                className={`w-full h-40 rounded-2xl bg-gradient-to-br ${
                  song.coverGradient || 'from-rose-500 to-amber-500'
                } flex flex-col justify-between p-4 shadow-inner relative overflow-hidden group/poster`}
              >
                {song.thumbnailUrl && (
                  <img
                    src={song.thumbnailUrl}
                    alt={song.title}
                    className="absolute inset-0 w-full h-full object-cover group-hover/poster:scale-105 transition-transform duration-500"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20"></div>

                <div className="relative z-10 flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-bold text-white border border-white/20 uppercase tracking-wider flex items-center gap-1.5">
                    {song.youtubeId ? (
                      <>
                        <Youtube className="w-3 h-3 text-red-400" />
                        <span>YouTube</span>
                      </>
                    ) : (
                      <>
                        <Music className="w-3 h-3 text-amber-300" />
                        <span>{isUploaded ? 'User Track' : 'Master Track'}</span>
                      </>
                    )}
                  </span>

                  {isUploaded && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSong(songId);
                      }}
                      className="w-7 h-7 rounded-full bg-black/50 hover:bg-red-500 text-white/80 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                      title="Delete song"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="relative z-10 flex items-end justify-between">
                  <div className="text-[11px] font-bold text-white/90 bg-black/60 px-2 py-0.5 rounded-md backdrop-blur-md flex items-center gap-1 border border-white/10">
                    <Clock className="w-3 h-3 text-amber-300" />
                    <span>{formatTime(song.duration)}</span>
                  </div>

                  <button
                    onClick={() => handlePlayInStudio(song)}
                    className="w-10 h-10 rounded-full bg-white text-stone-950 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform cursor-pointer"
                    title="Play in Karaoke Studio"
                  >
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                  </button>
                </div>
              </div>

              {/* Title & Metadata */}
              <div className="pt-4 space-y-2">
                <h3 className="font-bold text-white text-base group-hover:text-amber-300 transition-colors line-clamp-1">
                  {song.title}
                </h3>
                <p className="text-xs text-white/60 line-clamp-1">{song.artist || 'Aapan Music Artist'}</p>
                
                <div className="flex items-center gap-2 pt-1 text-[11px] text-white/50">
                  <span className="px-2 py-0.5 rounded-full bg-white/10 text-stone-300">
                    {song.lyrics?.length || 20} lines
                  </span>
                  <span>•</span>
                  <span className="text-emerald-400 font-semibold">3-Script Synced</span>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-4 border-t border-white/10 mt-4">
                <button
                  onClick={() => handlePlayInStudio(song)}
                  className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer group-hover:bg-amber-500 group-hover:text-stone-950"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{language === 'hi' ? 'कैरोके स्टूडियो में गाएं' : 'Sing in Karaoke Studio'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Upload Music Modal */}
      {showUploadMusicModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
          <div className="bg-stone-900 border border-white/20 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 text-white shadow-2xl relative">
            
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
                  <Music className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-white">
                    {language === 'hi' ? 'नया गाना जोड़ें' : 'Add Song to Music Studio'}
                  </h3>
                  <p className="text-xs text-white/60">
                    {language === 'hi' ? 'यूट्यूब लिंक या ऑडियो फाइल से लाइव लिरिक्स' : 'YouTube streaming or audio file'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowUploadMusicModal(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Mode Switcher */}
            <div className="grid grid-cols-3 p-1 rounded-2xl bg-black/60 border border-white/15 text-xs font-bold text-center">
              <button
                type="button"
                onClick={() => setMusicMode('youtube')}
                className={`py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  musicMode === 'youtube' ? 'bg-red-600 text-white font-black shadow-md' : 'text-stone-300 hover:text-white'
                }`}
              >
                <Youtube className="w-3.5 h-3.5" />
                <span>YouTube</span>
              </button>
              <button
                type="button"
                onClick={() => setMusicMode('file')}
                className={`py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  musicMode === 'file' ? 'bg-amber-500 text-stone-950 font-black shadow-md' : 'text-stone-300 hover:text-white'
                }`}
              >
                <Music className="w-3.5 h-3.5" />
                <span>Audio File</span>
              </button>
              <button
                type="button"
                onClick={() => setMusicMode('text')}
                className={`py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  musicMode === 'text' ? 'bg-purple-600 text-white font-black shadow-md' : 'text-stone-300 hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Custom Lyrics</span>
              </button>
            </div>

            <form onSubmit={handleMusicUploadSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1">
                  {language === 'hi' ? 'गाने का नाम (वैकल्पिक):' : 'Song Title (Optional):'}
                </label>
                <input
                  type="text"
                  value={musicTitle}
                  onChange={(e) => setMusicTitle(e.target.value)}
                  placeholder="उदा. Kesariya / Samjhawan"
                  className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-white/20 text-sm text-white placeholder-white/40 focus:outline-none focus:border-amber-400"
                />
              </div>

              {musicMode === 'youtube' && (
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-rose-300">
                    {language === 'hi' ? 'यूट्यूब वीडियो लिंक (YouTube Link):' : 'YouTube Video URL:'}
                  </label>
                  <input
                    type="url"
                    value={musicYoutubeUrl}
                    onChange={(e) => setMusicYoutubeUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full px-4 py-3 rounded-xl bg-black/50 border border-rose-500/30 text-sm text-white placeholder-white/40 focus:outline-none focus:border-rose-400 font-mono"
                    required
                  />
                  <p className="text-[11px] text-stone-400">
                    💡 बिना फाइल डाउनलोड किए सीधे यूट्यूब वीडियो स्ट्रीम होगी और पूरे गाने के बोल सिंक्रोनाइज़्ड रहेंगे।
                  </p>
                </div>
              )}

              {musicMode === 'file' && (
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-amber-300">
                    {language === 'hi' ? 'ऑडियो / वीडियो फाइल चुनें (.mp3, .wav, .m4a):' : 'Select Audio/Video File (.mp3, .wav):'}
                  </label>
                  <input
                    type="file"
                    accept="audio/*,video/*"
                    onChange={(e) => setMusicFile(e.target.files[0] || null)}
                    className="w-full text-xs text-stone-300 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-amber-500 file:text-stone-950 hover:file:bg-amber-400 cursor-pointer"
                    required
                  />
                </div>
              )}

              {musicMode === 'text' && (
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-purple-300">
                    {language === 'hi' ? 'बोल या कविता पेस्ट करें:' : 'Paste Lyrics / Poem:'}
                  </label>
                  <textarea
                    rows="5"
                    value={musicPastedLyrics}
                    onChange={(e) => setMusicPastedLyrics(e.target.value)}
                    placeholder="यहाँ गाने के बोल या कविता लिखें..."
                    className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-white/20 text-sm text-white placeholder-white/40 focus:outline-none focus:border-purple-400 resize-none font-sans"
                    required
                  ></textarea>
                </div>
              )}

              {musicIsProcessing && (
                <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-500/30 text-xs text-amber-300 flex items-center gap-2">
                  <Disc3 className="w-4 h-4 animate-spin text-amber-400" />
                  <span>{musicProcessingStatus || 'प्रोसेसिंग जारी है...'}</span>
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowUploadMusicModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-colors cursor-pointer"
                >
                  {language === 'hi' ? 'रद्द करें' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={musicIsProcessing}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 hover:opacity-95 text-stone-950 font-black text-xs shadow-md transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  {musicIsProcessing
                    ? (language === 'hi' ? 'सिंकिंग...' : 'Syncing...')
                    : (language === 'hi' ? 'लिरिक्स सिंक करें' : 'Sync & Launch')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
