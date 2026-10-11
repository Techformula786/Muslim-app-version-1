import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calculator, Info, ChevronLeft, Coins, Landmark, Wallet, Gem, Briefcase, Heart, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { IslamicPattern, RubElHizb } from './DecorativeIcons';
import { cn } from '../lib/utils';
import { useToast } from './ToastContext';

export default function ZakatCalculator() {
  const navigate = useNavigate();
  const { showSuccess, showInfo } = useToast();
  const [goldPrice, setGoldPrice] = useState<number>(0);
  const [silverPrice, setSilverPrice] = useState<number>(0);
  const [currency, setCurrency] = useState('USD');
  const [exchangeRate, setExchangeRate] = useState<number>(1);

  const currencies = [
    { code: 'USD', symbol: '$', name: 'US Dollar', rate: 1 },
    { code: 'INR', symbol: '₹', name: 'Indian Rupee', rate: 83.5 },
    { code: 'PKR', symbol: '₨', name: 'Pakistani Rupee', rate: 278.5 },
    { code: 'GBP', symbol: '£', name: 'British Pound', rate: 0.79 },
    { code: 'EUR', symbol: '€', name: 'Euro', rate: 0.92 },
    { code: 'SAR', symbol: 'SR', name: 'Saudi Riyal', rate: 3.75 },
  ];
  
  // Assets
  const [cash, setCash] = useState<string>('');
  const [bank, setBank] = useState<string>('');
  const [gold, setGold] = useState<string>('');
  const [silver, setSilver] = useState<string>('');
  const [investments, setInvestments] = useState<string>('');
  const [businessAssets, setBusinessAssets] = useState<string>('');
  
  // Liabilities
  const [debts, setDebts] = useState<string>('');
  const [expenses, setExpenses] = useState<string>('');

  const [nisabThreshold, setNisabThreshold] = useState<number>(0);
  const [totalAssets, setTotalAssets] = useState<number>(0);
  const [totalLiabilities, setTotalLiabilities] = useState<number>(0);
  const [netAssets, setNetAssets] = useState<number>(0);
  const [zakatAmount, setZakatAmount] = useState<number>(0);
  const [isEligible, setIsEligible] = useState<boolean>(false);

  // Fetch gold/silver prices (mocking for now, but could use an API)
  useEffect(() => {
    // In a real app, fetch from an API
    // Prices in USD per gram
    setGoldPrice(75); 
    setSilverPrice(0.9);
  }, []);

  useEffect(() => {
    const rate = currencies.find(c => c.code === currency)?.rate || 1;
    setExchangeRate(rate);
  }, [currency]);

  useEffect(() => {
    const goldWeight = parseFloat(gold) || 0;
    const silverWeight = parseFloat(silver) || 0;
    
    // Nisab is usually 87.48g of gold or 612.36g of silver
    const nisabGold = 87.48 * goldPrice * exchangeRate;
    const nisabSilver = 612.36 * silverPrice * exchangeRate;
    
    // Most scholars recommend using the lower value (silver) for the benefit of the poor
    const currentNisab = nisabSilver;
    setNisabThreshold(currentNisab);

    const assets = (parseFloat(cash) || 0) + 
                   (parseFloat(bank) || 0) + 
                   (goldWeight * goldPrice * exchangeRate) + 
                   (silverWeight * silverPrice * exchangeRate) + 
                   (parseFloat(investments) || 0) + 
                   (parseFloat(businessAssets) || 0);
    
    const liabilities = (parseFloat(debts) || 0) + (parseFloat(expenses) || 0);
    
    const net = assets - liabilities;
    setTotalAssets(assets);
    setTotalLiabilities(liabilities);
    setNetAssets(net);

    if (net >= currentNisab) {
      setIsEligible(true);
      setZakatAmount(net * 0.025); // 2.5%
    } else {
      setIsEligible(false);
      setZakatAmount(0);
    }
  }, [cash, bank, gold, silver, investments, businessAssets, debts, expenses, goldPrice, silverPrice, exchangeRate, currency]);

  const currentCurrency = currencies.find(c => c.code === currency);

  return (
    <div className="flex flex-col min-h-screen bg-[#fcfcfd] pb-24">
      <header className="bg-white/80 backdrop-blur-xl border-b border-slate-100 p-6 z-50 shadow-sm overflow-hidden">
        <IslamicPattern className="opacity-[0.03]" />
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-4">
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate(-1)} 
              className="p-2.5 bg-slate-50 hover:bg-emerald-50 text-slate-600 hover:text-emerald-600 rounded-2xl transition-all"
            >
              <ChevronLeft size={22} />
            </motion.button>
            <h1 className="text-xl font-black text-slate-800 tracking-tight">Zakat Calculator</h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex bg-slate-100 p-1 rounded-2xl">
              {['USD', 'INR', 'PKR'].map((c) => (
                <button
                  key={c}
                  onClick={() => setCurrency(c)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-[10px] font-black transition-all",
                    currency === c ? "bg-white text-emerald-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
                  )}
                >
                  {c}
                </button>
              ))}
            </div>
            <select 
              value={currency} 
              onChange={(e) => setCurrency(e.target.value)}
              className="bg-slate-100 border-none rounded-2xl px-3 py-2 text-[10px] font-black text-slate-600 focus:ring-2 focus:ring-emerald-500 outline-none"
            >
              {currencies.map(c => (
                <option key={c.code} value={c.code}>{c.code}</option>
              ))}
            </select>
          </div>
        </div>
      </header>

      <div className="p-6 space-y-8 max-w-2xl mx-auto w-full">
        {/* Result Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "rounded-[48px] p-8 text-white relative overflow-hidden shadow-2xl transition-all duration-500",
            isEligible ? "bg-emerald-600 shadow-emerald-200" : "bg-slate-800 shadow-slate-200"
          )}
        >
          <div className="absolute inset-0 bg-islamic-pattern opacity-10" />
          <div className="relative z-10 flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calculator size={20} className="text-emerald-200" />
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-100">Calculation Summary</h3>
              </div>
              {isEligible && (
                <div className="bg-white/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                  Nisab Reached
                </div>
              )}
            </div>
            
            <div className="flex flex-col gap-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-emerald-100/70">Payable Zakat</p>
              <h2 className="text-5xl font-black tracking-tighter">
                {currentCurrency?.symbol} {zakatAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/10">
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-emerald-100/50">Net Assets</p>
                <p className="text-lg font-black tracking-tight">{currentCurrency?.symbol} {netAssets.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-emerald-100/50">Nisab Threshold</p>
                <p className="text-lg font-black tracking-tight">{currentCurrency?.symbol} {nisabThreshold.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Info Box */}
        <div className="bg-amber-50 border border-amber-100 rounded-[32px] p-6 flex gap-4">
          <Info className="text-amber-600 shrink-0" size={24} />
          <p className="text-xs text-amber-800 leading-relaxed font-medium">
            Zakat is 2.5% of your net wealth that has been in your possession for a lunar year, provided it exceeds the Nisab threshold.
          </p>
        </div>

        {/* Input Sections */}
        <div className="space-y-6">
          <SectionTitle icon={Wallet} title="Cash & Liquid Assets" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField label="Cash on Hand" value={cash} onChange={setCash} placeholder="0.00" />
            <InputField label="Bank Balance" value={bank} onChange={setBank} placeholder="0.00" />
          </div>

          <SectionTitle icon={Gem} title="Gold & Silver" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField label="Gold Weight (grams)" value={gold} onChange={setGold} placeholder="0.00" />
            <InputField label="Silver Weight (grams)" value={silver} onChange={setSilver} placeholder="0.00" />
          </div>

          <SectionTitle icon={Landmark} title="Investments & Business" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField label="Shares & Investments" value={investments} onChange={setInvestments} placeholder="0.00" />
            <InputField label="Business Assets" value={businessAssets} onChange={setBusinessAssets} placeholder="0.00" />
          </div>

          <SectionTitle icon={Briefcase} title="Liabilities & Debts" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField label="Short-term Debts" value={debts} onChange={setDebts} placeholder="0.00" />
            <InputField label="Immediate Expenses" value={expenses} onChange={setExpenses} placeholder="0.00" />
          </div>
        </div>

        {/* Action Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            if (zakatAmount > 0) {
              showSuccess("MashaAllah! You can now proceed to distribute your Zakat to verified recipients.");
            } else {
              showInfo("Your net wealth is below the Nisab threshold. Zakat is not obligatory, though Sadaqah is beloved.");
            }
          }}
          className="w-full py-6 bg-emerald-600 text-white rounded-[32px] font-black uppercase tracking-widest text-sm shadow-xl shadow-emerald-200 flex items-center justify-center gap-3 hover:bg-emerald-500 transition-all"
        >
          {zakatAmount > 0 ? <Heart size={18} fill="currentColor" /> : <Coins size={18} />}
          {zakatAmount > 0 ? 'Proceed to Donate' : 'Check Eligibility'}
          <ArrowRight size={18} />
        </motion.button>
      </div>
    </div>
  );
}

function SectionTitle({ icon: Icon, title }: { icon: any, title: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="w-8 h-8 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500">
        <Icon size={18} />
      </div>
      <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">{title}</h3>
    </div>
  );
}

function InputField({ label, value, onChange, placeholder }: { label: string, value: string, onChange: (val: string) => void, placeholder: string }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">{label}</label>
      <input 
        type="number" 
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-white border border-slate-100 rounded-[20px] py-4 px-6 text-sm font-bold focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none shadow-sm"
      />
    </div>
  );
}
