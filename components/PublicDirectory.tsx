
import React, { useState, useEffect, useMemo } from 'react';
import { 
  ChevronLeft, 
  PhoneCall, 
  MapPin, 
  Search, 
  UserCircle,
  Smartphone,
  Clock,
  CheckCircle2,
  User,
  ChevronDown,
  ChevronRight,
  LayoutGrid,
  Filter,
  ArrowLeft,
  Mail,
  Type,
  Info,
  MessageCircle
} from 'lucide-react';
import { useLocation } from 'react-router-dom';

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

const toBn = (num: string | number | undefined | null) => {
  const val = num ?? '';
  return val.toString().replace(/\d/g, d => "০১২৩৪৫৬৭৮৯"[parseInt(d)]);
};

const convertBnToEn = (str: string) => {
  const bn = ['০','১','২','৩','৪','৫','৬','৭','৮','৯'], en = ['0','1','2','3','4','5','6','7','8','9'];
  return (str || '').toString().split('').map(c => bn.indexOf(c) !== -1 ? en[bn.indexOf(c)] : c).join('');
};

const formatWhatsAppNumber = (num: string) => {
  const enNum = convertBnToEn(num || '');
  const cleaned = enNum.replace(/\D/g, '');
  if (cleaned.startsWith('0')) return `88${cleaned}`;
  return cleaned;
};

const WhatsAppIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.414 0 0 5.414 0 12.05c0 2.123.552 4.197 1.6 6.02L0 24l6.142-1.61A11.815 11.815 0 0012.05 24.1c6.632 0 12.05-5.417 12.05-12.05 0-3.212-1.25-6.232-3.518-8.513z"/>
  </svg>
);

const ContactInfoRow: React.FC<{ icon: any, label: string, value: string, colorClass?: string, iconColor?: string }> = ({ icon: Icon, label, value, colorClass = "bg-slate-50", iconColor = "text-slate-400" }) => (
  <div className={`${colorClass}/50 p-5 rounded-[32px] border border-slate-100 flex items-start gap-4 text-left shadow-sm`}>
    <div className={`w-11 h-11 bg-white rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${iconColor}`}><Icon size={20} /></div>
    <div className="overflow-hidden">
      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{label}</p>
      <p className="text-sm font-bold text-slate-700 leading-relaxed">{value}</p>
    </div>
  </div>
);

const MobileActionRow: React.FC<{ mobile: string, label: string }> = ({ mobile, label }) => (
  <div className="bg-slate-50/50 p-5 rounded-[32px] border border-slate-100 flex items-center justify-between shadow-sm">
    <div className="flex items-center gap-4 text-left overflow-hidden">
      <div className="w-11 h-11 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center shadow-sm shrink-0"><Smartphone size={20} /></div>
      <div className="overflow-hidden">
         <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{label}</p>
         <p className="text-base font-black text-slate-800 font-inter tracking-tight truncate">{mobile}</p>
      </div>
    </div>
    <div className="flex items-center gap-2">
      <a href={`tel:${convertBnToEn(mobile)}`} className="p-3 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-500/20 active:scale-90 transition-all flex items-center justify-center">
        <PhoneCall size={18} />
      </a>
      <a 
        href={`https://wa.me/${formatWhatsAppNumber(mobile)}`} 
        target="_blank" 
        rel="noopener noreferrer" 
        className="p-3 bg-[#25D366] text-white rounded-xl shadow-lg shadow-emerald-500/20 active:scale-90 transition-all flex items-center justify-center"
      >
        <WhatsAppIcon size={18} />
      </a>
    </div>
  </div>
);

interface PublicDirectoryProps {
  id: string; 
  categoryName: string;
  pathParts?: string[];
  onNavigate: (path: string) => void;
  onBack: () => void;
}

const PublicDirectory: React.FC<PublicDirectoryProps> = ({ id, categoryName, pathParts = [], onNavigate, onBack }) => {
  const [allCategories, setAllCategories] = useState<any[]>([]);
  const [dataList, setDataList] = useState<any[]>([]);
  const [globalData, setGlobalData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const profileIdFromUrl = searchParams.get('item');

  const selections = useMemo(() => pathParts, [pathParts]);

  const selectedItem = useMemo(() => {
    if (!profileIdFromUrl) return null;
    return globalData.find(item => item.id === profileIdFromUrl) || null;
  }, [profileIdFromUrl, globalData]);

  useEffect(() => {
    if (selectedItem) {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [selectedItem]);

  useEffect(() => {
    setIsLoading(true);
    const catRef = ref(db, 'public_directory_categories');
    const unsubscribe = onValue(catRef, snap => {
      const val = snap.val();
      setAllCategories(val ? Object.values(val) : []);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const globalDataRef = ref(db, 'public_directory_data');
    const unsubscribe = onValue(globalDataRef, snap => {
      const val = snap.val();
      if (val) {
        let all: any[] = [];
        Object.keys(val).forEach(catId => {
          const items = val[catId];
          Object.keys(items).forEach(itemId => {
            all.push({ ...items[itemId], id: itemId, categoryId: catId });
          });
        });
        setGlobalData(all);
      }
    });
    return () => unsubscribe();
  }, []);

  const levels = useMemo(() => {
    const result = [];
    const rootCats = allCategories.filter(c => c.parentId === 'root');
    result.push({ parentId: 'root', items: rootCats });

    for (let i = 0; i < selections.length; i++) {
      const children = allCategories.filter(c => c.parentId === selections[i]);
      if (children.length > 0) {
        result.push({ parentId: selections[i], items: children, depth: i + 1 });
      } else {
        break;
      }
    }
    return result;
  }, [allCategories, selections]);

  const leafId = useMemo(() => {
    if (selections.length === 0) return null;
    const lastId = selections[selections.length - 1];
    const hasChildren = allCategories.some(c => c.parentId === lastId);
    return hasChildren ? null : lastId;
  }, [allCategories, selections]);

  useEffect(() => {
    if (!leafId) {
      setDataList([]);
      return;
    }
    setIsLoading(true);
    const dataRef = ref(db, `public_directory_data/${leafId}`);
    const unsubscribe = onValue(dataRef, snap => {
      const val = snap.val();
      if (val) {
        const list = Object.keys(val).map(key => ({ ...val[key], id: key }));
        setDataList(list.sort((a, b) => {
          const isA = (a.designation || '').includes('চেয়ারম্যান');
          const isB = (b.designation || '').includes('চেয়ারম্যান');
          if (isA && !isB) return -1;
          if (!isA && isB) return 1;
          return (a.name || '').localeCompare(b.name || '');
        }));
      } else {
        setDataList([]);
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, [leafId]);

  const handleSelection = (levelIdx: number, value: string) => {
    if (!value) {
      if (levelIdx === 0) onNavigate(`/category/15`);
      else {
        const parentPath = selections.slice(0, levelIdx).join('/');
        onNavigate(`/category/15/${parentPath}`);
      }
      return;
    }
    const newPath = selections.slice(0, levelIdx);
    newPath.push(value);
    onNavigate(`/category/15/${newPath.join('/')}`);
  };

  const openProfile = (item: any) => {
    onNavigate(`${location.pathname}?item=${item.id}`);
  };

  const filteredSearchResults = useMemo(() => {
    const source = isSearchMode ? globalData : dataList;
    if (isSearchMode && !searchTerm.trim()) return [];
    if (!isSearchMode && !searchTerm.trim()) return source;

    const term = searchTerm.toLowerCase();
    const enTerm = convertBnToEn(term);
    
    return source.filter(item => 
      (item.name || '').toLowerCase().includes(term) ||
      (item.designation || '').toLowerCase().includes(term) ||
      (item.mobile || '').includes(term) ||
      (item.address || '').toLowerCase().includes(term) ||
      convertBnToEn(item.mobile || '').includes(enTerm)
    );
  }, [searchTerm, isSearchMode, globalData, dataList]);

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] animate-in fade-in duration-500">
      <header className="flex items-center justify-between mb-4 shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-3 bg-white border border-slate-100 rounded-xl shadow-sm transition-transform active:scale-90 shrink-0">
            <ChevronLeft size={20} className="text-slate-800" />
          </button>
          <div className="text-left overflow-hidden">
            <h2 className="text-xl font-black text-slate-800 leading-tight truncate">{categoryName}</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
              {isSearchMode ? 'পুরো ডিরেক্টরিতে খুঁজুন' : 'আপনার পছন্দ মত সিলেক্ট করুন'}
            </p>
          </div>
        </div>
        <button 
          onClick={() => { setIsSearchMode(!isSearchMode); setSearchTerm(''); }}
          className={`p-3 rounded-xl shadow-sm transition-all active:scale-90 shrink-0 flex items-center justify-center border ${isSearchMode ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-blue-600 border-slate-100'}`}
        >
          {isSearchMode ? <ArrowLeft size={22} /> : <Search size={22} strokeWidth={2.5} />}
        </button>
      </header>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-40 space-y-5">
        {selectedItem ? (
          <div className="animate-in slide-in-from-bottom-6 duration-500 w-full flex flex-col items-center space-y-6">
            <div className="w-full bg-white p-8 rounded-[45px] shadow-[0_20px_60px_rgba(0,0,0,0.06)] border border-slate-50 space-y-8">
                <div className="flex flex-col items-center gap-5">
                  <div className="relative">
                    <div className="w-32 h-32 rounded-[40px] border-[5px] border-white shadow-xl overflow-hidden bg-slate-50 flex items-center justify-center text-slate-200">
                      {selectedItem.photo ? <img src={selectedItem.photo} className="w-full h-full object-cover" alt="" /> : <UserCircle size={60} strokeWidth={1} />}
                    </div>
                    <div className="absolute -bottom-2 -right-2 p-2.5 bg-blue-600 text-white rounded-2xl shadow-lg border-4 border-white">
                       <CheckCircle2 size={16} />
                    </div>
                  </div>
                  <div className="text-center space-y-1">
                    <h1 className="text-2xl font-black text-slate-800 leading-tight">{selectedItem.name}</h1>
                    <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em]">{selectedItem.designation || 'বিস্তারিত'}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  {selectedItem.mobile && <MobileActionRow mobile={selectedItem.mobile} label="প্রাথমিক মোবাইল নম্বর" />}
                  {selectedItem.extraMobiles && selectedItem.extraMobiles.map((mob: string, i: number) => mob && (
                    <MobileActionRow key={i} mobile={mob} label={`অতিরিক্ত নম্বর (${toBn(i + 1)})`} />
                  ))}
                  {selectedItem.email && <ContactInfoRow icon={Mail} label="ইমেইল এড্রেস" value={selectedItem.email} colorClass="bg-blue-50" iconColor="text-blue-500" />}
                  {selectedItem.address && <ContactInfoRow icon={MapPin} label="ঠিকানা" value={selectedItem.address} colorClass="bg-emerald-50" iconColor="text-emerald-500" />}
                  {selectedItem.customInfo && selectedItem.customInfo.map((info: any, i: number) => (info.label && info.value) && (
                    <ContactInfoRow key={i} icon={Type} label={info.label} value={info.value} colorClass="bg-indigo-50" iconColor="text-indigo-500" />
                  ))}
                </div>
            </div>
          </div>
        ) : isSearchMode ? (
          <div className="space-y-5 animate-in slide-in-from-top-4 duration-500">
             <div className="relative mx-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input 
                    autoFocus
                    className="w-full pl-12 pr-5 py-4 bg-white border border-slate-100 rounded-[22px] font-bold outline-none shadow-sm focus:border-blue-400 transition-all" 
                    placeholder="নাম, পদবী, মোবাইল বা ঠিকানা দিয়ে খুঁজুন..." 
                    value={searchTerm} 
                    onChange={e => setSearchTerm(e.target.value)} 
                />
             </div>
             <div className="space-y-3 px-1">
                {searchTerm.trim().length > 0 ? (
                  filteredSearchResults.length === 0 ? (
                    <div className="py-20 text-center opacity-30 flex flex-col items-center gap-4">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-200"><Search size={32} /></div>
                      <p className="font-bold text-slate-400">এই তথ্যে কিছু খুঁজে পাওয়া যায়নি</p>
                    </div>
                  ) : (
                    <>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">সার্চ ফলাফল ({toBn(filteredSearchResults.length)})</p>
                      {filteredSearchResults.map((item) => (
                        <button key={item.id} onClick={() => openProfile(item)} className="w-full flex items-center justify-between p-5 bg-white rounded-[32px] border border-slate-50 shadow-sm active:scale-[0.98] transition-all text-left">
                          <div className="flex items-center gap-4 flex-1 overflow-hidden">
                            <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-200 shrink-0">
                              {item.photo ? <img src={item.photo} className="w-full h-full object-cover" alt="" /> : <UserCircle size={28} />}
                            </div>
                            <div className="overflow-hidden">
                              <h4 className="font-black text-slate-800 truncate text-sm">{item.name}</h4>
                              <p className="text-[10px] font-bold text-slate-400 truncate mt-0.5">{item.designation || 'নির্ধারিত নয়'}</p>
                            </div>
                          </div>
                          <ChevronRight size={18} className="text-slate-200 shrink-0" />
                        </button>
                      ))}
                    </>
                  )
                ) : (
                  <div className="py-24 text-center opacity-30 flex flex-col items-center gap-4">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-200"><Search size={32} /></div>
                    <p className="font-bold text-slate-400">পুরো অ্যাপের মোবাইল নম্বর খুঁজে পেতে এখানে লিখুন</p>
                  </div>
                )}
             </div>
          </div>
        ) : (
          <div className="space-y-5 animate-in fade-in duration-500">
             <div className="bg-slate-50/50 p-6 rounded-[35px] border border-slate-100 shadow-inner space-y-5 mx-1">
                {levels.map((level, idx) => (
                    <div key={idx} className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-2 block text-left">
                            {idx === 0 ? 'প্রধান বিভাগ নির্বাচন করুন' : `সাব-ক্যাটাগরি (স্তর ${toBn(idx)})`}
                        </label>
                        <div className="relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500"><LayoutGrid size={16} /></div>
                            <select 
                                className="w-full pl-11 pr-10 py-4 bg-white border border-slate-100 rounded-[22px] font-black text-slate-800 appearance-none outline-none shadow-sm focus:border-blue-400 transition-all text-sm"
                                value={selections[idx] || ''}
                                onChange={(e) => handleSelection(idx, e.target.value)}
                            >
                                <option value="">নির্বাচন করুন...</option>
                                {level.items.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={18} />
                        </div>
                    </div>
                ))}
             </div>

             {leafId ? (
                <div className="space-y-4 animate-in fade-in duration-500 px-1">
                    {isLoading ? (
                      <div className="py-20 flex flex-col items-center justify-center gap-4 opacity-20"><Clock className="animate-spin" size={40} /></div>
                    ) : filteredSearchResults.length === 0 ? (
                      <div className="py-20 text-center opacity-30 flex flex-col items-center gap-4">
                          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-200"><Search size={32} /></div>
                          <p className="font-bold text-slate-400">এই ক্যাটাগরিতে কোনো তথ্য পাওয়া যায়নি</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2 text-left">ফলাফল ({toBn(filteredSearchResults.length)})</p>
                          {filteredSearchResults.map((item) => (
                             <button key={item.id} onClick={() => openProfile(item)} className="w-full flex items-center justify-between p-5 bg-white rounded-[32px] border border-slate-100 shadow-sm active:scale-[0.98] transition-all text-left group">
                                <div className="flex items-center gap-4 flex-1 overflow-hidden">
                                   <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                                      {item.photo ? <img src={item.photo} className="w-full h-full object-cover" alt="" /> : <UserCircle size={28} className="text-slate-200" />}
                                   </div>
                                   <div className="overflow-hidden">
                                      <h4 className="font-black text-slate-800 truncate text-sm">{item.name}</h4>
                                      <p className="text-[10px] font-bold text-slate-400 mt-0.5 truncate">{item.designation || 'নির্ধারিত নয়'}</p>
                                   </div>
                                </div>
                                <ChevronRight size={18} className="text-slate-200 group-hover:text-blue-500 transition-colors shrink-0" />
                             </button>
                          ))}
                      </div>
                    )}
                </div>
             ) : (
                <div className="py-20 text-center opacity-30 flex flex-col items-center gap-4">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-200"><Filter size={32} /></div>
                    <p className="font-bold text-slate-400 px-10 text-sm">কন্টাক্ট লিস্ট দেখতে অনুগ্রহ করে ড্রপডাউন থেকে ক্যাটাগরিগুলো নির্বাচন করুন</p>
                </div>
             )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicDirectory;
