
import React, { useState, useEffect, useMemo } from 'react';
import { 
  ChevronLeft, 
  Phone, 
  User, 
  MapPin, 
  ShieldAlert, 
  ChevronDown, 
  PhoneCall, 
  Search 
} from 'lucide-react';
import { HotlineContact } from '../types';

// Firebase Imports
import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

const firebaseConfig = {
  apiKey: 'AIzaSyBg-atwF990YQ8PvOCwKPDxu8IZlQgOZr4',
  authDomain: 'koyra-paikgacha.firebaseapp.com',
  databaseURL: 'https://koyra-paikgacha-default-rtdb.firebaseio.com',
  projectId: 'koyra-paikgacha',
  storageBucket: 'koyra-paikgacha.firebasestorage.app',
  messagingSenderId: '637481870946',
  appId: '1:637481870946:web:ef71c1e96b2729b2eb133b'
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const db = getDatabase(app);

const convertBnToEn = (str: string) => {
  const bn = ['০','১','২','৩','৪','৫','৬','৭','৮','৯'], en = ['0','1','2','3','4','5','6','7','8','9'];
  return (str || '').toString().split('').map(c => bn.indexOf(c) !== -1 ? en[bn.indexOf(c)] : c).join('');
};

const WhatsAppIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.414 0 0 5.414 0 12.05c0 2.123.552 4.197 1.6 6.02L0 24l6.142-1.61A11.815 11.815 0 0012.05 24.1c6.632 0 12.05-5.417 12.05-12.05 0-3.212-1.25-6.232-3.518-8.513z"/>
  </svg>
);

const SkeletonHotline = () => (
  <div className="space-y-4 animate-pulse pt-4">
    {[1, 2, 3, 4].map(i => (
      <div key={i} className="h-28 bg-slate-50 border border-slate-100 rounded-[28px] w-full"></div>
    ))}
  </div>
);

/**
 * @LOCKED_COMPONENT
 * @Section Public Hotline Service View
 * @Status Design & Content Finalized
 */
const PublicHotline: React.FC<{ 
  initialServiceType?: string; 
  onBack: () => void;
  onServiceChange: (type: string) => void;
}> = ({ initialServiceType, onBack, onServiceChange }) => {
  const [contacts, setContacts] = useState<HotlineContact[]>(() => {
    const cached = localStorage.getItem('kp_cache_hotline');
    return cached ? JSON.parse(cached) : [];
  });
  const [isLoading, setIsLoading] = useState(contacts.length === 0);

  useEffect(() => {
    const hotlineRef = ref(db, 'hotline');
    const unsubscribe = onValue(hotlineRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.keys(data).map(key => ({ ...data[key], id: key }));
        setContacts(list);
        localStorage.setItem('kp_cache_hotline', JSON.stringify(list));
      } else {
        setContacts([]);
        localStorage.removeItem('kp_cache_hotline');
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const serviceTypes = useMemo(() => 
    Array.from(new Set(contacts.map(c => c.serviceType))).filter(Boolean).sort(), 
  [contacts]);
  
  const filteredContacts = useMemo(() => {
    if (!initialServiceType) return [];
    return contacts.filter(c => c.serviceType === initialServiceType);
  }, [contacts, initialServiceType]);

  const formatWhatsAppNumber = (num: string) => {
    const enNum = convertBnToEn(num || '');
    const cleaned = enNum.replace(/\D/g, '');
    if (cleaned.startsWith('0')) return `88${cleaned}`;
    return cleaned;
  };

  return (
    <div className="animate-in slide-in-from-right-4 duration-500">
      <div className="flex items-center gap-4 mb-2">
        <button 
          onClick={onBack} 
          className="p-3 bg-white rounded-xl shadow-sm border border-slate-100 transition-transform active:scale-90"
        >
          <ChevronLeft size={20} className="text-slate-800" />
        </button>
        <div className="text-left">
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">জরুরি হটলাইন</h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">প্রয়োজনে আপনার পাশে</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-[32px] shadow-xl border border-slate-50 space-y-6">
        <div className="space-y-1.5 text-left">
            <label className="text-[10px] font-bold text-slate-400 block uppercase tracking-widest pl-1">সার্ভিসের ধরন নির্বাচন করুন</label>
            <div className="relative">
                <select 
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl appearance-none font-black text-slate-800 focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                    value={initialServiceType || ''}
                    onChange={(e) => onServiceChange(e.target.value)}
                >
                    <option value="">নির্বাচন করুন</option>
                    {serviceTypes.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
            </div>
        </div>

        {isLoading ? (
            <SkeletonHotline />
        ) : initialServiceType && filteredContacts.length > 0 ? (
            <div className="space-y-4 animate-in fade-in duration-700">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-2 text-left">হটলাইন কন্টাক্ট লিস্ট</p>
                {filteredContacts.map((contact, idx) => (
                    <div key={contact.id} className="bg-white p-5 rounded-[28px] border border-slate-100 shadow-sm space-y-4 animate-in slide-in-from-bottom-2 duration-500" style={{ animationDelay: `${idx * 100}ms` }}>
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-2xl bg-blue-50/50 border border-blue-100 overflow-hidden flex items-center justify-center text-blue-200">
                                {contact.photo ? (
                                    <img src={contact.photo} alt={contact.name} className="w-full h-full object-cover" />
                                ) : (
                                    <User size={32} />
                                )}
                            </div>
                            <div className="flex-1 text-left overflow-hidden">
                                <h4 className="text-lg font-black text-slate-800 leading-tight truncate">{contact.name}</h4>
                                <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mt-1">{contact.serviceType}</p>
                                
                                {contact.address && (
                                  <div className="flex items-center gap-1.5 mt-1">
                                      <MapPin size={10} className="text-slate-400" />
                                      <p className="text-[11px] font-bold text-slate-400 truncate">{contact.address}</p>
                                  </div>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                            <div className="flex flex-col text-left">
                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">মোবাইল নম্বর</p>
                                <p className="text-base font-black text-slate-700 font-inter">{contact.mobile}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <a 
                                    href={`tel:${convertBnToEn(contact.mobile)}`}
                                    className="p-3 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-500/20 active:scale-90 transition-all"
                                >
                                    <PhoneCall size={18} />
                                </a>
                                <a 
                                    href={`https://wa.me/${formatWhatsAppNumber(contact.mobile)}`} 
                                    target="_blank" rel="noopener noreferrer"
                                    className="p-3 bg-[#25D366] text-white rounded-xl shadow-lg shadow-emerald-500/20 active:scale-90 transition-all"
                                >
                                    <WhatsAppIcon size={18} />
                                </a>
                                {contact.centralHotline && (
                                    <a 
                                        href={`tel:${convertBnToEn(contact.centralHotline)}`}
                                        className="p-3 bg-red-50 text-red-600 rounded-xl border border-red-100 active:scale-90 transition-all flex items-center gap-2"
                                    >
                                        <ShieldAlert size={18} />
                                        <span className="text-xs font-black font-inter">{contact.centralHotline}</span>
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        ) : initialServiceType && filteredContacts.length === 0 ? (
            <div className="text-center py-20 opacity-30 flex flex-col items-center gap-4 animate-in fade-in duration-500">
                <ShieldAlert size={48} className="text-slate-300" />
                <p className="font-black text-slate-800 text-sm">দুঃখিত, এই ক্যাটাগরিতে কোনো তথ্য পাওয়া যায়নি</p>
            </div>
        ) : (
            <div className="text-center py-24 opacity-30 flex flex-col items-center gap-5 animate-in fade-in duration-700">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 border border-slate-100">
                    <Search size={40} />
                </div>
                <div className="space-y-1.5 px-10">
                    <p className="font-black text-slate-800 text-sm">অনুগ্রহ করে একটি সেবা নির্বাচন করুন</p>
                    <p className="text-[10px] font-bold text-slate-400 leading-relaxed uppercase tracking-widest">সঠিক তথ্য খুঁজে পেতে ড্রপডাউনটি ব্যবহার করুন</p>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default PublicHotline;
