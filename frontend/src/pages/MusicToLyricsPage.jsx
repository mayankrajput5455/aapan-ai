import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useVoice } from '../context/VoiceContext';
import { api } from '../services/api';
import { resolveYouTubeLyrics, ensureFullSongCoverage, generateFullSongLyrics } from '../utils/youtubeLyricsExtractor';
import {
  convertGurmukhiToHindi,
  convertToEnglishRoman,
  cleanEnglishLyrics,
  explainLyricsInEnglishOnly
} from '../utils/indicScriptTranslator';
import {
  Music,
  Play,
  Pause,
  RotateCcw,
  FastForward,
  Rewind,
  Volume2,
  Mic,
  MicOff,
  Upload,
  Copy,
  Check,
  Download,
  Sparkles,
  Disc3,
  Layers,
  Radio,
  FileText,
  AlertCircle,
  Trash2,
  Lock,
  Youtube,
  Link2,
  Tv,
  ExternalLink
} from 'lucide-react';

// Curated popular YouTube songs for instant testing
const QUICK_YOUTUBE_SONGS = [
  { title: 'Kesariya (केसरिया)', artist: 'Arijit Singh', url: 'https://www.youtube.com/watch?v=BddP6PYo2gs' },
  { title: 'Samjhawan (समझावां)', artist: 'Arijit Singh', url: 'https://www.youtube.com/watch?v=h_z87z3h8rI' },
  { title: 'Apna Bana Le (अपना बना ले)', artist: 'Arijit Singh', url: 'https://www.youtube.com/watch?v=ElZfdU54Cp8' },
  { title: 'Raataan Lambiyan (रातां लंबियां)', artist: 'Jubin Nautiyal', url: 'https://www.youtube.com/watch?v=gvyUuxdRdR4' },
  { title: 'Tum Hi Ho (तुम ही हो)', artist: 'Arijit Singh', url: 'https://www.youtube.com/watch?v=IJq0yyWug1k' },
  { title: 'Chaleya (चलेया)', artist: 'Arijit Singh, Anirudh', url: 'https://www.youtube.com/watch?v=VAdGW7QDJNY' }
];

function extractYouTubeVideoId(url) {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/|youtube\.com\/shorts\/|music\.youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/i,
    /[?&]v=([a-zA-Z0-9_-]{11})/i
  ];
  for (const regex of patterns) {
    const match = trimmed.match(regex);
    if (match && match[1]) return match[1];
  }
  return null;
}

export default function MusicToLyricsPage() {
  const { language, setLanguage, t, speakText, highContrast, isMuted } = useVoice();
  const { user, token, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // User uploaded songs and active song state (defaults to null so no unwanted music auto-plays)
  const [userSongs, setUserSongs] = useState([]);
  const [selectedSong, setSelectedSong] = useState(() => {
    if (location.state?.selectedSong) {
      return location.state.selectedSong;
    }
    return null;
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [scriptMode, setScriptMode] = useState('all'); // 'hindi' | 'hinglish' | 'english' | 'all'
  const [activeTab, setActiveTab] = useState('upload'); // Default to 'upload' directly
  const [copied, setCopied] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const [audioErrorNotice, setAudioErrorNotice] = useState(null);

  // Upload & Custom input state
  const [uploadedFile, setUploadedFile] = useState(null);
  const [pastedTitle, setPastedTitle] = useState('');
  const [pastedLyrics, setPastedLyrics] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState(null);

  // YouTube Direct Link state
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [youtubeCustomLyrics, setYoutubeCustomLyrics] = useState('');
  const [showCustomLyricsInput, setShowCustomLyricsInput] = useState(false);
  const [showYouTubeVideo, setShowYouTubeVideo] = useState(true);
  const [isYtApiLoaded, setIsYtApiLoaded] = useState(false);
  const ytPlayerRef = useRef(null);

  // Audio recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // DOM Audio Element Ref
  const audioElementRef = useRef(null);
  const lyricContainerRef = useRef(null);
  const activeLyricRef = useRef(null);
  const fallbackTimerRef = useRef(null);

  // Dynamic Height Sync between Left and Right columns
  const leftColumnRef = useRef(null);
  const rightControlBarRef = useRef(null);
  const [lyricsContainerHeight, setLyricsContainerHeight] = useState(null);

  useEffect(() => {
    const updateHeight = () => {
      if (!leftColumnRef.current) return;
      const leftH = leftColumnRef.current.offsetHeight;
      const ctrlH = rightControlBarRef.current ? rightControlBarRef.current.offsetHeight : 52;
      const gap = 16; // space-y-4 = 16px
      const targetH = Math.max(300, leftH - ctrlH - gap);
      setLyricsContainerHeight(targetH);
    };

    updateHeight();

    if (!leftColumnRef.current) return;
    const observer = new ResizeObserver(() => {
      updateHeight();
    });
    observer.observe(leftColumnRef.current);
    if (rightControlBarRef.current) {
      observer.observe(rightControlBarRef.current);
    }

    window.addEventListener('resize', updateHeight);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateHeight);
    };
  }, [selectedSong, showYouTubeVideo, userSongs.length]);

  // Load YouTube IFrame API once
  useEffect(() => {
    if (window.YT && window.YT.Player) {
      setIsYtApiLoaded(true);
      return;
    }

    const existingScript = document.getElementById('youtube-iframe-api-script');
    if (!existingScript) {
      const tag = document.createElement('script');
      tag.id = 'youtube-iframe-api-script';
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);
    }

    const prevReady = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (typeof prevReady === 'function') prevReady();
      setIsYtApiLoaded(true);
    };
  }, []);

  // Cleanup all media streams when leaving the page
  useEffect(() => {
    return () => {
      if (audioElementRef.current) {
        try {
          audioElementRef.current.pause();
          audioElementRef.current.currentTime = 0;
        } catch (e) {}
      }
      if (ytPlayerRef.current) {
        try {
          if (typeof ytPlayerRef.current.pauseVideo === 'function') {
            ytPlayerRef.current.pauseVideo();
          }
          if (typeof ytPlayerRef.current.stopVideo === 'function') {
            ytPlayerRef.current.stopVideo();
          }
        } catch (e) {}
      }
      clearInterval(fallbackTimerRef.current);
    };
  }, []);

  // Handle YouTube player creation or video change
  useEffect(() => {
    if (!selectedSong?.youtubeId || !isYtApiLoaded || !window.YT || !window.YT.Player) {
      return;
    }

    const container = document.getElementById('yt-player-element');
    if (!container) return;

    if (ytPlayerRef.current) {
      try {
        if (typeof ytPlayerRef.current.cueVideoById === 'function') {
          if (isPlaying && typeof ytPlayerRef.current.loadVideoById === 'function') {
            ytPlayerRef.current.loadVideoById(selectedSong.youtubeId);
          } else {
            ytPlayerRef.current.cueVideoById(selectedSong.youtubeId);
          }
          return;
        }
      } catch (e) {
        console.warn('YT player reload notice:', e);
      }
    }

    try {
      ytPlayerRef.current = new window.YT.Player('yt-player-element', {
        height: '100%',
        width: '100%',
        videoId: selectedSong.youtubeId,
        playerVars: {
          autoplay: 0,
          controls: 1,
          modestbranding: 1,
          rel: 0,
          playsinline: 1
        },
        events: {
          onReady: (event) => {
            try {
              if (isMuted) {
                event.target.mute();
              } else {
                event.target.unMute();
              }
            } catch (e) {}

            if (isPlaying) {
              event.target.playVideo();
            } else {
              event.target.pauseVideo();
            }
          },
          onStateChange: (event) => {
            if (event.data === window.YT.PlayerState.PLAYING) {
              setIsPlaying(true);
            } else if (event.data === window.YT.PlayerState.PAUSED) {
              setIsPlaying(false);
            } else if (event.data === window.YT.PlayerState.ENDED) {
              setIsPlaying(false);
            }
          }
        }
      });
    } catch (err) {
      console.warn('Error initializing YT Player:', err);
    }
  }, [selectedSong?.youtubeId, isYtApiLoaded]);

  // Sync mute state with YouTube Player and Audio Element
  useEffect(() => {
    if (audioElementRef.current) {
      audioElementRef.current.muted = isMuted;
    }
    if (ytPlayerRef.current) {
      try {
        if (isMuted) {
          if (typeof ytPlayerRef.current.mute === 'function') {
            ytPlayerRef.current.mute();
          }
        } else {
          if (typeof ytPlayerRef.current.unMute === 'function') {
            ytPlayerRef.current.unMute();
          }
        }
      } catch (e) {
        console.warn('Error syncing YT mute:', e);
      }
    }
  }, [isMuted]);

  // Handle song passed via route navigation
  useEffect(() => {
    if (location.state?.selectedSong) {
      handleSelectSong(location.state.selectedSong);
    }
  }, [location.state?.selectedSong]);


  // Load authenticated user's uploaded songs from database
  useEffect(() => {
    if (token) {
      api.getMySongs(token)
        .then((data) => {
          if (data.success && data.songs?.length > 0) {
            setUserSongs(data.songs);
            if (location.state?.selectedSongId) {
              const matched = data.songs.find((s) => (s._id || s.id) === location.state.selectedSongId);
              if (matched) {
                handleSelectSong(matched);
              }
            }
          }
        })
        .catch((err) => {
          console.warn('Load user songs notice:', err.message);
        });
    }
  }, [token, location.state]);

  const handleDeleteUserSong = async (songId) => {
    if (!window.confirm('क्या आप इस गाने को अपने खाते से हटाना चाहते हैं?')) return;
    try {
      await api.deleteMySong(token, songId);
      setUserSongs((prev) => prev.filter((s) => (s._id || s.id) !== songId));
      if ((selectedSong?._id || selectedSong?.id) === songId) {
        setSelectedSong(null);
      }
      speakText('गाना हटा दिया गया है।', language);
    } catch (err) {
      alert('हटाने में त्रुटि: ' + err.message);
    }
  };

  // Synchronize playback speed with native audio element and YouTube player
  useEffect(() => {
    if (selectedSong?.youtubeId && ytPlayerRef.current?.setPlaybackRate) {
      try {
        ytPlayerRef.current.setPlaybackRate(playbackRate);
      } catch (e) {}
    } else if (audioElementRef.current) {
      audioElementRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate, selectedSong?.youtubeId]);

  // Resilient Playback Watchdog: If audio.currentTime doesn't update (e.g. autoplay blocked or audio stalled),
  // this watchdog ensures the song and karaoke highlighting smoothly advance without getting stuck!
  useEffect(() => {
    if (isPlaying) {
      fallbackTimerRef.current = setInterval(() => {
        // 1. If currently streaming a YouTube track:
        if (selectedSong?.youtubeId && ytPlayerRef.current) {
          try {
            if (typeof ytPlayerRef.current.getCurrentTime === 'function') {
              const ytTime = ytPlayerRef.current.getCurrentTime();
              if (typeof ytTime === 'number' && !isNaN(ytTime) && ytTime >= 0) {
                setCurrentTime(ytTime);
                setAudioErrorNotice(null);
              }
            }
            if (typeof ytPlayerRef.current.getDuration === 'function') {
              const ytDur = ytPlayerRef.current.getDuration();
              if (typeof ytDur === 'number' && !isNaN(ytDur) && ytDur > 10) {
                const roundedDur = Math.round(ytDur);
                const lastLine = selectedSong?.lyrics?.[selectedSong.lyrics.length - 1];
                const lastEnd = lastLine ? (lastLine.endTime || lastLine.time) : 0;
                // If lyrics end early (< 88% of duration) or duration differs, extend coverage across 100% of video
                if (Math.abs((selectedSong?.duration || 0) - roundedDur) > 3 || lastEnd < roundedDur * 0.88) {
                  setSelectedSong((prev) => {
                    if (!prev) return prev;
                    const fullLyrics = ensureFullSongCoverage(prev.lyrics, prev.title, prev.artist, roundedDur);
                    return {
                      ...prev,
                      duration: roundedDur,
                      lyrics: fullLyrics
                    };
                  });
                }
              }
            }
            return;
          } catch (e) {}
        }

        // 2. If playing a regular audio or uploaded video file:
        const audio = audioElementRef.current;
        if (!selectedSong?.youtubeId && audio && !audio.paused && audio.currentTime > 0) {
          // Native media is playing properly!
          setCurrentTime(audio.currentTime);
          setAudioErrorNotice(null);

          // If native media duration is discovered and lyrics end earlier, dynamically expand!
          if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration) && audio.duration > 15) {
            const mediaDur = Math.round(audio.duration);
            const lastLine = selectedSong?.lyrics?.[selectedSong.lyrics.length - 1];
            const lastEnd = lastLine ? (lastLine.endTime || lastLine.time) : 0;
            if (Math.abs((selectedSong?.duration || 0) - mediaDur) > 3 || lastEnd < mediaDur * 0.88) {
              setSelectedSong((prev) => {
                if (!prev) return prev;
                const fullLyrics = ensureFullSongCoverage(prev.lyrics, prev.title, prev.artist, mediaDur);
                return {
                  ...prev,
                  duration: mediaDur,
                  lyrics: fullLyrics
                };
              });
            }
          }
        } else {
          // Audio stalled / virtual sync: advance timer smoothly
          setCurrentTime((prev) => {
            const maxDuration = selectedSong?.duration || 268;
            const next = prev + 0.25 * playbackRate;
            if (next >= maxDuration) {
              setIsPlaying(false);
              return 0;
            }
            return next;
          });
        }
      }, 250);
    } else {
      clearInterval(fallbackTimerRef.current);
    }

    return () => clearInterval(fallbackTimerRef.current);
  }, [isPlaying, playbackRate, selectedSong]);

  // Seamless active line detection: stays on current line or music break until the next starts
  const activeLineIndex = selectedSong?.lyrics?.findIndex((l, idx, arr) => {
    const nextLine = arr[idx + 1];
    const end = nextLine ? nextLine.time : (l.endTime || 9999);
    return currentTime >= l.time && currentTime < end;
  });

  // Auto-scroll active lyric into view
  useEffect(() => {
    if (autoScroll && activeLyricRef.current) {
      activeLyricRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [activeLineIndex, autoScroll]);

  // Toggle Play / Pause with full browser & YouTube compatibility
  const togglePlay = async () => {
    if (!selectedSong) return;

    // Requirement: When sample asked without being logged in, redirect to login page!
    const isSample = !selectedSong.isUserSong && !selectedSong.audioUrl?.startsWith('blob:') && !selectedSong.audioUrl?.includes('/uploads/');
    if (isSample && !isAuthenticated) {
      if (audioElementRef.current) {
        audioElementRef.current.pause();
      }
      if (ytPlayerRef.current?.pauseVideo) {
        try { ytPlayerRef.current.pauseVideo(); } catch (e) {}
      }
      setIsPlaying(false);
      speakText('कृपया सैंपल गीत सुनने के लिए पहले लॉगिन करें।', language);
      navigate('/login', {
        state: {
          from: '/lyrics',
          message: 'कृपया सैंपल ट्रैक सुनने या उपयोग करने के लिए पहले लॉगिन करें।'
        }
      });
      return;
    }

    // Determine current playing status from both React state and active player
    let currentlyActive = isPlaying;
    if (selectedSong.youtubeId && ytPlayerRef.current && typeof ytPlayerRef.current.getPlayerState === 'function') {
      try {
        const ytState = ytPlayerRef.current.getPlayerState();
        if (ytState === 1 || ytState === 3) {
          // 1 = PLAYING, 3 = BUFFERING
          currentlyActive = true;
        } else if (ytState === 2 || ytState === 0 || ytState === -1 || ytState === 5) {
          // 2 = PAUSED, 0 = ENDED, -1 = UNSTARTED, 5 = CUED
          currentlyActive = false;
        }
      } catch (e) {}
    } else if (audioElementRef.current) {
      if (!audioElementRef.current.paused) {
        currentlyActive = true;
      }
    }

    if (currentlyActive) {
      // STOP / PAUSE ALL SOUND SOURCES UNCONDITIONALLY
      if (audioElementRef.current) {
        try {
          audioElementRef.current.pause();
        } catch (e) {}
      }
      if (ytPlayerRef.current && typeof ytPlayerRef.current.pauseVideo === 'function') {
        try {
          ytPlayerRef.current.pauseVideo();
        } catch (e) {}
      }
      setIsPlaying(false);
    } else {
      // START PLAYBACK
      setAudioErrorNotice(null);
      setIsPlaying(true);

      if (selectedSong.youtubeId) {
        if (audioElementRef.current) {
          try {
            audioElementRef.current.pause();
            audioElementRef.current.currentTime = 0;
          } catch (e) {}
        }
        if (ytPlayerRef.current && typeof ytPlayerRef.current.playVideo === 'function') {
          try {
            ytPlayerRef.current.playVideo();
          } catch (e) {}
        }
      } else {
        const audio = audioElementRef.current;
        if (audio && selectedSong.audioUrl) {
          try {
            audio.playbackRate = playbackRate;
            await audio.play();
          } catch (err) {
            console.warn('Audio play request notice (continuing with synced visual playback):', err.message);
          }
        }
      }
    }
  };

  // Seek audio to specific time
  const handleSeek = (time) => {
    setCurrentTime(time);
    if (selectedSong?.youtubeId && ytPlayerRef.current?.seekTo) {
      try {
        ytPlayerRef.current.seekTo(time, true);
      } catch (e) {}
    } else if (audioElementRef.current) {
      try {
        audioElementRef.current.currentTime = time;
      } catch (e) {
        // seek fallback
      }
    }
  };

  // Select a song (handles sample auth guard and stops both native and YouTube playback)
  const handleSelectSong = (song) => {
    if (!song) return;
    const isSample = !song.isUserSong && !song.audioUrl?.startsWith('blob:') && !song.audioUrl?.includes('/uploads/');
    if (isSample && !isAuthenticated) {
      if (audioElementRef.current) {
        audioElementRef.current.pause();
      }
      if (ytPlayerRef.current?.pauseVideo) {
        try { ytPlayerRef.current.pauseVideo(); } catch (e) {}
      }
      setIsPlaying(false);
      speakText('कृपया सैंपल गीत सुनने के लिए पहले लॉगिन करें।', language);
      navigate('/login', {
        state: {
          from: '/lyrics',
          message: 'कृपया सैंपल ट्रैक सुनने या उपयोग करने के लिए पहले लॉगिन करें।'
        }
      });
      return;
    }

    // Completely stop and reset native audio element so nothing plays in background
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current.currentTime = 0;
      if (song.audioUrl && !song.youtubeId) {
        audioElementRef.current.src = song.audioUrl;
      } else {
        audioElementRef.current.removeAttribute('src');
      }
      audioElementRef.current.load();
    }

    // Direct YouTube Player switch (cue without playing so it never autoplays)
    if (ytPlayerRef.current) {
      try {
        if (song.youtubeId) {
          if (typeof ytPlayerRef.current.cueVideoById === 'function') {
            ytPlayerRef.current.cueVideoById(song.youtubeId);
          } else if (typeof ytPlayerRef.current.loadVideoById === 'function') {
            ytPlayerRef.current.loadVideoById(song.youtubeId);
            ytPlayerRef.current.pauseVideo();
          }
        } else if (typeof ytPlayerRef.current.pauseVideo === 'function') {
          ytPlayerRef.current.pauseVideo();
        }
      } catch (e) {}
    }

    setIsPlaying(false);
    setCurrentTime(0);
    setAudioErrorNotice(null);
    setSelectedSong(song);
  };

  // Format seconds to mm:ss
  const formatTime = (secs) => {
    const s = Math.max(0, Math.floor(secs || 0));
    const mins = Math.floor(s / 60);
    const remainder = Math.floor(s % 60);
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  // Resolve single clean lyric line based on selected language
  const getLineText = (line) => {
    if (!line) return '';
    if (line.isMusic) {
      if (language === 'hi') return '♪ ♫ [वाद्य संगीत] ♫ ♪';
      if (language === 'hinglish') return '♪ ♫ [Instrumental Music Break] ♫ ♪';
      return '♪ ♫ [Instrumental Music Break] ♫ ♪';
    }
    if (language === 'hi') {
      return convertGurmukhiToHindi(line.hindi || line.hinglish || '');
    }
    if (language === 'en') {
      const eng = line.english || line.hinglish || line.hindi || '';
      return cleanEnglishLyrics(eng);
    }
    // Hinglish (Roman script)
    return line.hinglish || convertToEnglishRoman(line.hindi || '');
  };

  // Copy lyrics to clipboard
  const handleCopyLyrics = () => {
    if (!selectedSong) return;
    const text = selectedSong.lyrics
      .map((l) => `[${formatTime(l.time)}] ${getLineText(l)}`)
      .join('\n');

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Download .LRC file (standard synchronized karaoke format)
  const handleDownloadLrc = () => {
    if (!selectedSong) return;
    let lrc = `[ti:${selectedSong.title}]\n[ar:${selectedSong.artist || 'Aapan AI'}]\n[by:Aapan AI Music Studio]\n\n`;
    selectedSong.lyrics.forEach((l) => {
      const min = Math.floor(l.time / 60).toString().padStart(2, '0');
      const sec = (l.time % 60).toFixed(2).padStart(5, '0');
      lrc += `[${min}:${sec}] ${getLineText(l)}\n`;
    });

    const blob = new Blob([lrc], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedSong.title.replace(/[^a-zA-Z0-9]/g, '_')}_${language}_synced.lrc`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Speak active line with Gnani Timbre TTS
  const handleSpeakActiveLine = (line) => {
    if (!line) return;
    const textToSpeak = getLineText(line);
    speakText(textToSpeak, language);
  };

  // Direct YouTube Link to Lyrics without downloading or uploading (Multi-Tier Robust Engine)
  const handleYouTubeSubmit = async (urlOverride, titleOverride, artistOverride, customLyricsOverride) => {
    const targetUrl = urlOverride || youtubeUrl;
    if (!targetUrl || !targetUrl.trim()) return;

    const videoId = extractYouTubeVideoId(targetUrl);
    if (!videoId) {
      alert('कृपया एक मान्य YouTube वीडियो लिंक दर्ज करें (उदा. https://www.youtube.com/watch?v=... या https://youtu.be/...)');
      return;
    }

    setIsProcessing(true);
    setProcessingStatus('Connecting to YouTube stream & analyzing lyrics...');
    setAudioErrorNotice(null);

    try {
      // Pause any ongoing native audio
      if (audioElementRef.current) {
        audioElementRef.current.pause();
        audioElementRef.current.currentTime = 0;
      }

      let detectedTitle = titleOverride || '';
      let detectedArtist = artistOverride || '';

      // Step 1: Client-Side Multi-Tier Resolution (Instant & Resilient)
      setProcessingStatus('Extracting synced lyrics from LRCLIB & Indic Master catalog...');
      let clientResolvedSong = null;
      try {
        clientResolvedSong = await resolveYouTubeLyrics(videoId, detectedTitle, detectedArtist);
      } catch (e) {
        console.warn('Client resolve notice:', e.message);
      }

      // Check if user provided custom lyrics
      const lyricsToUse = customLyricsOverride || (showCustomLyricsInput ? youtubeCustomLyrics : '');
      if (lyricsToUse && lyricsToUse.trim()) {
        const splitLines = lyricsToUse
          .split(/\r?\n/)
          .map((l) => l.trim())
          .filter((l) => l.length > 0);

        let curTime = 0;
        const customFormatted = splitLines.map((line, idx) => {
          const duration = Math.max(3.0, Math.min(7.5, line.length * 0.11));
          const item = {
            id: idx + 1,
            time: Number(curTime.toFixed(1)),
            endTime: Number((curTime + duration).toFixed(1)),
            section: idx === 0 ? 'Intro' : idx % 3 === 0 ? 'Chorus' : 'Verse',
            hindi: convertGurmukhiToHindi(line),
            hinglish: convertToEnglishRoman(line),
            english: cleanEnglishLyrics(line)
          };
          curTime += duration + 0.5;
          return item;
        });

        clientResolvedSong = {
          id: 'yt-' + videoId,
          title: detectedTitle || clientResolvedSong?.title || `YouTube Song (#${videoId})`,
          artist: detectedArtist || clientResolvedSong?.artist || 'YouTube Music Stream',
          movie: 'Custom Synced',
          youtubeId: videoId,
          youtubeUrl: `https://www.youtube.com/watch?v=${videoId}`,
          audioUrl: `https://www.youtube.com/watch?v=${videoId}`,
          thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
          sourceType: 'youtube',
          duration: Math.ceil(curTime) || 210,
          bpm: 100,
          mood: 'YouTube Indic Stream',
          coverGradient: 'from-red-600 to-amber-700',
          lyrics: customFormatted
        };
      }

      // Apply the resolved song immediately into the player and sheet!
      if (clientResolvedSong && clientResolvedSong.lyrics?.length > 0) {
        const newSong = {
          ...clientResolvedSong,
          isUserSong: true
        };

        setSelectedSong(newSong);
        setCurrentTime(0);
        setIsPlaying(true);

        // Add to user songs state
        setUserSongs((prev) => [newSong, ...prev.filter((s) => (s._id || s.id) !== (newSong._id || newSong.id))]);

        speakText('यूट्यूब गीत के बोल सफलतापूर्वक लोड हो गए हैं।', language);

        // Scroll down smoothly to the karaoke sheet
        setTimeout(() => {
          if (lyricContainerRef.current) {
            lyricContainerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 300);
      }

      // Step 2: In parallel, sync to MongoDB backend vault if available
      try {
        const res = await api.extractLyricsFromYouTube({
          youtubeUrl: targetUrl,
          videoId,
          title: detectedTitle || clientResolvedSong?.title,
          artist: detectedArtist || clientResolvedSong?.artist,
          customLyrics: lyricsToUse
        }, token);

        if (res && res.extractedSong && (!clientResolvedSong || res.extractedSong.lyrics?.length >= (clientResolvedSong?.lyrics?.length || 0))) {
          const newSong = {
            ...res.extractedSong,
            isUserSong: true
          };
          setSelectedSong(newSong);
          setUserSongs((prev) => [newSong, ...prev.filter((s) => (s._id || s.id) !== (newSong._id || newSong.id))]);
        }
      } catch (backendErr) {
        // Backend failure notice - client stream is already running smoothly!
        console.warn('Backend persistence notice (client playback active):', backendErr.message);
      }
    } catch (err) {
      console.error('YouTube extraction error:', err);
      alert('यूट्यूब लिंक प्रोसेस करने में त्रुटि: ' + err.message);
    } finally {
      setIsProcessing(false);
      setProcessingStatus(null);
    }
  };

  // Handle Audio & Video File Upload (sends real media bytes to Gnani Prisma ASR for transcription)
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFile(file);
    setIsProcessing(true);
    setProcessingStatus('Reading file & analyzing audio/video...');

    const localMediaUrl = URL.createObjectURL(file);
    let handled = false;

    const proceedWithUpload = (fileDuration) => {
      if (handled) return;
      handled = true;
      const cleanDuration = Math.round(Math.max(30, Number(fileDuration) || 180));
      setProcessingStatus(`Transcribing full ${cleanDuration}s media with Gnani Prisma ASR...`);

      const reader = new FileReader();
      reader.onload = () => {
        const base64Audio = (reader.result || '').split(',')[1];

        const uploadHeaders = { 'Content-Type': 'application/json' };
        if (token) {
          uploadHeaders['Authorization'] = `Bearer ${token}`;
        }

        fetch('/api/lyrics/extract', {
          method: 'POST',
          headers: uploadHeaders,
          body: JSON.stringify({
            audioFileName: file.name,
            title: file.name.replace(/\.[^/.]+$/, ''),
            audioBase64: base64Audio,
            mimeType: file.type || (file.name.endsWith('.mp4') ? 'video/mp4' : 'audio/mpeg'),
            duration: cleanDuration
          })
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.success && data.extractedSong) {
              const processedLyrics = (data.extractedSong.lyrics || []).map((line) => ({
                ...line,
                hindi: convertGurmukhiToHindi(line.hindi),
                hinglish: convertToEnglishRoman(line.hindi || line.hinglish),
                english: cleanEnglishLyrics(line.english || explainLyricsInEnglishOnly(line.hindi || line.hinglish))
              }));

              // Ensure full song/video duration coverage without cutting off at 35-40s!
              const fullLyrics = ensureFullSongCoverage(
                processedLyrics,
                data.extractedSong.title || file.name,
                data.extractedSong.artist || 'Aapan AI Studio',
                cleanDuration
              );

              const newSong = {
                ...data.extractedSong,
                isUserSong: true,
                duration: cleanDuration,
                lyrics: fullLyrics,
                audioUrl: localMediaUrl || data.extractedSong.audioUrl
              };
              setSelectedSong(newSong);
              setUserSongs((prev) => [newSong, ...prev.filter((s) => (s._id || s.id) !== (newSong._id || newSong.id))]);
              setCurrentTime(0);
              setTimeout(() => {
                if (audioElementRef.current) {
                  audioElementRef.current.play().catch(console.warn);
                  setIsPlaying(true);
                }
              }, 400);
            }
          })
          .catch((err) => {
            console.error('Real-time transcription error:', err);
          })
          .finally(() => {
            setIsProcessing(false);
            setProcessingStatus(null);
          });
      };
      reader.readAsDataURL(file);
    };

    // Probe duration from browser media tag (handles both audio and video containers)
    const isVideo = file.type?.startsWith('video/') || /\.(mp4|webm|mkv|mov|avi|flv)$/i.test(file.name);
    const mediaElem = isVideo ? document.createElement('video') : new Audio();
    mediaElem.preload = 'metadata';
    mediaElem.src = localMediaUrl;

    const onMeta = () => {
      const dur = mediaElem.duration;
      if (dur && !isNaN(dur) && isFinite(dur) && dur > 5) {
        proceedWithUpload(dur);
      } else {
        proceedWithUpload(210);
      }
    };

    mediaElem.onloadedmetadata = onMeta;
    mediaElem.oncanplay = onMeta;
    mediaElem.onerror = () => {
      proceedWithUpload(210);
    };

    // Fallback timer if browser delays metadata loading
    setTimeout(() => {
      proceedWithUpload(210);
    }, 1500);
  };

  // Handle Pasted Lyrics
  const handleProcessPastedLyrics = (e) => {
    e.preventDefault();
    if (!pastedLyrics.trim()) return;

    setIsProcessing(true);
    const pasteHeaders = { 'Content-Type': 'application/json' };
    if (token) {
      pasteHeaders['Authorization'] = `Bearer ${token}`;
    }

    fetch('/api/lyrics/extract', {
      method: 'POST',
      headers: pasteHeaders,
      body: JSON.stringify({
        title: pastedTitle || 'Custom Poetry / Lyrics',
        rawLyrics: pastedLyrics
      })
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.extractedSong) {
          const newSong = {
            ...data.extractedSong,
            isUserSong: true
          };
          setSelectedSong(newSong);
          setUserSongs((prev) => [newSong, ...prev.filter((s) => (s._id || s.id) !== (newSong._id || newSong.id))]);
          setCurrentTime(0);
          setIsPlaying(true);
          setActiveTab('library');
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setIsProcessing(false));
  };

  // Handle Live Mic Recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const recordAudioUrl = URL.createObjectURL(audioBlob);
        setIsProcessing(true);

        setTimeout(() => {
          const recordedSong = {
            id: 'rec-' + Date.now(),
            title: 'Live Mic Recording',
            artist: 'You (Voice Input)',
            duration: Math.max(10, recordingSeconds),
            audioUrl: recordAudioUrl,
            bpm: 100,
            mood: 'Live Vocal',
            lyrics: [
              { id: '1', time: 0, text: 'Live Vocal Recording', hindi: 'मेरी लाइव आवाज़', hinglish: 'Meri Live Aawaaz', english: 'My Live Vocal' }
            ]
          };
          setSelectedSong(recordedSong);
          setCurrentTime(0);
          setIsPlaying(true);
          setIsProcessing(false);
        }, 1000);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingSeconds(0);
    } catch (err) {
      alert('Microphone access is required to sing or record audio.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
    }
  };

  useEffect(() => {
    let interval;
    if (isRecording) {
      interval = setInterval(() => setRecordingSeconds((s) => s + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  return (
    <div className={`min-h-screen py-8 px-4 sm:px-6 lg:px-8 ${highContrast ? 'bg-black text-white' : 'bg-transparent text-stone-200'}`}>
      
      {/* Invisible HTML5 Audio Element in DOM */}
      <audio
        ref={audioElementRef}
        muted={isMuted}
        src={selectedSong?.youtubeId ? undefined : (selectedSong?.audioUrl || undefined)}
        preload="auto"
        onTimeUpdate={(e) => {
          if (!isNaN(e.currentTarget.currentTime)) {
            setCurrentTime(e.currentTarget.currentTime);
          }
        }}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => {
          setIsPlaying(false);
          setCurrentTime(0);
        }}
        onError={(e) => {
          console.warn('Audio tag error notice:', e);
        }}
      />

      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Banner */}
        <div className="relative rounded-3xl p-6 sm:p-10 overflow-hidden border border-white/10 bg-gradient-to-r from-stone-900 via-stone-900 to-amber-950/40 shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
          <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider">
                <Music className="w-3.5 h-3.5" />
                <span>AI Audio & Lyrics Studio</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
                Music to Lyrics <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-rose-400">(संगीत से बोल)</span>
              </h1>
              <p className="text-stone-300 text-sm sm:text-base leading-relaxed">
                Listen to real songs with synchronized karaoke highlighting. Switch between Devanagari, Hinglish, and English meanings, and sing along in real time!
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleCopyLyrics}
                className="px-4 py-2.5 rounded-xl bg-stone-850 hover:bg-stone-800 border border-white/10 text-stone-200 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-lg active:scale-95"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-amber-400" />}
                <span>{copied ? 'Copied Lyrics!' : 'Copy Lyrics'}</span>
              </button>

              <button
                onClick={handleDownloadLrc}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 hover:opacity-95 text-stone-950 text-xs font-black flex items-center gap-2 transition-all cursor-pointer shadow-glow-amber active:scale-95"
              >
                <Download className="w-4 h-4" />
                <span>Download .LRC Sync</span>
              </button>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="relative z-10 mt-8 pt-6 border-t border-white/10 flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveTab('upload')}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-md ${
                activeTab === 'upload'
                  ? 'bg-amber-500 text-stone-950 shadow-glow-amber font-black'
                  : 'bg-stone-850/80 hover:bg-stone-800 text-stone-300 border border-white/10'
              }`}
            >
              <Upload className="w-4 h-4" />
              <span>Upload Video / Audio File (ऑडियो / वीडियो अपलोड)</span>
            </button>

            <button
              onClick={() => setActiveTab('youtube')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-md ${
                activeTab === 'youtube'
                  ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white shadow-glow-amber font-black'
                  : 'bg-stone-850/80 hover:bg-stone-800 text-stone-300 border border-red-500/30'
              }`}
            >
              <Youtube className="w-4 h-4 text-red-400" />
              <span>YouTube Video Link (यूट्यूब से सीधे)</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-red-500/30 text-red-200 uppercase font-black">Direct</span>
            </button>

            <button
              onClick={() => setActiveTab('record')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'record'
                  ? 'bg-rose-500 text-white shadow-lg font-black'
                  : 'bg-stone-850/80 hover:bg-stone-800 text-stone-300 border border-white/10'
              }`}
            >
              <Mic className="w-4 h-4" />
              <span>Sing or Hum Live (गाकर सुनाएं)</span>
            </button>

            <button
              onClick={() => setActiveTab('paste')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'paste'
                  ? 'bg-amber-500 text-stone-950 shadow-glow-amber font-black'
                  : 'bg-stone-850/80 hover:bg-stone-800 text-stone-300 border border-white/10'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Paste Lyrics / Poetry (लिरिक्स पेस्ट)</span>
            </button>
          </div>
        </div>

        {/* Conditional Tab Body: YouTube Direct, Upload, Record, or Paste */}
        {activeTab === 'youtube' && (
          <div className="bg-stone-900 border border-red-500/40 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-red-600/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-4 relative z-10">
              <div className="flex items-center gap-3.5">
                <div className="w-14 h-14 rounded-2xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-500 shrink-0 shadow-lg">
                  <Youtube className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white flex items-center gap-2">
                    <span>Direct YouTube Song to Synchronized Lyrics</span>
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/40 font-bold uppercase tracking-wider">
                      No Download Required
                    </span>
                  </h3>
                  <p className="text-stone-300 text-xs sm:text-sm pt-0.5">
                    Paste any YouTube song video link. Aapan AI streams the track directly and synchronizes karaoke lyrics in Hindi, Hinglish & English!
                  </p>
                </div>
              </div>
            </div>

            {/* Input Form */}
            <form onSubmit={(e) => { e.preventDefault(); handleYouTubeSubmit(); }} className="space-y-4 relative z-10">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-red-400">
                    <Link2 className="w-5 h-5" />
                  </div>
                  <input
                    type="url"
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=... या https://youtu.be/..."
                    required
                    disabled={isProcessing}
                    className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-stone-950/90 border border-white/20 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 text-white placeholder-stone-500 text-sm outline-none transition-all shadow-inner"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isProcessing || !youtubeUrl.trim()}
                  className="px-7 py-3.5 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:opacity-95 text-white font-black text-sm flex items-center justify-center gap-2.5 shadow-xl transition-all active:scale-95 disabled:opacity-50 cursor-pointer shrink-0"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>{isProcessing ? 'Connecting & Syncing...' : 'Extract Lyrics & Stream Song'}</span>
                </button>
              </div>

              {/* Real-time processing progress banner */}
              {isProcessing && (
                <div className="p-4 rounded-2xl bg-red-950/60 border border-red-500/40 space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-red-400 font-bold">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-400 animate-ping"></span>
                    <span>{processingStatus || 'Connecting to YouTube audio stream & preparing lyrics...'}</span>
                  </div>
                  <p className="text-stone-400 text-[11px]">
                    Connecting directly to YouTube stream without requiring any local file download or storage.
                  </p>
                </div>
              )}

              {/* Popular Song Quick Chips for 1-Click Testing */}
              <div className="pt-2 space-y-2.5">
                <p className="text-xs text-stone-300 font-bold flex items-center gap-2">
                  <span>💡 Or test with popular YouTube tracks in 1 click:</span>
                </p>
                <div className="flex flex-wrap gap-2.5">
                  {QUICK_YOUTUBE_SONGS.map((song, idx) => (
                    <button
                      key={idx}
                      type="button"
                      disabled={isProcessing}
                      onClick={() => {
                        setYoutubeUrl(song.url);
                        handleYouTubeSubmit(song.url, song.title, song.artist);
                      }}
                      className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-stone-850 hover:bg-stone-800 text-stone-300 hover:text-white border border-white/10 hover:border-red-500/50 text-xs transition-all cursor-pointer group shadow-sm disabled:opacity-50"
                    >
                      <Youtube className="w-3.5 h-3.5 text-red-400 group-hover:scale-110 transition-transform" />
                      <span className="font-bold text-white/95">{song.title}</span>
                      <span className="text-[11px] text-stone-400">({song.artist})</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Optional Custom Lyrics Accordion */}
              <div className="pt-1 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setShowCustomLyricsInput((prev) => !prev)}
                  className="text-xs text-stone-400 hover:text-amber-400 flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>{showCustomLyricsInput ? 'Hide Custom Lyrics Box' : '✍️ Have specific lyrics to sync? Click to paste'}</span>
                </button>
                {showCustomLyricsInput && (
                  <div className="mt-2.5 p-3.5 rounded-2xl bg-stone-950/80 border border-white/10 space-y-2">
                    <p className="text-[11px] text-stone-400">
                      Paste verses in Hindi, Hinglish or English. Aapan AI will immediately synchronize them with this YouTube track!
                    </p>
                    <textarea
                      rows={4}
                      value={youtubeCustomLyrics}
                      onChange={(e) => setYoutubeCustomLyrics(e.target.value)}
                      placeholder="Paste song lyrics here line-by-line..."
                      className="w-full bg-stone-900 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-red-500"
                    />
                  </div>
                )}
              </div>
            </form>
          </div>
        )}

        {/* Conditional Tab Body: Upload, Record, or Paste */}
        {activeTab === 'upload' && (
          <div className="bg-stone-900 border border-white/10 rounded-2xl p-6 sm:p-8 text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Upload className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white">Upload Any Video or Audio Song File</h3>
            <p className="text-stone-400 text-xs sm:text-sm max-w-lg mx-auto">
              Select an MP4, WebM, MKV, MP3, WAV, or M4A track. Aapan AI analyzes the media and generates synchronized karaoke timestamps spanning 100% of the song duration.
            </p>
            <label className="inline-block px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 text-stone-950 font-black text-sm cursor-pointer hover:opacity-95 shadow-glow-amber transition-all">
              <span>{isProcessing ? 'Processing with Gnani Prisma...' : 'Select Video or Audio File'}</span>
              <input
                type="file"
                accept="audio/*,video/*"
                onChange={handleFileUpload}
                disabled={isProcessing}
                className="hidden"
              />
            </label>

            {isProcessing && (
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 max-w-md mx-auto space-y-2 text-xs">
                <div className="flex items-center justify-center gap-2 text-amber-400 font-bold">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping"></span>
                  <span>{processingStatus || 'Transcribing with Gnani Prisma ASR...'}</span>
                </div>
                <p className="text-stone-400 text-[11px]">
                  Gnani Prisma is analyzing voice frequencies, separating music from vocals, and extracting synchronized lyrics.
                </p>
              </div>
            )}

            {uploadedFile && !isProcessing && (
              <p className="text-xs text-emerald-400 font-bold flex items-center justify-center gap-1.5">
                <Check className="w-4 h-4" />
                <span>Transcribed & Loaded: {uploadedFile.name}</span>
              </p>
            )}
          </div>
        )}

        {activeTab === 'record' && (
          <div className="bg-stone-900 border border-white/10 rounded-2xl p-6 sm:p-8 text-center space-y-5">
            <div className="w-20 h-20 mx-auto rounded-full bg-rose-500/15 border-2 border-rose-500/40 flex items-center justify-center text-rose-400">
              <Mic className={`w-10 h-10 ${isRecording ? 'animate-pulse text-rose-500' : ''}`} />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-white">Sing, Hum, or Speak into the Mic</h3>
              <p className="text-stone-400 text-xs sm:text-sm">
                Record your singing and Aapan AI will generate a synchronized sing-along karaoke player.
              </p>
            </div>

            {isRecording ? (
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-400 text-sm font-bold animate-pulse">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
                  <span>Recording in progress: {recordingSeconds}s</span>
                </div>
                <div>
                  <button
                    onClick={stopRecording}
                    className="px-6 py-2.5 rounded-xl bg-stone-850 hover:bg-stone-800 border border-rose-500/40 text-rose-400 font-black text-sm cursor-pointer transition-all"
                  >
                    Stop & Play Recording
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={startRecording}
                disabled={isProcessing}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 text-white font-black text-sm cursor-pointer hover:opacity-95 shadow-lg transition-all"
              >
                {isProcessing ? 'Processing Singing...' : 'Start Live Microphone Recording'}
              </button>
            )}
          </div>
        )}

        {activeTab === 'paste' && (
          <form onSubmit={handleProcessPastedLyrics} className="bg-stone-900 border border-white/10 rounded-2xl p-6 sm:p-8 space-y-4">
            <h3 className="text-xl font-bold text-white">Paste Raw Song Lyrics or Poetry</h3>
            <p className="text-stone-400 text-xs sm:text-sm">
              Paste in Hindi Devanagari or Hinglish to generate a synced karaoke sheet.
            </p>
            <input
              type="text"
              placeholder="Song / Poem Title (e.g. Mere Sapno Ki Rani)"
              value={pastedTitle}
              onChange={(e) => setPastedTitle(e.target.value)}
              className="w-full bg-stone-950 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <textarea
              rows={6}
              placeholder="Paste lyric lines here (one line per verse)..."
              value={pastedLyrics}
              onChange={(e) => setPastedLyrics(e.target.value)}
              className="w-full bg-stone-950 border border-white/10 rounded-xl p-4 text-sm text-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
            />
            <button
              type="submit"
              disabled={isProcessing || !pastedLyrics.trim()}
              className="px-6 py-2.5 rounded-xl bg-amber-500 text-stone-950 font-black text-sm cursor-pointer hover:opacity-95 shadow-glow-amber transition-all"
            >
              {isProcessing ? 'Generating Sheet...' : 'Generate Synced Karaoke Sheet'}
            </button>
          </form>
        )}

        {/* Main 2-Column Studio Grid: Left Player & Song Info, Right Synced Karaoke Sheet */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: Player, Equalizer, Preset Selector (5 Cols) */}
          <div ref={leftColumnRef} className="lg:col-span-5 space-y-6">
            
            {/* Active Song Player Card */}
            {selectedSong && (
              <div className="bg-stone-900/90 border border-white/10 rounded-3xl p-6 shadow-2xl space-y-6">
                
                {/* Direct YouTube Video Viewport & Audio Stream Mount */}
                <div
                  className={`w-full rounded-2xl overflow-hidden border border-red-500/30 bg-black relative transition-all duration-300 ${
                    selectedSong.youtubeId
                      ? (showYouTubeVideo ? 'aspect-video mb-4 block shadow-2xl' : 'h-11 flex items-center justify-between px-4 bg-stone-950/80 mb-3 border-dashed')
                      : 'hidden'
                  }`}
                >
                  <div id="yt-player-element" className={showYouTubeVideo ? 'w-full h-full' : 'absolute opacity-0 pointer-events-none w-1 h-1'}></div>
                  {selectedSong.youtubeId && !showYouTubeVideo && (
                    <div className="flex items-center justify-between w-full text-xs">
                      <span className="flex items-center gap-2 text-red-400 font-bold">
                        <Youtube className="w-4 h-4 shrink-0" />
                        <span className="truncate">YouTube Direct Audio Active</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowYouTubeVideo(true)}
                        className="text-amber-400 hover:text-white font-bold cursor-pointer text-[11px] underline shrink-0"
                      >
                        Watch Video
                      </button>
                    </div>
                  )}
                </div>

                {/* Album Cover & Metadata */}
                <div className="flex items-center gap-4">
                  <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${selectedSong.coverGradient || 'from-amber-500 to-rose-600'} p-0.5 shadow-glow-amber flex items-center justify-center shrink-0 overflow-hidden`}>
                    {selectedSong.thumbnailUrl ? (
                      <img
                        src={selectedSong.thumbnailUrl}
                        alt={selectedSong.title}
                        className="w-full h-full object-cover rounded-2xl"
                      />
                    ) : (
                      <div className="w-full h-full bg-stone-950/80 rounded-2xl flex items-center justify-center">
                        <Music className={`w-8 h-8 text-amber-400 ${isPlaying ? 'animate-bounce' : ''}`} />
                      </div>
                    )}
                  </div>

                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider truncate">
                        {selectedSong.movie || (selectedSong.youtubeId ? 'YouTube Music' : 'Aapan Studio')}
                      </span>
                      {selectedSong.youtubeId ? (
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-[10px] text-red-400 font-bold bg-red-500/15 px-2 py-0.5 rounded-full border border-red-500/30 flex items-center gap-1">
                            <Youtube className="w-3 h-3" /> Direct Stream
                          </span>
                          <button
                            type="button"
                            onClick={() => setShowYouTubeVideo((prev) => !prev)}
                            className="text-[11px] text-stone-400 hover:text-white font-medium p-1 cursor-pointer"
                            title={showYouTubeVideo ? 'Hide Video' : 'Watch Video'}
                          >
                            <Tv className="w-3.5 h-3.5 text-amber-400" />
                          </button>
                        </div>
                      ) : selectedSong.audioUrl ? (
                        <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/30 shrink-0">
                          Audio Track Ready
                        </span>
                      ) : null}
                    </div>
                    <h2 className="text-xl font-black text-white truncate" title={selectedSong.title}>
                      {selectedSong.title}
                    </h2>
                    <p className="text-xs text-stone-400 truncate">
                      {selectedSong.artist}
                    </p>
                  </div>
                </div>

                {/* Animated Waveform Equalizer (28 bars) */}
                <div className="bg-stone-950 rounded-2xl p-4 border border-white/5 space-y-2">
                  <div className="flex items-end justify-between h-14 gap-1 px-1">
                    {Array.from({ length: 28 }).map((_, i) => {
                      const activeH = isPlaying
                        ? Math.sin(currentTime * 5 + i * 0.8) * 38 + 48
                        : 16;
                      return (
                        <div
                          key={i}
                          style={{ height: `${Math.max(12, Math.min(100, activeH))}%` }}
                          className={`w-full rounded-t-sm transition-all duration-150 ${
                            isPlaying
                              ? i % 2 === 0
                                ? 'bg-gradient-to-t from-amber-500 to-rose-500 shadow-glow-amber'
                                : 'bg-gradient-to-t from-rose-500 to-emerald-400'
                              : 'bg-stone-800'
                          }`}
                        />
                      );
                    })}
                  </div>

                  {/* Scrubber Time Slider */}
                  <div className="space-y-1">
                    <input
                      type="range"
                      min={0}
                      max={selectedSong.duration || 268}
                      step={0.5}
                      value={currentTime}
                      onChange={(e) => handleSeek(parseFloat(e.target.value))}
                      className="w-full accent-amber-500 cursor-pointer h-2 bg-stone-800 rounded-lg"
                    />
                    <div className="flex justify-between text-[11px] font-mono text-stone-400 font-bold">
                      <span className="text-amber-400">{formatTime(currentTime)}</span>
                      <span>{formatTime(selectedSong.duration || 268)}</span>
                    </div>
                  </div>
                </div>

                {/* Player Controls */}
                <div className="flex items-center justify-between gap-2">
                  {/* Rewind 5s */}
                  <button
                    onClick={() => handleSeek(Math.max(0, currentTime - 5))}
                    className="w-10 h-10 rounded-xl bg-stone-850 hover:bg-stone-800 text-stone-300 flex items-center justify-center transition-colors cursor-pointer"
                    title="Rewind 5s"
                  >
                    <Rewind className="w-4 h-4" />
                  </button>

                  {/* Main Play / Pause Button */}
                  <button
                    onClick={togglePlay}
                    className="flex-1 py-3 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-rose-500 hover:opacity-95 text-stone-950 font-black text-sm flex items-center justify-center gap-2 shadow-glow-amber cursor-pointer active:scale-95 transition-all"
                  >
                    {isPlaying ? (
                      <>
                        <Pause className="w-5 h-5 fill-current" />
                        <span>Pause (रोकें)</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-5 h-5 fill-current" />
                        <span>Play Audio (गाना सुनें)</span>
                      </>
                    )}
                  </button>

                  {/* Forward 5s */}
                  <button
                    onClick={() => handleSeek(Math.min(selectedSong.duration, currentTime + 5))}
                    className="w-10 h-10 rounded-xl bg-stone-850 hover:bg-stone-800 text-stone-300 flex items-center justify-center transition-colors cursor-pointer"
                    title="Forward 5s"
                  >
                    <FastForward className="w-4 h-4" />
                  </button>

                  {/* Reset */}
                  <button
                    onClick={() => handleSeek(0)}
                    className="w-10 h-10 rounded-xl bg-stone-850 hover:bg-stone-800 text-stone-300 flex items-center justify-center transition-colors cursor-pointer"
                    title="Restart from beginning"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>

                {/* Speed & Audio Attributes */}
                <div className="flex items-center justify-between pt-4 border-t border-white/10 text-xs">
                  <div className="flex items-center gap-1.5 text-stone-400 font-bold">
                    <span>Speed:</span>
                    {[0.75, 1.0, 1.25].map((rate) => (
                      <button
                        key={rate}
                        onClick={() => setPlaybackRate(rate)}
                        className={`px-2 py-0.5 rounded-lg text-[11px] font-bold ${
                          playbackRate === rate
                            ? 'bg-amber-500 text-stone-950 font-black'
                            : 'bg-stone-850 text-stone-400 hover:text-white'
                        }`}
                      >
                        {rate}x
                      </button>
                    ))}
                  </div>

                  {selectedSong.bpm && (
                    <div className="flex items-center gap-2 text-stone-400 text-[11px]">
                      <span className="bg-stone-850 px-2 py-0.5 rounded border border-white/5">
                        {selectedSong.bpm} BPM
                      </span>
                      <span className="bg-stone-850 px-2 py-0.5 rounded border border-white/5">
                        {selectedSong.scale || 'Indic Major'}
                      </span>
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* User Uploaded Songs from Database - Height matches right column with smooth scroll */}
            <div className={`bg-stone-900/80 border border-white/10 rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col justify-between ${
              selectedSong ? 'h-[280px]' : 'h-[600px]'
            }`}>
              {/* Header */}
              <div className="flex items-center justify-between pb-3.5 border-b border-white/10 shrink-0">
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                  <Music className="w-3.5 h-3.5 text-rose-400" />
                  <span>{language === 'en' ? `Your Uploaded Songs (${userSongs.length})` : language === 'hi' ? `आपके अपलोड किए गए गाने (${userSongs.length})` : `Aapke Upload Kiye Gaane (${userSongs.length})`}</span>
                </h3>
                <span className="text-[10px] text-amber-400 font-bold bg-amber-500/15 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                  {language === 'en' ? 'Music Vault' : language === 'hi' ? 'म्यूजिक वॉल्ट' : 'Music Vault'}
                </span>
              </div>

              {/* Scrollable Song List - If count increases, scrolls inside the box */}
              {userSongs.length > 0 ? (
                <div className="space-y-2.5 overflow-y-auto pr-1 flex-1 min-h-0 py-3 scrollbar-thin scrollbar-thumb-stone-700">
                  {userSongs.map((song) => {
                    const isCur = (selectedSong?._id || selectedSong?.id) === (song._id || song.id);
                    return (
                      <div
                        key={song._id || song.id}
                        className={`w-full text-left p-3 rounded-2xl flex items-center justify-between gap-3 transition-all ${
                          isCur
                            ? 'bg-amber-500/20 border-2 border-amber-500/60 text-white shadow-glow-amber'
                            : 'bg-stone-950/60 hover:bg-stone-850 border border-white/5 text-stone-300'
                        }`}
                      >
                        <button
                          onClick={() => handleSelectSong(song)}
                          className="flex items-center gap-3 min-w-0 flex-1 text-left cursor-pointer"
                        >
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${isCur ? 'bg-amber-500 text-stone-950 font-black' : 'bg-stone-800 text-amber-400'}`}>
                            {isCur && isPlaying ? (
                              <Disc3 className="w-4 h-4 animate-spin text-stone-950" />
                            ) : (
                              <Play className="w-4 h-4 fill-current" />
                            )}
                          </div>
                          <div className="truncate">
                            <p className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                              {song.youtubeId && <Youtube className="w-3.5 h-3.5 text-red-500 shrink-0" />}
                              <span className="truncate">{song.title}</span>
                            </p>
                            <p className="text-[11px] text-stone-400 truncate">
                              {song.youtubeId ? (song.artist || 'YouTube Stream') : (song.originalFileName || song.artist || 'आपका गाना')}
                            </p>
                          </div>
                        </button>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[11px] font-mono text-stone-400">
                            {formatTime(song.duration)}
                          </span>
                          <button
                            onClick={() => handleDeleteUserSong(song._id || song.id)}
                            className="p-1.5 text-stone-500 hover:text-rose-400 rounded-lg hover:bg-stone-800 transition-colors cursor-pointer"
                            title="गाना हटाएं"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-2">
                  <Music className="w-10 h-10 text-stone-600 mb-1" />
                  <p className="text-xs font-bold text-stone-400">No uploaded tracks yet</p>
                  <p className="text-[11px] text-stone-500 max-w-xs">Upload a song file to save it to your private vault.</p>
                </div>
              )}

              {/* Bottom Quick Upload Strip */}
              <div className="pt-3 border-t border-white/10 shrink-0">
                <label className="w-full py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-dashed border-white/20 hover:border-amber-400/50 text-stone-300 hover:text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.99]">
                  <Upload className="w-4 h-4 text-amber-400" />
                  <span>{language === 'hi' ? '+ नया गाना अपलोड करें' : '+ Upload New Song'}</span>
                  <input
                    type="file"
                    accept="audio/*,video/*"
                    onChange={handleFileUpload}
                    disabled={isProcessing}
                    className="hidden"
                  />
                </label>
              </div>
            </div>



          </div>

          {/* RIGHT COLUMN: Synced Interactive Karaoke Sheet (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* Sheet Control Bar (Script Switcher & Auto-scroll) */}
            <div ref={rightControlBarRef} className="bg-stone-900/80 border border-white/10 rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-3 shadow-lg shrink-0">
              
              {/* Lyrics Language Mode */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-stone-400">
                  {language === 'hi' ? 'बोल की भाषा:' : language === 'hinglish' ? 'Lyrics Bhasha:' : 'Lyrics Language:'}
                </span>
                <div className="flex items-center bg-stone-950 border border-white/10 rounded-xl p-0.5 text-xs">
                  <button
                    onClick={() => setLanguage('hinglish')}
                    className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                      language === 'hinglish' ? 'bg-amber-500 text-stone-950 font-black shadow-sm' : 'text-stone-400 hover:text-white'
                    }`}
                  >
                    Hinglish
                  </button>
                  <button
                    onClick={() => setLanguage('hi')}
                    className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                      language === 'hi' ? 'bg-amber-500 text-stone-950 font-black shadow-sm' : 'text-stone-400 hover:text-white'
                    }`}
                  >
                    हिन्दी
                  </button>
                  <button
                    onClick={() => setLanguage('en')}
                    className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                      language === 'en' ? 'bg-amber-500 text-stone-950 font-black shadow-sm' : 'text-stone-400 hover:text-white'
                    }`}
                  >
                    English
                  </button>
                </div>
              </div>

              {/* Auto Scroll Toggle */}
              <label className="flex items-center gap-2 text-xs text-stone-400 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={autoScroll}
                  onChange={(e) => setAutoScroll(e.target.checked)}
                  className="accent-amber-500 rounded"
                />
                <span>{language === 'hi' ? 'गायन के साथ स्वतः स्क्रॉल' : 'Auto-follow singing'}</span>
              </label>

            </div>

            {/* Karaoke Lyric Lines Container */}
            <div
              ref={lyricContainerRef}
              style={
                lyricsContainerHeight
                  ? { height: `${lyricsContainerHeight}px`, maxHeight: `${lyricsContainerHeight}px` }
                  : undefined
              }
              className={`bg-stone-900/90 border border-white/10 rounded-3xl p-6 sm:p-8 space-y-4 overflow-y-auto scroll-smooth shadow-2xl relative flex flex-col ${
                !lyricsContainerHeight ? (selectedSong ? 'min-h-[628px]' : 'min-h-[534px]') : ''
              }`}
            >
              {selectedSong?.lyrics?.length > 0 ? (
                selectedSong.lyrics.map((line, idx) => {
                  const isActive = activeLineIndex === idx;

                  return (
                    <div
                      key={line.id || idx}
                      ref={isActive ? activeLyricRef : null}
                      onClick={() => handleSeek(line.time)}
                      className={`p-4 sm:p-5 rounded-2xl transition-all duration-300 cursor-pointer border group relative ${
                        isActive
                          ? 'bg-gradient-to-r from-amber-500/25 via-rose-500/20 to-stone-900 border-amber-500/70 shadow-glow-amber scale-[1.02]'
                          : 'bg-stone-950/40 hover:bg-stone-850/60 border-white/5 opacity-80 hover:opacity-100'
                      }`}
                    >
                      {/* Active Indicator Pillar */}
                      {isActive && (
                        <div className="absolute left-0 top-3 bottom-3 w-1.5 rounded-r bg-gradient-to-b from-amber-400 to-rose-500 animate-pulse"></div>
                      )}

                      {/* Line Header: Timestamp + Section Badge + Timbre Voice Readout */}
                      <div className="flex items-center justify-between text-xs mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`font-mono text-[11px] px-2 py-0.5 rounded ${isActive ? 'bg-amber-500 text-stone-950 font-black' : 'bg-stone-850 text-stone-400'}`}>
                            {formatTime(line.time)}
                          </span>
                          {line.section && (
                            <span className="text-[10px] uppercase font-bold text-stone-500">
                              {line.section}
                            </span>
                          )}
                        </div>

                        {/* Read line with Gnani Timbre */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSpeakActiveLine(line);
                          }}
                          className="opacity-0 group-hover:opacity-100 px-2 py-1 rounded bg-stone-850 hover:bg-stone-800 text-amber-400 text-[10px] font-bold flex items-center gap-1 transition-opacity cursor-pointer"
                          title="Speak this line with Timbre"
                        >
                          <Volume2 className="w-3 h-3" />
                          <span>Timbre Voice</span>
                        </button>
                      </div>

                      {/* Single Clean Lyric Rendering Strictly in Selected Language */}
                      {line.isMusic ? (
                        <div className="py-1 flex items-center gap-3">
                          <div className={`p-2 rounded-xl transition-all ${
                            isActive ? 'bg-amber-500/20 text-amber-400' : 'bg-stone-850/80 text-stone-500'
                          }`}>
                            <Music className={`w-5 h-5 ${isActive ? 'animate-bounce text-amber-400' : ''}`} />
                          </div>
                          <div className="flex-1">
                            <p className={`font-bold text-sm sm:text-base ${
                              isActive ? 'text-amber-300 drop-shadow' : 'text-stone-400'
                            }`}>
                              {getLineText(line)}
                            </p>
                            {isActive && (
                              <div className="flex items-center gap-2 mt-1 text-xs text-rose-400 font-mono">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                                <span>{language === 'en' ? 'Instrumental Break • Vocals resume shortly...' : language === 'hi' ? 'वाद्य संगीत चालू है • बोल जल्द आ रहे हैं...' : 'Instrumental music break • Bol jald aa rahe hain...'}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="pl-2 py-0.5">
                          <p className={`text-base sm:text-xl font-bold leading-relaxed tracking-wide transition-colors ${
                            isActive ? 'text-amber-300 drop-shadow font-extrabold scale-[1.01]' : 'text-white/90 group-hover:text-white'
                          }`}>
                            {getLineText(line)}
                          </p>
                        </div>
                      )}

                    </div>
                  );
                })
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center py-16 text-center text-stone-500 space-y-2">
                  <Music className="w-10 h-10 mx-auto opacity-30 text-stone-400 mb-1" />
                  <p className="text-sm font-medium text-stone-400">No lyrics loaded</p>
                  <p className="text-xs text-stone-500">Lyrics will appear here when an audio track is played or uploaded.</p>
                </div>
              )}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
