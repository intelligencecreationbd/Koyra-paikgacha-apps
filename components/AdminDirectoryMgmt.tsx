
import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  Loader2,
  Camera,
  ChevronRight,
  Info,
  Settings2,
  FolderPlus,
  Home,
  ChevronDown,
  Edit2,
  Mail,
  Type,
  CheckCircle2
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

interface Category {
  id: string;
  name: string;
  parentId: string;
}

interface CustomField {
  label: string;
  value: string;
}

const AdminDirectoryMgmt: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [currentPath, setCurrentPath] = useState<Category[]>([]);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [currentContacts, setCurrentContacts] = useState<any[]>([]);
  
  const [showCatForm, setShowCatForm] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingContactId, setEditingContactId] = useState<string | null>(null);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [catName, setCatName] = useState('');
  const [contactForm, setContactForm] = useState({
    name: '', 
    designation: '', 
    mobile: '', 
    extraMobiles: [] as string[],
    email: '',
    address: '', 
    customInfo: [] as CustomField[],
    description: '', 
    photo: ''
  });

  const parentId = useMemo(() => currentPath.length > 0 ? currentPath[currentPath.length - 1].id : 'root', [currentPath]);

  useEffect(() => {
    const catRef = ref(db, 'public_directory_categories');
    const unsub = onValue(catRef, snap => {
        const val = snap.val();
        setAllCategories(val ? Object.values(val) : []);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const dataRef = ref(db, `public_directory_data/${parentId}`);
    const unsub = onValue(dataRef, snap => {
        const val = snap.val();
        setCurrentContacts(val ? Object.keys(val).map(k => ({...val[k], id: k})) : []);
    });
    return () => unsub();
  }, [parentId]);

  const subCategories = useMemo(() => 
    allCategories.filter(c => c.parentId === parentId), 
  [allCategories, parentId]);

  const handleAddCategory = async () => {
    if (!catName.trim()) return;
    setIsSubmitting(true);
    try {
        const id = editingCategoryId || `cat_${Date.now()}`;
        const currentParentId = editingCategoryId 
            ? (allCategories.find(c => c.id === editingCategoryId)?.parentId || parentId)
            : parentId;

        await set(ref(db, `public_directory_categories/${id}`), { id, name: catName, parentId: currentParentId });
        setCatName('');
        setEditingCategoryId(null);
        setShowCatForm(false);
    } catch (error) {
        alert('ক্যাটাগরি সেভ করতে সমস্যা হয়েছে!');
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.mobile) return;
    setIsSubmitting(true);
    try {
        const id = editingContactId || push(ref(db, `public_directory_data/${parentId}`)).key;
        await set(ref(db, `public_directory_data/${parentId}/${id}`), { ...contactForm, id });
        setShowContactForm(false);
        setEditingContactId(null);
        setContactForm({ name: '', designation: '', mobile: '', extraMobiles: [], email: '', address: '', customInfo: [], description: '', photo: '' });
    } catch (e) { alert('তথ্য সেভ করতে সমস্যা হয়েছে!'); }
    finally { setIsSubmitting(false); }
  };

  const handleDeleteCategory = async (id: string) => {
    if (window.confirm('এই ক্যাটাগরি এবং এর ভেতরের সকল তথ্য স্থায়ীভাবে মুছে যাবে। আপনি কি নিশ্চিত?')) {
        try {
            setIsSubmitting(true);
            await remove(ref(db, `public_directory_categories/${id}`));
            await remove(ref(db, `public_directory_data/${id}`));
        } catch (error) {
            alert('মুছে ফেলা সম্ভব হয়নি। আবার চেষ্টা করুন।');
        } finally {
            setIsSubmitting(false);
        }
    }
  };

  const handleDeleteContact = async (contactId: string) => {
    if (window.confirm('এই কন্টাক্ট নম্বরটি মুছে ফেলতে চান?')) {
        try {
            await remove(ref(db, `public_directory_data/${parentId}/${contactId}`));
        } catch (error) {
            alert('মুছে ফেলা সম্ভব হয়নি!');
        }
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setContactForm(prev => ({ ...prev, photo: reader.result as string }));
      reader.readAsDataURL(file);
    }
  };

  const handleAddExtraMobile = () => {
    setContactForm(prev => ({ ...prev, extraMobiles: [...prev.extraMobiles, ''] }));
  };

  const handleExtraMobileChange = (index: number, value: string) => {
    const newMobiles = [...contactForm.extraMobiles];
    newMobiles[index] = value;
    setContactForm(prev => ({ ...prev, extraMobiles: newMobiles }));
  };

  const handleRemoveExtraMobile = (index: number) => {
    setContactForm(prev => ({ ...prev, extraMobiles: prev.extraMobiles.filter((_, i) => i !== index) }));
  };

  const handleAddCustomInfo = () => {
    setContactForm(prev => ({ ...prev, customInfo: [...prev.customInfo, { label: '', value: '' }] }));
  };

  const handleCustomInfoChange = (index: number, field: 'label' | 'value', value: string) => {
    const newInfo = [...contactForm.customInfo];
    newInfo[index][field] = value;
    setContactForm(prev => ({ ...prev, customInfo: newInfo }));
  };

  const handleRemoveCustomInfo = (index: number) => {
    setContactForm(prev => ({ ...prev, customInfo: prev.customInfo.filter((_, i) => i !== index) }));
  };

  const resetToRoot = () => {
    setCurrentPath([]);
    setShowContactForm(false);
  };

  // If Contact Form is active, show the form in mian body
  if (showContactForm) {
    return (
      <div className="animate-in slide-in-from-right-4 duration-500 pb-20 space-y-6">
        <div className="flex items-center gap-4 mb-2">
          <button onClick={() => setShowContactForm(false)} className="p-3 bg-white border border-slate-100 rounded-xl shadow-sm active:scale-90 transition-all">
            <ChevronLeft size={20} className="text-slate-800" />
          </button>
          <div className="text-left">
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">{editingContactId ? 'কন্টাক্ট সংশোধন' : 'নতুন কন্টাক্ট'}</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">তথ্য প্রদান করুন</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[40px] border border-slate-100 shadow-xl space-y-6">
            <div className="flex flex-col items-center pt-2">
                <div className="relative group">
                    <div className="w-28 h-28 rounded-[35px] bg-slate-50 border-4 border-white shadow-lg overflow-hidden flex items-center justify-center text-slate-200">
                        {contactForm.photo ? (
                            <img src={contactForm.photo} className="w-full h-full object-cover" />
                        ) : (
                            <UserIcon size={45} strokeWidth={1.5} />
                        )}
                    </div>
                    <button 
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute bottom-0 right-0 p-3 bg-[#673AB7] text-white rounded-2xl shadow-xl border-4 border-white active:scale-90 transition-all"
                    >
                        <Camera size={18} strokeWidth={3} />
                    </button>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                </div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-4">প্রোফাইল ফটো নির্বাচন করুন</p>
            </div>

            <div className="space-y-5">
                <EditField label="নাম *" value={contactForm.name} onChange={v=>setContactForm({...contactForm, name:v})} placeholder="সম্পূর্ণ নাম লিখুন" icon={<UserIcon size={18}/>} />
                <EditField label="উপাধি/পদবী" value={contactForm.designation} onChange={v=>setContactForm({...contactForm, designation:v})} placeholder="যেমন: ইউপি মেম্বার" icon={<Tag size={18}/>} />
                
                {/* Mobile Section */}
                <div className="space-y-3">
                    <EditField label="প্রাথমিক মোবাইল নম্বর *" value={contactForm.mobile} onChange={v=>setContactForm({...contactForm, mobile:v})} placeholder="০১xxxxxxxxx" icon={<Smartphone size={18}/>} />
                    
                    {contactForm.extraMobiles.map((mob, idx) => (
                      <div key={idx} className="flex gap-2 animate-in slide-in-from-top-1 duration-200">
                        <EditField label={`অতিরিক্ত নম্বর (${idx + 1})`} value={mob} onChange={v => handleExtraMobileChange(idx, v)} placeholder="০১xxxxxxxxx" icon={<Smartphone size={18}/>} />
                        <button type="button" onClick={() => handleRemoveExtraMobile(idx)} className="mt-6 p-3 text-red-500 bg-red-50 rounded-xl active:scale-90 transition-all flex items-center justify-center h-[52px] w-[52px]">
                          <Trash2 size={20} />
                        </button>
                      </div>
                    ))}
                    
                    <button type="button" onClick={handleAddExtraMobile} className="flex items-center gap-2 text-xs font-black text-[#673AB7] pl-1 hover:opacity-70 transition-all">
                      <Plus size={16} /> + আরও মোবাইল নম্বর
                    </button>
                </div>

                <EditField label="ইমেইল এড্রেস (ঐচ্ছিক)" value={contactForm.email} onChange={v=>setContactForm({...contactForm, email:v})} placeholder="example@mail.com" icon={<Mail size={18}/>} />
                
                <EditField label="অফিস বা এলাকা (ঠিকানা)" value={contactForm.address} onChange={v=>setContactForm({...contactForm, address:v})} placeholder="ঠিকানা লিখুন" icon={<MapPin size={18}/>} />

                {/* Custom Info Section */}
                <div className="space-y-3">
                    {contactForm.customInfo.map((info, idx) => (
                      <div key={idx} className="p-5 bg-slate-50/50 rounded-3xl border border-slate-100 space-y-4 animate-in slide-in-from-bottom-2 duration-300 relative">
                        <button type="button" onClick={() => handleRemoveCustomInfo(idx)} className="absolute top-2 right-2 p-1.5 text-slate-300 hover:text-red-500"><X size={18}/></button>
                        <div className="grid grid-cols-2 gap-3">
                          <EditField label="ঘরের নাম (টাইটেল)" value={info.label} onChange={v => handleCustomInfoChange(idx, 'label', v)} placeholder="যেমন: ব্লাড গ্রুপ" icon={<Type size={16}/>} />
                          <EditField label="তথ্য" value={info.value} onChange={v => handleCustomInfoChange(idx, 'value', v)} placeholder="যেমন: O+" icon={<Info size={16}/>} />
                        </div>
                      </div>
                    ))}
                    
                    <button type="button" onClick={handleAddCustomInfo} className="flex items-center gap-2 text-xs font-black text-blue-600 pl-1 hover:opacity-70 transition-all">
                      <Plus size={16} /> + আরও তথ্য (কাস্টম ফিল্ড)
                    </button>
                </div>

                <div className="text-left">
                    <label className="text-[10px] font-bold text-slate-400 block mb-1.5 uppercase tracking-wider pl-1">অতিরিক্ত বিবরণ</label>
                    <textarea 
                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-3xl font-bold outline-none text-slate-800 h-28 text-sm leading-relaxed"
                        value={contactForm.description}
                        onChange={e => setContactForm({...contactForm, description: e.target.value})}
                        placeholder="কন্টাক্ট সম্পর্কে অতিরিক্ত কোনো তথ্য থাকলে লিখুন..."
                    />
                </div>

                <div className="flex gap-3 pt-4">
                  <button 
                      type="button"
                      onClick={() => setShowContactForm(false)}
                      className="flex-1 py-5 bg-slate-100 text-slate-500 font-black rounded-3xl active:scale-95 transition-all"
                  >
                      বাতিল করুন
                  </button>
                  <button 
                      onClick={handleContactSubmit} 
                      disabled={isSubmitting || !contactForm.name || !contactForm.mobile} 
                      className="flex-[2] py-5 bg-[#673AB7] text-white font-black rounded-3xl shadow-xl shadow-purple-500/20 flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50"
                  >
                      {isSubmitting ? <Loader2 className="animate-spin" /> : (editingContactId ? 'আপডেট করুন' : 'সংরক্ষণ করুন')}
                  </button>
                </div>
            </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-500 pb-20">
        <Header title="মোবাইল নাম্বার ম্যানেজার" onBack={onBack} />
        
        {/* Navigation Breadcrumbs */}
        <div className="bg-slate-50 p-4 rounded-[26px] flex items-center gap-2 overflow-x-auto no-scrollbar border border-slate-100 shadow-inner">
            <button onClick={resetToRoot} className={`p-2 rounded-lg transition-colors shrink-0 ${currentPath.length === 0 ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-200'}`}>
                <Home size={16}/>
            </button>
            {currentPath.map((node, idx) => (
                <React.Fragment key={node.id}>
                    <ChevronRight size={14} className="text-slate-300 shrink-0" />
                    <button 
                        onClick={() => setCurrentPath(currentPath.slice(0, idx + 1))}
                        className={`px-3 py-1.5 rounded-lg text-xs font-black whitespace-nowrap transition-colors ${idx === currentPath.length - 1 ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-slate-500 border border-slate-200'}`}
                    >
                        {node.name}
                    </button>
                </React.Fragment>
            ))}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
            <button 
                onClick={() => { setEditingCategoryId(null); setCatName(''); setShowCatForm(true); }}
                className="py-4 bg-white border border-blue-100 text-blue-600 font-black rounded-[24px] shadow-sm flex items-center justify-center gap-2 active:scale-95 transition-all text-xs"
            >
                <FolderPlus size={18}/> ক্যাটাগরি যোগ করুন
            </button>
            <button 
                onClick={() => { 
                  setEditingContactId(null); 
                  setContactForm({name:'', designation:'', mobile:'', extraMobiles: [], email: '', address:'', customInfo: [], description:'', photo:''}); 
                  setShowContactForm(true); 
                }}
                className="py-4 bg-[#673AB7] text-white font-black rounded-[24px] shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all text-xs"
            >
                <Plus size={18}/> কন্টাক্ট যোগ করুন
            </button>
        </div>

        {/* Content List */}
        <div className="space-y-4">
            {/* Sub-Categories */}
            {subCategories.length > 0 && (
                <div className="space-y-3">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">সাব-ক্যাটাগরি সমূহ</p>
                    {subCategories.map(cat => (
                        <div key={cat.id} className="flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
                            <button 
                                onClick={() => setCurrentPath([...currentPath, cat])}
                                className="flex-1 flex items-center justify-between p-5 bg-white rounded-[28px] border border-slate-100 shadow-sm active:scale-[0.98] transition-all group"
                            >
                                <div className="flex items-center gap-4 overflow-hidden">
                                    <div className="w-11 h-11 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center shadow-inner shrink-0">
                                        <Settings2 size={18} />
                                    </div>
                                    <span className="font-black text-slate-800 text-sm truncate">{cat.name}</span>
                                </div>
                                <ChevronRight size={18} className="text-slate-300 group-hover:text-blue-500 transition-colors shrink-0" />
                            </button>
                            
                            <div className="flex gap-2 shrink-0">
                                <button 
                                    onClick={() => { setEditingCategoryId(cat.id); setCatName(cat.name); setShowCatForm(true); }} 
                                    className="p-4 bg-blue-50 text-blue-600 rounded-[22px] active:scale-90 transition-all opacity-40 hover:opacity-100"
                                >
                                    <Edit2 size={18}/>
                                </button>
                                <button 
                                    onClick={() => handleDeleteCategory(cat.id)} 
                                    className="p-4 bg-red-50 text-red-500 rounded-[22px] active:scale-90 transition-all opacity-40 hover:opacity-100"
                                >
                                    <Trash2 size={18}/>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Contacts List */}
            <div className="space-y-3 pt-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">কন্টাক্ট লিস্ট ({currentContacts.length})</p>
                {currentContacts.length === 0 && subCategories.length === 0 ? (
                    <div className="py-20 text-center opacity-30 flex flex-col items-center gap-3">
                        <Info size={40} className="text-slate-400" />
                        <p className="font-bold">এই ফোল্ডারে কোনো তথ্য নেই</p>
                    </div>
                ) : (
                    currentContacts.map(item => (
                        <div key={item.id} className="bg-white p-5 rounded-[32px] border border-slate-100 flex items-center justify-between shadow-sm group animate-in fade-in">
                            <div className="flex items-center gap-4 text-left overflow-hidden">
                                <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 overflow-hidden flex items-center justify-center text-slate-300 shrink-0">
                                    {item.photo ? <img src={item.photo} className="w-full h-full object-cover" /> : <UserIcon size={20} />}
                                </div>
                                <div className="overflow-hidden">
                                    <h4 className="font-black text-slate-800 truncate text-sm">{item.name}</h4>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">{item.designation || 'নির্ধারিত নয়'}</p>
                                </div>
                            </div>
                            <div className="flex gap-2 shrink-0">
                                <button onClick={() => { 
                                  setEditingContactId(item.id); 
                                  setContactForm({
                                    ...item,
                                    extraMobiles: item.extraMobiles || [],
                                    customInfo: item.customInfo || [],
                                    email: item.email || ''
                                  }); 
                                  setShowContactForm(true); 
                                }} className="p-3 bg-blue-50 text-blue-600 rounded-xl active:scale-90 transition-all">
                                    <Edit2 size={18}/>
                                </button>
                                <button onClick={() => handleDeleteContact(item.id)} className="p-3 bg-red-50 text-red-500 rounded-xl active:scale-90 transition-all opacity-40 group-hover:opacity-100">
                                    <Trash2 size={18}/>
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>

        {/* Category Modal (Still modal because it's simpler and not asked to be inline) */}
        {showCatForm && (
            <div className="fixed inset-0 z-[150] bg-slate-900/60 backdrop-blur-md p-5 flex items-center justify-center">
                <div className="bg-white w-full max-w-sm rounded-[45px] p-8 shadow-2xl space-y-6 animate-in zoom-in duration-300">
                    <div className="flex justify-between items-center">
                        <h3 className="font-black text-xl text-slate-800">{editingCategoryId ? 'ক্যাটাগরি সংশোধন' : 'নতুন সাব-ক্যাটাগরি'}</h3>
                        <button onClick={()=>setShowCatForm(false)} className="p-2 text-slate-400 hover:text-red-500"><X/></button>
                    </div>
                    {!editingCategoryId && (
                        <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 mb-2 text-left">
                            <p className="text-[10px] font-black text-blue-500 uppercase">প্যারেন্ট ক্যাটাগরি:</p>
                            <p className="text-sm font-black text-slate-700">{currentPath.length > 0 ? currentPath[currentPath.length-1].name : 'মূল ক্যাটাগরি'}</p>
                        </div>
                    )}
                    <EditField label="ক্যাটাগরি নাম" value={catName} onChange={setCatName} placeholder="যেমন: রাজনৈতিক ব্যক্তি বা ইউনিয়ন" icon={<FolderPlus size={18}/>} />
                    <button 
                        onClick={handleAddCategory} 
                        disabled={isSubmitting || !catName.trim()} 
                        className="w-full py-5 bg-blue-600 text-white font-black rounded-3xl shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all"
                    >
                        {isSubmitting ? <Loader2 className="animate-spin" /> : (editingCategoryId ? 'আপডেট করুন' : 'ক্যাটাগরি তৈরি করুন')}
                    </button>
                </div>
            </div>
        )}
    </div>
  );
};

export default AdminDirectoryMgmt;
