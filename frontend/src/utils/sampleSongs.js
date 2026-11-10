// Synchronized Curated Indian Songs with exact vocal and instrumental music timing
// Built for Aapan AI Music to Lyrics Studio
import { YOUTUBE_MASTER_SONG_CATALOG } from './youtubeLyricsExtractor.js';

export const DEFAULT_SAMPLE_SONGS = YOUTUBE_MASTER_SONG_CATALOG.map((song) => {
  const ytId = song.youtubeId || (song.ids && song.ids[0]) || song.id;
  const localPoster = ['kesariya', 'samjhawan', 'chaleya', 'apna-bana-le', 'kabira', 'raataan-lambiyan', 'tum-hi-ho', 'jai-ho'].includes(song.id)
    ? `/posters/${song.id}.svg`
    : (song.thumbnailUrl || `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`);
  return {
    id: song.id || ytId,
    title: song.title,
    movie: song.movie || 'Indic Masterwork',
    artist: song.artist,
    audioUrl: song.audioUrl || '',
    youtubeId: ytId,
    youtubeUrl: song.youtubeUrl || `https://www.youtube.com/watch?v=${ytId}`,
    thumbnailUrl: localPoster,
    posterUrl: localPoster,
    duration: song.duration,
    bpm: song.bpm,
    mood: song.mood,
    coverGradient: song.coverGradient || 'from-amber-500 to-rose-600',
    lyrics: song.lyrics
  };
});

export const sampleSongs = DEFAULT_SAMPLE_SONGS;
export default DEFAULT_SAMPLE_SONGS;
