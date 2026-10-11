import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Quote, Share2, Heart, Copy, Search, ChevronLeft, Sparkles, Filter, Download, Plus, X, Image as ImageIcon, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { IslamicPattern } from './DecorativeIcons';
import { cn } from '../lib/utils';
import { useToast } from './ToastContext';

const INITIAL_QUOTES = [
  { id: 1, text: "The best among you are those who have the best manners and character.", author: "Prophet Muhammad (PBUH)", category: "Character", image: "https://picsum.photos/seed/q1/800/800" },
  { id: 2, text: "Richness does not lie in the abundance of worldly goods, but true wealth is the richness of the soul.", author: "Sahih al-Bukhari 6446", category: "Hope", image: "https://picsum.photos/seed/q2/800/800" },
  { id: 3, text: "Be kind, for whenever kindness becomes part of something, it beautifies it.", author: "Prophet Muhammad (PBUH)", category: "Kindness", image: "https://picsum.photos/seed/q3/800/800" },
  { id: 4, text: "The most beloved of deeds to Allah are those that are most consistent, even if they are small.", author: "Prophet Muhammad (PBUH)", category: "Deeds", image: "https://picsum.photos/seed/q4/800/800" },
  { id: 5, text: "The strong person is not the one who can wrestle someone down, but the one who controls himself in anger.", author: "Sahih al-Bukhari 6114", category: "Strength", image: "https://picsum.photos/seed/q5/800/800" },
];

const CATEGORIES = ["All", "Hope", "Character", "Kindness", "Deeds", "Strength", "Patience"];

export default function StatusSection() {
  const navigate = useNavigate();
  const { showSuccess } = useToast();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [likedQuotes, setLikedQuotes] = useState<number[]>([]);
  const [quotes, setQuotes] = useState(INITIAL_QUOTES);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newQuoteText, setNewQuoteText] = useState('');
  const [newQuoteAuthor, setNewQuoteAuthor] = useState('');
  const [newQuoteImage, setNewQuoteImage] = useState<string | null>(null);

  const filteredQuotes = quotes.filter(q => {
    const matchesSearch = q.text.toLowerCase().includes(search.toLowerCase()) || q.author.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || q.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleLike = (id: number) => {
    setLikedQuotes(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    showSuccess("Quote copied to clipboard!");
  };

  const handleShare = async (quote: any) => {
    const text = `"${quote.text}" - ${quote.author}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Islamic Quote', text });
      } catch (e) {}
    } else {
      handleCopy(text);
    }
  };

  const handleCreateQuote = () => {
    if (!newQuoteText.trim()) return;
    const newQuote = {
      id: Date.now(),
      text: newQuoteText,
      author: newQuoteAuthor || 'Anonymous',
      category: 'General',
      image: newQuoteImage || `https://picsum.photos/seed/${Date.now()}/800/800`
    };
    setQuotes([newQuote, ...quotes]);
    setNewQuoteText('');
    setNewQuoteAuthor('');
    setNewQuoteImage(null);
    setShowCreateModal(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewQuoteImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfcfd] pb-24">
      <header className="bg-white/80 backdrop-blur-xl border-b border-slate-100 p-6 z-50 shadow-sm sticky top-0">
        <IslamicPattern className="opacity-[0.03]" />
        <div className="flex items-center justify-between mb-6 relative z-10">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2.5 bg-slate-50 text-slate-600 rounded-2xl">
              <ChevronLeft size={22} />
            </button>
            <h1 className="text-xl font-black text-slate-800 tracking-tight">Islamic Status</h1>
          </div>
          <Sparkles className="text-amber-500 animate-pulse" size={24} />
        </div>
        
        <div className="space-y-4 relative z-10">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search quotes or authors..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50/50 border border-slate-100 rounded-[20px] py-3.5 pl-12 pr-4 text-sm focus:ring-4 focus:ring-emerald-500/10 focus:bg-white transition-all font-medium"
            />
          </div>
          
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  "px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border",
                  selectedCategory === cat 
                    ? "bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-100" 
                    : "bg-white border-slate-100 text-slate-400 hover:border-emerald-200"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="p-6 grid grid-cols-1 gap-6">
        {filteredQuotes.map((quote, i) => (
          <motion.div
            key={quote.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white rounded-[48px] border border-slate-100 shadow-sm relative overflow-hidden group"
          >
            {quote.image && (
              <div className="aspect-video relative overflow-hidden">
                <img src={quote.image} alt="Quote" className="w-full h-full object-cover transition-transform group-hover:scale-110" referrerPolicy="no-referrer" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </div>
            )}
            
            <div className={cn("p-8 relative z-10 space-y-6", quote.image && "-mt-20")}>
              <div className="flex justify-between items-start">
                <div className={cn(
                  "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest",
                  quote.image ? "bg-white/20 text-white backdrop-blur-md" : "bg-emerald-50 text-emerald-600"
                )}>
                  {quote.category}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => toggleLike(quote.id)} className={cn("p-2 rounded-xl transition-all", likedQuotes.includes(quote.id) ? "bg-rose-50 text-rose-500" : "bg-white/10 text-white/60 backdrop-blur-md")}>
                    <Heart size={18} fill={likedQuotes.includes(quote.id) ? "currentColor" : "none"} />
                  </button>
                </div>
              </div>

              <p className={cn(
                "text-xl font-medium leading-relaxed italic",
                quote.image ? "text-white drop-shadow-lg" : "text-slate-800"
              )}>
                "{quote.text}"
              </p>
              
              <div className={cn(
                "flex items-center justify-between pt-6 border-t",
                quote.image ? "border-white/10" : "border-slate-50"
              )}>
                <p className={cn(
                  "text-[10px] font-black uppercase tracking-widest",
                  quote.image ? "text-white/60" : "text-slate-400"
                )}>
                  — {quote.author}
                </p>
                <div className="flex gap-2">
                  <button onClick={() => handleCopy(quote.text)} className="p-2.5 bg-white/10 text-white/60 rounded-xl hover:bg-white/20 transition-all backdrop-blur-md">
                    <Copy size={18} />
                  </button>
                  <button onClick={() => handleShare(quote)} className="p-2.5 bg-white/10 text-white/60 rounded-xl hover:bg-white/20 transition-all backdrop-blur-md">
                    <Share2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <button 
        onClick={() => setShowCreateModal(true)}
        className="fixed bottom-28 right-6 w-16 h-16 bg-slate-900 text-white rounded-full shadow-2xl shadow-slate-900/20 flex items-center justify-center active:scale-95 transition-all z-20"
      >
        <Plus size={32} />
      </button>

      <AnimatePresence>
        {showCreateModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-end sm:items-center justify-center p-4"
          >
            <motion.div 
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              className="bg-white w-full max-w-lg rounded-t-[40px] sm:rounded-[40px] p-8 space-y-6 shadow-2xl"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-black text-slate-800">Post a Status</h2>
                <button onClick={() => setShowCreateModal(false)} className="p-2 bg-slate-50 text-slate-400 rounded-full">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <textarea 
                  value={newQuoteText}
                  onChange={(e) => setNewQuoteText(e.target.value)}
                  placeholder="Write a beautiful Islamic status..."
                  className="w-full h-32 bg-slate-50 border-none rounded-3xl p-6 text-sm focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium resize-none"
                />
                <input 
                  type="text"
                  value={newQuoteAuthor}
                  onChange={(e) => setNewQuoteAuthor(e.target.value)}
                  placeholder="Author (optional)"
                  className="w-full bg-slate-50 border-none rounded-2xl px-6 py-3 text-sm focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium"
                />

                {newQuoteImage && (
                  <div className="relative rounded-2xl overflow-hidden border border-slate-100 aspect-video">
                    <img src={newQuoteImage} alt="Preview" className="w-full h-full object-cover" />
                    <button onClick={() => setNewQuoteImage(null)} className="absolute top-2 right-2 p-1.5 bg-rose-500 text-white rounded-full">
                      <X size={14} />
                    </button>
                  </div>
                )}

                <div className="flex items-center justify-between gap-4">
                  <label className="flex-1 flex items-center justify-center gap-2 py-4 bg-emerald-50 text-emerald-600 rounded-2xl font-black uppercase tracking-widest text-[10px] cursor-pointer hover:bg-emerald-100 transition-colors">
                    <ImageIcon size={16} /> Add Image
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  </label>
                  <button 
                    onClick={handleCreateQuote}
                    disabled={!newQuoteText.trim()}
                    className="flex-[2] flex items-center justify-center gap-2 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-slate-900/20 hover:bg-slate-800 transition-colors disabled:opacity-50"
                  >
                    Post Status <Send size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
