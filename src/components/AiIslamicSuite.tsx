import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, MessageSquare, Send, Copy, Check, ChevronLeft, Bookmark, Share2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { findAiDua, askIslamicAi, DuaResult } from '../services/geminiService';
import { IslamicPattern, RubElHizb } from './DecorativeIcons';
import { useToast } from './ToastContext';

export default function AiIslamicSuite() {
  const navigate = useNavigate();
  const { showSuccess } = useToast();
  const [activeTab, setActiveTab] = useState<'dua' | 'chat'>('dua');

  // AI Dua Finder State
  const [duaQuery, setDuaQuery] = useState('');
  const [duaLoading, setDuaLoading] = useState(false);
  const [duaResult, setDuaResult] = useState<DuaResult | null>(null);
  const [copied, setCopied] = useState(false);

  // AI Chat State
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'model'; content: string }>>([
    {
      role: 'model',
      content: 'As-salamu alaykum! I am your AI Islamic Assistant powered by authentic Sahih Hadith and Sunnah teachings. Ask me about Salah, Fasting, Zakat, Adab, or Daily Supplications.'
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  const handleSearchDua = async (queryText?: string) => {
    const q = queryText || duaQuery;
    if (!q.trim()) return;
    setDuaLoading(true);
    try {
      const res = await findAiDua(q);
      setDuaResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setDuaLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim() || chatLoading) return;
    const msg = chatInput.trim();
    setChatInput('');
    const newHistory = [...chatMessages, { role: 'user' as const, content: msg }];
    setChatMessages(newHistory);
    setChatLoading(true);

    try {
      const reply = await askIslamicAi(msg, newHistory);
      setChatMessages([...newHistory, { role: 'model', content: reply }]);
    } catch (err) {
      console.error(err);
    } finally {
      setChatLoading(false);
    }
  };

  const copyText = (txt: string) => {
    navigator.clipboard.writeText(txt);
    setCopied(true);
    showSuccess("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col min-h-full bg-[#f8f9fb]">
      {/* Header */}
      <header className="p-4 sm:p-5 bg-white border-b border-slate-100 shadow-sm sticky top-0 z-20">
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-3">
            <motion.button 
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={() => navigate('/')} 
              className="p-2.5 bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 rounded-2xl transition-all shadow-sm"
              title="Go Back"
            >
              <ChevronLeft size={20} />
            </motion.button>
            <div>
              <h1 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                AI Islamic Suite
                <span className="text-[10px] bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-sm">
                  <Sparkles size={10} /> Powered by Gemini
                </span>
              </h1>
              <p className="text-[11px] text-slate-500 font-medium">AI Dua Finder • Islamic Knowledge Assistant</p>
            </div>
          </div>
          <RubElHizb className="w-7 h-7 text-emerald-600/30" />
        </div>

        {/* 2 Tabs */}
        <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100 rounded-2xl relative z-10 text-xs">
          <button
            onClick={() => setActiveTab('dua')}
            className={`py-2.5 px-3 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 ${
              activeTab === 'dua'
                ? 'bg-white text-emerald-700 shadow-md shadow-slate-200/60 scale-[1.01]'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles size={16} className={activeTab === 'dua' ? 'text-emerald-600' : 'text-slate-400'} />
            <span>AI Dua Finder</span>
          </button>

          <button
            onClick={() => setActiveTab('chat')}
            className={`py-2.5 px-3 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 ${
              activeTab === 'chat'
                ? 'bg-white text-emerald-700 shadow-md shadow-slate-200/60 scale-[1.01]'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <MessageSquare size={16} className={activeTab === 'chat' ? 'text-emerald-600' : 'text-slate-400'} />
            <span>Islamic Assistant</span>
          </button>
        </div>
      </header>

      <div className="flex-1 p-4 sm:p-5">
        {/* TAB 1: AI DUA FINDER */}
        {activeTab === 'dua' && (
          <div className="space-y-4 pb-28">
            {/* Search Card */}
            <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-3">
              <label className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles size={14} className="text-emerald-600" />
                Find Authentic Duas for Any Need or Emotion
              </label>
              
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. anxiety, gratitude, health, exams, parents, patience..."
                  value={duaQuery}
                  onChange={(e) => setDuaQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearchDua()}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 pl-4 pr-12 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all"
                />
                <button
                  onClick={() => handleSearchDua()}
                  disabled={duaLoading || !duaQuery.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white p-2 rounded-xl transition-all shadow-md shadow-emerald-200"
                >
                  <Send size={14} />
                </button>
              </div>

              {/* Quick Prompt Suggestions */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {['Protection', 'Anxiety & Stress', 'Parents', 'Forgiveness', 'Good Health', 'Exam Success'].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => {
                      setDuaQuery(tag);
                      handleSearchDua(tag);
                    }}
                    className="text-[10px] font-black uppercase tracking-wider px-3 py-1 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 rounded-lg transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Loading */}
            {duaLoading && (
              <div className="p-8 text-center bg-white rounded-3xl border border-slate-100 shadow-sm space-y-2">
                <motion.div 
                  animate={{ rotate: 360 }} 
                  transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
                  className="w-8 h-8 mx-auto text-emerald-600"
                >
                  <Sparkles size={32} />
                </motion.div>
                <p className="text-xs font-bold text-slate-500">Searching authentic Sahih supplications...</p>
              </div>
            )}

            {/* Result */}
            {duaResult && !duaLoading && (
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl p-6 border border-slate-100 shadow-lg space-y-5 relative overflow-hidden"
              >
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full border border-emerald-100">
                      Authentic Supplication
                    </span>
                    <h2 className="text-base font-black text-slate-900 mt-2">{duaResult.title}</h2>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => copyText(`${duaResult.title}\n\n${duaResult.arabic}\n\n"${duaResult.englishTranslation}"\n\nSource: ${duaResult.source}`)}
                      className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl transition-all"
                      title="Copy Dua"
                    >
                      {copied ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
                    </button>
                  </div>
                </div>

                <div className="p-5 bg-gradient-to-br from-emerald-900 via-slate-900 to-emerald-950 text-white rounded-2xl space-y-4">
                  <p className="text-2xl sm:text-3xl font-arabic text-right leading-loose text-emerald-100">
                    {duaResult.arabic}
                  </p>
                  {duaResult.transliteration && (
                    <p className="text-xs italic text-emerald-200/80 font-medium border-t border-white/10 pt-3">
                      {duaResult.transliteration}
                    </p>
                  )}
                </div>

                <div className="space-y-3 text-xs leading-relaxed">
                  <div>
                    <h4 className="font-black text-slate-800 uppercase tracking-wider text-[10px] text-slate-400">Meaning & Translation</h4>
                    <p className="text-slate-700 font-medium mt-1">"{duaResult.englishTranslation}"</p>
                  </div>
                  <div>
                    <h4 className="font-black text-slate-800 uppercase tracking-wider text-[10px] text-slate-400">Reference</h4>
                    <p className="text-emerald-700 font-bold mt-0.5">{duaResult.source}</p>
                  </div>
                  {duaResult.benefits && (
                    <div className="p-3 bg-amber-50 text-amber-900 rounded-xl text-xs border border-amber-200/60">
                      <strong>Spiritual Benefit:</strong> {duaResult.benefits}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        )}

        {/* TAB 2: AI ISLAMIC CHATBOT */}
        {activeTab === 'chat' && (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col h-[calc(100vh-220px)] max-h-[680px] overflow-hidden">
            {/* Chat Messages */}
            <div className="flex-1 p-4 overflow-y-auto no-scrollbar space-y-3 bg-[#fcfcfd]">
              {chatMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] px-4 py-3 rounded-2xl text-xs leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-emerald-600 text-white rounded-br-none shadow-md shadow-emerald-200 font-medium'
                        : 'bg-white text-slate-800 rounded-bl-none border border-slate-100 shadow-sm font-normal'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div className="flex items-center gap-2 p-3 bg-white text-slate-500 rounded-2xl border border-slate-100 w-fit text-xs">
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
                    <Sparkles size={14} className="text-emerald-600" />
                  </motion.div>
                  <span>Searching authentic Sunnah guidance...</span>
                </div>
              )}
            </div>

            {/* Chat Input */}
            <div className="p-3 bg-white border-t border-slate-100 flex items-center gap-2">
              <input
                type="text"
                placeholder="Ask any question on Salah, Sunnah, Fasting, Zakat..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-xs text-slate-800 outline-none focus:border-emerald-500 focus:bg-white transition-all font-medium"
              />
              <button
                onClick={handleSendMessage}
                disabled={chatLoading || !chatInput.trim()}
                className="p-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white rounded-2xl transition-all shadow-md shadow-emerald-200"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
