
import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronLeft, 
  Trash2, 
  Plus, 
  X, 
  Search, 
  Smartphone, 
  MapPin, 
  User as UserIcon, 
  Tag, 
  Phone, 
  ShieldAlert, 
  Camera, 
  Loader2 
} from 'lucide-react';
import { HotlineContact } from '../types';

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

// INTERNAL COMPONENTS
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
 * @Section Emergency Hotline Management
 * @Status Design & Logic Finalized
 */
const AdminHotlineMgmt: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const hotlineFileInputRef = useRef<HTMLInputElement>(null);
  const [hotlineContacts, setHotlineContacts] = useState<HotlineContact[]>([]);
  const [showHotlineForm, setShowHotlineForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingHotlineId, setEditingHotlineId] = useState<string | null>(null);
  const [hotlineForm, setHotlineForm] = useState<Omit<HotlineContact, 'id'>>({
    serviceType: '', name: '', address: '', mobile: '', centralHotline: '', photo: ''
  });

  useEffect(() => {
    const unsubscribe = onValue(ref(db, 'hotline'), snap => {
        const data = snap.val();
        setHotlineContacts(data ? Object.keys(data).map(k => ({...data[k], id: k})) : []);
    });
    return () => unsubscribe();
  }, []);

  const handleHotlinePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setHotlineForm(prev => ({ ...prev, photo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleHotlineSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hotlineForm.name || !hotlineForm.mobile) return;
    setIsSubmitting(true);
    try {
        const id = editingHotlineId || push(ref(db, 'hotline')).key;
        await set(ref(db, `hotline/${id}`), { ...hotlineForm, id });
        setShowHotlineForm(false);
        setEditingHotlineId(null);
    } catch (e) { alert('ত্রুটি!'); }
    finally { setIsSubmitting(false); }
  };

  const handleDeleteHotline = async (id: string) => {
    if (confirm('আপনি কি এই তথ্যটি মুছে ফেলতে চান?')) {
      try {
        await remove(ref(db, `hotline/${id}`));
      } catch (e) {
        alert('মুছে ফেলা সম্ভব হয়নি।');
      }
    }
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
        <Header title="জরুরি হটলাইন ম্যানেজমেন্ট" onBack={onBack} />
        
        <button 
          onClick={() => { 
            setEditingHotlineId(null); 
            setHotlineForm({serviceType: '', name: '', address: '', mobile: '', centralHotline: '', photo: ''}); 
            setShowHotlineForm(true); 
          }} 
          className="w-full py-5 bg-red-600 text-white font-black rounded-[28px] shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all"
        >
            <Plus /> নতুন হটলাইন যোগ করুন
        </button>

        <div className="grid gap-3">
            {hotlineContacts.length === 0 ? (
                <div className="py-20 text-center opacity-30">কোনো তথ্য পাওয়া যায়নি।</div>
            ) : (
                hotlineContacts.map(h => (
                    <div key={h.id} className="bg-white p-5 rounded-[28px] border border-slate-100 flex items-center justify-between shadow-sm hover:border-red-100 transition-colors group">
                        <div className="flex items-center gap-4 text-left">
                            <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-100 overflow-hidden flex items-center justify-center text-slate-300 shrink-0">
                                {h.photo ? <img src={h.photo} className="w-full h-full object-cover" /> : <UserIcon size={20} />}
                            </div>
                            <div>
                                <h4 className="font-black text-slate-800">{h.name}</h4>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{h.serviceType}</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => { setEditingHotlineId(h.id); setHotlineForm(h); setShowHotlineForm(true); }} className="p-3 bg-blue-50 text-blue-600 rounded-xl active:scale-90 transition-all">
                                <Search size={18}/>
                            </button>
                            <button onClick={() => handleDeleteHotline(h.id)} className="p-3 bg-red-50 text-red-500 rounded-xl active:scale-90 transition-all opacity-40 group-hover:opacity-100">
                                <Trash2 size={18}/>
                            </button>
                        </div>
                    </div>
                ))
            )}
        </div>

        {showHotlineForm && (
            <div className="fixed inset-0 z-[150] bg-slate-900/60 backdrop-blur-md p-5 flex items-center justify-center">
                <div className="bg-white w-full max-w-sm rounded-[45px] p-8 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto animate-in zoom-in duration-300">
                    <div className="flex justify-between items-center">
                        <h3 className="font-black text-xl text-slate-800">হটলাইন তথ্য প্রদান</h3>
                        <button onClick={()=>setShowHotlineForm(false)} className="p-2 text-slate-400 hover:text-red-500"><X/></button>
                    </div>
                    
                    <div className="flex flex-col items-center pt-2">
                        <div className="relative group">
                            <div className="w-24 h-24 rounded-full bg-slate-50 border-4 border-white shadow-lg overflow-hidden flex items-center justify-center text-slate-200">
                                {hotlineForm.photo ? (
                                    <img src={hotlineForm.photo} alt="Hotline" className="w-full h-full object-cover" />
                                ) : (
                                    <UserIcon size={40} />
                                )}
                            </div>
                            <button 
                                type="button"
                                onClick={() => hotlineFileInputRef.current?.click()}
                                className="absolute bottom-0 right-0 p-3 bg-red-600 text-white rounded-2xl shadow-xl border-4 border-white active:scale-90 transition-all"
                            >
                                <Camera size={16} strokeWidth={3} />
                            </button>
                            <input type="file" ref={hotlineFileInputRef} className="hidden" accept="image/*" onChange={handleHotlinePhotoUpload} />
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-4">ছবি নির্বাচন করুন</p>
                    </div>

                    <div className="space-y-4 pt-2">
                        <EditField label="সার্ভিসের ধরন" value={hotlineForm.serviceType} onChange={v=>setHotlineForm({...hotlineForm, serviceType:v})} placeholder="উদাঃ ফায়ার সার্ভিস" icon={<Tag size={18}/>} />
                        <EditField label="প্রতিষ্ঠানের নাম" value={hotlineForm.name} onChange={v=>setHotlineForm({...hotlineForm, name:v})} placeholder="নাম লিখুন" icon={<UserIcon size={18}/>} />
                        <EditField label="ঠিকানা" value={hotlineForm.address} onChange={v=>setHotlineForm({...hotlineForm, address:v})} placeholder="ঠিকানা" icon={<MapPin size={18}/>} />
                        <EditField label="মোবাইল নম্বর" value={hotlineForm.mobile} onChange={v=>setHotlineForm({...hotlineForm, mobile:v})} placeholder="০১xxxxxxxxx" icon={<Smartphone size={18}/>} />
                        <EditField label="সেন্ট্রাল হটলাইন (অপশনাল)" value={hotlineForm.centralHotline} onChange={v=>setHotlineForm({...hotlineForm, centralHotline:v})} placeholder="উদাঃ ১৬২৬৩" icon={<Phone size={18}/>} />
                        
                        <button 
                            onClick={handleHotlineSubmit} 
                            disabled={isSubmitting} 
                            className="w-full py-5 bg-red-600 text-white font-black rounded-3xl shadow-lg mt-4 flex items-center justify-center gap-2 active:scale-95 transition-all shadow-red-500/20"
                        >
                            {isSubmitting ? <Loader2 className="animate-spin" /> : (editingHotlineId ? 'আপডেট করুন' : 'সংরক্ষণ করুন')}
                        </button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default AdminHotlineMgmt;
