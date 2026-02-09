
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
  Info,
  Edit,
  Store
} from 'lucide-react';

// Firebase Imports
import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, onValue, remove, set, push } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

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

const HAAT_CATEGORIES = [
  { id: 'fish', name: 'তাজা মাছ' },
  { id: 'veg', name: 'শাক-সবজি' },
  { id: 'meat', name: 'মাংস ও ডিম' },
  { id: 'fruit', name: 'ফলমূল' },
  { id: 'grocery', name: 'নিত্যপণ্য' }
];

/**
 * @LOCKED_COMPONENT
 * @Section Online Haat Admin Management
 * @Status Design & Logic Finalized
 */
const AdminHaatMgmt: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [form, setForm] = useState({
    name: '', category: 'fish', price: '', unit: 'কেজি', sellerName: '', mobile: '', location: '', description: '', photo: ''
  });

  useEffect(() => {
    const haatRef = ref(db, 'online_haat');
    const unsubscribe = onValue(haatRef, snap => {
        const val = snap.val();
        setProducts(val ? Object.keys(val).map(k => ({...val[k], id: k})) : []);
    });
    return () => unsubscribe();
  }, []);

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
    if (!form.name || !form.price || !form.mobile) {
        alert('নাম, মূল্য এবং মোবাইল নম্বর অবশ্যই পূরণ করুন');
        return;
    }
    setIsSubmitting(true);
    try {
        const id = editingId || push(ref(db, 'online_haat')).key;
        const finalData = { ...form, id, timestamp: new Date().toISOString() };
        await set(ref(db, `online_haat/${id}`), finalData);
        setShowForm(false);
        setEditingId(null);
        setForm({ name: '', category: 'fish', price: '', unit: 'কেজি', sellerName: '', mobile: '', location: '', description: '', photo: '' });
    } catch (e) { alert('সংরক্ষণ ব্যর্থ হয়েছে!'); }
    finally { setIsSubmitting(false); }
  };

  const handleDelete = async (id: string) => {
    if (confirm('আপনি কি এই পণ্যটি মুছে ফেলতে চান?')) {
      await remove(ref(db, `online_haat/${id}`));
    }
  };

  const filteredProducts = products.filter(p => 
    (p.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.sellerName || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
        <Header title="অনলাইন হাট ম্যানেজার" onBack={onBack} />
        
        <button 
            onClick={() => { setEditingId(null); setForm({name:'', category:'fish', price:'', unit:'কেজি', sellerName:'', mobile:'', location:'', description:'', photo:''}); setShowForm(true); }}
            className="w-full py-5 bg-[#F1C40F] text-slate-900 font-black rounded-[28px] shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all"
        >
            <Plus /> নতুন পণ্য যোগ করুন
        </button>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            className="w-full pl-12 pr-5 py-4 bg-white border border-slate-100 rounded-[22px] font-bold outline-none shadow-sm" 
            placeholder="পণ্য বা বিক্রেতার নাম..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="grid gap-4">
            {filteredProducts.length === 0 ? (
                <div className="py-20 text-center opacity-30 flex flex-col items-center gap-3">
                   <Info size={32} />
                   <p className="font-bold">কোনো পণ্য পাওয়া যায়নি</p>
                </div>
            ) : (
                filteredProducts.map(p => (
                    <div key={p.id} className="bg-white p-4 rounded-[32px] border border-slate-100 flex items-center gap-4 shadow-sm group">
                        <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 overflow-hidden flex items-center justify-center text-slate-300 shrink-0">
                            {p.photo ? <img src={p.photo} className="w-full h-full object-cover" /> : <ShoppingBasket size={24} />}
                        </div>
                        <div className="flex-1 overflow-hidden text-left">
                            <h4 className="font-black text-slate-800 truncate text-sm">{p.name}</h4>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">বিক্রেতা: {p.sellerName}</p>
                            <p className="text-[10px] font-black text-orange-600 mt-1">৳ {p.price} / {p.unit}</p>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => { setEditingId(p.id); setForm(p); setShowForm(true); }} className="p-3 bg-blue-50 text-blue-600 rounded-xl active:scale-90 transition-all">
                                <Edit size={16}/>
                            </button>
                            <button onClick={() => handleDelete(p.id)} className="p-3 bg-red-50 text-red-500 rounded-xl active:scale-90 transition-all opacity-40 group-hover:opacity-100">
                                <Trash2 size={16}/>
                            </button>
                        </div>
                    </div>
                ))
            )}
        </div>

        {showForm && (
            <div className="fixed inset-0 z-[150] bg-slate-900/60 backdrop-blur-md p-5 flex items-center justify-center">
                <div className="bg-white w-full max-w-sm rounded-[45px] p-8 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto animate-in zoom-in duration-300">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="font-black text-xl text-slate-800">পণ্যের তথ্য প্রদান</h3>
                        <button onClick={()=>setShowForm(false)} className="p-2 text-slate-400 hover:text-red-500"><X/></button>
                    </div>
                    
                    <div className="flex flex-col items-center">
                        <div className="relative group w-full">
                            <div className="w-full h-40 rounded-[30px] bg-slate-50 border-2 border-dashed border-slate-200 shadow-inner overflow-hidden flex flex-col items-center justify-center text-slate-300 gap-2">
                                {form.photo ? (
                                    <img src={form.photo} className="w-full h-full object-cover" />
                                ) : (
                                    <>
                                        <Camera size={40} />
                                        <span className="text-[10px] font-black uppercase tracking-widest">পণ্যের ছবি দিন</span>
                                    </>
                                )}
                            </div>
                            <button 
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute bottom-2 right-2 p-3 bg-[#F1C40F] text-slate-900 rounded-2xl shadow-xl border-4 border-white active:scale-90 transition-all"
                            >
                                <Camera size={16} strokeWidth={3} />
                            </button>
                            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                        </div>
                    </div>

                    <div className="space-y-4 pt-2">
                        <div className="text-left">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-2 block">ক্যাটাগরি</label>
                            <div className="relative">
                                <select 
                                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl appearance-none font-black text-slate-800 focus:ring-2 focus:ring-blue-500 shadow-sm outline-none"
                                    value={form.category}
                                    onChange={(e) => setForm({...form, category: e.target.value})}
                                >
                                    {HAAT_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
                            </div>
                        </div>

                        <EditField label="পণ্যের নাম" value={form.name} onChange={v=>setForm({...form, name:v})} placeholder="উদাঃ টাটকা রুই মাছ" icon={<ShoppingBasket size={18}/>} />
                        
                        <div className="grid grid-cols-2 gap-3">
                            <EditField label="মূল্য (টাকা)" value={form.price} onChange={v=>setForm({...form, price:v})} placeholder="৳ 00" type="number" />
                            <EditField label="একক" value={form.unit} onChange={v=>setForm({...form, unit:v})} placeholder="কেজি / হালি" />
                        </div>

                        <EditField label="বিক্রেতার নাম" value={form.sellerName} onChange={v=>setForm({...form, sellerName:v})} placeholder="নাম লিখুন" icon={<Store size={18}/>} />
                        <EditField label="মোবাইল নম্বর" value={form.mobile} onChange={v=>setForm({...form, mobile:v})} placeholder="০১xxxxxxxxx" icon={<Smartphone size={18}/>} />
                        <EditField label="এলাকা / ঠিকানা" value={form.location} onChange={v=>setForm({...form, location:v})} placeholder="যেমন: কপিলমুনি বাজার" icon={<MapPin size={18}/>} />
                        
                        <div className="text-left">
                            <label className="text-[10px] font-bold text-slate-400 block mb-1.5 uppercase tracking-wider pl-1">বিস্তারিত (ঐচ্ছিক)</label>
                            <textarea 
                                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none text-slate-800 h-24 text-sm"
                                value={form.description}
                                onChange={e => setForm({...form, description: e.target.value})}
                                placeholder="পণ্যের গুণাগুণ সম্পর্কে লিখুন..."
                            />
                        </div>

                        <button 
                            onClick={handleSubmit} 
                            disabled={isSubmitting} 
                            className="w-full py-5 bg-[#F1C40F] text-slate-900 font-black rounded-3xl shadow-lg mt-4 flex items-center justify-center gap-2 active:scale-95 transition-all"
                        >
                            {isSubmitting ? <Loader2 className="animate-spin" /> : (editingId ? 'পণ্য আপডেট করুন' : 'পণ্য পাবলিশ করুন')}
                        </button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default AdminHaatMgmt;
