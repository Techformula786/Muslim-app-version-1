import { useState } from 'react';
import { ChevronLeft, Search, MessageSquare, Plus, Send, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { useToast } from './ToastContext';

interface Chat {
  id: number;
  user: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread: number;
  messages: Array<{ id: number; text: string; sender: 'me' | 'them'; time: string }>;
}

const INITIAL_CHATS: Chat[] = [
  { 
    id: 1, 
    user: "Ahmad Al-Farooq", 
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80", 
    lastMessage: "Assalamu Alaikum! Did you find the Tafsir book?", 
    time: "10:30 AM", 
    unread: 2,
    messages: [
      { id: 1, text: "Assalamu Alaikum brother!", sender: 'them', time: "10:28 AM" },
      { id: 2, text: "Did you find the Tafsir book you were searching for?", sender: 'them', time: "10:30 AM" }
    ]
  },
  { 
    id: 2, 
    user: "Fatima Zahra", 
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80", 
    lastMessage: "JazakAllah Khair for the Hadith reference!", 
    time: "Yesterday", 
    unread: 0,
    messages: [
      { id: 1, text: "Assalamu Alaikum sister Fatima", sender: 'me', time: "Yesterday" },
      { id: 2, text: "JazakAllah Khair for the Hadith reference!", sender: 'them', time: "Yesterday" }
    ]
  },
  { 
    id: 3, 
    user: "Zaid Ibn Tariq", 
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80", 
    lastMessage: "Let's meet at the mosque after Asr prayer inshaAllah.", 
    time: "2 days ago", 
    unread: 0,
    messages: [
      { id: 1, text: "Are you attending the Halaqah today?", sender: 'them', time: "2 days ago" },
      { id: 2, text: "Yes brother, let's meet at the mosque after Asr prayer inshaAllah.", sender: 'me', time: "2 days ago" }
    ]
  }
];

export default function Messages() {
  const navigate = useNavigate();
  const { showSuccess } = useToast();
  const [chats, setChats] = useState<Chat[]>(INITIAL_CHATS);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [messageText, setMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredChats = chats.filter(c => 
    c.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendMessage = () => {
    if (!messageText.trim() || !activeChat) return;

    const newMsg = {
      id: Date.now(),
      text: messageText.trim(),
      sender: 'me' as const,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedActiveChat = {
      ...activeChat,
      lastMessage: newMsg.text,
      time: newMsg.time,
      unread: 0,
      messages: [...activeChat.messages, newMsg]
    };

    setActiveChat(updatedActiveChat);
    setChats(prev => prev.map(c => c.id === activeChat.id ? updatedActiveChat : c));
    setMessageText('');

    // Simulate reply after 1.5 seconds
    setTimeout(() => {
      const replyMsg = {
        id: Date.now() + 1,
        text: "BarakAllah Feek brother! May Allah reward you.",
        sender: 'them' as const,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChats(prev => prev.map(c => {
        if (c.id === activeChat.id) {
          const chatWithReply = {
            ...c,
            lastMessage: replyMsg.text,
            time: replyMsg.time,
            messages: [...c.messages, replyMsg]
          };
          setActiveChat(curr => curr?.id === activeChat.id ? chatWithReply : curr);
          return chatWithReply;
        }
        return c;
      }));
    }, 1500);
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
              <h1 className="text-xl font-black text-slate-800">Ummah Messages</h1>
              <p className="text-[10px] text-emerald-600 font-black uppercase tracking-widest">Connect With Brothers & Sisters</p>
            </div>
          </div>
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-2xl">
            <MessageSquare size={20} />
          </div>
        </div>
        
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search conversations..."
            className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 pl-12 pr-4 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition-all font-medium"
          />
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 space-y-3 pb-28">
        {filteredChats.map((chat, i) => (
          <motion.div 
            key={chat.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => {
              setActiveChat(chat);
              // mark read
              setChats(prev => prev.map(c => c.id === chat.id ? { ...c, unread: 0 } : c));
            }}
            className="bg-white p-4 rounded-[24px] border border-slate-100 shadow-sm hover:shadow-md transition-all flex items-center gap-4 cursor-pointer"
          >
            <div className="relative shrink-0">
              <img src={chat.avatar} alt={chat.user} className="w-12 h-12 rounded-2xl object-cover border border-slate-100" />
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center mb-0.5">
                <h3 className="text-xs font-black text-slate-800 truncate">{chat.user}</h3>
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider shrink-0">{chat.time}</span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium truncate">{chat.lastMessage}</p>
            </div>

            {chat.unread > 0 && (
              <div className="w-5 h-5 bg-emerald-600 text-white rounded-full flex items-center justify-center text-[9px] font-black shrink-0">
                {chat.unread}
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Active Conversation Drawer/Modal */}
      <AnimatePresence>
        {activeChat && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-md h-[550px] rounded-[36px] shadow-2xl flex flex-col overflow-hidden"
            >
              {/* Chat Header */}
              <div className="p-4 bg-emerald-800 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img src={activeChat.avatar} alt={activeChat.user} className="w-10 h-10 rounded-xl object-cover" />
                  <div>
                    <h3 className="text-sm font-black leading-snug">{activeChat.user}</h3>
                    <p className="text-[9px] text-emerald-200 font-bold uppercase tracking-wider">Online</p>
                  </div>
                </div>
                <button onClick={() => setActiveChat(null)} className="p-2 hover:bg-white/10 rounded-full">
                  <X size={18} />
                </button>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#f8f9fb]">
                {activeChat.messages.map((m) => (
                  <div 
                    key={m.id} 
                    className={`flex flex-col ${m.sender === 'me' ? 'items-end' : 'items-start'}`}
                  >
                    <div className={`max-w-[78%] px-4 py-2.5 rounded-2xl text-xs font-medium leading-relaxed ${
                      m.sender === 'me' 
                        ? 'bg-emerald-600 text-white rounded-br-none shadow-md shadow-emerald-200' 
                        : 'bg-white text-slate-800 rounded-bl-none border border-slate-100 shadow-sm'
                    }`}>
                      {m.text}
                    </div>
                    <span className="text-[9px] text-slate-400 mt-1 px-1">{m.time}</span>
                  </div>
                ))}
              </div>

              {/* Chat Input */}
              <div className="p-3 bg-white border-t border-slate-100 flex items-center gap-2">
                <input 
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl py-2.5 px-4 text-xs outline-none focus:border-emerald-500 focus:bg-white"
                />
                <button 
                  onClick={handleSendMessage}
                  disabled={!messageText.trim()}
                  className="p-2.5 bg-emerald-600 disabled:opacity-40 text-white rounded-2xl hover:bg-emerald-500 transition-colors shadow-md shadow-emerald-200"
                >
                  <Send size={16} />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
