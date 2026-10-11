import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import Layout from './components/Layout';
import Home from './components/Home';
import QuranHome from './components/QuranHome';
import QuranReader from './components/QuranReader';
import QiblaAR from './components/QiblaAR';
import TawafTracker from './components/TawafTracker';
import Quiz from './components/Quiz';
import StatusSection from './components/StatusSection';
import Leaderboard from './components/Leaderboard';
import Challenges from './components/Challenges';
import Nearby from './components/Nearby';
import Tasbih from './components/Tasbih';
import Settings from './components/Settings';
import Duas from './components/Duas';
import Azkar from './components/Azkar';
import Hadith from './components/Hadith';
import MoodDua from './components/MoodDua';
import DuaWall from './components/DuaWall';
import LiveStream from './components/LiveStream';
import SunnahWellness from './components/SunnahWellness';
import HalalScanner from './components/HalalScanner';
import ZakatCalculator from './components/ZakatCalculator';
import AiIslamicSuite from './components/AiIslamicSuite';
import Community from './components/Community';
import Store from './components/Store';
import Shahada from './components/Shahada';
import Tracker from './components/Tracker';
import Gallery from './components/Gallery';
import Messages from './components/Messages';
import { PrayerProvider } from './components/PrayerProvider';
import { ThemeProvider } from './components/ThemeProvider';
import { ToastProvider } from './components/ToastContext';
import { QuranAudioProvider } from './context/QuranAudioContext';

function AnimatedRoutes() {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageWrapper><Home /></PageWrapper>} />
        <Route path="/quran" element={<PageWrapper><QuranHome /></PageWrapper>} />
        <Route path="/quran/:mode/:id" element={<PageWrapper><QuranReader /></PageWrapper>} />
        <Route path="/surah/:id" element={<PageWrapper><QuranReader /></PageWrapper>} />
        <Route path="/para/:id" element={<PageWrapper><QuranReader /></PageWrapper>} />
        <Route path="/tracker" element={<PageWrapper><Tracker /></PageWrapper>} />
        <Route path="/qibla" element={<PageWrapper><QiblaAR /></PageWrapper>} />
        <Route path="/tasbih" element={<PageWrapper><Tasbih /></PageWrapper>} />
        <Route path="/duas" element={<PageWrapper><Duas /></PageWrapper>} />
        <Route path="/azkar" element={<PageWrapper><Azkar /></PageWrapper>} />
        <Route path="/hadith" element={<PageWrapper><Hadith /></PageWrapper>} />
        <Route path="/mood-dua" element={<PageWrapper><MoodDua /></PageWrapper>} />
        <Route path="/dua-wall" element={<PageWrapper><DuaWall /></PageWrapper>} />
        <Route path="/tawaf" element={<PageWrapper><TawafTracker /></PageWrapper>} />
        <Route path="/quiz" element={<PageWrapper><Quiz /></PageWrapper>} />
        <Route path="/status" element={<PageWrapper><StatusSection /></PageWrapper>} />
        <Route path="/leaderboard" element={<PageWrapper><Leaderboard /></PageWrapper>} />
        <Route path="/challenges" element={<PageWrapper><Challenges /></PageWrapper>} />
        <Route path="/nearby" element={<PageWrapper><Nearby /></PageWrapper>} />
        <Route path="/live" element={<PageWrapper><LiveStream /></PageWrapper>} />
        <Route path="/wellness" element={<PageWrapper><SunnahWellness /></PageWrapper>} />
        <Route path="/scanner" element={<PageWrapper><HalalScanner /></PageWrapper>} />
        <Route path="/zakat" element={<PageWrapper><ZakatCalculator /></PageWrapper>} />
        <Route path="/ai" element={<PageWrapper><AiIslamicSuite /></PageWrapper>} />
        <Route path="/ai-assistant" element={<PageWrapper><AiIslamicSuite /></PageWrapper>} />
        <Route path="/community" element={<PageWrapper><Community /></PageWrapper>} />
        <Route path="/store" element={<PageWrapper><Store /></PageWrapper>} />
        <Route path="/shahada" element={<PageWrapper><Shahada /></PageWrapper>} />
        <Route path="/gallery" element={<PageWrapper><Gallery /></PageWrapper>} />
        <Route path="/messages" element={<PageWrapper><Messages /></PageWrapper>} />
        <Route path="/settings" element={<PageWrapper><Settings /></PageWrapper>} />
        {/* Wildcard redirect */}
        <Route path="*" element={<PageWrapper><Home /></PageWrapper>} />
      </Routes>
    </AnimatePresence>
  );
}

function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 1.02, y: -10 }}
      transition={{ 
        duration: 0.35, 
        ease: [0.23, 1, 0.32, 1],
      }}
      className="h-full relative"
    >
      {children}
    </motion.div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <ThemeProvider>
        <PrayerProvider>
          <QuranAudioProvider>
            <BrowserRouter>
              <Layout>
                <AnimatedRoutes />
              </Layout>
            </BrowserRouter>
          </QuranAudioProvider>
        </PrayerProvider>
      </ThemeProvider>
    </ToastProvider>
  );
}
