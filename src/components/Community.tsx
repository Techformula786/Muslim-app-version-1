import { ChevronLeft, Search, Heart, MessageCircle, Share2, Users, Plus, X, Image as ImageIcon, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useToast } from './ToastContext';

interface Post {
  id: number;
  user: string;
  avatar: string;
  content: string;
  likes: number;
  comments: number;
  time: string;
  image: string | null;
  isLiked?: boolean;
}

const INITIAL_POSTS: Post[] = [
  { 
    id: 1, 
    user: "Ahmad", 
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80", 
    content: "SubhanAllah! The morning prayer in congregation today brought so much tranquility. May Allah bless us all with steadfastness on the straight path.", 
    likes: 124, 
    comments: 12, 
    time: "2h ago",
    image: null,
    isLiked: false
  },
  { 
    id: 2, 
    user: "Fatima", 
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80", 
    content: "Remember to send abundant blessings upon the Prophet ﷺ on this blessed Friday! #BlessedFriday", 
    likes: 89, 
    comments: 5, 
    time: "4h ago",
    image: "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?auto=format&fit=crop&w=800&q=80",
    isLiked: false
  },
  { 
    id: 3, 
    user: "Zaid", 
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80", 
    content: "Does anyone have recommendations for a concise authentic Hadith commentary book for daily study?", 
    likes: 45, 
    comments: 28, 
    time: "6h ago",
    image: null,
    isLiked: false
  }
];

export default function Community() {
  const navigate = useNavigate();
  const { showSuccess } = useToast();
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostImage, setNewPostImage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPosts = posts.filter(p => 
    p.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.user.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreatePost = () => {
    if (!newPostContent.trim() && !newPostImage) return;

    const newPost: Post = {
      id: Date.now(),
      user: "You",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
      content: newPostContent,
      likes: 0,
      comments: 0,
      time: "Just now",
      image: newPostImage,
      isLiked: false
    };

    setPosts([newPost, ...posts]);
    setNewPostContent('');
    setNewPostImage(null);
    setShowCreateModal(false);
    showSuccess("Alhamdulillah! Post published to the Ummah Feed.");
  };

  const toggleLike = (id: number) => {
    setPosts(prev => prev.map(p => {
      if (p.id === id) {
        const nextLiked = !p.isLiked;
        return {
          ...p,
          isLiked: nextLiked,
          likes: nextLiked ? p.likes + 1 : p.likes - 1
        };
      }
      return p;
    }));
  };

  const handleShare = async (post: Post) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Post by ${post.user}`,
          text: `"${post.content}" - shared via Nur Al-Islam Community`,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(`"${post.content}" - ${post.user}`);
        showSuccess("Post copied to clipboard!");
      }
    } catch {
      // User cancelled
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewPostImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
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
              <h1 className="text-xl font-black text-slate-800">Ummah Feed</h1>
              <p className="text-[10px] text-emerald-600 font-black uppercase tracking-widest">Islamic Community Network</p>
            </div>
          </div>
          <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-2xl">
            <Users size={20} />
          </div>
        </div>
        
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search community posts..."
            className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 pl-12 pr-4 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition-all font-medium"
          />
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 space-y-4 pb-28">
        {filteredPosts.map((post, i) => (
          <motion.div 
            key={post.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white p-5 rounded-[28px] border border-slate-100 shadow-sm hover:shadow-md transition-all space-y-3"
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <img src={post.avatar} alt={post.user} className="w-10 h-10 rounded-2xl object-cover border border-slate-100" />
                <div>
                  <h3 className="text-xs font-black text-slate-800">{post.user}</h3>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{post.time}</p>
                </div>
              </div>
              <button 
                onClick={() => handleShare(post)}
                className="p-2 text-slate-300 hover:text-emerald-600 transition-colors rounded-xl"
              >
                <Share2 size={16} />
              </button>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed font-medium">{post.content}</p>

            {post.image && (
              <div className="rounded-2xl overflow-hidden border border-slate-100 max-h-60">
                <img src={post.image} alt="Post content" className="w-full h-full object-cover" />
              </div>
            )}

            <div className="flex items-center gap-5 pt-1 border-t border-slate-50">
              <button 
                onClick={() => toggleLike(post.id)}
                className={`flex items-center gap-1.5 text-xs font-bold transition-colors ${
                  post.isLiked ? 'text-rose-500' : 'text-slate-400 hover:text-rose-500'
                }`}
              >
                <Heart size={16} className={post.isLiked ? "fill-rose-500" : ""} /> {post.likes}
              </button>
              <button className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-emerald-600 transition-colors">
                <MessageCircle size={16} /> {post.comments}
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      <button 
        onClick={() => setShowCreateModal(true)}
        className="fixed bottom-24 right-6 w-14 h-14 bg-emerald-600 text-white rounded-full shadow-2xl shadow-emerald-500/40 flex items-center justify-center active:scale-95 transition-all z-20 hover:bg-emerald-500"
      >
        <Plus size={26} />
      </button>

      {/* Create Post Modal */}
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
              className="bg-white w-full max-w-lg rounded-t-[36px] sm:rounded-[36px] p-6 space-y-5 shadow-2xl"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-black text-slate-800">Share with the Ummah</h2>
                <button onClick={() => setShowCreateModal(false)} className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-400 rounded-full">
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-4">
                <textarea 
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  placeholder="Share a reflection, Hadith, daily Sunnah deed, or encouraging words..."
                  className="w-full h-28 bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition-all font-medium resize-none outline-none"
                />

                {newPostImage && (
                  <div className="relative rounded-2xl overflow-hidden border border-slate-100 aspect-video max-h-40">
                    <img src={newPostImage} alt="Preview" className="w-full h-full object-cover" />
                    <button 
                      onClick={() => setNewPostImage(null)}
                      className="absolute top-2 right-2 p-1.5 bg-rose-500 text-white rounded-full shadow-lg"
                    >
                      <X size={12} />
                    </button>
                  </div>
                )}

                <div className="flex items-center justify-between gap-3">
                  <label className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-black uppercase tracking-wider text-[10px] cursor-pointer transition-colors">
                    <ImageIcon size={16} /> Photo
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  </label>
                  <button 
                    onClick={handleCreatePost}
                    disabled={!newPostContent.trim() && !newPostImage}
                    className="flex-[2] flex items-center justify-center gap-2 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black uppercase tracking-wider text-[10px] shadow-lg shadow-emerald-200 transition-colors disabled:opacity-40"
                  >
                    Post <Send size={14} />
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
