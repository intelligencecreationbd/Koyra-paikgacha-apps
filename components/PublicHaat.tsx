
import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  CheckCircle2,
  Camera,
  Loader2,
  Send,
  ChevronDown,
  AlertCircle,
  ZoomIn
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

// Firebase Imports
import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, onValue, set, push } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
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

const EditField = ({ label, value, placeholder, onChange, icon, type = 'text', readOnly = false }: any) => (
    <div className="text-left w-full">
      <label className="text-[10px] font-bold text-slate-400 block mb-1.5 uppercase tracking-wider pl-1">{label}</label>
      <div className="relative">
          {icon && <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300">{icon}</div>}
          <input 
            type={type}
            readOnly={readOnly}
            placeholder={placeholder}
            className={`w-full ${icon ? 'pl-11' : 'px-5'} py-3.5 ${readOnly ? 'bg-slate-100 opacity-80' : 'bg-slate-50'} border border-slate-100 rounded-2xl font-bold outline-none text-slate-800 transition-all focus:border-blue-400 shadow-sm`} 
            value={value} 
            onChange={e => onChange(e.target.value)} 
          />
      </div>
    </div>
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
  isVerified?: boolean; 
}

const PublicHaat: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<{id: string, name: string}[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [filterSeller, setFilterSeller] = useState<{id: string, name: string} | null>(null);
  const [terms, setTerms] = useState('');
  
  // Modals
  const [showFullImage, setShowFullImage] = useState<string | null>(null);
  const [showTermsModal, setShowTermsModal] = useState(false);

  // Submission States
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [allUsers, setAllUsers] = useState<any[]>([]);

  const [form, setForm] = useState({
    name: '', category: '', price: '', offerPrice: '', condition: 'new', unit: 'কেজি', sellerName: '', mobile: '', location: '', description: '', photo: ''
  });

  // Handle URL parameters for Redirects (Login -> Back)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const action = params.get('action');
    const view = params.get('view');
    const savedUser = localStorage.getItem('kp_logged_in_user');
    
    if (savedUser) {
        const u = JSON.parse(savedUser);
        setCurrentUser(u);
        
        // Priority 1: Force show add form if requested via param
        if (action === 'add') {
            setForm(prev => ({ 
                ...prev, 
                sellerName: u.fullName,
                mobile: u.mobile,
                location: u.village
            }));
            setShowSubmitForm(true);
            // Clear URL to prevent repetitive behavior on refresh
            navigate(location.pathname, { replace: true });
        }

        // Priority 2: Filter by user's products if requested via param
        if (view === 'mine') {
            setFilterSeller({ id: u.memberId, name: u.fullName });
            navigate(location.pathname, { replace: true });
        }
    }
  }, [location.search, navigate, location.pathname]);

  useEffect(() => {
    setLoading(true);
    // Fetch products
    onValue(ref(db, 'online_haat'), snap => {
      const val = snap.val();
      setProducts(val ? Object.keys(val).map(k => ({ ...val[k], id: k })).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()) : []);
      setLoading(false);
    });
    // Fetch categories
    onValue(ref(db, 'online_haat_categories'), snap => {
      const val = snap.val();
      const list = val ? Object.keys(val).map(k => ({ id: k, name: val[k].name })) : [];
      setCategories(list);
      if (list.length > 0 && !form.category) setForm(prev => ({ ...prev, category: list[0].id }));
    });
    // Fetch terms
    onValue(ref(db, 'online_haat_settings'), snap => {
        const val = snap.val();
        if (val && val.terms) setTerms(val.terms);
    });

    // Sync all users for verified badges
    const fetchUsers = async () => {
        const snap = await getDocs(collection(dbFs, "users"));
        setAllUsers(snap.docs.map(doc => doc.data()));
    };
    fetchUsers();
  }, []);

  const getProductWithVerified = (p: Product) => {
    const user = allUsers.find(u => u.memberId === p.userId);
    return { ...p, isVerified: user?.isVerified || false };
  };

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

  const handleAddProductClick = () => {
    const savedUser = localStorage.getItem('kp_logged_in_user');
    if (!savedUser) {
      alert('পণ্য যোগ করতে দয়া করে লগইন করুন।');
      navigate('/auth?to=haat');
    } else {
      const u = JSON.parse(savedUser);
      setCurrentUser(u);
      setForm({ 
          name: '', category: categories[0]?.id || '', price: '', offerPrice: '', condition: 'new', unit: 'কেজি', 
          sellerName: u.fullName,
          mobile: u.mobile,
          location: u.village,
          description: '', photo: ''
      });
      setShowSubmitForm(true);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setForm(prev => ({ ...prev, photo: reader.result as string }));
      reader.readAsDataURL(file);
    }
  };

  const handleUserProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.category) {
        alert('পণ্যের নাম, দাম এবং ক্যাটাগরি অবশ্যই পূরণ করুন');
        return;
    }
    setIsSubmitting(true);
    try {
        const id = push(ref(db, 'online_haat')).key;
        const finalData = { 
          ...form, 
          id, 
          timestamp: new Date().toISOString(),
          userId: currentUser.memberId,
          status: 'published'
        };
        await set(ref(db, `online_haat/${id}`), finalData);
        setShowSubmitForm(false);
        setShowSuccessMessage(true);
        setForm({ name: '', category: categories[0]?.id || '', price: '', offerPrice: '', condition: 'new', unit: 'কেজি', sellerName: currentUser.fullName, mobile: currentUser.mobile, location: currentUser.village, description: '', photo: '' });
    } catch (e) { alert('সংরক্ষণ ব্যর্থ হয়েছে!'); }
    finally { setIsSubmitting(false); }
  };

  const isMyView = filterSeller && currentUser && filterSeller.id === currentUser.memberId;

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] animate-in fade-in duration-500">
       {/* Full Image Modal */}
       {showFullImage && (
         <div className="fixed inset-0 z-[200] bg-slate-950 flex flex-col items-center justify-center p-4 animate-in zoom-in duration-200" onClick={() => setShowFullImage(null)}>
            <button className="absolute top-6 right-6 p-3 bg-white/10 rounded-full text-white backdrop-blur-md"><X size={24}/></button>
            <img src={showFullImage} className="max-w-full max-h-[80vh] rounded-2xl shadow-2xl object-contain" onClick={e => e.stopPropagation()} />
            <p className="text-white/50 text-[10px] font-black uppercase tracking-widest mt-6">ট্যাপ করে বন্ধ করুন</p>
         </div>
       )}

       {/* Terms Modal */}
       {showTermsModal && (
         <div className="fixed inset-0 z-[200] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-5 animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-sm rounded-[40px] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
                <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <AlertCircle className="text-blue-600" size={20} />
                        <h3 className="font-black text-slate-800">পরিষেবার শর্তাবলী</h3>
                    </div>
                    <button onClick={() => setShowTermsModal(false)} className="p-2 text-slate-400 hover:text-red-500 transition-colors"><X size={24}/></button>
                </div>
                <div className="p-7 max-h-[60vh] overflow-y-auto no-scrollbar">
                    <p className="text-sm font-bold text-slate-600 leading-relaxed whitespace-pre-line text-justify">{terms || 'শর্তাবলী যোগ করা হয়নি।'}</p>
                </div>
                <div className="p-4 bg-slate-50">
                    <button onClick={() => setShowTermsModal(false)} className="w-full py-4 bg-slate-900 text-white font-black rounded-2xl active:scale-95 transition-all">আমি সম্মত আছি</button>
                </div>
            </div>
         </div>
       )}

       {showSuccessMessage && (
          <div className="fixed inset-0 z-[180] bg-slate-900/60 backdrop-blur-md p-5 flex items-center justify-center">
              <div className="bg-white w-full max-w-xs rounded-[45px] p-8 shadow-2xl text-center space-y-5 animate-in zoom-in duration-300">
                  <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center text-green-600 mx-auto shadow-sm"><CheckCircle2 size={50} /></div>
                  <h3 className="font-black text-lg text-slate-800 leading-tight">বিজ্ঞাপন সফলভাবে যুক্ত হয়েছে</h3>
                  <p className="text-sm font-bold text-slate-500">আপনার পণ্যটি এখন হাটে প্রদর্শিত হচ্ছে।</p>
                  <button onClick={() => setShowSuccessMessage(false)} className="p-3 bg-red-50 text-red-600 rounded-full shadow-inner active:scale-90 transition-all mx-auto block border border-red-100"><X size={24} /></button>
              </div>
          </div>
       )}

       <header className="relative flex items-center justify-between min-h-[64px] shrink-0 px-1">
          <button 
            onClick={selectedProduct ? () => setSelectedProduct(null) : (filterSeller ? () => setFilterSeller(null) : onBack)} 
            className="p-3 bg-white border border-slate-100 rounded-xl shadow-sm shrink-0 active:scale-90 transition-all"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="text-center overflow-hidden">
             <h2 className="text-xl font-black text-slate-800 leading-tight">{isMyView ? 'আমার পন্য' : 'অনলাইন হাট'}</h2>
             <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-0.5">{isMyView ? 'নিজের বিজ্ঞাপন' : 'আমার বাজার'}</p>
          </div>
          <button 
            onClick={handleAddProductClick} 
            className="px-3 py-2.5 bg-[#F1C40F] text-slate-900 rounded-xl font-black text-[10px] uppercase shadow-md flex items-center gap-1.5 shrink-0 active:scale-95 transition-all border-b-2 border-amber-600/30"
          >
            <Plus size={16} strokeWidth={4} /> পন্য যোগ করুন
          </button>
       </header>

       <div className="flex-1 overflow-y-auto no-scrollbar pb-40 space-y-6">
          {selectedProduct ? (
            <div className="animate-in slide-in-from-right-4 duration-500 space-y-5 pb-20 px-1">
               <div className="w-full bg-white rounded-[38px] shadow-2xl border border-slate-100 overflow-hidden text-left relative">
                  <div 
                    className="w-full h-52 bg-slate-50 relative group overflow-hidden cursor-zoom-in flex items-center justify-center border-b border-slate-50"
                    onClick={() => selectedProduct.photo && setShowFullImage(selectedProduct.photo)}
                  >
                     {selectedProduct.photo ? (
                        <img src={selectedProduct.photo} className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-105" alt={selectedProduct.name} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300 bg-slate-50">
                          <ShoppingBasket size={60} />
                        </div>
                      )}
                      <div className="absolute top-4 left-4 flex flex-col gap-1.5 pointer-events-none">
                        <span className="px-3 py-1 bg-blue-600/90 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-widest rounded-lg shadow-lg border border-white/20">
                          {categories.find(c => c.id === selectedProduct.category)?.name || 'পণ্য'}
                        </span>
                        <span className={`px-3 py-1 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-widest rounded-lg shadow-lg border border-white/20 ${selectedProduct.condition === 'new' ? 'bg-emerald-500/90' : 'bg-orange-500/90'}`}>
                          {selectedProduct.condition === 'new' ? 'নতুন' : 'পুরাতন'}
                        </span>
                      </div>
                      <div className="absolute bottom-3 right-4 p-2 bg-white/20 backdrop-blur-md rounded-lg text-white pointer-events-none group-hover:opacity-100 transition-opacity">
                         <ZoomIn size={14} />
                      </div>
                  </div>
                  
                  <div className="p-6 pt-5 space-y-5">
                     <div className="space-y-1">
                        <h1 className="text-xl font-black text-slate-900 leading-tight tracking-tight">{selectedProduct.name}</h1>
                        <div className="flex items-center gap-2.5">
                           {selectedProduct.offerPrice ? (
                             <>
                               <span className="text-xl font-black text-emerald-600">৳ {toBn(selectedProduct.offerPrice)}</span>
                               <span className="text-xs font-bold text-slate-400 line-through">৳ {toBn(selectedProduct.price)}</span>
                             </>
                           ) : (
                             <span className="text-xl font-black text-orange-600">৳ {toBn(selectedProduct.price)}</span>
                           )}
                           <span className="text-[9px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md">/ {selectedProduct.unit}</span>
                        </div>
                     </div>

                     <div className="grid gap-2.5">
                        <button 
                            onClick={() => {
                              setFilterSeller({ id: selectedProduct.userId || 'admin', name: selectedProduct.sellerName });
                              setSelectedProduct(null);
                            }}
                            className="w-full bg-slate-50/70 p-4 rounded-[24px] border border-slate-100 flex items-center justify-between group active:scale-[0.98] transition-all shadow-sm"
                        >
                            <div className="flex items-center gap-4 text-left overflow-hidden">
                               <div className="p-3 bg-white rounded-xl shadow-sm text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-all shrink-0">
                                  <Store size={20} />
                               </div>
                               <div className="overflow-hidden">
                                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">বিক্রেতা ও ঠিকানা (সব পণ্য দেখতে ক্লিক করুন)</p>
                                  <div className="flex items-center gap-1.5 overflow-hidden">
                                    <p className="font-black text-slate-800 text-sm truncate">{selectedProduct.sellerName}</p>
                                    {getProductWithVerified(selectedProduct).isVerified && (
                                       <CheckCircle2 size={14} fill="#1877F2" className="text-white shrink-0" />
                                    )}
                                  </div>
                                  <p className="text-[10px] font-bold text-slate-500 truncate mt-0.5 flex items-center gap-1">
                                     <MapPin size={10} className="text-slate-300" /> {selectedProduct.location}
                                  </p>
                               </div>
                            </div>
                            <ChevronRight size={16} className="text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                        </button>

                        {selectedProduct.description && (
                          <div className="bg-slate-50/70 p-5 rounded-[28px] border border-slate-100 shadow-sm">
                            <div className="flex items-center gap-2 mb-1.5">
                               <FileText size={12} className="text-slate-400" />
                               <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">পণ্যের বিস্তারিত</p>
                            </div>
                            <p className="text-xs font-bold text-slate-600 leading-relaxed text-justify whitespace-pre-line">{selectedProduct.description}</p>
                          </div>
                        )}

                        <div className="space-y-2 pt-2">
                           {terms && (
                              <button 
                                onClick={() => setShowTermsModal(true)}
                                className="w-full py-2 flex items-center justify-center gap-2 text-blue-600 font-black text-[10px] uppercase tracking-[0.1em] hover:opacity-70 active:scale-95 transition-all mb-1 border-b border-dashed border-blue-100 mx-auto w-fit px-4"
                              >
                                <AlertCircle size={13} strokeWidth={3} /> পরিষেবার শর্তাবলী দেখুন
                              </button>
                           )}
                           <div className="grid grid-cols-2 gap-2.5">
                              <a href={`tel:${convertBnToEn(selectedProduct.mobile)}`} className="w-full py-3.5 bg-blue-600 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all"><PhoneCall size={16} /> কল দিন</a>
                              <a href={`https://wa.me/${formatWhatsAppNumber(selectedProduct.mobile)}`} target="_blank" rel="noopener noreferrer" className="w-full py-3.5 bg-[#25D366] text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all"><WhatsAppIcon size={16} /> হোয়াটসঅ্যাপ</a>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
          ) : showSubmitForm ? (
            <div className="bg-white min-h-full animate-in slide-in-from-right-4 duration-500 p-5 pb-32 overflow-y-auto no-scrollbar">
                <div className="bg-white p-6 rounded-[40px] border border-slate-100 shadow-xl space-y-6">
                    <div className="flex justify-between items-center border-b pb-4">
                       <h3 className="font-black text-xl text-slate-800">পণ্যের বিজ্ঞাপন দিন</h3>
                       <button onClick={()=>setShowSubmitForm(false)} className="p-2 text-slate-400"><X/></button>
                    </div>
                    <div className="flex flex-col items-center">
                        <div className="relative w-full h-44">
                            <div className="w-full h-full rounded-[30px] bg-slate-50 border-2 border-dashed border-slate-200 overflow-hidden flex flex-col items-center justify-center text-slate-300 gap-2">
                                {form.photo ? <img src={form.photo} className="w-full h-full object-cover" /> : (
                                    <>
                                        <Camera size={40} />
                                        <span className="text-[10px] font-black uppercase tracking-widest">ছবির যোগ করুন</span>
                                    </>
                                )}
                            </div>
                            <button type="button" onClick={() => fileInputRef.current?.click()} className="absolute bottom-3 right-3 p-3 bg-blue-600 text-white rounded-2xl shadow-xl border-4 border-white active:scale-90 transition-all"><Plus size={18}/></button>
                            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                        </div>
                    </div>

                    <div className="space-y-5 pt-2">
                        <div className="text-left">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-2 block">ক্যাটাগরি নির্বাচন</label>
                            <div className="relative">
                                <select className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl appearance-none font-black text-slate-800 outline-none focus:ring-2 focus:ring-blue-500" value={form.category} onChange={(e) => setForm({...form, category: e.target.value})}>
                                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
                            </div>
                        </div>

                        <div className="text-left">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-2 block">পণ্যের অবস্থা</label>
                            <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl">
                                <button type="button" onClick={() => setForm({...form, condition: 'new'})} className={`flex-1 py-3 rounded-xl font-black text-xs transition-all ${form.condition === 'new' ? 'bg-white shadow-md text-emerald-600' : 'text-slate-400'}`}>নতুন</button>
                                <button type="button" onClick={() => setForm({...form, condition: 'used'})} className={`flex-1 py-3 rounded-xl font-black text-xs transition-all ${form.condition === 'used' ? 'bg-white shadow-md text-orange-600' : 'text-slate-400'}`}>পুরাতন</button>
                            </div>
                        </div>

                        <EditField label="পণ্যের নাম *" value={form.name} onChange={(v:any)=>setForm({...form, name:v})} placeholder="যেমন: দেশি মুরগী" icon={<ShoppingBasket size={18}/>} />
                        
                        <div className="grid grid-cols-2 gap-3">
                            <EditField label="মূল্য (৳) *" value={form.price} onChange={(v:any)=>setForm({...form, price:v})} placeholder="৳ ০০" type="number" />
                            <EditField label="অফার মূল্য (৳)" value={form.offerPrice} onChange={(v:any)=>setForm({...form, offerPrice:v})} placeholder="৳ ০০" type="number" />
                        </div>

                        <EditField label="একক (যেমন: কেজি) *" value={form.unit} onChange={(v:any)=>setForm({...form, unit:v})} placeholder="কেজি / হালি / পিচ" icon={<Tag size={16}/>} />

                        <div className="p-4 bg-blue-50/50 rounded-[30px] border border-blue-100 space-y-4">
                            <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] pl-1">আপনার তথ্য (বিক্রেতা)</p>
                            <EditField label="বিক্রেতার নাম" value={form.sellerName} readOnly={true} icon={<Store size={18}/>} />
                            <EditField label="মোবাইল নম্বর" value={form.mobile} readOnly={true} icon={<PhoneCall size={18}/>} />
                            <EditField label="ঠিকানা (গ্রাম)" value={form.location} readOnly={true} icon={<MapPin size={18}/>} />
                        </div>

                        <div className="text-left">
                            <label className="text-[10px] font-bold text-slate-400 block mb-1.5 uppercase tracking-wider pl-1">বিস্তারিত বিবরণ</label>
                            <textarea className="w-full p-5 bg-slate-50 border border-slate-100 rounded-[28px] font-bold outline-none text-slate-800 h-32 text-sm focus:ring-2 focus:ring-blue-500 transition-all" value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="পণ্যের গুণাগুণ বা বিশেষত্ব লিখুন..." />
                        </div>

                        <button onClick={handleUserProductSubmit} disabled={isSubmitting} className="w-full py-5 bg-blue-600 text-white font-black rounded-[30px] shadow-lg mt-4 flex items-center justify-center gap-2 active:scale-95 border-b-4 border-indigo-800 disabled:opacity-50">
                            {isSubmitting ? <Loader2 className="animate-spin" /> : <><Send size={18}/> বিজ্ঞাপন দিন</>}
                        </button>
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

                {/* Filter Chip if seller filter is active */}
                {filterSeller && (
                  <div className="flex px-1 animate-in slide-in-from-left-2 duration-300">
                    <div className="px-4 py-2 bg-blue-600 text-white rounded-full flex items-center gap-2 shadow-md">
                       <Store size={14} />
                       <span className="text-xs font-black">{filterSeller.name} এর পন্য</span>
                       <button onClick={() => setFilterSeller(null)} className="ml-1 p-0.5 bg-white/20 rounded-full hover:bg-white/40 transition-colors">
                         <X size={14} />
                       </button>
                    </div>
                  </div>
                )}

                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                   <button onClick={() => setActiveCategory('all')} className={`whitespace-nowrap px-6 py-3 rounded-2xl font-black text-xs transition-all border ${activeCategory === 'all' ? 'bg-[#0056b3] text-white border-[#0056b3] shadow-lg' : 'bg-white text-slate-400 border-slate-100'}`}>সব পণ্য</button>
                   {categories.map(cat => (
                     <button key={cat.id} onClick={() => setActiveCategory(cat.id)} className={`whitespace-nowrap px-6 py-3 rounded-2xl font-black text-xs transition-all border ${activeCategory === cat.id ? 'bg-[#0056b3] text-white border-[#0056b3] shadow-lg' : 'bg-white text-slate-400 border-slate-100'}`}>{cat.name}</button>
                   ))}
                </div>
                <div className="grid grid-cols-2 gap-4">
                   {filteredProducts.map((p) => {
                     const productData = getProductWithVerified(p);
                     return (
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
                             <div className="flex items-center gap-1 overflow-hidden">
                                <h4 className="font-black text-slate-800 text-sm truncate flex-1">{p.name}</h4>
                             </div>
                             <div className="flex items-center gap-1 overflow-hidden">
                                <Store size={10} className="text-slate-300 shrink-0" />
                                <p className="text-[9px] font-black text-slate-600 truncate flex-1">{p.sellerName}</p>
                                {productData.isVerified && (
                                   <CheckCircle2 size={11} fill="#1877F2" className="text-white shrink-0" />
                                )}
                             </div>
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
                     );
                   })}
                </div>
            </div>
          )}
       </div>
    </div>
  );
};

export default PublicHaat;
