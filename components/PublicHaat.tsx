
import React, { useState, useEffect, useMemo } from 'react';
import { 
  ChevronLeft, 
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
  MessageCircle,
  Plus
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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

interface Product {
  id: string;
  name: string;
  category: string;
  price: string;
  unit: string;
  sellerName: string;
  mobile: string;
  location: string;
  photo?: string;
  description?: string;
  timestamp: string;
  userId?: string;
}

interface Category {
  id: string;
  name: string;
}

/**
 * @LOCKED_COMPONENT
 * @Section Public Online Haat Service
 * @Status Design Updated - Dynamic Categories Integration
 */
const PublicHaat: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    setLoading(true);
    // Products listener
    const haatRef = ref(db, 'online_haat');
    const unsubscribeProd = onValue(haatRef, snap => {
      const val = snap.val();
      if (val) {
        const list = Object.keys(val).map(key => ({ ...val[key], id: key }));
        setProducts(list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
      } else {
        setProducts([]);
      }
      setLoading(false);
    });

    // Categories listener
    const catRef = ref(db, 'online_haat_categories');
    const unsubscribeCat = onValue(catRef, snap => {
      const val = snap.val();
      const list = val ? Object.keys(val).map(key => ({ ...val[key], id: key })) : [];
      setCategories(list);
    });

    return () => {
      unsubscribeProd();
      unsubscribeCat();
    };
  }, []);

  const fullCategories = useMemo(() => [
    { id: 'all', name: 'সব পণ্য' },
    ...categories
  ], [categories]);

  const filteredProducts = useMemo(() => {
    const term = (searchTerm || '').toLowerCase();
    return products.filter(p => {
      const matchCat = activeCategory === 'all' || p.category === activeCategory;
      const matchSearch = (p.name || '').toLowerCase().includes(term) || 
                          (p.sellerName || '').toLowerCase().includes(term);
      return matchCat && matchSearch;
    });
  }, [products, activeCategory, searchTerm]);

  const handleAddProductClick = () => {
    navigate('/auth?to=haat');
  };

  if (selectedProduct) {
    return (
      <div className="animate-in slide-in-from-bottom-8 duration-500 pb-24 space-y-6">
         <header className="flex items-center justify-between sticky top-0 z-20 bg-white/80 backdrop-blur-md py-4">
            <button onClick={() => setSelectedProduct(null)} className="p-3 bg-white border border-slate-100 rounded-xl shadow-sm active:scale-90 transition-all">
                <ChevronLeft size={24} className="text-slate-800" />
            </button>
            <h3 className="font-black text-slate-800">পণ্যের বিস্তারিত</h3>
            <div className="w-12 h-12"></div>
         </header>

         <div className="w-full bg-white rounded-[45px] shadow-2xl border border-slate-50 overflow-hidden">
            <div className="w-full h-80 bg-slate-100 relative">
               {selectedProduct.photo ? (
                 <img src={selectedProduct.photo} className="w-full h-full object-cover" alt="" />
               ) : (
                 <div className="w-full h-full flex items-center justify-center text-slate-300">
                    <ShoppingBasket size={80} />
                 </div>
               )}
               <div className="absolute top-6 left-6 px-4 py-2 bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-white/50">
                  <span className="text-xs font-black text-blue-600 uppercase tracking-widest">
                    {fullCategories.find(c => c.id === selectedProduct.category)?.name || 'পণ্য'}
                  </span>
               </div>
            </div>

            <div className="p-8 space-y-8 text-left">
               <div className="space-y-2">
                  <h1 className="text-3xl font-black text-slate-800 leading-tight">{selectedProduct.name}</h1>
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-orange-50 text-orange-600 rounded-lg"><Tag size={16} /></div>
                    <p className="text-2xl font-black text-orange-600">৳ {toBn(selectedProduct.price)} <span className="text-sm font-bold text-slate-400">/ {selectedProduct.unit}</span></p>
                  </div>
               </div>

               <div className="grid gap-4">
                  <div className="bg-slate-50/50 p-5 rounded-[32px] border border-slate-100 flex items-center gap-4">
                     <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-500 shadow-sm">
                        <Store size={22} />
                     </div>
                     <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">বিক্রেতার নাম</p>
                        <p className="font-black text-slate-800">{selectedProduct.sellerName}</p>
                     </div>
                  </div>

                  <div className="bg-slate-50/50 p-5 rounded-[32px] border border-slate-100 flex items-center gap-4">
                     <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-emerald-500 shadow-sm">
                        <MapPin size={22} />
                     </div>
                     <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ঠিকানা</p>
                        <p className="font-black text-slate-800">{selectedProduct.location}</p>
                     </div>
                  </div>
               </div>

               {selectedProduct.description && (
                  <div className="space-y-2">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">বিবরণ</p>
                     <p className="text-sm font-bold text-slate-600 leading-relaxed bg-slate-50/50 p-6 rounded-[32px] border border-slate-100">
                        {selectedProduct.description}
                     </p>
                  </div>
               )}

               <div className="flex gap-4 pt-2">
                  <a 
                    href={`tel:${convertBnToEn(selectedProduct.mobile)}`}
                    className="flex-1 py-5 bg-[#0056b3] text-white font-black rounded-[28px] shadow-xl shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-center gap-3"
                  >
                    <PhoneCall size={20} /> কল করুন
                  </a>
                  <button 
                    onClick={() => window.open(`https://wa.me/88${convertBnToEn(selectedProduct.mobile)}`, '_blank')}
                    className="w-20 py-5 bg-emerald-500 text-white rounded-[28px] shadow-xl shadow-emerald-500/20 flex items-center justify-center active:scale-95 transition-all"
                  >
                    <MessageCircle size={24} />
                  </button>
               </div>
            </div>
         </div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500 space-y-6">
       <header className="relative flex items-center justify-between min-h-[64px]">
          <button onClick={onBack} className="p-3 bg-white border border-slate-100 rounded-xl shadow-sm active:scale-90 transition-all shrink-0 relative z-10">
             <ChevronLeft size={20} className="text-slate-800" />
          </button>
          
          <div className="absolute left-1/2 -translate-x-1/2 text-center pointer-events-none w-full px-16">
             <h2 className="text-xl font-black text-slate-800 leading-tight">অনলাইন হাট</h2>
             <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-0.5">আমার বাজার</p>
          </div>

          <button 
             onClick={handleAddProductClick}
             className="px-3 py-2 bg-[#F1C40F] text-slate-900 rounded-xl font-black text-[9px] uppercase tracking-tighter shadow-sm active:scale-95 transition-all flex items-center gap-1.5 shrink-0 relative z-10"
          >
             <Plus size={14} strokeWidth={4} /> আমার পন্য
          </button>
       </header>

       <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
          <input 
            className="w-full pl-12 pr-5 py-4 bg-white border border-slate-100 rounded-[22px] font-bold outline-none shadow-sm focus:border-blue-400 transition-all" 
            placeholder="পণ্য বা বিক্রেতার নাম খুঁজুন..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
       </div>

       <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
          {fullCategories.map(cat => (
            <button 
               key={cat.id}
               onClick={() => setActiveCategory(cat.id)}
               className={`whitespace-nowrap px-6 py-3 rounded-2xl font-black text-xs transition-all border ${activeCategory === cat.id ? 'bg-[#0056b3] text-white border-[#0056b3] shadow-lg shadow-blue-500/20' : 'bg-white text-slate-400 border-slate-100 hover:border-blue-200'}`}
            >
               {cat.name}
            </button>
          ))}
       </div>

       {loading ? (
         <div className="py-24 flex flex-col items-center justify-center gap-4 opacity-20">
            <RefreshCw className="animate-spin" size={48} />
            <p className="font-bold">তথ্য লোড হচ্ছে...</p>
         </div>
       ) : filteredProducts.length === 0 ? (
         <div className="py-32 text-center opacity-30 flex flex-col items-center gap-4">
            <ShoppingBasket size={64} className="text-slate-300" />
            <p className="font-bold text-slate-400">দুঃখিত, কোনো পণ্য পাওয়া যায়নি</p>
         </div>
       ) : (
         <div className="grid grid-cols-2 gap-4 pb-32">
            {filteredProducts.map((p, idx) => (
               <button 
                 key={p.id}
                 onClick={() => setSelectedProduct(p)}
                 className="flex flex-col bg-white rounded-[35px] border border-slate-50 shadow-sm overflow-hidden text-left group active:scale-[0.98] transition-all animate-in slide-in-from-bottom-2 duration-500"
                 style={{ animationDelay: `${idx * 50}ms` }}
               >
                  <div className="w-full h-40 bg-slate-50 relative overflow-hidden">
                     {p.photo ? (
                        <img src={p.photo} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                     ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-200">
                           <ShoppingBasket size={32} />
                        </div>
                     )}
                     <div className="absolute bottom-3 right-3 px-3 py-1.5 bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-white/50">
                        <p className="text-[10px] font-black text-orange-600">৳ {toBn(p.price)}</p>
                     </div>
                  </div>
                  <div className="p-4 space-y-1">
                     <h4 className="font-black text-slate-800 text-sm truncate">{p.name}</h4>
                     <div className="flex items-center gap-1.5">
                        <MapPin size={10} className="text-slate-300" />
                        <p className="text-[9px] font-bold text-slate-400 truncate">{p.location}</p>
                     </div>
                     <div className="pt-2 flex items-center justify-between">
                        <span className="text-[8px] font-black text-blue-500 uppercase tracking-widest">
                          {fullCategories.find(c => c.id === p.category)?.name || 'পণ্য'}
                        </span>
                        <div className="p-1.5 bg-blue-50 rounded-lg text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                           <ArrowRight size={10} />
                        </div>
                     </div>
                  </div>
               </button>
            ))}
         </div>
       )}
    </div>
  );
};

export default PublicHaat;
