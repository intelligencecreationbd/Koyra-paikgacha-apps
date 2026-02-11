
import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronLeft, 
  Trash2, 
  Plus, 
  X, 
  Search, 
  User as UserIcon, 
  Scale, 
  Loader2, 
  Camera, 
  Smartphone, 
  Mail, 
  Building2, 
  Home as HomeIcon, 
  UserCheck, 
  FolderPlus 
} from 'lucide-react';
import { LegalServiceContact } from '../types';

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
 * @Section Legal Service Management
 * @Status Design & Logic Finalized
 */
const AdminLegalMgmt: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const legalFileInputRef = useRef<HTMLInputElement>(null);
  const [legalServices, setLegalServices] = useState<LegalServiceContact[]>([]);
  const [showLegalForm, setShowLegalForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingLegalId, setEditingLegalId] = useState<string | null>(null);
  
  const [showEmailField, setShowEmailField] = useState(false);
  const [showAssistantFields, setShowAssistantFields] = useState(false);
  const [isAddingNewCategory, setIsAddingNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const [legalForm, setLegalForm] = useState<Omit<LegalServiceContact, 'id'> & { extraMobiles: string[], email: string, assistantName: string, assistantMobile: string }>({
    categoryId: '4-1', categoryName: 'আইনজীবী', name: '', mobile: '', extraMobiles: [], email: '', assistantName: '', assistantMobile: '', homeAddress: '', officeAddress: '', photo: '', customFields: []
  });

  useEffect(() => {
    const legalRef = ref(db, 'legal_services');
    const unsubscribe = onValue(legalRef, snap => {
        const data = snap.val();
        if (!data) { setLegalServices([]); return; }
        const list: LegalServiceContact[] = [];
        Object.keys(data).forEach(cat => {
            Object.keys(data[cat]).forEach(key => {
                list.push({...data[cat][key], id: key});
            });
        });
        setLegalServices(list);
    });
    return () => unsubscribe();
  }, []);

  const handleLegalPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLegalForm(prev => ({ ...prev, photo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLegalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!legalForm.name || !legalForm.mobile) return;
    if (isAddingNewCategory && !newCategoryName.trim()) { alert('ক্যাটাগরির নাম লিখুন'); return; }
    
    setIsSubmitting(true);
    const catId = isAddingNewCategory ? `4-${Date.now()}` : legalForm.categoryId;
    const catName = isAddingNewCategory ? newCategoryName : legalForm.categoryName;
    
    const customFields = [];
    if (legalForm.email) customFields.push({ label: 'Email', value: legalForm.email });
    if (legalForm.assistantName) customFields.push({ label: 'সহকারীর নাম', value: legalForm.assistantName });
    if (legalForm.assistantMobile) customFields.push({ label: 'সহকারীর মোবাইল', value: legalForm.assistantMobile });
    
    legalForm.extraMobiles.forEach((mob, idx) => {
        if (mob) customFields.push({ label: `Mobile ${idx + 2}`, value: mob });
    });

    try {
        const id = editingLegalId || push(ref(db, `legal_services/${catId}`)).key;
        const finalData = {
            id,
            categoryId: catId,
            categoryName: catName,
            name: legalForm.name,
            mobile: legalForm.mobile,
            homeAddress: legalForm.homeAddress,
            officeAddress: legalForm.officeAddress,
            photo: legalForm.photo,
            customFields
        };
        await set(ref(db, `legal_services/${catId}/${id}`), finalData);
        setShowLegalForm(false);
        setIsAddingNewCategory(false);
        setNewCategoryName('');
        setEditingLegalId(null);
    } catch (e) { alert('ত্রুটি!'); }
    finally { setIsSubmitting(false); }
  };

  const handleDeleteLegal = async (categoryId: string, id: string) => {
    if (confirm('আপনি কি এই তথ্যটি মুছে ফেলতে চান?')) {
        try {
            await remove(ref(db, `legal_services/${categoryId}/${id}`));
        } catch (e) { alert('মুছে ফেলা সম্ভব হয়নি।'); }
    }
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
        <Header title="আইনি সেবা ম্যানেজার" onBack={onBack} />
        
        <button 
          onClick={() => { 
            setEditingLegalId(null); 
            setLegalForm({categoryId: '4-1', categoryName: 'আইনজীবী', name: '', mobile: '', extraMobiles: [], email: '', assistantName: '', assistantMobile: '', homeAddress: '', officeAddress: '', photo: '', customFields: []}); 
            setShowEmailField(false);
            setShowAssistantFields(false);
            setIsAddingNewCategory(false);
            setNewCategoryName('');
            setShowLegalForm(true); 
          }} 
          className="w-full py-5 bg-blue-700 text-white font-black rounded-[28px] shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all"
        >
            <Plus /> নতুন তথ্য যোগ করুন
        </button>

        <div className="grid gap-3">
            {legalServices.length === 0 ? (
                <div className="py-20 text-center opacity-30">কোনো তথ্য পাওয়া যায়নি।</div>
            ) : (
                legalServices.map(l => (
                    <div key={l.id} className="bg-white p-5 rounded-[28px] border border-slate-100 flex items-center justify-between shadow-sm hover:border-blue-100 transition-colors group">
                        <div className="flex items-center gap-4 text-left">
                            <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-100 overflow-hidden flex items-center justify-center text-slate-300 shrink-0">
                                {l.photo ? <img src={l.photo} className="w-full h-full object-cover" /> : <UserIcon size={20} />}
                            </div>
                            <div>
                                <h4 className="font-black text-slate-800">{l.name}</h4>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{l.categoryName}</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button 
                                onClick={() => { 
                                    setEditingLegalId(l.id); 
                                    const emailField = l.customFields?.find(f => f.label === 'Email')?.value || '';
                                    const asstName = l.customFields?.find(f => f.label === 'সহকারীর নাম')?.value || '';
                                    const asstMobile = l.customFields?.find(f => f.label === 'সহকারীর মোবাইল')?.value || '';
                                    const extraMobs = l.customFields?.filter(f => f.label.startsWith('Mobile')).map(f => f.value) || [];
                                    setLegalForm({...l, extraMobiles: extraMobs, email: emailField, assistantName: asstName, assistantMobile: asstMobile} as any); 
                                    setShowEmailField(!!emailField);
                                    setShowAssistantFields(!!asstName || !!asstMobile);
                                    setIsAddingNewCategory(false);
                                    setShowLegalForm(true); 
                                }} 
                                className="p-3 bg-blue-50 text-blue-600 rounded-xl active:scale-90 transition-all"
                            >
                                <Search size={18}/>
                            </button>
                            <button 
                                onClick={() => handleDeleteLegal(l.categoryId, l.id)} 
                                className="p-3 bg-red-50 text-red-500 rounded-xl active:scale-90 transition-all opacity-40 group-hover:opacity-100"
                            >
                                <Trash2 size={18}/>
                            </button>
                        </div>
                    </div>
                ))
            )}
        </div>

        {showLegalForm && (
            <div className="fixed inset-0 z-[150] bg-slate-900/60 backdrop-blur-md p-5 flex items-center justify-center">
                <div className="bg-white w-full max-w-sm rounded-[45px] p-8 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto animate-in zoom-in duration-300">
                    <div className="flex justify-between items-center">
                        <h3 className="font-black text-xl text-slate-800">আইনি সেবা তথ্য প্রদান</h3>
                        <button onClick={()=>setShowLegalForm(false)} className="p-2 text-slate-400 hover:text-red-500"><X/></button>
                    </div>
                    
                    <div className="flex flex-col items-center pt-2">
                        <div className="relative group">
                            <div className="w-24 h-24 rounded-full bg-slate-50 border-4 border-white shadow-lg overflow-hidden flex items-center justify-center text-slate-200">
                                {legalForm.photo ? (
                                    <img src={legalForm.photo} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <UserIcon size={40} />
                                )}
                            </div>
                            <button 
                                type="button"
                                onClick={() => legalFileInputRef.current?.click()}
                                className="absolute bottom-0 right-0 p-3 bg-blue-700 text-white rounded-2xl shadow-xl border-4 border-white active:scale-90 transition-all"
                            >
                                <Camera size={16} strokeWidth={3} />
                            </button>
                            <input type="file" ref={legalFileInputRef} className="hidden" accept="image/*" onChange={handleLegalPhotoUpload} />
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-4">ছবি আপলোড করুন</p>
                    </div>

                    <div className="space-y-4 pt-2">
                        <div className="space-y-1.5 text-left">
                            <label className="text-[10px] font-bold text-slate-400 uppercase block pl-1 tracking-widest">ক্যাটাগরি নির্বাচন</label>
                            {!isAddingNewCategory ? (
                                <div className="space-y-2">
                                    <select 
                                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-800 outline-none appearance-none" 
                                        value={legalForm.categoryId} 
                                        onChange={e=>setLegalForm({...legalForm, categoryId: e.target.value, categoryName: e.target.options[e.target.selectedIndex].text})}
                                    >
                                        <option value="4-1">আইনজীবী</option>
                                        <option value="4-2">সার্ভেয়ার</option>
                                        {/* Dynamic categories from existing list */}
                                        {Array.from(new Set(legalServices.map(l => l.categoryId)))
                                            .filter(id => id !== '4-1' && id !== '4-2')
                                            .map(id => {
                                                const cat = legalServices.find(l => l.categoryId === id);
                                                return <option key={id} value={id}>{cat?.categoryName}</option>;
                                            })
                                        }
                                    </select>
                                    <button type="button" onClick={() => setIsAddingNewCategory(true)} className="flex items-center gap-1.5 text-xs font-black text-blue-600 pl-1">
                                        <Plus size={14}/> নতুন ক্যাটাগরি যোগ করুন
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-3 p-4 bg-blue-50/50 border border-blue-100 rounded-3xl animate-in slide-in-from-top-2 duration-300 relative">
                                    <button type="button" onClick={() => setIsAddingNewCategory(false)} className="absolute top-2 right-2 text-slate-400"><X size={16}/></button>
                                    <EditField label="নতুন ক্যাটাগরির নাম" value={newCategoryName} onChange={setNewCategoryName} placeholder="যেমন: ডিড রাইটার" icon={<FolderPlus size={18}/>} />
                                </div>
                            )}
                        </div>

                        <EditField label="নাম" value={legalForm.name} onChange={v=>setLegalForm({...legalForm, name:v})} placeholder="নাম লিখুন" icon={<UserIcon size={18}/>} />
                        
                        <div className="space-y-3">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block pl-1">মোবাইল নম্বরসমূহ</label>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"><Smartphone size={18}/></div>
                                <input className="w-full pl-11 pr-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none text-slate-800" placeholder="প্রাথমিক নম্বর" value={legalForm.mobile} onChange={e => setLegalForm({...legalForm, mobile: e.target.value})} />
                            </div>
                            {legalForm.extraMobiles.map((mob, idx) => (
                                <div key={idx} className="flex gap-2 animate-in slide-in-from-top-1">
                                    <input className="flex-1 p-3.5 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm outline-none" placeholder="অতিরিক্ত নম্বর" value={mob} onChange={e => {
                                        const updated = [...legalForm.extraMobiles];
                                        updated[idx] = e.target.value;
                                        setLegalForm({...legalForm, extraMobiles: updated});
                                    }} />
                                    <button type="button" onClick={() => setLegalForm({...legalForm, extraMobiles: legalForm.extraMobiles.filter((_, i) => i !== idx)})} className="p-3 text-red-500 bg-red-50 rounded-2xl active:scale-90 transition-all"><Trash2 size={18}/></button>
                                </div>
                            ))}
                            <button type="button" onClick={() => setLegalForm({...legalForm, extraMobiles: [...legalForm.extraMobiles, '']})} className="flex items-center gap-1.5 text-xs font-black text-blue-600 pl-1">
                                <Plus size={14}/> মোবাইল নম্বর যোগ করুন
                            </button>
                        </div>

                        {!showEmailField ? (
                            <button type="button" onClick={() => setShowEmailField(true)} className="flex items-center gap-1.5 text-xs font-black text-blue-600 pl-1">
                                <Plus size={14}/> ইমেইল এড করুন
                            </button>
                        ) : (
                            <div className="animate-in slide-in-from-top-1">
                                <EditField label="ইমেইল এড্রেস" value={legalForm.email} onChange={v => setLegalForm({...legalForm, email: v})} placeholder="example@mail.com" icon={<Mail size={18}/>} />
                            </div>
                        )}

                        <EditField label="অফিসের ঠিকানা" value={legalForm.officeAddress || ''} onChange={v=>setLegalForm({...legalForm, officeAddress:v})} placeholder="ঠিকানা" icon={<Building2 size={18}/>} />
                        <EditField label="বাসার ঠিকানা" value={legalForm.homeAddress || ''} onChange={v=>setLegalForm({...legalForm, homeAddress:v})} placeholder="ঠিকানা" icon={<HomeIcon size={18}/>} />
                        
                        <div className="pt-1">
                            {!showAssistantFields ? (
                                <button type="button" onClick={() => setShowAssistantFields(true)} className="flex items-center gap-1.5 text-xs font-black text-blue-600 pl-1">
                                    <Plus size={14}/> সহকারীর তথ্য
                                </button>
                            ) : (
                                <div className="space-y-4 p-4 bg-slate-50 rounded-3xl border border-slate-100 animate-in slide-in-from-top-2 duration-300 relative">
                                    <button type="button" onClick={() => { setShowAssistantFields(false); setLegalForm({...legalForm, assistantName: '', assistantMobile: ''}); }} className="absolute top-2 right-2 text-slate-300 hover:text-red-500"><X size={16}/></button>
                                    <EditField label="সহকারীর নাম" value={legalForm.assistantName} onChange={v => setLegalForm({...legalForm, assistantName: v})} placeholder="নাম লিখুন" icon={<UserCheck size={18}/>} />
                                    <EditField label="মোবাইল নং" value={legalForm.assistantMobile} onChange={v => setLegalForm({...legalForm, assistantMobile: v})} placeholder="০১xxxxxxxxx" icon={<Smartphone size={18}/>} />
                                </div>
                            )}
                        </div>

                        <button 
                            onClick={handleLegalSubmit} 
                            disabled={isSubmitting} 
                            className="w-full py-5 bg-blue-700 text-white font-black rounded-3xl shadow-lg mt-4 flex items-center justify-center gap-2 active:scale-95 transition-all shadow-blue-500/20"
                        >
                            {isSubmitting ? <Loader2 className="animate-spin" /> : (editingLegalId ? 'আপডেট করুন' : 'সংরক্ষণ করুন')}
                        </button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default AdminLegalMgmt;
