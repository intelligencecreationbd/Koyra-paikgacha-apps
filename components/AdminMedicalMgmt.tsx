
import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronLeft, 
  Trash2, 
  Plus, 
  X, 
  Smartphone, 
  MapPin, 
  User as UserIcon, 
  Tag, 
  Stethoscope,
  Hospital,
  Truck,
  Droplets,
  Pill,
  Microscope,
  Activity,
  Camera, 
  Loader2,
  ArrowRight,
  Edit2
} from 'lucide-react';

// Firebase Imports
import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, onValue, remove, set, push } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

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

const MEDICAL_CATEGORIES = [
  { id: 'doc', name: 'ডাক্তার খুঁজুন', icon: Stethoscope, color: '#E91E63' },
  { id: 'hosp', name: 'হাসপাতাল ও ক্লিনিক', icon: Hospital, color: '#3B82F6' },
  { id: 'amb', name: 'অ্যাম্বুলেন্স সেবা', icon: Truck, color: '#F59E0B' },
  { id: 'blood', name: 'ব্লাড ব্যাংক', icon: Droplets, color: '#EF4444' },
  { id: 'pharma', name: 'অনলাইন ফার্মেসি', icon: Pill, color: '#10B981' },
  { id: 'diag', name: 'ডায়াগনস্টিক সেন্টার', icon: Microscope, color: '#8B5CF6' },
  { id: 'tips', name: 'হেলথ টিপস', icon: Activity, color: '#EC4899' },
];

const EditField = ({ label, value, placeholder, onChange, icon, type = 'text' }: any) => (
  <div className="text-left w-full">
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

export default function AdminMedicalMgmt({ onBack }: { onBack: () => void }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const [items, setItems] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [form, setForm] = useState({
    name: '', specialist: '', degree: '', mobile: '', location: '', photo: '', desc: ''
  });

  useEffect(() => {
    if (!selectedCat) return;
    const medicalRef = ref(db, `medical_services/${selectedCat}`);
    const unsubscribe = onValue(medicalRef, snap => {
        const val = snap.val();
        setItems(val ? Object.keys(val).map(k => ({...val[k], id: k})) : []);
    });
    return () => unsubscribe();
  }, [selectedCat]);

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
    if (!form.name || !form.mobile) return;
    setIsSubmitting(true);
    try {
        const id = editingId || push(ref(db, `medical_services/${selectedCat}`)).key;
        await set(ref(db, `medical_services/${selectedCat}/${id}`), { ...form, id });
        setShowForm(false);
        setEditingId(null);
        setForm({ name: '', specialist: '', degree: '', mobile: '', location: '', photo: '', desc: '' });
    } catch (e) { alert('সংরক্ষণ ব্যর্থ হয়েছে!'); }
    finally { setIsSubmitting(false); }
  };

  const handleDelete = async (id: string) => {
    if (confirm('আপনি কি এই তথ্যটি ডিলিট করতে চান?')) {
      await remove(ref(db, `medical_services/${selectedCat}/${id}`));
    }
  };

  const handleBack = () => {
    if (selectedCat) setSelectedCat(null);
    else onBack();
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-500 pb-20">
        <div className="flex items-center gap-4 mb-6 text-left">
          <button onClick={handleBack} className="p-3 bg-white rounded-xl shadow-sm border border-slate-100 active:scale-90 transition-all">
            <ChevronLeft size={20} className="text-slate-800" />
          </button>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">
            {selectedCat ? MEDICAL_CATEGORIES.find(c => c.id === selectedCat)?.name : 'চিকিৎসা সেবা ম্যানেজার'}
          </h2>
        </div>

        {!selectedCat ? (
          <div className="grid grid-cols-2 gap-3">
             {MEDICAL_CATEGORIES.map(cat => (
                <button
                   key={cat.id}
                   onClick={() => setSelectedCat(cat.id)}
                   className="flex flex-col items-center justify-center p-6 bg-white rounded-[32px] border border-slate-100 shadow-sm active:scale-[0.98] transition-all group"
                >
                   <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform" style={{ backgroundColor: `${cat.color}15`, color: cat.color }}>
                      <cat.icon size={28} />
                   </div>
                   <span className="font-black text-xs text-slate-800 text-center">{cat.name}</span>
                </button>
             ))}
          </div>
        ) : (
          <>
            <button 
              onClick={() => { setEditingId(null); setForm({name:'', specialist:'', degree:'', mobile:'', location:'', photo:'', desc:''}); setShowForm(true); }}
              className="w-full py-5 bg-[#0056b3] text-white font-black rounded-[28px] shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
                <Plus size={20} /> নতুন তথ্য যোগ করুন
            </button>

            <div className="space-y-3">
                {items.length === 0 ? (
                    <div className="py-20 text-center opacity-30">কোনো তথ্য সংরক্ষিত নেই।</div>
                ) : (
                    items.map(item => (
                        <div key={item.id} className="bg-white p-5 rounded-[28px] border border-slate-100 flex items-center justify-between shadow-sm group">
                            <div className="flex items-center gap-4 text-left overflow-hidden">
                                <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 overflow-hidden flex items-center justify-center text-slate-300 shrink-0">
                                    {item.photo ? <img src={item.photo} className="w-full h-full object-cover" /> : <UserIcon size={24} />}
                                </div>
                                <div className="overflow-hidden">
                                    <h4 className="font-black text-slate-800 truncate text-sm">{item.name}</h4>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">{item.specialist || item.location}</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => { setEditingId(item.id); setForm(item); setShowForm(true); }} className="p-3 bg-blue-50 text-blue-600 rounded-xl active:scale-90 transition-all">
                                    <Edit2 size={16}/>
                                </button>
                                <button onClick={() => handleDelete(item.id)} className="p-3 bg-red-50 text-red-500 rounded-xl active:scale-90 transition-all">
                                    <Trash2 size={16}/>
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
          </>
        )}

        {showForm && (
            <div className="fixed inset-0 z-[150] bg-slate-900/60 backdrop-blur-md p-5 flex items-center justify-center">
                <div className="bg-white w-full max-w-sm rounded-[45px] p-8 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto animate-in zoom-in duration-300">
                    <div className="flex justify-between items-center border-b pb-4">
                        <h3 className="font-black text-xl text-slate-800">{editingId ? 'তথ্য সংশোধন' : 'নতুন তথ্য প্রদান'}</h3>
                        <button onClick={()=>setShowForm(false)} className="p-2 text-slate-400 hover:text-red-500"><X/></button>
                    </div>
                    
                    <div className="flex flex-col items-center">
                        <div className="relative group">
                            <div className="w-24 h-24 rounded-[35px] bg-slate-50 border-4 border-white shadow-lg overflow-hidden flex items-center justify-center text-slate-200">
                                {form.photo ? <img src={form.photo} className="w-full h-full object-cover" /> : <Camera size={40} />}
                            </div>
                            <button type="button" onClick={() => fileInputRef.current?.click()} className="absolute bottom-0 right-0 p-3 bg-blue-600 text-white rounded-2xl shadow-xl border-4 border-white active:scale-90"><Plus size={18}/></button>
                            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                        </div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-4">ছবি সিলেক্ট করুন</p>
                    </div>

                    <div className="space-y-4 pt-2">
                        <EditField label="নাম *" value={form.name} onChange={(v:any)=>setForm({...form, name:v})} placeholder="নাম লিখুন" icon={<UserIcon size={18}/>} />
                        {(selectedCat === 'doc' || selectedCat === 'tips') && (
                           <EditField label="স্পেশালিস্ট" value={form.specialist} onChange={(v:any)=>setForm({...form, specialist:v})} placeholder="যেমন: মেডিসিন বিশেষজ্ঞ" icon={<Stethoscope size={18}/>} />
                        )}
                        {selectedCat === 'doc' && (
                           <EditField label="ডিগ্রি" value={form.degree} onChange={(v:any)=>setForm({...form, degree:v})} placeholder="যেমন: MBBS, FCPS" icon={<Tag size={18}/>} />
                        )}
                        <EditField label="মোবাইল নম্বর *" value={form.mobile} onChange={(v:any)=>setForm({...form, mobile:v})} placeholder="০১xxxxxxxxx" icon={<Smartphone size={18}/>} />
                        <EditField label="ঠিকানা / অবস্থান" value={form.location} onChange={(v:any)=>setForm({...form, location:v})} placeholder="ঠিকানা দিন" icon={<MapPin size={18}/>} />
                        <div className="text-left">
                            <label className="text-[10px] font-bold text-slate-400 block mb-1.5 uppercase tracking-wider pl-1">অতিরিক্ত বিবরণ</label>
                            <textarea className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-700 outline-none h-24 text-sm" value={form.desc} onChange={e => setForm({...form, desc: e.target.value})} placeholder="বিস্তারিত তথ্য..." />
                        </div>
                        <button 
                            onClick={handleSubmit} 
                            disabled={isSubmitting} 
                            className="w-full py-5 bg-[#0056b3] text-white font-black rounded-[28px] shadow-lg mt-4 flex items-center justify-center gap-2 active:scale-95 transition-all shadow-blue-500/20 disabled:opacity-50"
                        >
                            {isSubmitting ? <Loader2 className="animate-spin" /> : (editingId ? 'আপডেট করুন' : 'সংরক্ষণ করুন')}
                        </button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
}
