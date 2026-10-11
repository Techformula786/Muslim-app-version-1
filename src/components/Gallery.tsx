import { useState } from 'react';
import { ChevronLeft, Image as ImageIcon, Heart, Download, Share2, X, Eye, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { useToast } from './ToastContext';

interface GalleryItem {
  id: number;
  url: string;
  title: string;
  category: string;
  location: string;
}

const IMAGES: GalleryItem[] = [
  { 
    id: 1, 
    url: "https://images.unsplash.com/photo-1542810634-71277d95dcbb?auto=format&fit=crop&w=1200&q=80", 
    title: "Masjid Al-Haram", 
    category: "Holy Sites",
    location: "Makkah Al-Mukarramah, Saudi Arabia" 
  },
  { 
    id: 2, 
    url: "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?auto=format&fit=crop&w=1200&q=80", 
    title: "Sheikh Zayed Grand Mosque", 
    category: "Architecture",
    location: "Abu Dhabi, UAE" 
  },
  { 
    id: 3, 
    url: "https://images.unsplash.com/photo-1564507592333-c60657eaa0ae?auto=format&fit=crop&w=1200&q=80", 
    title: "Sultan Ahmed Mosque (Blue Mosque)", 
    category: "Historical",
    location: "Istanbul, Turkey" 
  },
  { 
    id: 4, 
    url: "https://images.unsplash.com/photo-1590073242678-70ee3fc28e84?auto=format&fit=crop&w=1200&q=80", 
    title: "Sacred Arabic Calligraphy", 
    category: "Art",
    location: "Islamic Arts Museum" 
  },
  { 
    id: 5, 
    url: "https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=1200&q=80", 
    title: "Al-Masjid An-Nabawi", 
    category: "Holy Sites",
    location: "Madinah Al-Munawwarah, Saudi Arabia" 
  },
  { 
    id: 6, 
    url: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1200&q=80", 
    title: "Al-Aqsa Sanctuary", 
    category: "Holy Sites",
    location: "Al-Quds (Jerusalem)" 
  }
];

export default function Gallery() {
  const navigate = useNavigate();
  const { showSuccess } = useToast();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);
  const [favorites, setFavorites] = useState<number[]>([]);

  const categories = ['All', 'Holy Sites', 'Architecture', 'Historical', 'Art'];

  const filtered = selectedCategory === 'All'
    ? IMAGES
    : IMAGES.filter(img => img.category === selectedCategory);

  const toggleFavorite = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites(prev => {
      const exists = prev.includes(id);
      if (exists) {
        showSuccess("Removed from favorites");
        return prev.filter(i => i !== id);
      }
      showSuccess("Added to favorites! ❤️");
      return [...prev, id];
    });
  };

  const handleShare = async (img: GalleryItem, e?: React.MouseEvent) => {
    e?.stopPropagation();
    try {
      if (navigator.share) {
        await navigator.share({
          title: img.title,
          text: `Check out ${img.title} from the Islamic Hub App!`,
          url: img.url,
        });
      } else {
        await navigator.clipboard.writeText(img.url);
        showSuccess("Image link copied to clipboard!");
      }
    } catch {
      // User cancelled
    }
  };

  const handleDownload = (img: GalleryItem, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const a = document.createElement('a');
    a.href = img.url;
    a.target = '_blank';
    a.download = `${img.title}.jpg`;
    a.click();
    showSuccess("Image opening in full resolution for save.");
  };

  return (
    <div className="flex flex-col h-full bg-[#fcfcfd]">
      <header className="p-6 bg-white sticky top-0 z-10 border-b border-slate-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2.5 hover:bg-slate-50 rounded-2xl transition-colors">
              <ChevronLeft size={22} className="text-slate-800" />
            </button>
            <div>
              <h1 className="text-xl font-black text-slate-800">Islamic Gallery</h1>
              <p className="text-[10px] text-emerald-600 font-black uppercase tracking-widest">Sanctuaries & Sacred Architecture</p>
            </div>
          </div>
          <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-2xl">
            <ImageIcon size={20} />
          </div>
        </div>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setSelectedCategory(c)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider shrink-0 transition-all ${
                selectedCategory === c
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 grid grid-cols-2 gap-4 pb-28">
        {filtered.map((img, i) => {
          const isFav = favorites.includes(img.id);
          return (
            <motion.div 
              key={img.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => setSelectedImage(img)}
              className="bg-white rounded-[28px] border border-slate-100 shadow-sm overflow-hidden group cursor-pointer hover:shadow-md transition-shadow relative"
            >
              <div className="h-44 bg-slate-100 relative overflow-hidden">
                <img 
                  src={img.url} 
                  alt={img.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 opacity-80" />
                
                {/* Actions overlay */}
                <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
                  <button 
                    onClick={(e) => toggleFavorite(img.id, e)}
                    className="p-2 bg-white/80 backdrop-blur-md rounded-xl text-slate-700 hover:text-rose-500 hover:bg-white transition-all shadow-sm"
                  >
                    <Heart size={14} className={isFav ? "text-rose-500 fill-rose-500" : ""} />
                  </button>
                </div>

                <div className="absolute bottom-2.5 left-2.5 right-2.5 text-white">
                  <span className="text-[8px] font-black uppercase tracking-widest text-emerald-300 drop-shadow-sm">
                    {img.category}
                  </span>
                  <h3 className="text-xs font-black truncate drop-shadow-sm">{img.title}</h3>
                </div>
              </div>

              <div className="p-3 bg-white flex items-center justify-between text-slate-400">
                <span className="text-[9px] font-medium truncate">{img.location}</span>
                <Eye size={14} className="shrink-0 text-slate-300" />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] flex flex-col justify-between p-4 sm:p-6"
          >
            <div className="flex items-center justify-between text-white z-10">
              <div>
                <h3 className="text-base font-black">{selectedImage.title}</h3>
                <p className="text-xs text-white/70">{selectedImage.location}</p>
              </div>
              <button 
                onClick={() => setSelectedImage(null)}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
              >
                <X size={22} />
              </button>
            </div>

            <div className="flex-1 flex items-center justify-center p-2 my-auto">
              <img 
                src={selectedImage.url} 
                alt={selectedImage.title} 
                className="max-h-[70vh] max-w-full rounded-2xl object-contain shadow-2xl" 
              />
            </div>

            <div className="flex items-center justify-center gap-4 pb-2 z-10">
              <button 
                onClick={(e) => toggleFavorite(selectedImage.id, e)}
                className="px-5 py-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl text-xs font-black uppercase tracking-wider flex items-center gap-2 backdrop-blur-md transition-colors"
              >
                <Heart size={16} className={favorites.includes(selectedImage.id) ? "text-rose-500 fill-rose-500" : ""} />
                {favorites.includes(selectedImage.id) ? "Saved" : "Favorite"}
              </button>
              <button 
                onClick={(e) => handleDownload(selectedImage, e)}
                className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-emerald-900/40 transition-colors"
              >
                <Download size={16} /> Open HD
              </button>
              <button 
                onClick={(e) => handleShare(selectedImage, e)}
                className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl transition-colors"
              >
                <Share2 size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
