
import React, { useState, useEffect, useMemo } from 'react';
import { 
  ChevronLeft, 
  HeartPulse, 
  Stethoscope, 
  PhoneCall, 
  MapPin, 
  Search, 
  Building2, 
  Truck, 
  Droplets, 
  Pill, 
  Microscope, 
  Activity,
  ArrowRight,
  Hospital,
  Info,
  User,
  Clock
} from 'lucide-react';

// Firebase Imports
import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

const firebaseConfig = {
  apiKey: 'AIzaSyBg-atwF990YQ8PvDCwKPDxu8IZlQgOZr4',
  authDomain: 'koyra-paikgacha.firebaseapp.com',
  databaseURL: 'https://koyra-paikgacha-default-rtdb.firebaseio.com',
  projectId: 'koyra-paikgacha',
  storageBucket: 'koyra-paikgacha.firebasestorage.app',
  messagingSenderId: '637481870946',
  appId: '1:637481870946:web:ef71c1e96b2729b2eb133b'
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const db = getDatabase(app);

const toBn = (num: string | number) => 
  (num || '').toString().replace(/\d/g, d => "০১২৩৪৫৬৭৮৯"[parseInt(d)]);

const convertBnToEn = (str: string) => {
  const bn = ['০','১','২','৩','৪','৫','৬','৭','৮','৯'], en = ['0','1','2','3','4','5','6','7','8','9'];
  return (str || '').toString().split('').map(c => bn.indexOf(c) !== -1 ? en[bn.indexOf(c)] : c).join('');
};

const MEDICAL_SUBMENUS = [
  { id: 'doc', name: 'ডাক্তার খুঁজুন', icon: Stethoscope, color: '#E91E63' },
  { id: 'hosp', name: 'হাসপাতাল ও ক্লিনিক', icon: Hospital, color: '#3B82F6' },
  { id: 'amb', name: 'অ্যাম্বুলেন্স সেবা', icon: Truck, color: '#F59E0B' },
  { id: 'blood', name: 'ব্লাড ব্যাংক', icon: Droplets, color: '#EF4444' },
  { id: 'pharma', name: 'অনলাইন ফার্মেসি', icon: Pill, color: '#10B981' },
  { id: 'diag', name: 'ডায়াগনস্টিক সেন্টার', icon: Microscope, color: '#8B5CF6' },
  { id: 'tips', name: 'হেলথ টিপস', icon: Activity, color: '#EC4899' },
];

export default function PublicMedical({ onBack }: { onBack: () => void }) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!selectedCategory) {
      setItems([]);
      return;
    }

    setIsLoading(true);
    const medicalRef = ref(db, `medical_services/${selectedCategory}`);
    const unsubscribe = onValue(medicalRef, (snap) => {
      const val = snap.val();
      if (val) {
        const list = Object.keys(val).map(k => ({ ...val[k], id: k }));
        setItems(list);
      } else {
        setItems([]);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [selectedCategory]);

  const filteredItems = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return items.filter(item => 
      (item.name || '').toLowerCase().includes(term) || 
      (item.specialist || '').toLowerCase().includes(term) ||
      (item.location || '').toLowerCase().includes(term)
    );
  }, [items, searchTerm]);

  const handleBack = () => {
    if (selectedCategory) {
      setSelectedCategory(null);
      setSearchTerm('');
    } else {
      onBack();
    }
  };

  const getActiveMenu = () => MEDICAL_SUBMENUS.find(m => m.id === selectedCategory);

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500 p-5 bg-white">
      <header className="flex items-center gap-4 mb-6 shrink-0">
        <button onClick={handleBack} className="p-3 bg-white border border-slate-100 rounded-xl shadow-sm transition-transform active:scale-90">
          <ChevronLeft size={24} />
        </button>
        <div className="text-left overflow-hidden">
          <h2 className="text-xl font-black text-slate-800 leading-tight truncate">
            {selectedCategory ? getActiveMenu()?.name : 'চিকিৎসা সেবা'}
          </h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
            {selectedCategory ? 'বিস্তারিত তথ্য তালিকা' : 'ডাক্তার ও স্বাস্থ্য সেবা'}
          </p>
        </div>
      </header>

      {!selectedCategory ? (
        <div className="flex-1 overflow-y-auto no-scrollbar pb-32">
          <div className="grid grid-cols-1 gap-3 animate-in slide-in-from-bottom-4 duration-500">
            {MEDICAL_SUBMENUS.map((menu) => {
              const Icon = menu.icon;
              return (
                <button 
                  key={menu.id}
                  onClick={() => setSelectedCategory(menu.id)}
                  className="flex items-center justify-between p-5 bg-white rounded-[28px] border border-slate-100 shadow-sm active:scale-[0.98] transition-all group overflow-hidden relative"
                >
                  <div className="flex items-center gap-4 relative z-10">
                    <div 
                      className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform duration-300"
                      style={{ backgroundColor: `${menu.color}15`, color: menu.color }}
                    >
                      <Icon size={26} strokeWidth={2.5} />
                    </div>
                    <span className="font-black text-lg text-slate-800">{menu.name}</span>
                  </div>
                  <ArrowRight size={20} className="text-slate-200 group-hover:text-blue-500 transition-colors z-10" />
                </button>
              );
            })}
          </div>
          
          <div className="mt-8 p-6 bg-rose-50/50 rounded-[35px] border border-rose-100 flex items-start gap-4 text-left">
             <div className="p-2 bg-white rounded-xl text-rose-500 shadow-sm"><HeartPulse size={20} /></div>
             <p className="text-xs font-bold text-rose-600/80 leading-relaxed">জরুরি অবস্থায় নিকটস্থ হাসপাতাল বা অ্যাম্বুলেন্স নাম্বারে সরাসরি কল দিন। আমরা তথ্যগুলো নিয়মিত আপডেট করার চেষ্টা করি।</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col min-h-0 animate-in slide-in-from-right-4 duration-500">
          <div className="relative mb-6 shrink-0">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            <input 
              className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-100 rounded-[22px] font-bold outline-none focus:border-blue-400 shadow-inner" 
              placeholder={`${getActiveMenu()?.name} খুঁজুন...`} 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex-1 overflow-y-auto no-scrollbar space-y-5 pb-40 px-1">
            {isLoading ? (
                <div className="py-20 flex flex-col items-center justify-center gap-4 opacity-30">
                    <Clock className="animate-spin text-blue-600" size={40} />
                    <p className="font-black text-[10px] uppercase tracking-widest">তথ্য লোড হচ্ছে...</p>
                </div>
            ) : filteredItems.length > 0 ? (
                filteredItems.map((item, idx) => {
                    const CategoryIcon = getActiveMenu()?.icon || User;
                    return (
                        <div key={item.id} className="bg-white p-5 rounded-[35px] border border-slate-100 shadow-lg shadow-slate-100/50 space-y-4 text-left animate-in slide-in-from-bottom-2 duration-500" style={{ animationDelay: `${idx * 50}ms` }}>
                            
                            {/* Profile Header Row - Matches Screenshot 2 Top */}
                            <div className="flex items-start gap-4">
                                <div className="w-16 h-16 rounded-[22px] bg-rose-50 text-[#E91E63] border border-rose-100 overflow-hidden flex items-center justify-center shrink-0 shadow-sm">
                                    {item.photo ? (
                                        <img src={item.photo} className="w-full h-full object-cover" alt={item.name} />
                                    ) : (
                                        <CategoryIcon size={32} />
                                    )}
                                </div>
                                <div className="flex-1 overflow-hidden pt-1">
                                    <h4 className="font-black text-slate-800 text-lg leading-tight truncate">{item.name}</h4>
                                    {item.specialist && (
                                      <p className="text-sm font-bold text-blue-600 mt-0.5 truncate">{item.specialist}</p>
                                    )}
                                    {item.degree && (
                                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-0.5 truncate">{item.degree}</p>
                                    )}
                                </div>
                            </div>

                            {/* Location Row - Matches Screenshot 2 Middle */}
                            {item.location && (
                                <div className="flex items-center gap-2 px-1 border-t border-slate-50 pt-3">
                                    <MapPin size={14} className="shrink-0 text-[#E91E63]" />
                                    <span className="text-[13px] font-bold text-slate-500 truncate leading-none">{item.location}</span>
                                </div>
                            )}

                            {/* Action Button - Matches Screenshot 2 Bottom */}
                            <div className="pt-1">
                                <a 
                                    href={`tel:${convertBnToEn(item.mobile)}`} 
                                    className="w-full py-4 bg-[#E91E63] text-white font-black rounded-[20px] flex items-center justify-center gap-3 shadow-xl shadow-rose-500/30 active:scale-95 transition-all text-[15px]"
                                >
                                    <PhoneCall size={18} /> সিরিয়ালের জন্য কল দিন
                                </a>
                            </div>

                            {/* Description text - subtle if exists */}
                            {item.desc && (
                              <p className="text-[11px] font-bold text-slate-400/80 px-1 line-clamp-2 leading-relaxed italic">
                                {item.desc}
                              </p>
                            )}
                        </div>
                    );
                })
            ) : (
                <div className="py-24 text-center opacity-30 flex flex-col items-center gap-4">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 border border-slate-100">
                        <Info size={40} />
                    </div>
                    <div className="px-10">
                        <p className="font-black text-slate-800">কোনো তথ্য পাওয়া যায়নি</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">খুব শীঘ্রই তথ্য যুক্ত করা হবে</p>
                    </div>
                </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
