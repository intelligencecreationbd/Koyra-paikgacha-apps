
import React, { useState } from 'react';
import { ChevronLeft, HeartPulse, Stethoscope, PhoneCall, MapPin, Search } from 'lucide-react';

const toBn = (num: string | number) => 
  (num || '').toString().replace(/\d/g, d => "০১২৩৪৫৬৭৮৯"[parseInt(d)]);

const DOCTORS = [
  { id: '1', name: 'ডাঃ মোঃ আব্দুল হাই', specialist: 'মেডিসিন বিশেষজ্ঞ', degree: 'MBBS, BCS (Health)', mobile: '01712000000', location: 'উপজেলা স্বাস্থ্য কমপ্লেক্স, কয়রা' },
  { id: '2', name: 'ডাঃ রেজওয়ানা পারভীন', specialist: 'গাইনী বিশেষজ্ঞ', degree: 'MBBS, DGO', mobile: '01713000000', location: 'পাইকগাছা সদর হাসপাতাল' },
  { id: '3', name: 'ডাঃ সাইফুল ইসলাম', specialist: 'শিশু রোগ বিশেষজ্ঞ', degree: 'MBBS, FCPS', mobile: '01714000000', location: 'কয়রা ক্লিনিক অ্যান্ড ডায়াগনস্টিক' }
];

export default function PublicMedical({ onBack }: { onBack: () => void }) {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = DOCTORS.filter(d => 
    d.name.includes(searchTerm) || d.specialist.includes(searchTerm)
  );

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500 p-5">
      <header className="flex items-center gap-4 mb-6 shrink-0">
        <button onClick={onBack} className="p-3 bg-white border border-slate-100 rounded-xl shadow-sm"><ChevronLeft size={24} /></button>
        <div className="text-left">
          <h2 className="text-xl font-black text-slate-800">চিকিৎসা সেবা</h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ডাক্তার ও হাসপাতাল তালিকা</p>
        </div>
      </header>

      <div className="relative mb-6 shrink-0">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
        <input 
          className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-100 rounded-[22px] font-bold outline-none focus:border-blue-400" 
          placeholder="ডাক্তার বা স্পেশালিস্ট খুঁজুন..." 
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar space-y-4 pb-40">
        {filtered.map(doc => (
          <div key={doc.id} className="bg-white p-5 rounded-[32px] border border-slate-100 shadow-sm space-y-4 text-left">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center shrink-0 border border-rose-100">
                <Stethoscope size={28} />
              </div>
              <div className="overflow-hidden">
                <h4 className="font-black text-slate-800 text-lg leading-tight">{doc.name}</h4>
                <p className="text-xs font-bold text-blue-600 mt-1">{doc.specialist}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-1">{doc.degree}</p>
              </div>
            </div>
            <div className="pt-3 border-t border-slate-50 space-y-2">
              <div className="flex items-center gap-2 text-slate-500">
                <MapPin size={14} /><span className="text-xs font-bold">{doc.location}</span>
              </div>
              <a href={`tel:${doc.mobile}`} className="w-full py-4 bg-[#E91E63] text-white font-black rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-rose-500/20 active:scale-95 transition-all">
                <PhoneCall size={18} /> সিরিয়ালের জন্য কল দিন
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
