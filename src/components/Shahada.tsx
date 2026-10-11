import { useState } from 'react';
import { ChevronLeft, Share2, Copy, Check, BookOpen, Sparkles, Heart } from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { useToast } from './ToastContext';
import { RubElHizb } from './DecorativeIcons';

export default function Shahada() {
  const navigate = useNavigate();
  const { showSuccess } = useToast();
  const [copied, setCopied] = useState(false);

  const arabicText = "أَشْهَدُ أَنْ لَا إِلٰهَ إِلَّا اللهُ وَأَشْهَدُ أَنَّ مُحَمَّدًا رَسُولُ اللهِ";
  const transliteration = "Ashhadu an la ilaha illa Allah, wa ashhadu anna Muhammadan rasulu Allah";
  const englishTranslation = "I bear witness that there is no deity worthy of worship except Allah, and I bear witness that Muhammad is the Messenger of Allah.";

  const copyText = async () => {
    try {
      await navigator.clipboard.writeText(`${arabicText}\n\n${transliteration}\n\n"${englishTranslation}"`);
      setCopied(true);
      showSuccess("Shahada copied to clipboard!");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      showSuccess("Copied successfully!");
    }
  };

  const shareText = async () => {
    const fullText = `The Islamic Shahada (Declaration of Faith):\n\n${arabicText}\n\n${transliteration}\n\n"${englishTranslation}"`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'The Shahada - Declaration of Faith',
          text: fullText,
          url: window.location.href,
        });
      } else {
        await copyText();
      }
    } catch {
      // User cancelled share
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#fcfcfd]">
      <header className="p-6 bg-white sticky top-0 z-10 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2.5 hover:bg-slate-50 rounded-2xl transition-colors">
              <ChevronLeft size={22} className="text-slate-800" />
            </button>
            <div>
              <h1 className="text-xl font-black text-slate-800">The Shahada</h1>
              <p className="text-[10px] text-emerald-600 font-black uppercase tracking-widest">Pillar of Iman & Faith</p>
            </div>
          </div>
          <div className="w-10 h-10 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
            <RubElHizb className="w-5 h-5" />
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 pb-28">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-900 p-8 rounded-[40px] text-white shadow-2xl shadow-emerald-900/20 relative overflow-hidden text-center"
        >
          <div className="relative z-10 space-y-6">
            <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto border border-white/20">
              <Heart size={32} className="text-amber-300 fill-amber-300/30" />
            </div>

            <p className="text-3xl sm:text-4xl font-arabic leading-loose tracking-wide px-2 drop-shadow-sm">
              {arabicText}
            </p>

            <div className="h-px bg-white/20 w-3/4 mx-auto" />

            <div className="space-y-2">
              <p className="text-sm font-semibold text-emerald-100 italic leading-relaxed">
                "{transliteration}"
              </p>
              <p className="text-xs text-emerald-200/90 leading-relaxed max-w-sm mx-auto">
                {englishTranslation}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Core Pillar Card */}
        <div className="bg-emerald-50 p-5 rounded-[28px] border border-emerald-200/60 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-600 text-white rounded-2xl flex items-center justify-center shrink-0 shadow-md shadow-emerald-200">
              <Sparkles size={22} />
            </div>
            <div>
              <h4 className="text-sm font-black text-emerald-950">
                Foundational Pillar of Faith
              </h4>
              <p className="text-[11px] text-emerald-800 font-medium">Recited with sincere conviction & devotion in the heart</p>
            </div>
          </div>
          <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-200/50 px-3 py-1.5 rounded-xl font-bold">
            Tawheed
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button 
            onClick={copyText}
            className="flex-1 py-4 bg-white border border-slate-200 text-slate-700 rounded-2xl text-xs font-black uppercase tracking-wider active:scale-95 transition-all flex items-center justify-center gap-2 shadow-sm hover:border-emerald-300 hover:text-emerald-700"
          >
            {copied ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
            {copied ? "Copied" : "Copy Text"}
          </button>
          <button 
            onClick={shareText}
            className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl text-xs font-black uppercase tracking-wider active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-200 hover:bg-emerald-500"
          >
            <Share2 size={16} /> Share Faith
          </button>
        </div>

        {/* Information & Meaning */}
        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <BookOpen size={18} className="text-emerald-600" />
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">The First Pillar of Islam</h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            The Shahada is the foundational declaration of Islamic faith. It asserts two core convictions:
          </p>
          <ul className="text-xs text-slate-600 space-y-2 list-disc pl-5">
            <li><strong>Tawhid (Oneness of God):</strong> Absolute monotheism; worship belongs solely to Allah with no partners or intermediaries.</li>
            <li><strong>Risalah (Prophethood):</strong> Acceptance of Prophet Muhammad ﷺ as Allah’s final messenger and exemplar for humanity.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
