import { useState } from 'react';
import { ChevronLeft, ChevronRight, Trophy, Clock, Zap, Activity, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { cn, safeGetHijriDate, safeGetHijriParts } from '../lib/utils';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, getDay } from 'date-fns';
import { usePrayer } from './PrayerProvider';

export default function Tracker() {
  const navigate = useNavigate();
  const { prayerHistory, checkInPrayer } = usePrayer();
  const [currentDate, setCurrentDate] = useState(new Date());

  // Calculate streak from prayer history
  const todayKey = format(new Date(), 'yyyy-MM-dd');
  const todayPrayers = prayerHistory[todayKey] || {};
  const completedTodayCount = Object.values(todayPrayers).filter(Boolean).length;

  const totalCompletedPrayers = Object.values(prayerHistory).reduce((acc, day) => {
    return acc + Object.values(day).filter(Boolean).length;
  }, 0);

  const stats = {
    consecutive: Math.max(1, Object.keys(prayerHistory).length),
    accumulatedDays: Math.max(1, Object.keys(prayerHistory).length),
    accumulatedTimes: totalCompletedPrayers || 5,
    accumulatedDuration: (totalCompletedPrayers || 5) * 10
  };

  const getHijriMonth = (date: Date) => {
    const parts = safeGetHijriParts(date, {
      month: 'long',
      year: 'numeric'
    });
    const month = parts.find(p => p.type === 'month')?.value || 'Shawwal';
    const year = parts.find(p => p.type === 'year')?.value || '1447 AH';
    return `${month}, ${year}`;
  };

  const days = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate)
  });

  const startDay = getDay(startOfMonth(currentDate));
  const blanks = Array(startDay).fill(null);

  const prayersList = [
    { key: 'fajr', name: 'Fajr', time: '05:15 AM' },
    { key: 'dhuhr', name: 'Dhuhr', time: '12:30 PM' },
    { key: 'asr', name: 'Asr', time: '03:45 PM' },
    { key: 'maghrib', name: 'Maghrib', time: '06:20 PM' },
    { key: 'isha', name: 'Isha', time: '07:45 PM' },
  ];

  return (
    <div className="flex flex-col h-full bg-[#fcfcfd] overflow-hidden pb-24">
      {/* Header */}
      <header className="bg-[#004d40] pt-6 pb-14 px-6 rounded-b-[40px] relative overflow-hidden shadow-2xl shadow-emerald-900/20">
        <div className="relative z-10 flex items-center justify-between mb-4">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-2xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors backdrop-blur-md"
          >
            <ChevronLeft size={22} />
          </button>
          <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-amber-300">
            <Trophy size={20} fill="currentColor" />
          </div>
        </div>

        <div className="relative z-10">
          <h1 className="text-2xl font-black text-white mb-1">Prayer Tracker</h1>
          <p className="text-emerald-200 text-xs font-medium">Record daily Salah & build your streak</p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 -mt-8 relative z-20">
        {/* Streak Hero Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative bg-white rounded-[36px] p-6 shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden"
        >
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="w-10 h-10 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center">
                  <Zap size={22} fill="currentColor" className="animate-pulse" />
                </div>
                <span className="text-4xl font-black text-slate-800 tracking-tighter">{stats.consecutive}</span>
              </div>
              <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest">Day Prayer Streak</p>
            </div>

            <div className="text-right">
              <span className="text-2xl font-black text-emerald-600 tracking-tight">{completedTodayCount} / 5</span>
              <p className="text-slate-400 font-bold text-[9px] uppercase tracking-wider">Prayed Today</p>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Active Days', value: `${stats.accumulatedDays} d`, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Total Prayers', value: `${stats.accumulatedTimes}`, color: 'text-purple-600', bg: 'bg-purple-50' },
            { label: 'In Sujood', value: `${stats.accumulatedDuration} m`, color: 'text-amber-600', bg: 'bg-amber-50' }
          ].map((stat, i) => (
            <div key={i} className="bg-white p-3.5 rounded-[24px] border border-slate-100 shadow-sm text-center flex flex-col items-center gap-1.5">
              <div className={cn("w-7 h-7 rounded-xl flex items-center justify-center", stat.bg, stat.color)}>
                <Activity size={14} />
              </div>
              <p className="text-xs font-black text-slate-800 tracking-tight">{stat.value}</p>
              <p className="text-[8px] text-slate-400 font-black uppercase tracking-widest">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Today's Prayers Checklist */}
        <div className="bg-white rounded-[36px] p-6 border border-slate-100 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-black text-slate-800">Today's Prayers</h3>
            <span className="text-[10px] text-emerald-600 font-black uppercase tracking-wider">{format(new Date(), 'EEEE, d MMM')}</span>
          </div>

          <div className="space-y-2.5">
            {prayersList.map((prayer) => {
              const isChecked = !!todayPrayers[prayer.key];
              return (
                <div
                  key={prayer.key}
                  onClick={() => checkInPrayer(prayer.key)}
                  className={cn(
                    "p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all",
                    isChecked
                      ? "bg-emerald-50/70 border-emerald-200 text-emerald-900"
                      : "bg-slate-50 border-slate-100 hover:border-slate-200 text-slate-700"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-8 h-8 rounded-xl flex items-center justify-center transition-colors",
                      isChecked ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-400"
                    )}>
                      <CheckCircle2 size={16} />
                    </div>
                    <div>
                      <p className="font-bold text-xs">{prayer.name}</p>
                      <p className="text-[10px] text-slate-400">{prayer.time}</p>
                    </div>
                  </div>
                  <span className={cn(
                    "text-[10px] font-black uppercase px-2.5 py-1 rounded-lg",
                    isChecked ? "bg-emerald-100 text-emerald-700" : "bg-slate-200/60 text-slate-500"
                  )}>
                    {isChecked ? 'Prayed' : 'Check In'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Calendar Section */}
        <div className="bg-white rounded-[36px] p-6 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-black text-slate-800">{getHijriMonth(currentDate)}</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{format(currentDate, 'MMMM yyyy')}</p>
            </div>
            <div className="flex gap-1.5">
              <button 
                onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                className="p-2 bg-slate-50 hover:bg-slate-100 rounded-xl text-slate-600 transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <button 
                onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                className="p-2 bg-slate-50 hover:bg-slate-100 rounded-xl text-slate-600 transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-y-4 text-center">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
              <div key={`${day}-${i}`} className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{day}</div>
            ))}
            
            {blanks.map((_, i) => <div key={`blank-${i}`} />)}
            
            {days.map((day, i) => {
              const isToday = isSameDay(day, new Date());
              const isSelected = isSameDay(day, currentDate);
              const dayKey = format(day, 'yyyy-MM-dd');
              const hasActivity = prayerHistory[dayKey] && Object.values(prayerHistory[dayKey]).some(Boolean);
              
              return (
                <button 
                  key={i}
                  onClick={() => setCurrentDate(day)}
                  className="flex flex-col items-center gap-1 group py-1"
                >
                  <div className={cn(
                    "w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black transition-all",
                    isToday ? "bg-emerald-600 text-white shadow-md shadow-emerald-200" : 
                    isSelected ? "bg-emerald-100 text-emerald-800" : "text-slate-700 hover:bg-slate-50"
                  )}>
                    {format(day, 'd')}
                  </div>
                  {hasActivity && <div className="w-1 h-1 rounded-full bg-emerald-500" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Badges Section */}
        <div className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <h3 className="text-sm font-black text-slate-800">Achievements</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { name: "Early Bird", icon: "🌅", desc: "Fajr on time", color: "bg-amber-50" },
              { name: "Consistent", icon: "🔥", desc: "Prayer streak", color: "bg-rose-50" },
              { name: "Charitable", icon: "🤝", desc: "Zakat calculator", color: "bg-blue-50" },
              { name: "Remembrance", icon: "📿", desc: "Daily Dhikr & Tasbih", color: "bg-emerald-50" }
            ].map((badge, i) => (
              <div key={i} className="bg-white p-4 rounded-[28px] border border-slate-100 shadow-sm flex items-center gap-3">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0", badge.color)}>
                  {badge.icon}
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-black text-slate-800 truncate">{badge.name}</h4>
                  <p className="text-[9px] text-slate-400 font-bold truncate">{badge.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
