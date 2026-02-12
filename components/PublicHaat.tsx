
import React, { useState, useEffect, useMemo } from 'react';
import { 
  ChevronLeft, 
  ChevronRight,
  Search, 
  ShoppingBasket, 
  PhoneCall, 
  MapPin, 
  Tag, 
  Clock, 
  ArrowRight,
  Store,
  Sparkles,
  RefreshCw,
  X,
  Plus,
  Info,
  ExternalLink,
  FileText,
  CheckCircle2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Firebase Imports
import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
import { getFirestore, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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
const dbFs = getFirestore(app);

const toBn = (num: string | number) => 
  (num || '').toString().replace(/\d/g, d => "০১২৩৪৫৬৭৮৯"[parseInt(d)]);

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

interface Product {
  id: string; 
  name: string; 
  category: string; 
  price: string; 
  offerPrice?: string;
  condition: string;
  unit: string; 
  sellerName: string; 
  mobile: string; 
  location: string; 
  photo?: string; 
  description?: string; 
  timestamp: string; 
  userId?: string;
  isVerified?: boolean; // Temporary field for display
}

const PublicHaat: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<{id: string, name: string}[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [filterSeller, setFilterSeller] = useState<{id: string, name: string} | null>(null);
  const [showTerms, setShowTerms] = useState(false);
  const [globalTerms, setGlobalTerms] = useState('');
  const [allUsers, setAllUsers] = useState<any[]>([]);

  useEffect(() => {
    setLoading(true);
    // Listen for products
    onValue(ref(db, 'online_haat'), snap => {
      const val = snap.val();
      setProducts(val ? Object.keys(val).map(k => ({ ...val[k], id: k })).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()) : []);
      setLoading(false);
    });
    // Listen for categories
    onValue(ref(db, 'online_haat_categories'), snap => {
      const val = snap.val();
      setCategories(val ? Object.keys(val).map(k => ({ id: k, name: val[k].name })) : []);
    });
    // Listen for global terms
    onValue(ref(db, 'online_haat_settings/terms'), snap => {
      setGlobalTerms(snap.val() || 'এখনও কোনো শর্তাবলী যোগ করা হয়নি।');
    });

    // Fetch all users to match verification status
    const fetchUsers = async () => {
        const snap = await getDocs(collection(dbFs, "users"));
        setAllUsers(snap.docs.map(doc => doc.data()));
    };
    fetchUsers();
  }, []);

  const filteredProducts = useMemo(() => {
    let list = products.filter(p => (activeCategory === 'all' || p.category === activeCategory));
    
    if (filterSeller) {
      list = list.filter(p => (p.userId || 'admin') === filterSeller.id);
    }

    const term = (searchTerm || '').toLowerCase();
    return list.filter(p => 
      (p.name || '').toLowerCase().includes(term) || 
      (p.sellerName || '').toLowerCase().includes(term)
    );
  }, [products, activeCategory, searchTerm, filterSeller]);

  const getProductWithVerified = (p: Product) => {
    const user = allUsers.find(u => u.memberId === p.userId);
    return { ...p, isVerified: user?.isVerified || false };
  };

  const handleAddProductClick = () => {
    const savedUser = localStorage.getItem('kp_logged_in_user');
    if (savedUser) {
      navigate('/auth?to=haat');
    } else {
      alert('পণ্য যোগ করতে দয়া করে লগইন করুন।');
      navigate('/auth?to=haat');
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] animate-in fade-in duration-500">
       <header className="relative flex items-center justify-between min-h-[64px] shrink-0 px-1">
          <button 
            onClick={selectedProduct ? () => setSelectedProduct(null) : onBack} 
            className="p-3 bg-white border border-slate-100 rounded-xl shadow-sm shrink-0 active:scale-90 transition-all"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="text-center overflow-hidden">
             <h2 className="text-xl font-black text-slate-800 leading-tight">অনলাইন হাট</h2>
             <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-0.5">আমার বাজার</p>
          </div>
          <button 
            onClick={handleAddProductClick} 
            className="px-3 py-2.5 bg-[#F1C40F] text-slate-900 rounded-xl font-black text-[10px] uppercase shadow-md flex items-center gap-1.5 shrink-0 active:scale-95 transition-all border-b-2 border-amber-600/30"
          >
            <Plus size={16} strokeWidth={4} /> আমার পন্য
          </button>
       </header>

       <div className="flex-1 overflow-y-auto no-scrollbar pb-40 space-y-6">
          {selectedProduct ? (
            <div className="animate-in slide-in-from-right-4 duration-500 space-y-6 pb-20 px-1">
               <div className="w-full bg-white rounded-[40px] shadow-2xl border border-slate-50 overflow-hidden text-left relative">
                  <div className="w-full h-72 bg-slate-100 relative group overflow-hidden">
                     {selectedProduct.photo ? (
                        <img src={selectedProduct.photo} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt={selectedProduct.name} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                          <ShoppingBasket size={80} />
                        </div>
                      )}
                      <div className="absolute top-5 left-5 flex flex-col gap-2">
                        <span className="px-4 py-1.5 bg-blue-600/90 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg border border-white/20">
                          {categories.find(c => c.id === selectedProduct.category)?.name || 'পণ্য'}
                        </span>
                        <span className={`px-4 py-1.5 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg border border-white/20 ${selectedProduct.condition === 'new' ? 'bg-emerald-500/90' : 'bg-orange-500/90'}`}>
                          {selectedProduct.condition === 'new' ? 'নতুন' : 'পুরাতন'}
                        </span>
                      </div>
                  </div>
                  
                  <div className="p-7 space-y-6">
                     <div>
                        <h1 className="text-2xl font-black text-slate-900 leading-tight mb-2 tracking-tight">{selectedProduct.name}</h1>
                        <div className="flex items-center gap-3">
                           {selectedProduct.offerPrice ? (
                             <>
                               <span className="text-2xl font-black text-emerald-600">৳ {toBn(selectedProduct.offerPrice)}</span>
                               <span className="text-sm font-bold text-slate-400 line-through">৳ {toBn(selectedProduct.price)}</span>
                             </>
                           ) : (
                             <span className="text-2xl font-black text-orange-600">৳ {toBn(selectedProduct.price)}</span>
                           )}
                           <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2.5 py-1 rounded-lg">/ {selectedProduct.unit}</span>
                        </div>
                     </div>

                     <div className="grid gap-3">
                        <button 
                            onClick={() => {
                              setFilterSeller({ id: selectedProduct.userId || 'admin', name: selectedProduct.sellerName });
                              setSelectedProduct(null);
                            }}
                            className="w-full bg-slate-50/70 p-4 rounded-[28px] border border-slate-100 flex items-center justify-between group active:scale-[0.98] transition-all shadow-sm"
                        >
                            <div className="flex items-center gap-4 text-left overflow-hidden">
                               <div className="p-3 bg-white rounded-2xl shadow-sm text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-all shrink-0">
                                  <Store size={20} />
                               </div>
                               <div className="overflow-hidden">
                                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">বিক্রেতা (সব পণ্য দেখতে ক্লিক করুন)</p>
                                  <div className="flex items-center gap-1.5 overflow-hidden">
                                    <p className="font-black text-slate-800 text-base truncate">{selectedProduct.sellerName}</p>
                                    {getProductWithVerified(selectedProduct).isVerified && (
                                       <CheckCircle2 size={16} fill="#1877F2" className="text-white shrink-0" />
                                    )}
                                  </div>
                               </div>
                            </div>
                            <ChevronRight size={18} className="text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                        </button>
                        <div className="bg-slate-50/70 p-4 rounded-[28px] border border-slate-100 flex items-center gap-4 shadow-sm">
                           <div className="p-3 bg-white rounded-2xl shadow-sm text-emerald-500 shrink-0">
                              <MapPin size={20} />
                           </div>
                           <div className="text-left overflow-hidden">
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">ঠিকানা</p>
                              <p className="font-black text-slate-700 truncate">{selectedProduct.location}</p>
                           </div>
                        </div>
                        {selectedProduct.description && (
                          <div className="bg-slate-50/70 p-5 rounded-[32px] border border-slate-100 shadow-sm">
                            <div className="flex items-center gap-2 mb-2">
                               <FileText size={14} className="text-slate-400" />
                               <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">পণ্যের বিস্তারিত</p>
                            </div>
                            <p className="text-sm font-bold text-slate-600 leading-relaxed text-justify whitespace-pre-line">{selectedProduct.description}</p>
                          </div>
                        )}
                        <div className="grid grid-cols-2 gap-3 pt-2">
                           <a href={`tel:${convertBnToEn(selectedProduct.mobile)}`} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all"><PhoneCall size={18} /> কল দিন</a>
                           <a href={`https://wa.me/${formatWhatsAppNumber(selectedProduct.mobile)}`} target="_blank" rel="noopener noreferrer" className="w-full py-4 bg-[#25D366] text-white rounded-2xl font-black flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all"><WhatsAppIcon size={18} /> হোয়াটসঅ্যাপ</a>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
          ) : (
            <div className="px-1 space-y-6">
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={18} />
                  <input 
                    className="w-full pl-12 pr-5 py-4 bg-white border border-slate-100 rounded-[22px] font-bold outline-none shadow-sm focus:border-blue-400 transition-all" 
                    placeholder="পণ্যের নাম দিয়ে খুঁজুন..." 
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                   <button onClick={() => setActiveCategory('all')} className={`whitespace-nowrap px-6 py-3 rounded-2xl font-black text-xs transition-all border ${activeCategory === 'all' ? 'bg-[#0056b3] text-white border-[#0056b3] shadow-lg' : 'bg-white text-slate-400 border-slate-100'}`}>সব পণ্য</button>
                   {categories.map(cat => (
                     <button key={cat.id} onClick={() => setActiveCategory(cat.id)} className={`whitespace-nowrap px-6 py-3 rounded-2xl font-black text-xs transition-all border ${activeCategory === cat.id ? 'bg-[#0056b3] text-white border-[#0056b3] shadow-lg' : 'bg-white text-slate-400 border-slate-100'}`}>{cat.name}</button>
                   ))}
                </div>
                <div className="grid grid-cols-2 gap-4">
                   {filteredProducts.map((p) => (
                     <button key={p.id} onClick={() => setSelectedProduct(p)} className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden flex flex-col group active:scale-95 transition-all text-left">
                        <div className="aspect-square relative overflow-hidden bg-slate-50">
                           {p.photo ? (
                             <img src={p.photo} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={p.name} />
                           ) : (
                             <div className="w-full h-full flex items-center justify-center text-slate-200">
                               <ShoppingBasket size={48} />
                             </div>
                           )}
                           <div className="absolute top-2 left-2 px-2.5 py-0.5 bg-white/90 backdrop-blur-sm rounded-lg text-[8px] font-black text-blue-600 uppercase tracking-widest shadow-sm">
                             {categories.find(c => c.id === p.category)?.name || 'পণ্য'}
                           </div>
                        </div>
                        <div className="p-4 space-y-1.5">
                           <h4 className="font-black text-slate-800 text-sm truncate">{p.name}</h4>
                           <div className="flex items-center gap-1.5">
                              <p className="font-black text-blue-600 text-xs truncate">৳ {toBn(p.offerPrice || p.price)}</p>
                              {p.offerPrice && <p className="text-[8px] font-bold text-slate-400 line-through opacity-60">৳ {toBn(p.price)}</p>}
                           </div>
                           <div className="flex items-center gap-1 opacity-50 overflow-hidden">
                              <MapPin size={8} />
                              <p className="text-[8px] font-bold truncate uppercase">{p.location}</p>
                           </div>
                        </div>
                     </button>
                   ))}
                </div>
            </div>
          )}
       </div>
    </div>
  );
};

// Fix: Added missing default export
export default PublicHaat;
