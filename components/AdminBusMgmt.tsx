
import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronLeft, 
  Trash2, 
  Plus, 
  X, 
  Search, 
  MapPin, 
  Bus, 
  Loader2,
  Tag
} from 'lucide-react';
import { BusCounter } from '../types';

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

// INTERNAL COMPONENTS
const Header: React.FC<{ title: string; onBack: () => void }> = ({ title, onBack }) => (
  <div className="flex items-center gap-4 mb-6 text-left">
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
 * @Section Bus Counter Management
 * @Status Design & Logic Finalized
 */
const AdminBusMgmt: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [busCounters, setBusCounters] = useState<BusCounter[]>([]);
  const [showBusForm, setShowBusForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingBusId, setEditingBusId] = useState<string | null>(null);
  const [busForm, setBusForm] = useState<Omit<BusCounter, 'id'>>({
    route: '', busName: '', acFare: '', nonAcFare: '', counters: [{ name: '', mobile: '' }]
  });

  useEffect(() => {
    const busRef = ref(db, 'bus_counters');
    const unsubscribe = onValue(busRef, snap => {
        const data = snap.val();
        setBusCounters(data ? Object.keys(data).map(k => ({...data[k], id: k})) : []);
    });
    return () => unsubscribe();
  }, []);

  const handleBusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!busForm.busName || !busForm.route) return;
    setIsSubmitting(true);
    try {
        const id = editingBusId || push(ref(db, 'bus_counters')).key;
        await set(ref(db, `bus_counters/${id}`), { ...busForm, id });
        setShowBusForm(false);
        setEditingBusId(null);
    } catch (e) { alert('ত্রুটি!'); }
    finally { setIsSubmitting(false); }
  };

  const handleDeleteBus = async (id: string) => {
    if (confirm('আপনি কি এই বাস সার্ভিসের তথ্য মুছে ফেলতে চান?')) {
      try {
        await remove(ref(db, `bus_counters/${id}`));
      } catch (e) {
        alert('মুছে ফেলা সম্ভব হয়নি।');
      }
    }
  };

  const handleAddCounterField = () => {
    setBusForm({
      ...busForm, 
      counters: [...busForm.counters, { name: '', mobile: '' }]
    });
  };

  const handleCounterChange = (index: number, field: 'name' | 'mobile', value: string) => {
    const updatedCounters = [...busForm.counters];
    updatedCounters[index][field] = value;
    setBusForm({ ...busForm, counters: updatedCounters });
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
        <Header title="বাস কাউন্টার ম্যানেজার" onBack={onBack} />
        
        <button 
          onClick={() => { 
            setEditingBusId(null); 
            setBusForm({route: '', busName: '', acFare: '', nonAcFare: '', counters: [{name:'', mobile:''}]}); 
            setShowBusForm(true); 
          }} 
          className="w-full py-5 bg-orange-600 text-white font-black rounded-[28px] shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all"
        >
            <Plus /> নতুন বাস সার্ভিস যোগ করুন
        </button>

        <div className="grid gap-3">
            {busCounters.length === 0 ? (
                <div className="py-20 text-center opacity-30">কোনো বাসের তথ্য পাওয়া যায়নি।</div>
            ) : (
                busCounters.map(b => (
                    <div key={b.id} className="bg-white p-5 rounded-[28px] border border-slate-100 flex items-center justify-between shadow-sm hover:border-orange-100 transition-colors group">
                        <div className="text-left">
                            <h4 className="font-black text-slate-800">{b.busName}</h4>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <MapPin size={10} className="text-orange-500" />
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{b.route}</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button 
                                onClick={() => { setEditingBusId(b.id); setBusForm(b); setShowBusForm(true); }} 
                                className="p-3 bg-blue-50 text-blue-600 rounded-xl active:scale-90 transition-all"
                            >
                                <Search size={18}/>
                            </button>
                            <button 
                                onClick={() => handleDeleteBus(b.id)} 
                                className="p-3 bg-red-50 text-red-500 rounded-xl active:scale-90 transition-all opacity-40 group-hover:opacity-100"
                            >
                                <Trash2 size={18}/>
                            </button>
                        </div>
                    </div>
                ))
            )}
        </div>

        {showBusForm && (
            <div className="fixed inset-0 z-[150] bg-slate-900/60 backdrop-blur-md p-5 flex items-center justify-center">
                <div className="bg-white w-full max-w-sm rounded-[45px] p-8 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto animate-in zoom-in duration-300">
                    <div className="flex justify-between items-center">
                        <h3 className="font-black text-xl text-slate-800">বাস সার্ভিসের তথ্য প্রদান</h3>
                        <button onClick={()=>setShowBusForm(false)} className="p-2 text-slate-400 hover:text-red-500"><X/></button>
                    </div>
                    
                    <div className="space-y-4 pt-2">
                        <EditField 
                            label="রুটের নাম" 
                            value={busForm.route} 
                            onChange={v=>setBusForm({...busForm, route:v})} 
                            placeholder="উদাঃ পাইকগাছা-ঢাকা" 
                            icon={<MapPin size={18}/>} 
                        />
                        <EditField 
                            label="বাসের নাম" 
                            value={busForm.busName} 
                            onChange={v=>setBusForm({...busForm, busName:v})} 
                            placeholder="উদাঃ হানিফ এন্টারপ্রাইজ" 
                            icon={<Bus size={18}/>} 
                        />
                        
                        <div className="grid grid-cols-2 gap-3">
                            <EditField 
                                label="এসি ভাড়া" 
                                value={busForm.acFare} 
                                onChange={v=>setBusForm({...busForm, acFare:v})} 
                                placeholder="৳ 00" 
                            />
                            <EditField 
                                label="নন-এসি ভাড়া" 
                                value={busForm.nonAcFare} 
                                onChange={v=>setBusForm({...busForm, nonAcFare:v})} 
                                placeholder="৳ 00" 
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block pl-1">কাউন্টার লিস্ট</label>
                            {busForm.counters.map((c, i) => (
                                <div key={i} className="flex gap-2 animate-in slide-in-from-top-1">
                                    <input 
                                        placeholder="কাউন্টার নাম" 
                                        className="flex-1 p-3.5 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-xs outline-none focus:border-orange-400" 
                                        value={c.name} 
                                        onChange={e => handleCounterChange(i, 'name', e.target.value)} 
                                    />
                                    <input 
                                        placeholder="মোবাইল" 
                                        className="flex-1 p-3.5 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-xs outline-none focus:border-orange-400" 
                                        value={c.mobile} 
                                        onChange={e => handleCounterChange(i, 'mobile', e.target.value)} 
                                    />
                                    {busForm.counters.length > 1 && (
                                        <button 
                                            type="button" 
                                            onClick={() => setBusForm({...busForm, counters: busForm.counters.filter((_, idx) => idx !== i)})} 
                                            className="p-3 text-red-500"
                                        >
                                            <Trash2 size={16}/>
                                        </button>
                                    )}
                                </div>
                            ))}
                            <button 
                                type="button" 
                                onClick={handleAddCounterField} 
                                className="flex items-center gap-1.5 text-xs font-black text-orange-600 pl-1"
                            >
                                <Plus size={14}/> আরেকটি কাউন্টার যোগ করুন
                            </button>
                        </div>
                        
                        <button 
                            onClick={handleBusSubmit} 
                            disabled={isSubmitting} 
                            className="w-full py-5 bg-orange-600 text-white font-black rounded-3xl shadow-lg mt-4 flex items-center justify-center gap-2 active:scale-95 transition-all shadow-orange-500/20"
                        >
                            {isSubmitting ? <Loader2 className="animate-spin" /> : (editingBusId ? 'আপডেট করুন' : 'সংরক্ষণ করুন')}
                        </button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default AdminBusMgmt;
