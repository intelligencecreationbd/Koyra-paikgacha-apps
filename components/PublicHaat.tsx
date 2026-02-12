
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
  id: string; name: string; category: string; price: string; unit: string; sellerName: string; mobile: string; location: string; photo?: string; description?: string; timestamp: string; userId?: string;
}

const PublicHaat: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<{id: string, name: string}[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    setLoading(true);
    onValue(ref(db, 'online_haat'), snap => {
      const val = snap.val();
      setProducts(val ? Object.keys(val).map(k => ({ ...val[k], id: k })).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()) : []);
      setLoading(false);
    });
    onValue(ref(db, 'online_haat_categories'), snap => {
      const val = snap.val();
      setCategories(val ? Object.keys(val).map(k => ({ ...val[k], id: k })) : []);
    });
  }, []);

  const filteredProducts = useMemo(() => {
    const term = (searchTerm || '').toLowerCase();
    return products.filter(p => (activeCategory === 'all' || p.category === activeCategory) && ((p.name || '').toLowerCase().includes(term) || (p.sellerName || '').toLowerCase().includes(term)));
  }, [products, activeCategory, searchTerm]);

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
          <button onClick={onBack} className="p-3 bg-white border border-slate-100 rounded-xl shadow-sm shrink-0"><ChevronLeft size={20} /></button>
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
            <div className="animate-in slide-in-from-bottom-8 duration-500 space-y-6">
               <div className="w-full bg-white rounded-[45px] shadow-2xl border border-slate-50 overflow-hidden text-left">
                  <div className="w-full h-80 bg-slate-100 relative">
                     {selectedProduct.photo ? <img src={selectedProduct.photo} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-300"><ShoppingBasket size={80} /></div>}
                  </div>
                  <div className="p-8 space-y-8">
                     <h1 className="text-3xl font-black text-slate-800 leading-tight">{selectedProduct.name}</h1>
                     <p className="text-2xl font-black text-orange-600">৳ {toBn(selectedProduct.price)} / {selectedProduct.unit}</p>
                     <div className="space-y-4">
                        <div className="bg-slate-50 p-5 rounded-[32px] border border-slate-100 flex items-center gap-4"><Store size={22} /><p className="font-black text-slate-800">{selectedProduct.sellerName}</p></div>
                        <div className="bg-slate-50 p-5 rounded-[32px] border border-slate-100 flex items-center gap-4"><MapPin size={22} /><p className="font-black text-slate-800">{selectedProduct.location}</p></div>
                     </div>
                     <div className="flex gap-4"><a href={`tel:${convertBnToEn(selectedProduct.mobile)}`} className="flex-1 py-5 bg-[#0056b3] text-white font-black rounded-[28px] flex items-center justify-center gap-3"><PhoneCall size={20} /> কল করুন</a><button onClick={() => setSelectedProduct(null)} className="p-5 bg-slate-100 rounded-full"><X/></button></div>
                  </div>
               </div>
            </div>
          ) : (
            <>
              <div className="relative mx-1">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                 <input className="w-full pl-12 pr-5 py-4 bg-white border border-slate-100 rounded-[22px] font-bold outline-none shadow-sm focus:border-blue-400" placeholder="খুঁজুন..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar px-1">
                 <button onClick={() => setActiveCategory('all')} className={`whitespace-nowrap px-6 py-3 rounded-2xl font-black text-xs border ${activeCategory === 'all' ? 'bg-[#0056b3] text-white shadow-lg shadow-blue-500/20' : 'bg-white text-slate-400 border-slate-100'}`}>সব পণ্য</button>
                 {categories.map(cat => <button key={cat.id} onClick={() => setActiveCategory(cat.id)} className={`whitespace-nowrap px-6 py-3 rounded-2xl font-black text-xs border ${activeCategory === cat.id ? 'bg-[#0056b3] text-white shadow-lg shadow-blue-500/20' : 'bg-white text-slate-400 border-slate-100'}`}>{cat.name}</button>)}
              </div>
              <div className="grid grid-cols-2 gap-4 px-1">
                 {filteredProducts.map(p => (
                    <button key={p.id} onClick={() => setSelectedProduct(p)} className="flex flex-col bg-white rounded-[35px] border border-slate-50 shadow-sm overflow-hidden text-left group">
                       <div className="w-full h-40 bg-slate-50 relative overflow-hidden">{p.photo ? <img src={p.photo} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" /> : <div className="w-full h-full flex items-center justify-center text-slate-200"><ShoppingBasket size={32} /></div>}</div>
                       <div className="p-4 space-y-1"><h4 className="font-black text-slate-800 text-sm truncate">{p.name}</h4><p className="text-[10px] font-black text-orange-600">৳ {toBn(p.price)}</p></div>
                    </button>
                 ))}
              </div>
            </>
          )}
       </div>
    </div>
  );
};

export default PublicHaat;
