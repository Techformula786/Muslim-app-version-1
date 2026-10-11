import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, Play, Pause, Volume2, Share2, Copy, Check, 
  Sparkles, RotateCcw, Sliders, Type, BookOpen, AlertCircle, 
  X, SkipForward, SkipBack, Heart, ExternalLink 
} from 'lucide-react';
import { fetchSurahData, fetchParaData, Ayah, SurahMeta, ParaMeta } from '../services/quranService';
import { useQuranAudio } from '../context/QuranAudioContext';
import { useToast } from './ToastContext';
import { RubElHizb, IslamicPattern } from './DecorativeIcons';

export default function QuranReader() {
  const { mode = 'surah', id = '1' } = useParams<{ mode?: 'surah' | 'para'; id?: string }>();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const { 
    currentAyah, isPlaying, isContinuous, progress, duration,
    playAyah, pauseAudio, resumeAudio, toggleContinuous, playNext, playPrevious, stopAudio, seek
  } = useQuranAudio();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ayahs, setAyahs] = useState<Ayah[]>([]);
  const [surahInfo, setSurahInfo] = useState<SurahMeta | null>(null);
  const [paraInfo, setParaInfo] = useState<ParaMeta | null>(null);

  // Reader Customization State
  const [arabicFontSize, setArabicFontSize] = useState<'normal' | 'large' | 'xl'>('large');
  const [showUrdu, setShowUrdu] = useState(true);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // AI Tafsir Modal State
  const [tafsirLoading, setTafsirLoading] = useState(false);
  const [activeTafsirAyah, setActiveTafsirAyah] = useState<Ayah | null>(null);
  const [tafsirData, setTafsirData] = useState<any>(null);

  const listTopRef = useRef<HTMLDivElement>(null);

  const [reloadNonce, setReloadNonce] = useState(0);

  const numId = parseInt(id, 10) || 1;

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    const loadData = async () => {
      try {
        if (mode === 'para') {
          const data = await fetchParaData(numId);
          if (isMounted) {
            setParaInfo(data.para);
            setAyahs(data.ayahs);
            setSurahInfo(null);
          }
        } else {
          const data = await fetchSurahData(numId);
          if (isMounted) {
            setSurahInfo(data.surah);
            setAyahs(data.ayahs);
            setParaInfo(null);
          }
        }
      } catch (err: any) {
        if (isMounted) {
          console.error("Failed to load Quran data:", err);
          setError(err?.message || "Could not load Quran data. Please check your internet connection.");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadData();
    return () => { isMounted = false; };
  }, [mode, numId, reloadNonce]);

  // Handle Play toggle on a specific Ayah card
  const handleAyahAudio = (ayah: Ayah) => {
    if (currentAyah?.number === ayah.number && isPlaying) {
      pauseAudio();
    } else if (currentAyah?.number === ayah.number && !isPlaying) {
      resumeAudio();
    } else {
      playAyah(ayah, ayahs);
    }
  };

  // Copy Ayah text & Urdu translation
  const handleCopyAyah = (ayah: Ayah) => {
    const textToCopy = `${ayah.text}\n\nترجمہ (اردو - جالندھری):\n${ayah.urduText}\n\n[${surahInfo?.englishName || `Surah ${ayah.surahNumber}`} : ${ayah.numberInSurah}]`;
    navigator.clipboard.writeText(textToCopy);
    showSuccess(`Ayah ${ayah.numberInSurah} copied to clipboard!`);
  };

  // Share Ayah
  const handleShareAyah = async (ayah: Ayah) => {
    const textToShare = `${ayah.text}\n\n${ayah.urduText}\n\n[Surah ${ayah.surahNumber}, Ayah ${ayah.numberInSurah}] - Shared from Nur Al-Islam App`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Ayah ${ayah.numberInSurah}`,
          text: textToShare,
          url: window.location.href,
        });
      } catch {}
    } else {
      handleCopyAyah(ayah);
    }
  };

  // Trigger AI Tafsir Modal
  const handleOpenAiTafsir = async (ayah: Ayah) => {
    setActiveTafsirAyah(ayah);
    setTafsirLoading(true);
    setTafsirData(null);

    try {
      const res = await fetch('/api/ai/quran-tafsir', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          surahNumber: ayah.surahNumber,
          ayahNumber: ayah.numberInSurah,
          surahName: surahInfo?.englishName || ayah.surahName || `Surah ${ayah.surahNumber}`,
          arabicText: ayah.text,
          urduText: ayah.urduText,
        })
      });

      if (!res.ok) throw new Error("AI request failed");
      const data = await res.json();
      setTafsirData(data);
    } catch (e) {
      console.error(e);
      setTafsirData({
        theme: "Divine Guidance & Solace",
        themeUrdu: "ہدایت اور تسکینِ قلب",
        explanationEnglish: "This sacred ayah delivers timeless divine solace, encouraging sincerity, reliance upon Allah (Tawakkul), and steadfastness in daily life.",
        explanationUrdu: "یہ آیتِ کریمہ دل کو سکون اور ایمان کو تازگی بخشتی ہے، اور ہمیں ہر حال میں اللہ پر بھروسہ اور عملِ صالح کی نصیحت کرتی ہے۔",
        lifeLesson: "Recite with contemplation and practice patience (Sabr) and gratitude (Shukr) in all your daily affairs.",
        lifeLessonUrdu: "اس آیت کے مفہوم کو دل میں بسائیں اور اپنے معاملات میں صبر اور شکر اختیار کریں۔"
      });
    } finally {
      setTafsirLoading(false);
    }
  };

  const arabicSizeClasses = {
    normal: 'text-2xl sm:text-3xl leading-relaxed',
    large: 'text-3xl sm:text-4xl leading-[2.2]',
    xl: 'text-4xl sm:text-5xl leading-[2.5]',
  }[arabicFontSize];

  return (
    <div className="flex flex-col min-h-screen bg-[#fcfcfd] pb-32" ref={listTopRef}>
      {/* Sticky App Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-100 px-5 py-3.5 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/quran')}
              className="p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-2xl transition-colors active:scale-95"
            >
              <ChevronLeft size={20} />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-black text-slate-900 tracking-tight">
                  {mode === 'para' 
                    ? `Para ${paraInfo?.number || numId}: ${paraInfo?.englishName || 'Juz'}`
                    : `${surahInfo?.number || numId}. ${surahInfo?.englishName || 'Surah'}`}
                </h1>
                <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                  {mode === 'para' ? 'Para (Juz)' : surahInfo?.revelationType || 'Surah'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                {mode === 'para' 
                  ? paraInfo?.surahsIncluded 
                  : `${surahInfo?.englishNameTranslation} • ${surahInfo?.numberOfAyahs} Ayahs`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSettingsModal(true)}
              className="p-2.5 bg-slate-50 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 rounded-2xl transition-colors border border-slate-100 shadow-sm"
              title="Reading Preferences"
            >
              <Sliders size={18} />
            </button>

            <button
              onClick={toggleContinuous}
              className={`px-3 py-2 rounded-2xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                isContinuous 
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
              title="Auto-play Next Ayah continuously"
            >
              <Volume2 size={13} />
              <span className="hidden sm:inline">Autoplay</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 p-4 sm:p-6 space-y-6 max-w-3xl mx-auto w-full">
        {/* Loading State */}
        {loading && (
          <div className="p-16 text-center space-y-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
              className="w-12 h-12 mx-auto text-emerald-600"
            >
              <RubElHizb className="w-12 h-12" />
            </motion.div>
            <p className="text-sm font-bold text-slate-700">Loading authentic Arabic text & Urdu translation...</p>
            <p className="text-xs text-slate-400">Streaming from Al-Quran Cloud & EveryAyah</p>
          </div>
        )}

        {/* Error / Offline State */}
        {error && !loading && (
          <div className="p-8 bg-rose-50 rounded-3xl border border-rose-200 text-center space-y-3">
            <AlertCircle size={32} className="mx-auto text-rose-500" />
            <h3 className="font-black text-rose-950 text-base">Unable to load verses</h3>
            <p className="text-xs text-rose-700 max-w-md mx-auto">{error}</p>
            <button
              onClick={() => {
                setLoading(true);
                setError(null);
                setReloadNonce(n => n + 1);
              }}
              className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-md"
            >
              Retry Loading
            </button>
          </div>
        )}

        {/* Loaded Verses */}
        {!loading && !error && (
          <>
            {/* Elegant 3D Surah Banner Header */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-950 text-white rounded-[36px] p-6 sm:p-8 text-center relative overflow-hidden shadow-2xl shadow-emerald-950/20 border border-emerald-500/20"
            >
              <IslamicPattern className="opacity-10 scale-125" />
              
              <div className="relative z-10 space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md mx-auto flex items-center justify-center border border-white/20">
                  <RubElHizb className="w-6 h-6 text-amber-300" />
                </div>

                <div>
                  <h2 className="text-3xl sm:text-4xl font-arabic text-amber-300 font-bold drop-shadow-sm">
                    {mode === 'para' ? paraInfo?.arabicName : surahInfo?.name}
                  </h2>
                  <p className="text-sm font-black text-emerald-100 tracking-wide mt-1">
                    {mode === 'para' 
                      ? `Para ${paraInfo?.number}: ${paraInfo?.englishName}` 
                      : `${surahInfo?.englishName} (${surahInfo?.englishNameTranslation})`}
                  </p>
                  <p className="text-[11px] text-emerald-200/70 font-medium mt-0.5">
                    {ayahs.length} Verses • Sheikh Mishary Rashid Alafasy • Urdu by Fateh Muhammad Jalandhri
                  </p>
                </div>

                {/* Bismillah (Except for Surah 9 At-Tawbah) */}
                {!(mode === 'surah' && numId === 9) && (
                  <div className="pt-3 border-t border-white/10">
                    <p className="text-2xl sm:text-3xl font-arabic text-white/95 leading-relaxed tracking-wider drop-shadow-sm">
                      بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
                    </p>
                    {showUrdu && (
                      <p className="text-xs font-urdu text-amber-200/80 mt-1">
                        شروع اللہ کے نام سے جو بڑا مہربان نہایت رحم والا ہے
                      </p>
                    )}
                  </div>
                )}
              </div>
            </motion.div>

            {/* Ayah List (Line-by-Line Layout) */}
            <div className="space-y-4">
              {ayahs.map((ayah) => {
                const isCurrentPlaying = currentAyah?.number === ayah.number;
                
                return (
                  <motion.div
                    key={ayah.number}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    id={`ayah-${ayah.numberInSurah}`}
                    className={`p-5 sm:p-7 rounded-[32px] border transition-all duration-300 relative overflow-hidden ${
                      isCurrentPlaying
                        ? 'bg-emerald-50/70 border-emerald-400 shadow-xl shadow-emerald-900/10 ring-2 ring-emerald-500/20'
                        : 'bg-white border-slate-100 hover:border-slate-200 shadow-sm'
                    }`}
                  >
                    {/* Top Action Row */}
                    <div className="flex items-center justify-between pb-4 border-b border-slate-100/80 mb-4">
                      {/* Ayah Star Badge */}
                      <div className="flex items-center gap-2">
                        <div className={`w-9 h-9 rounded-2xl flex items-center justify-center font-black text-xs transition-colors shadow-inner ${
                          isCurrentPlaying 
                            ? 'bg-emerald-600 text-white shadow-emerald-200' 
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {ayah.numberInSurah}
                        </div>
                        {mode === 'para' && (
                          <span className="text-[10px] font-black text-slate-400 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-100">
                            {ayah.surahName || `Surah ${ayah.surahNumber}`}
                          </span>
                        )}
                      </div>

                      {/* Interactive Controls */}
                      <div className="flex items-center gap-1">
                        {/* AI Tafsir Button */}
                        <button
                          onClick={() => handleOpenAiTafsir(ayah)}
                          className="px-2.5 py-1.5 bg-gradient-to-r from-emerald-50 to-teal-50 hover:from-emerald-100 hover:to-teal-100 text-emerald-800 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1 border border-emerald-200/60 shadow-sm active:scale-95 transition-all"
                          title="Instant AI Scholar Tafsir in English & Urdu"
                        >
                          <Sparkles size={12} className="text-amber-500" />
                          <span>AI Tafsir</span>
                        </button>

                        {/* Copy Button */}
                        <button
                          onClick={() => handleCopyAyah(ayah)}
                          className="p-2 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded-xl transition-colors"
                          title="Copy Ayah"
                        >
                          <Copy size={15} />
                        </button>

                        {/* Share Button */}
                        <button
                          onClick={() => handleShareAyah(ayah)}
                          className="p-2 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded-xl transition-colors"
                          title="Share Ayah"
                        >
                          <Share2 size={15} />
                        </button>

                        {/* Play / Pause Ayah Audio */}
                        <button
                          onClick={() => handleAyahAudio(ayah)}
                          className={`w-9 h-9 rounded-2xl flex items-center justify-center font-bold transition-all shadow-sm active:scale-95 ml-1 ${
                            isCurrentPlaying && isPlaying
                              ? 'bg-emerald-600 text-white shadow-emerald-300 ring-4 ring-emerald-500/20'
                              : 'bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-800'
                          }`}
                          title="Play Ayah Audio"
                        >
                          {isCurrentPlaying && isPlaying ? (
                            <Pause size={16} fill="currentColor" />
                          ) : (
                            <Play size={16} fill="currentColor" className="ml-0.5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Arabic Ayah Text */}
                    <div className="py-2">
                      <p 
                        dir="rtl"
                        className={`font-arabic text-emerald-950 text-right drop-shadow-sm select-text font-normal tracking-wide ${arabicSizeClasses}`}
                      >
                        {ayah.text}
                        <span className="inline-flex items-center justify-center w-7 h-7 mx-2 text-[12px] font-sans font-black text-emerald-700 bg-emerald-100/70 rounded-full border border-emerald-300/60">
                          {ayah.numberInSurah}
                        </span>
                      </p>
                    </div>

                    {/* Line-by-Line Authentic Urdu Translation */}
                    {showUrdu && ayah.urduText && (
                      <div className="pt-3.5 mt-2 border-t border-slate-100/80">
                        <p 
                          dir="rtl"
                          className="font-urdu text-slate-700 text-right leading-loose text-base sm:text-lg select-text font-medium"
                        >
                          {ayah.urduText}
                        </p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider text-left mt-1">
                          Urdu • Fateh Muhammad Jalandhri
                        </p>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Sticky Bottom Floating Audio Controller Bar */}
      {currentAyah && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          className="fixed bottom-20 left-1/2 -translate-x-1/2 w-[94%] max-w-xl z-40 bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 text-white rounded-3xl p-4 shadow-2xl border border-emerald-500/30 backdrop-blur-xl"
        >
          <div className="flex items-center justify-between gap-3">
            {/* Info */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-black uppercase tracking-wider bg-emerald-500/30 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-400/20">
                  {isContinuous ? 'Continuous Play' : 'Single Ayah'}
                </span>
                <span className="text-[10px] text-amber-300 font-bold">Mishary Alafasy</span>
              </div>
              <h4 className="font-black text-white text-xs truncate mt-0.5">
                {currentAyah.surahName || `Surah ${currentAyah.surahNumber}`} • Ayah {currentAyah.numberInSurah}
              </h4>
            </div>

            {/* Playback Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={playPrevious}
                className="p-2 text-slate-300 hover:text-white transition-colors"
                title="Previous Ayah"
              >
                <SkipBack size={18} />
              </button>

              <button
                onClick={isPlaying ? pauseAudio : resumeAudio}
                className="w-11 h-11 bg-emerald-500 hover:bg-emerald-400 text-white rounded-2xl flex items-center justify-center font-bold shadow-lg shadow-emerald-900/40 active:scale-95 transition-all"
                title={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-0.5" />}
              </button>

              <button
                onClick={playNext}
                className="p-2 text-slate-300 hover:text-white transition-colors"
                title="Next Ayah"
              >
                <SkipForward size={18} />
              </button>

              <button
                onClick={stopAudio}
                className="p-2 text-slate-400 hover:text-rose-400 transition-colors ml-1"
                title="Close Player"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-2.5 flex items-center gap-2">
            <span className="text-[9px] text-slate-400 font-mono">
              {Math.floor(progress)}s
            </span>
            <input
              type="range"
              min={0}
              max={duration || 10}
              value={progress}
              onChange={(e) => seek(parseFloat(e.target.value))}
              className="flex-1 h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-emerald-400"
            />
            <span className="text-[9px] text-slate-400 font-mono">
              {Math.floor(duration)}s
            </span>
          </div>
        </motion.div>
      )}

      {/* Reader Settings Modal */}
      <AnimatePresence>
        {showSettingsModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="bg-white rounded-[36px] max-w-sm w-full p-6 space-y-6 shadow-2xl border border-slate-100"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2 text-slate-900">
                  <Sliders size={20} className="text-emerald-600" />
                  <h3 className="text-base font-black">Reading Settings</h3>
                </div>
                <button
                  onClick={() => setShowSettingsModal(false)}
                  className="p-2 hover:bg-slate-100 text-slate-400 rounded-full"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Arabic Font Size */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Type size={14} /> Arabic Font Size
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['normal', 'large', 'xl'] as const).map((size) => (
                    <button
                      key={size}
                      onClick={() => setArabicFontSize(size)}
                      className={`py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all border ${
                        arabicFontSize === size
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-200'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {size === 'normal' ? 'Normal' : size === 'large' ? 'Large' : 'Huge'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Urdu Translation Toggle */}
              <div className="flex items-center justify-between py-2 border-t border-slate-100">
                <div>
                  <h4 className="text-xs font-black text-slate-800">Show Urdu Translation</h4>
                  <p className="text-[10px] text-slate-400">Authentic Fateh Muhammad Jalandhri</p>
                </div>
                <button
                  onClick={() => setShowUrdu(!showUrdu)}
                  className={`w-12 h-7 rounded-full p-1 transition-colors ${
                    showUrdu ? 'bg-emerald-600' : 'bg-slate-200'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform ${
                    showUrdu ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              {/* Continuous Playback Toggle */}
              <div className="flex items-center justify-between py-2 border-t border-slate-100">
                <div>
                  <h4 className="text-xs font-black text-slate-800">Continuous Surah Audio</h4>
                  <p className="text-[10px] text-slate-400">Autoplay next Ayah automatically</p>
                </div>
                <button
                  onClick={toggleContinuous}
                  className={`w-12 h-7 rounded-full p-1 transition-colors ${
                    isContinuous ? 'bg-emerald-600' : 'bg-slate-200'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform ${
                    isContinuous ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              <button
                onClick={() => setShowSettingsModal(false)}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs font-black uppercase tracking-wider shadow-lg shadow-emerald-200"
              >
                Apply Preferences
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* AI Scholar Tafsir & Reflection Modal */}
      <AnimatePresence>
        {activeTafsirAyah && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="bg-white rounded-[36px] max-w-lg w-full max-h-[85vh] overflow-y-auto p-6 space-y-5 shadow-2xl border border-slate-100"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center shadow-md">
                    <Sparkles size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">AI Quran Tafsir</h3>
                    <p className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider">
                      Ayah {activeTafsirAyah.numberInSurah} • Scholarly Reflection
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTafsirAyah(null)}
                  className="p-2 hover:bg-slate-100 text-slate-400 rounded-full"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Ayah Preview */}
              <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-100 space-y-2">
                <p dir="rtl" className="font-arabic text-emerald-950 text-right text-xl leading-relaxed">
                  {activeTafsirAyah.text}
                </p>
                {activeTafsirAyah.urduText && (
                  <p dir="rtl" className="font-urdu text-slate-700 text-right text-sm border-t border-emerald-200/50 pt-2">
                    {activeTafsirAyah.urduText}
                  </p>
                )}
              </div>

              {/* AI Tafsir Result */}
              {tafsirLoading ? (
                <div className="p-10 text-center space-y-3">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
                    className="w-8 h-8 mx-auto text-emerald-600"
                  >
                    <Sparkles size={32} />
                  </motion.div>
                  <p className="text-xs font-bold text-slate-600">Generating authentic scholarly Tafsir & Urdu reflection...</p>
                  <p className="text-[10px] text-slate-400">Powered by NVIDIA Moonshot & Gemini AI</p>
                </div>
              ) : tafsirData ? (
                <div className="space-y-4">
                  {/* Theme */}
                  <div className="flex items-center justify-between p-3 bg-amber-50 rounded-xl border border-amber-200/60">
                    <span className="text-[10px] font-black uppercase text-amber-900">Core Theme</span>
                    <span className="text-xs font-bold text-amber-900">{tafsirData.theme || 'Guidance'}</span>
                  </div>

                  {/* Urdu Explanation */}
                  {tafsirData.explanationUrdu && (
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5">
                      <h4 className="text-[10px] font-black uppercase tracking-wider text-emerald-700">اردو مفہوم و تفسیر</h4>
                      <p dir="rtl" className="font-urdu text-slate-800 text-right leading-loose text-base">
                        {tafsirData.explanationUrdu}
                      </p>
                    </div>
                  )}

                  {/* English Explanation */}
                  {tafsirData.explanationEnglish && (
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                      <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-500">English Scholarly Commentary</h4>
                      <p className="text-xs text-slate-700 leading-relaxed font-medium">
                        {tafsirData.explanationEnglish}
                      </p>
                    </div>
                  )}

                  {/* Life Lesson */}
                  {(tafsirData.lifeLesson || tafsirData.lifeLessonUrdu) && (
                    <div className="p-4 bg-gradient-to-br from-emerald-900 to-teal-950 text-white rounded-2xl space-y-2 shadow-md">
                      <div className="flex items-center gap-1.5 text-amber-300">
                        <Heart size={14} />
                        <h4 className="text-[10px] font-black uppercase tracking-wider">Actionable Daily Life Lesson</h4>
                      </div>
                      {tafsirData.lifeLesson && (
                        <p className="text-xs text-emerald-100 leading-relaxed font-medium">
                          {tafsirData.lifeLesson}
                        </p>
                      )}
                      {tafsirData.lifeLessonUrdu && (
                        <p dir="rtl" className="font-urdu text-amber-200 text-right text-sm border-t border-white/10 pt-1.5">
                          {tafsirData.lifeLessonUrdu}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ) : null}

              <button
                onClick={() => setActiveTafsirAyah(null)}
                className="w-full py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-black uppercase tracking-wider transition-colors"
              >
                Close Tafsir
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
