
import React, { useState } from 'react';
import { ChevronLeft, Calculator, Calendar, RefreshCw } from 'lucide-react';

const toBn = (num: string | number) => 
  (num || '০').toString().replace(/\d/g, d => "০১২৩৪৫৬৭৮৯"[parseInt(d)]);

export default function AgeCalculator({ onBack }: { onBack: () => void }) {
  const [dob, setDob] = useState('');
  const [result, setResult] = useState<any>(null);

  const calculateAge = () => {
    if (!dob) return;
    const birthDate = new Date(dob);
    const today = new Date();
    
    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();
    let days = today.getDate() - birthDate.getDate();

    if (days < 0) {
      months -= 1;
      days += new Date(today.getFullYear(), today.getMonth(), 0).getDate();
    }
    if (months < 0) {
      years -= 1;
      months += 12;
    }

    setResult({ years, months, days });
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500 p-5">
      <header className="flex items-center gap-4 mb-6 shrink-0">
        <button onClick={onBack} className="p-3 bg-white border border-slate-100 rounded-xl shadow-sm"><ChevronLeft size={24} /></button>
        <div className="text-left">
          <h2 className="text-xl font-black text-slate-800">বয়স ক্যালকুলেটর</h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">নির্ভুল বয়স গণনা করুন</p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto no-scrollbar space-y-6 pb-40">
        <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-xl space-y-6 text-left">
           <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">আপনার জন্ম তারিখ সিলেক্ট করুন</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500" size={20} />
                <input 
                  type="date" 
                  className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-black text-slate-800 outline-none"
                  value={dob}
                  onChange={e => setDob(e.target.value)}
                />
              </div>
           </div>
           <button 
             onClick={calculateAge}
             className="w-full py-5 bg-[#7C3AED] text-white font-black rounded-3xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-3"
           >
              <Calculator size={20} /> বয়স দেখুন
           </button>
        </div>

        {result && (
          <div className="animate-in zoom-in duration-500 space-y-4">
             <div className="grid grid-cols-3 gap-3">
                <div className="bg-blue-50 p-6 rounded-[30px] border border-blue-100 text-center">
                   <p className="text-[10px] font-black text-blue-500 uppercase">বছর</p>
                   <p className="text-3xl font-black text-blue-800">{toBn(result.years)}</p>
                </div>
                <div className="bg-emerald-50 p-6 rounded-[30px] border border-emerald-100 text-center">
                   <p className="text-[10px] font-black text-emerald-500 uppercase">মাস</p>
                   <p className="text-3xl font-black text-emerald-800">{toBn(result.months)}</p>
                </div>
                <div className="bg-rose-50 p-6 rounded-[30px] border border-rose-100 text-center">
                   <p className="text-[10px] font-black text-rose-500 uppercase">দিন</p>
                   <p className="text-3xl font-black text-rose-800">{toBn(result.days)}</p>
                </div>
             </div>
             <div className="p-6 bg-slate-900 text-white rounded-[35px] shadow-2xl flex items-center justify-between">
                <div className="text-left">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">বর্তমান বয়স</p>
                  <p className="text-lg font-black">{toBn(result.years)} বছর, {toBn(result.months)} মাস এবং {toBn(result.days)} দিন</p>
                </div>
                <button onClick={() => {setResult(null); setDob('');}} className="p-3 bg-white/10 rounded-2xl"><RefreshCw size={20}/></button>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}
