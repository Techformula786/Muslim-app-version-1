import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, HelpCircle, CheckCircle2, XCircle, Trophy, Sparkles, Brain, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { awardKarma } from '../lib/karma';

const QUIZ_QUESTIONS = [
  {
    id: 1,
    question: "Which Prophet is known as 'Khalilullah' (Friend of Allah)?",
    options: ["Prophet Musa (AS)", "Prophet Ibrahim (AS)", "Prophet Isa (AS)", "Prophet Nuh (AS)"],
    correct: 1,
    explanation: "Prophet Ibrahim (AS) is honored with the title 'Khalilullah'."
  },
  {
    id: 2,
    question: "How many obligatory daily prayers (Fard Salah) are there in Islam?",
    options: ["3", "4", "5", "6"],
    correct: 2,
    explanation: "There are 5 daily obligatory prayers (Fajr, Dhuhr, Asr, Maghrib, Isha)."
  },
  {
    id: 3,
    question: "In which blessed city is the holy Kaaba situated?",
    options: ["Madinah", "Jerusalem", "Makkah", "Ta'if"],
    correct: 2,
    explanation: "The Holy Kaaba (Bayt Allah) is situated in Makkah al-Mukarramah."
  },
  {
    id: 4,
    question: "What is the first month of the Islamic calendar?",
    options: ["Ramadan", "Muharram", "Shawwal", "Dhul-Hijjah"],
    correct: 1,
    explanation: "Muharram is the first month of the Hijri calendar."
  },
  {
    id: 5,
    question: "Which companion of the Prophet (PBUH) was known as 'As-Siddiq'?",
    options: ["Umar ibn al-Khattab", "Ali ibn Abi Talib", "Abu Bakr (RA)", "Uthman ibn Affan"],
    correct: 2,
    explanation: "Abu Bakr (RA) was given the title 'As-Siddiq' (The Truthful)."
  }
];

export default function Quiz() {
  const navigate = useNavigate();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [quizComplete, setQuizComplete] = useState(false);

  const currentQuestion = QUIZ_QUESTIONS[currentIdx];

  const handleOptionSelect = (idx: number) => {
    if (selectedOption !== null) return;
    setSelectedOption(idx);
    setShowResult(true);
    if (idx === currentQuestion.correct) {
      setScore(prev => prev + 1);
      awardKarma(10);
    }
  };

  const nextQuestion = () => {
    if (currentIdx < QUIZ_QUESTIONS.length - 1) {
      setCurrentIdx(prev => prev + 1);
      setSelectedOption(null);
      setShowResult(false);
    } else {
      setQuizComplete(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfcfd] pb-24">
      <header className="bg-white/80 backdrop-blur-xl border-b border-slate-100 p-6 z-50 shadow-sm sticky top-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2.5 bg-slate-50 text-slate-600 rounded-2xl">
              <ChevronLeft size={22} />
            </button>
            <div>
              <h1 className="text-xl font-black text-slate-800 tracking-tight">Islamic Quiz</h1>
              <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Question {currentIdx + 1} of {QUIZ_QUESTIONS.length}</p>
            </div>
          </div>
          <HelpCircle className="text-emerald-500" size={24} />
        </div>
      </header>

      <div className="p-6">
        {!quizComplete ? (
          <div className="space-y-8">
            {/* Progress Bar */}
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${((currentIdx + 1) / QUIZ_QUESTIONS.length) * 100}%` }}
                className="h-full bg-emerald-500"
              />
            </div>

            {/* Question Card */}
            <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm space-y-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <Brain size={120} />
              </div>
              
              <h2 className="text-2xl font-black text-slate-800 leading-tight relative z-10">
                {currentQuestion.question}
              </h2>

              <div className="grid grid-cols-1 gap-4 relative z-10">
                {currentQuestion.options.map((option, i) => {
                  const isCorrect = i === currentQuestion.correct;
                  const isSelected = i === selectedOption;
                  
                  return (
                    <button
                      key={i}
                      onClick={() => handleOptionSelect(i)}
                      disabled={selectedOption !== null}
                      className={cn(
                        "p-6 rounded-3xl border-2 text-left transition-all flex items-center justify-between group",
                        selectedOption === null 
                          ? "border-slate-50 hover:border-emerald-100 hover:bg-emerald-50/30" 
                          : isCorrect 
                            ? "border-emerald-500 bg-emerald-50 text-emerald-900" 
                            : isSelected 
                              ? "border-rose-500 bg-rose-50 text-rose-900" 
                              : "border-slate-50 opacity-40"
                      )}
                    >
                      <span className="font-bold">{option}</span>
                      {selectedOption !== null && isCorrect && <CheckCircle2 size={20} className="text-emerald-500" />}
                      {selectedOption !== null && isSelected && !isCorrect && <XCircle size={20} className="text-rose-500" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Result & Explanation */}
            <AnimatePresence>
              {showResult && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className={cn(
                    "p-6 rounded-3xl border flex gap-4",
                    selectedOption === currentQuestion.correct ? "bg-emerald-50 border-emerald-100" : "bg-amber-50 border-amber-100"
                  )}>
                    <div className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0",
                      selectedOption === currentQuestion.correct ? "bg-emerald-100 text-emerald-600" : "bg-amber-100 text-amber-600"
                    )}>
                      <Sparkles size={24} />
                    </div>
                    <div className="space-y-1">
                      <h4 className={cn("font-black uppercase tracking-widest text-[10px]", selectedOption === currentQuestion.correct ? "text-emerald-600" : "text-amber-600")}>
                        {selectedOption === currentQuestion.correct ? "Correct Answer!" : "Did you know?"}
                      </h4>
                      <p className="text-sm font-medium text-slate-700 leading-relaxed">
                        {currentQuestion.explanation}
                      </p>
                    </div>
                  </div>

                  <button 
                    onClick={nextQuestion}
                    className="w-full py-5 bg-slate-900 text-white rounded-[24px] font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 shadow-2xl shadow-slate-900/20"
                  >
                    {currentIdx === QUIZ_QUESTIONS.length - 1 ? "Finish Quiz" : "Next Question"} <ArrowRight size={16} />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white p-12 rounded-[48px] border border-slate-100 shadow-sm text-center space-y-8"
          >
            <div className="w-24 h-24 bg-amber-50 text-amber-500 rounded-[32px] flex items-center justify-center mx-auto border border-amber-100">
              <Trophy size={48} fill="currentColor" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-3xl font-black text-slate-800 tracking-tight">Quiz Complete!</h2>
              <p className="text-slate-400 font-medium">MashaAllah! You've completed today's quiz.</p>
            </div>

            <div className="bg-slate-50 p-8 rounded-[32px] flex items-center justify-around">
              <div className="text-center">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Score</p>
                <p className="text-3xl font-black text-emerald-600">{score}/{QUIZ_QUESTIONS.length}</p>
              </div>
              <div className="w-px h-12 bg-slate-200" />
              <div className="text-center">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Karma</p>
                <p className="text-3xl font-black text-amber-500">+{score * 10}</p>
              </div>
            </div>

            <button 
              onClick={() => navigate('/')}
              className="w-full py-5 bg-slate-900 text-white rounded-[24px] font-black uppercase tracking-widest text-xs shadow-2xl shadow-slate-900/20"
            >
              Back to Home
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
