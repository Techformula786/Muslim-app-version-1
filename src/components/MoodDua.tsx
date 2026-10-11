import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Sparkles, Heart, Lightbulb, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getMoodDua } from '../services/geminiService';
import { RubElHizb } from './DecorativeIcons';

interface MoodDuaProps {
  hideHeader?: boolean;
}

export default function MoodDua({ hideHeader = false }: MoodDuaProps) {
  const navigate = useNavigate();
  const [mood, setMood] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mood.trim()) return;
    
    setLoading(true);
    const data = await getMoodDua(mood);
    setResult(data);
    setLoading(false);
  };

  const quickMoods = ['Anxious', 'Grateful', 'Sad', 'Seeking Guidance', 'Tired', 'Seeking Forgiveness'];

  return (
    <div className="flex flex-col h-full bg-[#fcfcfd]">
      {!hideHeader && (
        <header className="p-6 bg-white sticky top-0 z-10 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => navigate(-1)} className="p-2.5 hover:bg-slate-50 rounded-2xl transition-colors">
                <ChevronLeft size={22} className="text-slate-800" />
              </button>
              <div>
                <h1 className="text-xl font-black text-slate-800">AI Mood Dua</h1>
                <p className="text-[10px] text-emerald-600 font-black uppercase tracking-widest">Comfort in Allah's Remembrance</p>
              </div>
            </div>
            <div className="w-10 h-10 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
        </header>
      )}

      <div className="flex-1 overflow-y-auto p-6 space-y-6 pb-28">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">How is your heart feeling?</h2>
          <p className="text-xs text-slate-500 font-medium">Express your emotion and find solace in authentic Prophetic Hadith and Sunnah supplications.</p>
        </div>

        {/* Quick emotion pills */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
          {quickMoods.map((m) => (
            <button
              key={m}
              onClick={() => {
                setMood(m);
              }}
              className="px-3.5 py-1.5 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 rounded-xl text-xs font-bold shrink-0 transition-colors"
            >
              {m}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="relative">
          <input
            type="text"
            value={mood}
            onChange={(e) => setMood(e.target.value)}
            placeholder="e.g. I feel overwhelmed with exams and need tranquility..."
            className="w-full px-5 py-4 bg-white rounded-2xl shadow-sm border border-slate-200 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none pr-14 text-xs font-medium transition-all"
          />
          <button
            type="submit"
            disabled={loading || !mood.trim()}
            className="absolute right-2.5 top-2.5 p-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-500 disabled:opacity-40 transition-colors shadow-md shadow-emerald-200"
          >
            {loading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles size={18} />
              </motion.div>
            ) : (
              <Send size={18} />
            )}
          </button>
        </form>

        <AnimatePresence mode="wait">
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >

              {/* Dua from Sunnah */}
              {result.dua && (
                <div className="bg-emerald-900 text-white p-6 rounded-[32px] shadow-xl shadow-emerald-950/20 space-y-4">
                  <div className="flex items-center gap-2 text-emerald-300">
                    <Heart size={18} />
                    <h3 className="text-xs font-black uppercase tracking-widest">Prophetic Supplication</h3>
                  </div>
                  <p className="text-xl font-arabic text-emerald-200 text-right leading-loose">
                    {result.dua.arabic}
                  </p>
                  <p className="text-xs text-emerald-100/90 italic leading-relaxed">
                    "{result.dua.translation}"
                  </p>
                </div>
              )}

              {/* Sunnah Advice */}
              {result.advice && (
                <div className="bg-amber-50 p-5 rounded-[28px] border border-amber-200/60 flex items-start gap-3">
                  <Lightbulb size={20} className="text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-black text-amber-900 uppercase tracking-wider mb-1">Sunnah Prescribed Action</h4>
                    <p className="text-xs text-amber-800 leading-relaxed font-medium">{result.advice}</p>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
