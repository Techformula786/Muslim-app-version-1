import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, Search, Sparkles, Volume2, ChevronRight, Bookmark, ArrowRight, Play, Check, Flame, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SURAHS_CATALOG, PARAS_CATALOG, SurahMeta, ParaMeta } from '../services/quranService';
import { RubElHizb, IslamicPattern } from './DecorativeIcons';
import { useQuranAudio } from '../context/QuranAudioContext';

export default function QuranHome() {
  const navigate = useNavigate();
  const { currentAyah, isPlaying, pauseAudio, resumeAudio } = useQuranAudio();
  const [activeTab, setActiveTab] = useState<'surahs' | 'paras'>('surahs');
  const [searchQuery, setSearchQuery] = useState('');

  // Important highlighted surahs for quick hero cards
  const highlightedSurahs = useMemo(() => {
    const importantNumbers = [1, 2, 18, 36, 55, 56, 67, 112];
    return SURAHS_CATALOG.filter(s => importantNumbers.includes(s.number));
  }, []);

  // Filtered Surahs
  const filteredSurahs = useMemo(() => {
    if (!searchQuery.trim()) return SURAHS_CATALOG;
    const q = searchQuery.toLowerCase().trim();
    return SURAHS_CATALOG.filter(s => 
      s.englishName.toLowerCase().includes(q) ||
      s.englishNameTranslation.toLowerCase().includes(q) ||
      s.name.includes(q) ||
      String(s.number).includes(q)
    );
  }, [searchQuery]);

  // Filtered Paras
  const filteredParas = useMemo(() => {
    if (!searchQuery.trim()) return PARAS_CATALOG;
    const q = searchQuery.toLowerCase().trim();
    return PARAS_CATALOG.filter(p => 
      p.englishName.toLowerCase().includes(q) ||
      p.arabicName.includes(q) ||
      p.surahsIncluded.toLowerCase().includes(q) ||
      String(p.number).includes(q)
    );
  }, [searchQuery]);

  return (
    <div className="min-h-full bg-[#f8f9fb] pb-32">
      {/* 3D Motion Graphics Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-950 text-white pt-7 pb-10 px-6 rounded-b-[44px] shadow-2xl shadow-emerald-950/20 border-b border-emerald-500/20">
        <IslamicPattern className="opacity-10 scale-125" />
        
        {/* Glowing 3D Orbs */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 -left-12 w-44 h-44 bg-amber-500/15 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 space-y-5">
          {/* Top Bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.button 
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                onClick={() => navigate('/')} 
                className="w-11 h-11 bg-white/10 hover:bg-white/20 text-white rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/15 transition-all shadow-sm"
                title="Go to Home"
              >
                <ChevronLeft size={22} />
              </motion.button>
              <div className="w-11 h-11 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/15 shadow-inner">
                <RubElHizb className="w-6 h-6 text-amber-300" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-emerald-300/90 flex items-center gap-1.5">
                  <Sparkles size={11} className="text-amber-300" /> Al-Quran Al-Kareem
                </span>
                <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
                  The Holy Quran
                </h1>
              </div>
            </div>

            <div className="text-right">
              <p className="text-xs font-arabic text-amber-200/90 font-bold">القرآن الكريم</p>
              <p className="text-[10px] text-emerald-200/70 font-semibold">Uthmani & Urdu</p>
            </div>
          </div>

          <p className="text-xs text-emerald-100/90 leading-relaxed font-medium max-w-sm">
            Read complete 30 Paras & 114 Surahs with line-by-line authentic Urdu translation and Sheikh Mishary Alafasy audio recitation.
          </p>

          {/* Search Box */}
          <div className="relative">
            <Search size={18} className="text-emerald-300/70 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Surah (e.g. Yaseen, Baqarah) or Para (1-30)..."
              className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl py-3.5 pl-11 pr-4 text-xs font-semibold text-white placeholder-emerald-200/60 focus:outline-none focus:ring-2 focus:ring-amber-300/40 focus:bg-white/15 transition-all shadow-inner"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-emerald-200 hover:text-white bg-white/10 px-2 py-1 rounded-lg"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Floating Audio Bar if Ayah is playing */}
      {currentAyah && (
        <div className="px-5 -mt-5 relative z-20">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 text-white p-3.5 rounded-2xl shadow-xl shadow-amber-900/20 flex items-center justify-between border border-amber-300/30"
          >
            <div className="flex items-center gap-3">
              <button
                onClick={isPlaying ? pauseAudio : resumeAudio}
                className="w-9 h-9 bg-white text-amber-700 rounded-xl flex items-center justify-center font-bold shadow-md hover:scale-105 active:scale-95 transition-transform"
              >
                {isPlaying ? <Volume2 size={18} className="animate-pulse" /> : <Play size={18} fill="currentColor" />}
              </button>
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider text-amber-100">
                  {isPlaying ? 'Currently Reciting' : 'Recitation Paused'}
                </p>
                <p className="text-xs font-black truncate">
                  {currentAyah.surahName || `Surah ${currentAyah.surahNumber}`} : Ayah {currentAyah.numberInSurah}
                </p>
              </div>
            </div>

            <button
              onClick={() => navigate(`/quran/surah/${currentAyah.surahNumber}`)}
              className="px-3 py-1.5 bg-black/20 hover:bg-black/30 rounded-xl text-[11px] font-black uppercase tracking-wider flex items-center gap-1 transition-colors"
            >
              Open <ChevronRight size={14} />
            </button>
          </motion.div>
        </div>
      )}

      {/* Main Tabs Navigation */}
      <div className="px-5 pt-6 space-y-6">
        <div className="grid grid-cols-2 p-1.5 bg-slate-200/70 rounded-2xl border border-slate-300/40">
          <button
            onClick={() => setActiveTab('surahs')}
            className={`py-3 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 ${
              activeTab === 'surahs'
                ? 'bg-white text-emerald-800 shadow-md shadow-slate-300/60 scale-[1.02]'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen size={16} className={activeTab === 'surahs' ? 'text-emerald-600' : 'text-slate-500'} />
            <span>114 Surahs (سُوَر)</span>
          </button>
          <button
            onClick={() => setActiveTab('paras')}
            className={`py-3 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 ${
              activeTab === 'paras'
                ? 'bg-white text-emerald-800 shadow-md shadow-slate-300/60 scale-[1.02]'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <RubElHizb className={`w-4 h-4 ${activeTab === 'paras' ? 'text-emerald-600' : 'text-slate-500'}`} />
            <span>30 Paras (أجزاء)</span>
          </button>
        </div>

        {/* TAB 1: 114 SURAHS */}
        {activeTab === 'surahs' && (
          <div className="space-y-6">
            {/* Special Highlights Section (Only when not searching) */}
            {!searchQuery && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                    <Flame size={14} className="text-amber-500 fill-amber-500" />
                    Important Surahs & Virtues
                  </h3>
                  <span className="text-[10px] text-slate-400 font-bold">Quick Access</span>
                </div>

                <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
                  {highlightedSurahs.map((s) => (
                    <motion.div
                      key={s.number}
                      whileHover={{ y: -3, scale: 1.03 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => navigate(`/quran/surah/${s.number}`)}
                      className="min-w-[190px] max-w-[210px] bg-white rounded-3xl p-4 border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between shrink-0 relative overflow-hidden group"
                    >
                      <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-50 rounded-full blur-xl group-hover:bg-amber-50 transition-colors pointer-events-none" />
                      
                      <div className="space-y-2 relative z-10">
                        <div className="flex items-center justify-between">
                          <span className="w-7 h-7 rounded-xl bg-emerald-50 text-emerald-700 font-black text-xs flex items-center justify-center border border-emerald-100">
                            {s.number}
                          </span>
                          <span className="text-xs font-arabic text-emerald-900 font-bold group-hover:text-amber-700 transition-colors">
                            {s.name}
                          </span>
                        </div>

                        <div>
                          <h4 className="font-black text-slate-900 text-sm">{s.englishName}</h4>
                          <p className="text-[10px] text-slate-400 font-medium">{s.englishNameTranslation} • {s.numberOfAyahs} Ayahs</p>
                        </div>
                      </div>

                      {s.tag && (
                        <div className="mt-3 pt-2 border-t border-slate-50">
                          <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${s.tagColor || 'bg-slate-50 text-slate-600'}`}>
                            {s.tag}
                          </span>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Complete Surahs List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                  {searchQuery ? `Search Results (${filteredSurahs.length})` : 'All 114 Surahs'}
                </h3>
                <span className="text-[10px] font-bold text-slate-400">Arabic & Urdu Available</span>
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                {filteredSurahs.map((surah) => (
                  <motion.div
                    key={surah.number}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate(`/quran/surah/${surah.number}`)}
                    className="bg-white p-4 rounded-2xl border border-slate-100 hover:border-emerald-200 shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3.5">
                      {/* Number Icon in Star Badge */}
                      <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center justify-center font-black text-xs shrink-0 shadow-inner group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                        {surah.number}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-black text-slate-900 text-sm truncate">
                            {surah.englishName}
                          </h4>
                          <span className="text-[9px] font-black uppercase text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md">
                            {surah.revelationType}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium truncate">
                          {surah.englishNameTranslation} • {surah.numberOfAyahs} Verses
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="text-lg font-arabic font-bold text-emerald-950 group-hover:text-emerald-700 transition-colors">
                        {surah.name}
                      </p>
                      <p className="text-[10px] text-emerald-600 font-bold group-hover:underline">
                        Read & Listen →
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: 30 PARAS (JUZ) */}
        {activeTab === 'paras' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                {searchQuery ? `Search Results (${filteredParas.length})` : 'All 30 Paras (Juz 1 - 30)'}
              </h3>
              <span className="text-[10px] font-bold text-slate-400">Line-by-Line Layout</span>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {filteredParas.map((para) => (
                <motion.div
                  key={para.number}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate(`/quran/para/${para.number}`)}
                  className="bg-white p-4.5 rounded-3xl border border-slate-100 hover:border-emerald-200 shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center justify-between group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-800 border border-amber-200/60 flex items-center justify-center font-black text-sm shrink-0 shadow-inner group-hover:bg-amber-600 group-hover:text-white transition-colors">
                      {para.number}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-black text-slate-900 text-sm">
                          Para {para.number}: {para.englishName}
                        </h4>
                      </div>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">
                        {para.surahsIncluded}
                      </p>
                      <p className="text-[10px] text-emerald-700 font-bold mt-1">
                        ~{para.totalVersesApprox} Ayahs • Urdu Translation & Audio
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-2xl font-arabic font-bold text-emerald-950 group-hover:text-amber-700 transition-colors">
                      {para.arabicName}
                    </p>
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 group-hover:underline">
                      Open Para →
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
