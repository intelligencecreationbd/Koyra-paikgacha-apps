
import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronLeft, 
  Trash2, 
  Plus, 
  X, 
  Search, 
  Smartphone, 
  MapPin, 
  ShoppingBasket, 
  Tag, 
  Loader2,
  Camera,
  ChevronDown,
  ChevronUp,
  Info,
  Edit,
  Store,
  UserCheck,
  LayoutGrid,
  Edit2,
  AlertCircle,
  Settings,
  Save,
  FileText
} from 'lucide-react';

// Firebase Imports
import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, onValue, remove, set, push, update } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

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
  (num || '০').toString().replace(/\d/g, d => "০১২৩৪৫৬৭৮৯"[parseInt(d)]);

const Header: React.FC<{ title: string; onBack: () => void }> = ({ title, onBack }) => (
  <div className="flex items-center gap-4 mb-6">
    <button onClick={onBack} className="p-3 bg-white rounded-xl shadow-sm border border-slate-100 active:scale-90 transition-all">
      <ChevronLeft size={20} className="text-slate-800" />
    </button>
    <h2 className="text-2xl font-black text-slate-800 tracking-tight">{title}</h2>
  </div>
);

const EditField: React.FC<{ label: string; value: string; placeholder?: string; onChange: (v: string) => void; icon?: React.ReactNode; type?: string }> = ({ label, value, placeholder, onChange, icon, type = 'text' }) => (
  <div className="text-left">
    <label className="text-[10px] font-bold text-slate-400 block mb-1.5 uppercase tracking-wider pl-1">{label}</label>
    <div className="relative">
        {icon && <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300">{icon}</div>}
        <input 
          type={type}
          placeholder={placeholder}
          className={`w-full ${icon ? 'pl-11' : 'px-5'} py-3.5 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none text-slate-800 transition-all focus:border-blue-400 shadow-sm`} 
          value={value} 
          onChange={e => onChange(e.target.value)} 
        />
    </div>
  </div>
);

/**
 * @LOCKED_COMPONENT
 * @Section Online Haat Admin Management
 * @Status UI & Logic Updated - Includes global terms and conditions editor
 */
const AdminHaatMgmt: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<{id: string, name: string}[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'admin' | 'user'>('admin');
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editCategoryName, setEditCategoryName] = useState('');
  const [termsText, setTermsText] = useState('');

  const [form, setForm] = useState({
    name: '', category: '', price: '', offerPrice: '', condition: 'new', unit: 'কেজি', sellerName: '', mobile: '', location: '', description: '', photo: ''
  });

  useEffect(() => {
    // Products Listener
    const haatRef = ref(db, 'online_haat');
    const unsubscribeProd = onValue(haatRef, snap => {
        const val = snap.val();
        setProducts(val ? Object.keys(val).map(k => ({...val[k], id: k})) : []);
    });

    // Categories Listener
    const catRef = ref(db, 'online_haat_categories');
    const unsubscribeCat = onValue(catRef, snap => {
      const val = snap.val();
      const list = val ? Object.keys(val).map(k => ({ id: k, name: val[k].name })) : [];
      setCategories(list);
      if (list.length > 0 && !form.category) {
        setForm(prev => ({ ...prev, category: list[0].id }));
      }
    });

    // Settings Listener
    const settingsRef = ref(db, 'online_haat_settings');
    onValue(settingsRef, snap => {
      const val = snap.val();
      if (val && val.terms) setTermsText(val.terms);
    });

    return () => {
      unsubscribeProd();
      unsubscribeCat();
    };
  }, []);

  const handleSaveSettings = async () => {
    setIsSubmitting(true);
    try {
      await set(ref(db, 'online_haat_settings'), { terms: termsText });
      alert('শর্তাবলী সফলভাবে আপডেট হয়েছে।');
      setIsSettingsOpen(false);
    } catch (e) { alert('সেভ করা যায়নি'); }
    finally { setIsSubmitting(false); }
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;
    setIsSubmitting(true);
    try {
      const id = `cat_${Date.now()}`;
      await set(ref(db, `online_haat_categories/${id}`), { id, name: newCategoryName });
      setNewCategoryName('');
    } catch (e) { alert('ক্যাটাগরি যোগ করা যায়নি'); }
    finally { setIsSubmitting(false); }
  };

  const handleUpdateCategory = async (id: string) => {
    if (!editCategoryName.trim()) return;
    setIsSubmitting(true);
    try {
      await update(ref(db, `online_haat_categories/${id}`), { name: editCategoryName });
      setEditingCategoryId(null);
      setEditCategoryName('');
    } catch (e) { alert('আপডেট করা যায়নি'); }
    finally { setIsSubmitting(false); }
  };

  const handleDeleteCategory = async (id: string) => {
    if (confirm('এই ক্যাটাগরি কি ডিলিট করতে চান?')) {
      await remove(ref(db, `online_haat_categories/${id}`));
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.mobile || !form.category) {
        alert('দয়াকরে সব তথ্য পূরণ করুন');
        return;
    }
    setIsSubmitting(true);
    try {
        const id = editingId || push(ref(db, 'online_haat')).key;
        const existingProduct = products.find(p => p.id === id);
        
        const finalData = { 
          ...form, 
          id, 
          timestamp: new Date().toISOString(),
          userId: existingProduct?.userId || 'admin' 
        };

        await set(ref(db, `online_haat/${id}`), finalData);
        setShowForm(false);
        setEditingId(null);
        setForm({ name: '', category: categories[0]?.id || '', price: '', offerPrice: '', condition: 'new', unit: 'কেজি', sellerName: '', mobile: '', location: '', description: '', photo: '' });
    } catch (e) { alert('সংরক্ষণ ব্যর্থ হয়েছে!'); }
    finally { setIsSubmitting(false); }
  };

  const handleDelete = async (id: string) => {
    if (confirm('আপনি কি এই পণ্যটি স্থায়ীভাবে মুছে ফেলতে চান?')) {
      try {
        await remove(ref(db, `online_haat/${id}`));
      } catch (err) {
        alert('মুছে ফেলা সম্ভব হয়নি!');
      }
    }
  };

  const filteredProducts = products.filter(p => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = (p.name || '').toLowerCase().includes(term) ||
                         (p.sellerName || '').toLowerCase().includes(term);
    const matchesTab = activeTab === 'user' 
        ? (p.userId && p.userId !== 'admin') 
        : (!p.userId || p.userId === 'admin');
    return matchesSearch && matchesTab;
  });

  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-500 text-left pb-20">
        <Header title="অনলাইন হাট ম্যানেজার" onBack={onBack} />

        {/* Global Settings (Terms) */}
        <div className="bg-white border border-slate-100 rounded-[30px] overflow-hidden shadow-sm">
            <button onClick={() => setIsSettingsOpen(!isSettingsOpen)} className="w-full flex items-center justify-between p-5 bg-blue-50/50 hover:bg-blue-50 transition-colors">
                <div className="flex items-center gap-3">
                   <div className="p-2 bg-blue-100 text-blue-600 rounded-xl"><Settings size={18} /></div>
                   <h4 className="font-black text-slate-800 text-sm">হাটের শর্তাবলী ম্যানেজ</h4>
                </div>
                {isSettingsOpen ? <ChevronUp className="text-slate-400" size={18}/> : <ChevronDown className="text-slate-400" size={18}/>}
            </button>
            {isSettingsOpen && (
              <div className="p-5 space-y-4 animate-in slide-in-from-top-2 duration-300">
                <div className="space-y-1.5">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">হাটের সকল পণ্যে প্রদর্শিত হওয়ার শর্তসমূহ</label>
                   <textarea 
                      className="w-full p-4 bg-slate-50 border border-slate-100 rounded-3xl font-bold text-slate-700 outline-none focus:border-blue-400 min-h-[150px] text-sm"
                      placeholder="এখানে শর্তাবলী লিখুন..."
                      value={termsText}
                      onChange={e => setTermsText(e.target.value)}
                   />
                </div>
                <button 
                   onClick={handleSaveSettings}
                   disabled={isSubmitting}
                   className="w-full py-4 bg-blue-600 text-white font-black rounded-2xl shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all"
                >
                  {isSubmitting ? <Loader2 size={18} className="animate-spin"/> : <><Save size={18}/> শর্তাবলী সেভ করুন</>}
                </button>
              </div>
            )}
        </div>

        {/* Category Management Section */}
        <div className="bg-white border border-slate-100 rounded-[30px] overflow-hidden shadow-sm">
            <button onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)} className="w-full flex items-center justify-between p-5 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                   <div className="p-2 bg-amber-100 text-amber-600 rounded-xl"><LayoutGrid size={18} /></div>
                   <h4 className="font-black text-slate-800 text-sm">হাট ক্যাটাগরি সমূহ</h4>
                </div>
                {isCategoryDropdownOpen ? <ChevronUp className="text-slate-400" size={18}/> : <ChevronDown className="text-slate-400" size={18}/>}
            </button>
            {isCategoryDropdownOpen && (
              <div className="p-5 space-y-4 animate-in slide-in-from-top-2 duration-300">
                <div className="space-y-2.5">
                    {categories.map(c => (
                        <div key={c.id} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                            {editingCategoryId === c.id ? (
                                <input 
                                  className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1 font-bold outline-none"
                                  value={editCategoryName}
                                  onChange={e => setEditCategoryName(e.target.value)}
                                  autoFocus
                                />
                            ) : (
                                <span className="text-sm font-black text-slate-700">{c.name}</span>
                            )}
                            <div className="flex gap-3 ml-2">
                                {editingCategoryId === c.id ? (
                                    <button onClick={() => handleUpdateCategory(c.id)} className="text-green-500 p-1"><Plus size={18}/></button>
                                ) : (
                                    <button onClick={() => { setEditingCategoryId(c.id); setEditCategoryName(c.name); }} className="text-blue-500 p-1"><Edit2 size={16}/></button>
                                )}
                                <button onClick={() => handleDeleteCategory(c.id)} className="text-red-500 p-1"><Trash2 size={16}/></button>
                            </div>
                        </div>
                    ))}
                    {categories.length === 0 && <p className="text-center text-xs text-slate-400 py-4">কোনো ক্যাটাগরি যোগ করা হয়নি</p>}
                </div>
                <div className="flex gap-2 pt-2 border-t border-slate-50 mt-4">
                    <input className="flex-1 px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none text-sm focus:border-amber-400" placeholder="নতুন ক্যাটাগরি..." value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} />
                    <button onClick={handleAddCategory} className="p-4 bg-[#F1C40F] text-slate-900 rounded-2xl shadow-lg active:scale-90"><Plus size={24} strokeWidth={3}/></button>
                </div>
              </div>
            )}
        </div>

        {/* Tab System */}
        <div className="flex p-1.5 bg-slate-100 rounded-[24px] mb-4">
            <button 
                onClick={() => setActiveTab('admin')} 
                className={`flex-1 py-3.5 rounded-2xl font-black text-xs transition-all flex items-center justify-center gap-2 ${activeTab === 'admin' ? 'bg-white shadow-md text-[#0056b3]' : 'text-slate-400'}`}
            >
                এডমিন পন্য <div className={`px-2 py-0.5 rounded-full text-[9px] ${activeTab === 'admin' ? 'bg-blue-100 text-blue-600' : 'bg-slate-200 text-slate-500'}`}>{toBn(products.filter(p => !p.userId || p.userId === 'admin').length)}</div>
            </button>
            <button 
                onClick={() => setActiveTab('user')} 
                className={`flex-1 py-3.5 rounded-2xl font-black text-xs transition-all flex items-center justify-center gap-2 ${activeTab === 'user' ? 'bg-white shadow-md text-amber-600' : 'text-slate-400'}`}
            >
                ইউজার পন্য বিজ্ঞাপন <div className={`px-2 py-0.5 rounded-full text-[9px] ${activeTab === 'user' ? 'bg-amber-100 text-amber-600' : 'bg-slate-200 text-slate-500'}`}>{toBn(products.filter(p => p.userId && p.userId !== 'admin').length)}</div>
            </button>
        </div>
        
        {activeTab === 'admin' && (
          <button 
              onClick={() => { 
                setEditingId(null); 
                setForm({name:'', category: categories[0]?.id || '', price:'', offerPrice: '', condition: 'new', unit:'কেজি', sellerName:'এডমিন', mobile:'', location:'কয়রা-পাইকগাছা', description:'', photo:''}); 
                setShowForm(true); 
              }}
              className="w-full py-5 bg-[#F1C40F] text-slate-900 font-black rounded-[28px] shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all"
          >
              <Plus size={20} strokeWidth={3} /> নতুন এডমিন পণ্য যোগ করুন
          </button>
        )}

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            className="w-full pl-12 pr-5 py-4 bg-white border border-slate-100 rounded-[22px] font-bold outline-none shadow-sm focus:border-blue-400" 
            placeholder="পণ্যের নাম বা বিক্রেতা দিয়ে খুঁজুন..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    {activeTab === 'admin' ? 'এডমিন লিস্ট' : 'ইউজার বিজ্ঞাপন লিস্ট'} ({toBn(filteredProducts.length)})
                </p>
            </div>

            {filteredProducts.length === 0 ? (
                <div className="py-20 text-center opacity-30 flex flex-col items-center gap-3 bg-slate-50 rounded-[40px] border border-dashed border-slate-200">
                   <ShoppingBasket size={48} className="text-slate-300" />
                   <p className="font-bold text-sm">কোনো পণ্য পাওয়া যায়নি</p>
                </div>
            ) : (
                filteredProducts.map(p => (
                    <div key={p.id} className="bg-white p-4 rounded-[35px] border border-slate-100 flex items-center gap-4 shadow-sm group animate-in fade-in duration-300">
                        <div className="w-16 h-16 rounded-[22px] bg-slate-50 border border-slate-100 overflow-hidden flex items-center justify-center text-slate-300 shrink-0 shadow-inner">
                            {p.photo ? <img src={p.photo} className="w-full h-full object-cover" alt="" /> : <ShoppingBasket size={24} />}
                        </div>
                        <div className="flex-1 overflow-hidden text-left space-y-0.5">
                            <h4 className="font-black text-slate-800 truncate text-sm">{p.name || 'নামহীন পণ্য'}</h4>
                            <div className="flex items-center gap-1 overflow-hidden">
                              {p.userId && p.userId !== 'admin' && <UserCheck size={10} className="text-blue-500 shrink-0" />}
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">
                                {p.userId && p.userId !== 'admin' ? 'ইউজার বিজ্ঞাপন' : 'এডমিন পোস্ট'}
                              </p>
                            </div>
                            <div className="flex items-center gap-1">
                               <Store size={10} className="text-slate-300" />
                               <p className="text-[10px] font-black text-slate-600 truncate">{p.sellerName || 'অজানা বিক্রেতা'}</p>
                            </div>
                            <div className="flex flex-col">
                              {p.offerPrice ? (
                                <>
                                  <p className="text-[10px] font-black text-emerald-600">৳ {toBn(p.offerPrice)}</p>
                                  <p className="text-[8px] font-bold text-slate-400 line-through">৳ {toBn(p.price)}</p>
                                </>
                              ) : (
                                <p className="text-[10px] font-black text-orange-600">৳ {toBn(p.price)}</p>
                              )}
                            </div>
                        </div>
                        <div className="flex gap-2 shrink-0">
                            <button 
                                onClick={() => { setEditingId(p.id); setForm(p); setShowForm(true); }} 
                                className="p-3 bg-blue-50 text-blue-600 rounded-2xl active:scale-90 transition-all hover:bg-blue-100"
                            >
                                <Edit2 size={16}/>
                            </button>
                            <button 
                                onClick={() => handleDelete(p.id)} 
                                className="p-3 bg-red-50 text-red-500 rounded-2xl active:scale-90 transition-all hover:bg-red-100"
                            >
                                <Trash2 size={16}/>
                            </button>
                        </div>
                    </div>
                ))
            )}
        </div>

        {showForm && (
            <div className="fixed inset-0 z-[150] bg-slate-900/60 backdrop-blur-md p-5 flex items-center justify-center overflow-hidden">
                <div className="bg-white w-full max-w-sm rounded-[45px] p-8 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto animate-in zoom-in duration-300 text-left relative">
                    <div className="flex justify-between items-center border-b pb-4 mb-2">
                        <div className="flex items-center gap-3">
                           <div className="p-2 bg-blue-50 text-blue-600 rounded-xl"><Edit2 size={20}/></div>
                           <h3 className="font-black text-xl text-slate-800">{editingId ? 'পণ্য সংশোধন' : 'নতুন পণ্য যোগ'}</h3>
                        </div>
                        <button onClick={()=>setShowForm(false)} className="p-2 text-slate-400 hover:text-red-500 transition-colors"><X size={24}/></button>
                    </div>
                    
                    <div className="flex flex-col items-center">
                        <div className="relative group w-full">
                            <div className="w-full h-44 rounded-[30px] bg-slate-50 border-2 border-dashed border-slate-200 shadow-inner overflow-hidden flex flex-col items-center justify-center text-slate-300 gap-2">
                                {form.photo ? (
                                    <img src={form.photo} className="w-full h-full object-cover" alt="Product" />
                                ) : (
                                    <>
                                        <Camera size={40} />
                                        <span className="text-[10px] font-black uppercase tracking-widest">পণ্যের ছবি আপলোড করুন</span>
                                    </>
                                )}
                            </div>
                            <button 
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute bottom-3 right-3 p-3 bg-blue-600 text-white rounded-2xl shadow-xl border-4 border-white active:scale-90 transition-all"
                            >
                                <Camera size={18} strokeWidth={3} />
                            </button>
                            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                        </div>
                    </div>

                    <div className="space-y-4 pt-2">
                        <div className="text-left">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-1.5 block">ক্যাটাগরি নির্বাচন *</label>
                            <div className="relative">
                                <select 
                                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-[22px] appearance-none font-black text-slate-800 focus:ring-2 focus:ring-blue-500 shadow-sm outline-none"
                                    value={form.category}
                                    onChange={(e) => setForm({...form, category: e.target.value})}
                                >
                                    <option value="" disabled>ক্যাটাগরি বেছে নিন</option>
                                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
                            </div>
                        </div>

                        {/* Product Condition Selection */}
                        <div className="text-left">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-1.5 block">পণ্যের কন্ডিশন *</label>
                            <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl">
                                <button 
                                  type="button"
                                  onClick={() => setForm({...form, condition: 'new'})}
                                  className={`flex-1 py-3 rounded-xl font-black text-xs transition-all ${form.condition === 'new' ? 'bg-white shadow-md text-emerald-600' : 'text-slate-400'}`}
                                >
                                  নতুন
                                </button>
                                <button 
                                  type="button"
                                  onClick={() => setForm({...form, condition: 'used'})}
                                  className={`flex-1 py-3 rounded-xl font-black text-xs transition-all ${form.condition === 'used' ? 'bg-white shadow-md text-orange-600' : 'text-slate-400'}`}
                                >
                                  পুরাতন
                                </button>
                            </div>
                        </div>

                        <EditField label="পণ্যের নাম *" value={form.name} onChange={v=>setForm({...form, name:v})} placeholder="যেমন: দেশি মুরগী" icon={<ShoppingBasket size={18}/>} />
                        
                        <div className="grid grid-cols-2 gap-3">
                            <EditField label="মূল্য (৳) *" value={form.price} onChange={v=>setForm({...form, price:v})} placeholder="৳ ০০" type="number" />
                            <EditField label="অফার মূল্য (৳)" value={form.offerPrice} onChange={v=>setForm({...form, offerPrice:v})} placeholder="৳ ০০" type="number" />
                        </div>
                        <EditField label="একক (যেমন: কেজি) *" value={form.unit} onChange={v=>setForm({...form, unit:v})} placeholder="কেজি / হালি" icon={<Tag size={16}/>} />

                        <div className="p-4 bg-blue-50/50 rounded-[30px] border border-blue-100 space-y-4">
                           <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] pl-1">বিক্রেতার তথ্য</p>
                           <EditField label="নাম" value={form.sellerName} onChange={v=>setForm({...form, sellerName:v})} placeholder="নাম লিখুন" icon={<Store size={18}/>} />
                           <EditField label="মোবাইল নম্বর *" value={form.mobile} onChange={v=>setForm({...form, mobile:v})} placeholder="০১xxxxxxxxx" icon={<Smartphone size={18}/>} />
                           <EditField label="ঠিকানা" value={form.location} onChange={v=>setForm({...form, location:v})} placeholder="যেমন: কয়রা বাজার" icon={<MapPin size={18}/>} />
                        </div>
                        
                        <div className="text-left">
                            <label className="text-[10px] font-bold text-slate-400 block mb-1.5 uppercase tracking-wider pl-1">বিস্তারিত বিবরণ</label>
                            <textarea 
                                className="w-full p-5 bg-slate-50 border border-slate-100 rounded-[28px] font-bold outline-none text-slate-800 h-24 text-sm focus:ring-2 focus:ring-blue-500 transition-all"
                                value={form.description}
                                onChange={e => setForm({...form, description: e.target.value})}
                                placeholder="পণ্যের গুণাগুণ বা বিশেষত্ব লিখুন..."
                            />
                        </div>

                        <button 
                            onClick={handleSubmit} 
                            disabled={isSubmitting} 
                            className="w-full py-5 bg-blue-600 text-white font-black rounded-[28px] shadow-2xl mt-4 flex items-center justify-center gap-2 active:scale-95 transition-all shadow-blue-500/20 disabled:opacity-50"
                        >
                            {isSubmitting ? <Loader2 className="animate-spin" /> : (editingId ? 'তথ্য আপডেট করুন' : 'পণ্য পাবলিশ করুন')}
                        </button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default AdminHaatMgmt;
