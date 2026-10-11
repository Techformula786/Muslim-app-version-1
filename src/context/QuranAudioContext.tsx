import React, { createContext, useContext, useState, useRef, useEffect, ReactNode, useCallback } from 'react';
import { Ayah, getEveryAyahAudioUrl, fetchSurahData } from '../services/quranService';

interface QuranAudioContextType {
  currentAyah: Ayah | null;
  isPlaying: boolean;
  isContinuous: boolean;
  progress: number;
  duration: number;
  playAyah: (ayah: Ayah, playlist?: Ayah[]) => void;
  pauseAudio: () => void;
  resumeAudio: () => void;
  toggleContinuous: () => void;
  playNext: () => void;
  playPrevious: () => void;
  stopAudio: () => void;
  seek: (seconds: number) => void;
}

const QuranAudioContext = createContext<QuranAudioContextType | undefined>(undefined);

export function QuranAudioProvider({ children }: { children: ReactNode }) {
  const [currentAyah, setCurrentAyah] = useState<Ayah | null>(null);
  const [playlist, setPlaylist] = useState<Ayah[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isContinuous, setIsContinuous] = useState(true);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  // Single persistent Audio instance and ref
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playPromiseRef = useRef<Promise<void> | null>(null);

  // Keep references to state in refs for stable audio callbacks
  const currentAyahRef = useRef<Ayah | null>(null);
  currentAyahRef.current = currentAyah;

  const playlistRef = useRef<Ayah[]>([]);
  playlistRef.current = playlist;

  const isContinuousRef = useRef(true);
  isContinuousRef.current = isContinuous;

  // Safe playback helper that prevents "interrupted by pause / remove" error
  const safePlay = useCallback(async (audio: HTMLAudioElement, srcUrl: string, fallbackUrl?: string) => {
    try {
      if (playPromiseRef.current) {
        try {
          await playPromiseRef.current;
        } catch {
          // Ignore previous abort/pause errors
        }
      }

      audio.pause();
      audio.src = srcUrl;
      audio.currentTime = 0;

      const promise = audio.play();
      playPromiseRef.current = promise;
      await promise;
      setIsPlaying(true);
    } catch (err: any) {
      if (err?.name === 'AbortError' || err?.message?.includes('interrupted')) {
        return;
      }

      if (fallbackUrl && audio.src !== fallbackUrl) {
        console.warn("Audio primary stream failed, trying CDN fallback...", err);
        try {
          audio.src = fallbackUrl;
          const fbPromise = audio.play();
          playPromiseRef.current = fbPromise;
          await fbPromise;
          setIsPlaying(true);
        } catch (fbErr: any) {
          if (fbErr?.name !== 'AbortError') {
            console.error("Audio fallback playback failed:", fbErr);
            setIsPlaying(false);
          }
        }
      } else {
        console.warn("Audio playback interrupted or failed:", err);
        setIsPlaying(false);
      }
    }
  }, []);

  const playAyah = useCallback((ayah: Ayah, newPlaylist?: Ayah[]) => {
    if (newPlaylist) {
      setPlaylist(newPlaylist);
      playlistRef.current = newPlaylist;
    }
    setCurrentAyah(ayah);
    currentAyahRef.current = ayah;
    setIsPlaying(true);

    if (audioRef.current) {
      const audio = audioRef.current;
      const primaryUrl = ayah.audioUrl || ayah.fallbackAudioUrl || getEveryAyahAudioUrl(ayah.surahNumber, ayah.numberInSurah);
      const fallbackUrl = ayah.fallbackAudioUrl || getEveryAyahAudioUrl(ayah.surahNumber, ayah.numberInSurah);

      safePlay(audio, primaryUrl, fallbackUrl);
    }
  }, [safePlay]);

  // Advance to next Ayah OR advance to Next Surah if current Surah has ended!
  const advanceNext = useCallback(async () => {
    const cur = currentAyahRef.current;
    const list = playlistRef.current;
    if (!cur) return;

    // Check if next Ayah exists in current playlist
    const currentIndex = list.length > 0 ? list.findIndex(a => a.number === cur.number) : -1;
    if (currentIndex !== -1 && currentIndex + 1 < list.length) {
      const nextAyah = list[currentIndex + 1];
      playAyah(nextAyah, list);
      return;
    }

    // If current playlist ended AND continuous playback is on: Load NEXT SURAH automatically!
    if (isContinuousRef.current && cur.surahNumber < 114) {
      const nextSurahNum = cur.surahNumber + 1;
      try {
        console.log(`Surah ${cur.surahNumber} finished. Automatically loading next Surah ${nextSurahNum}...`);
        const nextSurahData = await fetchSurahData(nextSurahNum);
        if (nextSurahData && nextSurahData.ayahs && nextSurahData.ayahs.length > 0) {
          setPlaylist(nextSurahData.ayahs);
          playlistRef.current = nextSurahData.ayahs;
          playAyah(nextSurahData.ayahs[0], nextSurahData.ayahs);
          return;
        }
      } catch (err) {
        console.error("Failed to auto-advance to next Surah:", err);
      }
    }

    setIsPlaying(false);
  }, [playAyah]);

  const advancePrevious = useCallback(() => {
    const cur = currentAyahRef.current;
    const list = playlistRef.current;
    if (!cur || list.length === 0) return;

    const currentIndex = list.findIndex(a => a.number === cur.number);
    if (currentIndex > 0) {
      const prevAyah = list[currentIndex - 1];
      playAyah(prevAyah, list);
    }
  }, [playAyah]);

  const pauseAudio = useCallback(async () => {
    if (audioRef.current) {
      const audio = audioRef.current;
      if (playPromiseRef.current) {
        try {
          await playPromiseRef.current;
        } catch {}
      }
      audio.pause();
      setIsPlaying(false);
    }
  }, []);

  const resumeAudio = useCallback(async () => {
    if (audioRef.current && currentAyahRef.current) {
      const audio = audioRef.current;
      try {
        const p = audio.play();
        playPromiseRef.current = p;
        await p;
        setIsPlaying(true);
      } catch (err: any) {
        if (err?.name !== 'AbortError') {
          console.error("Audio resume failed:", err);
        }
      }
    }
  }, []);

  const toggleContinuous = useCallback(() => {
    setIsContinuous(prev => !prev);
  }, []);

  const stopAudio = useCallback(async () => {
    if (audioRef.current) {
      const audio = audioRef.current;
      if (playPromiseRef.current) {
        try {
          await playPromiseRef.current;
        } catch {}
      }
      audio.pause();
      audio.currentTime = 0;
    }
    setIsPlaying(false);
    setCurrentAyah(null);
    currentAyahRef.current = null;
  }, []);

  const seek = useCallback((seconds: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = seconds;
      setProgress(seconds);
    }
  }, []);

  // Initialize Audio instance ONCE on mount, keep alive for the whole app
  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'auto';
    audioRef.current = audio;

    const handleTimeUpdate = () => {
      setProgress(audio.currentTime);
      setDuration(audio.duration || 0);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(0);
      if (isContinuousRef.current) {
        advanceNext();
      }
    };

    const handleError = () => {
      const cur = currentAyahRef.current;
      if (cur && audio.src !== cur.fallbackAudioUrl) {
        audio.src = cur.fallbackAudioUrl;
        const p = audio.play();
        playPromiseRef.current = p;
        p.then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
      } else {
        setIsPlaying(false);
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.pause();
      audio.src = '';
      audioRef.current = null;
    };
  }, [advanceNext]);

  return (
    <QuranAudioContext.Provider
      value={{
        currentAyah,
        isPlaying,
        isContinuous,
        progress,
        duration,
        playAyah,
        pauseAudio,
        resumeAudio,
        toggleContinuous,
        playNext: advanceNext,
        playPrevious: advancePrevious,
        stopAudio,
        seek,
      }}
    >
      {children}
    </QuranAudioContext.Provider>
  );
}

export function useQuranAudio() {
  const context = useContext(QuranAudioContext);
  if (!context) {
    throw new Error('useQuranAudio must be used within a QuranAudioProvider');
  }
  return context;
}
