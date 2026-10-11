import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Play, Pause, Volume2, VolumeX, Radio, Settings, ShieldCheck, ChevronLeft, ExternalLink, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { getLiveStreamConfig, getYoutubeEmbedUrl, DEFAULT_MAKKAH_STREAM, DEFAULT_MADINAH_STREAM } from '../services/liveStreamService';
import AdminModal from './AdminModal';

export default function LiveStream() {
  const navigate = useNavigate();
  const [streams, setStreams] = useState([
    {
      id: 'makkah',
      name: 'Makkah Live (Kaaba)',
      url: DEFAULT_MAKKAH_STREAM,
      thumbnail: 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 'madinah',
      name: 'Madinah Live (Masjid Nabawi)',
      url: DEFAULT_MADINAH_STREAM,
      thumbnail: 'https://images.unsplash.com/photo-1549468057-5b7fa1a41d7a?auto=format&fit=crop&w=800&q=80'
    }
  ]);
  const [activeStreamId, setActiveStreamId] = useState('makkah');
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);

  // Load configured links from Firestore / localStorage
  const loadConfig = async () => {
    try {
      const config = await getLiveStreamConfig();
      setStreams([
        {
          id: 'makkah',
          name: 'Makkah Live (Kaaba)',
          url: config.makkahUrl || DEFAULT_MAKKAH_STREAM,
          thumbnail: 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?auto=format&fit=crop&w=800&q=80'
        },
        {
          id: 'madinah',
          name: 'Madinah Live (Masjid Nabawi)',
          url: config.madinahUrl || DEFAULT_MADINAH_STREAM,
          thumbnail: 'https://images.unsplash.com/photo-1549468057-5b7fa1a41d7a?auto=format&fit=crop&w=800&q=80'
        }
      ]);
    } catch {
      // Fallback works smoothly
    }
  };

  useEffect(() => {
    loadConfig();

    const handleStreamUpdate = (e: any) => {
      const detail = e.detail;
      if (detail?.makkahUrl) {
        setStreams(prev => prev.map(s => {
          if (s.id === 'makkah') return { ...s, url: detail.makkahUrl };
          if (s.id === 'madinah' && detail.madinahUrl) return { ...s, url: detail.madinahUrl };
          return s;
        }));
        setIframeKey(k => k + 1);
      }
    };
    window.addEventListener('livestream-updated', handleStreamUpdate);

    return () => {
      window.removeEventListener('livestream-updated', handleStreamUpdate);
    };
  }, []);

  const activeStream = streams.find(s => s.id === activeStreamId) || streams[0];
  const embedUrl = getYoutubeEmbedUrl(activeStream.url, isPlaying, isMuted);

  return (
    <div className="p-4 sm:p-5 space-y-5 max-w-3xl mx-auto pb-28">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/')} 
            className="p-2 bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 rounded-xl transition-all shadow-sm border border-slate-100"
            title="Go to Home"
          >
            <ChevronLeft size={18} />
          </motion.button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-black text-slate-800 tracking-tight">Haramain Live</h1>
              <span className="px-2 py-0.5 bg-rose-50 border border-rose-100 text-rose-600 rounded-full text-[9px] font-black uppercase tracking-wider flex items-center gap-1">
                <Radio size={10} className="animate-pulse" />
                24/7 Live
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">Official live broadcasts of Holy Makkah and Madinah.</p>
          </div>
        </div>

        {/* Discrete Admin trigger button */}
        <button
          onClick={() => setIsAdminOpen(true)}
          className="p-2 bg-white hover:bg-emerald-50 text-slate-500 hover:text-emerald-700 rounded-xl border border-slate-100 transition-all text-xs font-semibold flex items-center gap-1 shadow-sm"
          title="Broadcast Controls"
        >
          <ShieldCheck size={15} />
          <span className="text-[10px] font-black">Admin</span>
        </button>
      </div>

      {/* Main YouTube Live Player Container */}
      <div className="relative aspect-video bg-black rounded-3xl overflow-hidden shadow-xl border-2 border-slate-100 group">
        {isPlaying ? (
          <iframe
            key={`${activeStream.id}-${iframeKey}`}
            src={embedUrl}
            title={activeStream.name}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        ) : (
          <div className="relative w-full h-full">
            <img 
              src={activeStream.thumbnail} 
              alt={activeStream.name}
              className="w-full h-full object-cover opacity-60"
            />
            <div 
              className="absolute inset-0 flex items-center justify-center bg-black/40 cursor-pointer"
              onClick={() => setIsPlaying(true)}
            >
              <div className="w-14 h-14 bg-emerald-600 hover:bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-xl transition-transform active:scale-95">
                <Play size={26} className="ml-0.5" fill="currentColor" />
              </div>
            </div>
          </div>
        )}

        {/* Live Status Badge */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 bg-black/60 backdrop-blur-md rounded-xl text-white text-[10px] font-black border border-white/10 pointer-events-none">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          <span>{activeStream.id === 'makkah' ? 'Makkah Al-Mukarramah' : 'Madinah Al-Munawwarah'}</span>
        </div>

        {/* Direct YouTube link preview button */}
        <a
          href={activeStream.url}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute top-3 right-3 p-1.5 bg-black/60 hover:bg-black/80 backdrop-blur-md rounded-xl text-white/80 hover:text-white transition-all border border-white/10"
          title="Open in YouTube"
        >
          <ExternalLink size={14} />
        </a>
      </div>

      {/* Playback Controls & Reload Bar */}
      <div className="flex items-center justify-between p-3 bg-white rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
          >
            {isPlaying ? <Pause size={13} fill="currentColor" /> : <Play size={13} fill="currentColor" />}
            <span>{isPlaying ? 'Pause' : 'Play Live'}</span>
          </button>
          <button
            onClick={() => setIframeKey(k => k + 1)}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-all"
            title="Refresh stream"
          >
            <RefreshCw size={13} />
          </button>
        </div>

        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
          Direct YouTube Connection
        </p>
      </div>

      {/* Stream Selector Cards */}
      <div className="grid grid-cols-2 gap-3">
        {streams.map((stream) => (
          <button
            key={stream.id}
            onClick={() => {
              if (activeStreamId !== stream.id) {
                setActiveStreamId(stream.id);
                setIsPlaying(true);
                setIframeKey(k => k + 1);
              }
            }}
            className={cn(
              "relative h-24 rounded-2xl overflow-hidden transition-all text-left p-3 flex flex-col justify-end group shadow-sm border",
              activeStreamId === stream.id 
                ? "ring-2 ring-emerald-500 border-transparent shadow-md" 
                : "border-slate-100 opacity-75 hover:opacity-100"
            )}
          >
            <img 
              src={stream.thumbnail} 
              alt={stream.name}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className={cn(
              "absolute inset-0 transition-colors",
              activeStreamId === stream.id ? "bg-gradient-to-t from-emerald-950/90 via-black/40 to-transparent" : "bg-gradient-to-t from-black/80 via-black/30 to-transparent"
            )} />
            
            <div className="relative z-10 space-y-0.5">
              <div className="flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-emerald-300">
                <Radio size={9} className={activeStreamId === stream.id ? "animate-pulse" : ""} />
                <span>{stream.id === 'makkah' ? 'Masjid Al-Haram' : 'Al-Masjid An-Nabawi'}</span>
              </div>
              <p className="font-black text-white text-xs sm:text-sm tracking-tight drop-shadow-sm truncate">
                {stream.name}
              </p>
            </div>
          </button>
        ))}
      </div>

      {/* Admin Modal */}
      <AdminModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
      />
    </div>
  );
}