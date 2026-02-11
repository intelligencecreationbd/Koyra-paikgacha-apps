
import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronLeft, 
  Trash2, 
  Plus, 
  X, 
  Search, 
  Newspaper, 
  Calendar, 
  User as UserIcon, 
  Tag, 
  Loader2,
  Camera,
  ChevronDown,
  ChevronUp,
  Info,
  Edit,
  LayoutGrid,
  Settings,
  Inbox,
  Edit2,
  Check,
  Zap,
  Send,
  Link as LinkIcon,
  Clock,
  ShieldCheck,
  UserCheck,
  XCircle
} from 'lucide-react';

// Firebase Imports
import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, onValue, remove, set, push, update } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

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

const toBn = (num: string | number) => 
  (num || '').toString().replace(/\d/g, d => "০১২৩৪৫৬৭৮৯"[parseInt(d)]);

const Header = ({ title, onBack }: { title: string; onBack: () => void }) => (
  <div className="flex items-center gap-4 mb-6">
    <button onClick={onBack} className="p-3 bg-white rounded-xl shadow-sm border border-slate-100 active:scale-90 transition-all text-left">
      <ChevronLeft size={20} className="text-slate-800" />
    </button>
    <h2 className="text-2xl font-black text-slate-800 tracking-tight">{title}</h2>
  </div>
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
          className={`w-full ${icon ? 'pl-11' : 'px-5'} py-3.5 ${readOnly ? 'bg-slate-100 opacity-70' : 'bg-slate-50'} border border-slate-100 rounded-2xl font-bold outline-none text-slate-800 transition-all focus:border-blue-400 shadow-sm`} 
          value={value} 
          onChange={e => onChange(e.target.value)} 
        />
    </div>
  </div>
);

export default function AdminNewsMgmt({ onBack }: { onBack: () => void }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [view, setView] = useState<'main' | 'breaking' | 'incoming'>('main');
  
  // Tab System State
  const [activeNewsTab, setActiveNewsTab] = useState<'admin' | 'approved' | 'rejected'>('admin');
  
  const [newsList, setNewsList] = useState<any[]>([]);
  const [pendingNewsList, setPendingNewsList] = useState<any[]>([]);
  const [rejectedNewsList, setRejectedNewsList] = useState<any[]>([]);
  const [breakingNewsList, setBreakingNewsList] = useState<any[]>([]);
  
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [breakingText, setBreakingText] = useState('');
  const [editingBreakingId, setEditingBreakingId] = useState<string | null>(null);

  const [categories, setCategories] = useState<{id: string, name: string}[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editCategoryName, setEditCategoryName] = useState('');
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);

  // States for verification & editing pending news
  const [selectedPendingNews, setSelectedPendingNews] = useState<any | null>(null);
  const [pendingEditForm, setPendingEditForm] = useState<any>({
    title: '', description: '', reporter: '', category: '', source: '', date: ''
  });

  const getCurrentDateTime = () => {
    const now = new Date();
    return now.toLocaleString('bn-BD', {
        year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: true
    });
  };

  const [form, setForm] = useState({
    title: '', description: '', date: getCurrentDateTime(), reporter: '', photo: '', category: '', source: ''
  });

  useEffect(() => {
    const catRef = ref(db, 'news_categories');
    onValue(catRef, snap => {
      const val = snap.val();
      const list = val ? Object.keys(val).map(k => ({ id: k, name: val[k].name })) : [];
      setCategories(list);
      if (list.length > 0 && !form.category) {
        setForm(prev => ({ ...prev, category: list[0].id }));
      }
    });

    const newsRef = ref(db, 'local_news/main');
    onValue(newsRef, snap => {
        const val = snap.val();
        setNewsList(val ? Object.keys(val).map(k => ({...val[k], id: k})) : []);
    });

    const pendingRef = ref(db, 'local_news/pending');
    onValue(pendingRef, snap => {
        const val = snap.val();
        setPendingNewsList(val ? Object.keys(val).map(k => ({...val[k], id: k})) : []);
    });

    const rejectedRef = ref(db, 'local_news/rejected');
    onValue(rejectedRef, snap => {
        const val = snap.val();
        setRejectedNewsList(val ? Object.keys(val).map(k => ({...val[k], id: k})) : []);
    });

    const breakingRef = ref(db, 'breaking_news');
    onValue(breakingRef, snap => {
        const val = snap.val();
        if (val) {
          const list = Object.keys(val).map(k => ({ ...val[k], id: k }));
          setBreakingNewsList(list.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0)));
        } else {
          setBreakingNewsList([]);
        }
    });
  }, []);

  // When a pending news is selected, initialize the edit form
  useEffect(() => {
    if (selectedPendingNews) {
        setPendingEditForm({
            title: selectedPendingNews.title || '',
            description: selectedPendingNews.description || '',
            reporter: selectedPendingNews.reporter || '',
            category: selectedPendingNews.category || (categories[0]?.id || ''),
            source: selectedPendingNews.source || '',
            date: selectedPendingNews.date || getCurrentDateTime()
        });
    }
  }, [selectedPendingNews, categories]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setForm(prev => ({ ...prev, photo: reader.result as string }));
      reader.readAsDataURL(file);
    }
  };

  const handleBreakingSubmit = async () => {
    if (!breakingText.trim()) return;
    setIsSubmitting(true);
    try {
        const id = editingBreakingId || push(ref(db, 'breaking_news')).key;
        await set(ref(db, `breaking_news/${id}`), {
            id,
            text: breakingText,
            timestamp: Date.now()
        });
        setBreakingText('');
        setEditingBreakingId(null);
    } catch (e) { 
        alert('সংরক্ষণ ব্যর্থ হয়েছে!'); 
    }
    finally { setIsSubmitting(false); }
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;
    const id = `cat_${Date.now()}`;
    await set(ref(db, `news_categories/${id}`), { id, name: newCategoryName });
    setNewCategoryName('');
  };

  const handleUpdateCategoryName = async (id: string) => {
    if (!editCategoryName.trim()) return;
    await update(ref(db, `news_categories/${id}`), { name: editCategoryName });
    setEditingCategoryId(null);
    setEditCategoryName('');
  };

  const handleDeleteCategory = async (id: string) => {
    if (confirm('এই ক্যাটাগরি কি ডিলিট করতে চান?')) {
      await remove(ref(db, `news_categories/${id}`));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.description) {
        alert('শিরোনাম ও বিবরণ অবশ্যই পূরণ করুন');
        return;
    }
    setIsSubmitting(true);
    try {
        const id = editingId || push(ref(db, 'local_news/main')).key;
        await set(ref(db, `local_news/main/${id}`), { ...form, id, status: 'published', timestamp: Date.now(), isAdminPost: true });
        setShowForm(false);
        setEditingId(null);
        setForm({ title: '', description: '', date: getCurrentDateTime(), reporter: '', photo: '', category: categories[0]?.id || '', source: '' });
    } catch (e) { alert('সংরক্ষণ ব্যর্থ হয়েছে!'); }
    finally { setIsSubmitting(false); }
  };

  // Approval logic now uses pendingEditForm data
  const handleApproveNews = async () => {
    if (!selectedPendingNews?.id || isSubmitting) return;
    setIsSubmitting(true);
    try {
        const id = selectedPendingNews.id;
        const finalData = { 
            ...selectedPendingNews, 
            ...pendingEditForm, // Integrate edits
            status: 'published', 
            timestamp: selectedPendingNews.timestamp || Date.now() 
        };
        await set(ref(db, `local_news/main/${id}`), finalData);
        await remove(ref(db, `local_news/pending/${id}`));
        setSelectedPendingNews(null);
        alert('সংবাদটি সফলভাবে প্রকাশিত হয়েছে!');
        setActiveNewsTab('approved');
    } catch (err) {
        alert('অপারেশনটি সম্পন্ন করা যায়নি।');
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleRejectNews = async () => {
    if (!selectedPendingNews?.id || isSubmitting) return;
    setIsSubmitting(true);
    try {
        const id = selectedPendingNews.id;
        const finalData = { 
            ...selectedPendingNews, 
            ...pendingEditForm, // Integrate edits even if rejecting
            status: 'rejected', 
            timestamp: selectedPendingNews.timestamp || Date.now() 
        };
        await set(ref(db, `local_news/rejected/${id}`), finalData);
        await remove(ref(db, `local_news/pending/${id}`));
        setSelectedPendingNews(null);
        alert('সংবাদটি রিজেক্ট করা হয়েছে।');
        setActiveNewsTab('rejected');
    } catch (err) {
        alert('অপারেশনটি সম্পন্ন করা যায়নি।');
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleDeleteNewsDirectly = async (id: string, tab: 'admin' | 'approved' | 'rejected') => {
    if (!id || isSubmitting) return;
    
    setIsSubmitting(true);
    try {
        const node = tab === 'rejected' ? 'rejected' : 'main';
        const newsPath = `local_news/${node}/${id}`;
        await remove(ref(db, newsPath));
    } catch (err) {
        console.error("News removal failed:", err);
        alert('ত্রুটির কারণে ডিলিট করা যায়নি।');
    } finally {
        setIsSubmitting(false);
    }
  };

  const getDisplayedNews = () => {
    if (activeNewsTab === 'admin') {
        return newsList.filter(n => n.isAdminPost === true || !n.userId);
    } else if (activeNewsTab === 'approved') {
        return newsList.filter(n => n.userId && !n.isAdminPost);
    } else {
        return rejectedNewsList;
    }
  };

  const displayedNews = getDisplayedNews();

  if (view === 'breaking') {
    return (
        <div className="space-y-6 animate-in slide-in-from-right-4 duration-500 pb-20">
            <Header title="ব্রেকিং নিউজ ম্যানেজার" onBack={() => setView('main')} />
            <div className="bg-red-600 text-white py-3 px-6 rounded-2xl flex items-center gap-3 shadow-lg">
                <Zap size={20} fill="currentColor" className="animate-pulse" />
                <h4 className="font-black text-sm uppercase tracking-widest">ব্রেকিং নিউজ সেটআপ</h4>
            </div>
            <div className="bg-white p-6 rounded-[35px] border border-slate-100 shadow-sm space-y-4">
                <textarea 
                    className="w-full p-5 bg-slate-50 border border-slate-100 rounded-[28px] font-bold text-slate-800 outline-none focus:border-red-400 transition-all text-sm h-32"
                    placeholder="ব্রেকিং সংবাদের হেডলাইন এখানে লিখুন..."
                    value={breakingText}
                    onChange={e => setBreakingText(e.target.value)}
                />
                <button 
                    onClick={handleBreakingSubmit}
                    disabled={isSubmitting || !breakingText.trim()}
                    className="w-full py-4 bg-red-600 text-white rounded-2xl font-black shadow-lg shadow-red-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                    {isSubmitting ? <Loader2 className="animate-spin" /> : <><Send size={18}/> {editingBreakingId ? 'নিউজ আপডেট করুন' : 'নিউজ পাবলিশ করুন'}</>}
                </button>
            </div>
            <div className="space-y-3">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">প্রকাশিত নিউজ তালিকা ({toBn(breakingNewsList.length)})</p>
                {breakingNewsList.map((bn, idx) => (
                    <div key={bn.id} className="bg-white p-4 rounded-[28px] border border-slate-50 shadow-sm flex items-center gap-4 animate-in slide-in-from-bottom-2 relative">
                        <div className="w-10 h-10 bg-red-50 text-red-600 rounded-full flex items-center justify-center font-black text-sm shrink-0">
                            {toBn(idx + 1)}
                        </div>
                        <p className="flex-1 text-sm font-bold text-slate-700 leading-snug pr-2">{bn.text}</p>
                        <div className="flex items-center gap-2 shrink-0">
                            <button onClick={() => { setEditingBreakingId(bn.id); setBreakingText(bn.text); }} className="p-3 text-blue-500 bg-blue-50 rounded-xl active:scale-90 transition-all"><Edit2 size={18}/></button>
                            <button onClick={() => { if(confirm('ডিলিট করতে চান?')) remove(ref(db, `breaking_news/${bn.id}`)); }} className="p-3 text-red-600 bg-red-50 rounded-xl active:scale-90 transition-all"><Trash2 size={20}/></button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
  }

  if (view === 'incoming') {
    return (
        <div className="space-y-6 animate-in slide-in-from-right-4 duration-500 pb-20 text-left">
            <Header title="আগত সংবাদ তালিকা" onBack={() => setView('main')} />
            <div className="bg-blue-600 text-white py-3 px-6 rounded-2xl flex items-center gap-3 shadow-lg mb-4">
                <Inbox size={20} />
                <h4 className="font-black text-sm uppercase tracking-widest">ইউজার সাবমিশন ({toBn(pendingNewsList.length)})</h4>
            </div>

            <div className="space-y-3">
                {pendingNewsList.length === 0 ? (
                    <div className="py-20 text-center opacity-20">
                        <Inbox size={48} className="mx-auto mb-2" />
                        <p className="font-bold">কোনো আগত সংবাদ নেই</p>
                    </div>
                ) : (
                    pendingNewsList.map((p, idx) => (
                        <button 
                            key={p.id}
                            onClick={() => setSelectedPendingNews(p)}
                            className="w-full bg-white p-5 rounded-[28px] border border-slate-100 shadow-sm flex items-center justify-between group active:scale-[0.98] transition-all"
                        >
                            <div className="flex items-center gap-4 overflow-hidden">
                                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center font-black text-xs shrink-0">{toBn(idx + 1)}</div>
                                <h4 className="font-bold text-slate-800 truncate pr-4">{p.title}</h4>
                            </div>
                            <ChevronDown size={18} className="text-slate-300 group-hover:text-blue-500" />
                        </button>
                    ))
                )}
            </div>

            {selectedPendingNews && (
                <div className="fixed inset-0 z-[160] bg-slate-900/70 backdrop-blur-md p-5 flex items-center justify-center overflow-hidden">
                    <div className="bg-white w-full max-w-md rounded-[45px] p-8 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto animate-in zoom-in duration-300">
                        <div className="flex justify-between items-center border-b pb-4">
                            <h3 className="font-black text-xl text-slate-800">সংবাদ যাচাই ও এডিট</h3>
                            <button onClick={()=>setSelectedPendingNews(null)} className="p-2 text-slate-400 hover:text-red-500 transition-colors"><X/></button>
                        </div>
                        
                        {selectedPendingNews.photo && (
                            <div className="w-full rounded-[30px] overflow-hidden border border-slate-100 shadow-sm">
                                <img src={selectedPendingNews.photo} className="w-full h-auto object-cover max-h-56" alt="News" />
                            </div>
                        )}

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1 text-left">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">ক্যাটাগরি</label>
                                    <select 
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-slate-800 outline-none focus:border-blue-400 text-xs"
                                        value={pendingEditForm.category}
                                        onChange={e => setPendingEditForm({...pendingEditForm, category: e.target.value})}
                                    >
                                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-1 text-left">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">তারিখ</label>
                                    <input 
                                        className="w-full px-4 py-3 bg-slate-100 border border-slate-100 rounded-xl font-bold text-slate-500 outline-none text-xs"
                                        value={pendingEditForm.date}
                                        readOnly
                                    />
                                </div>
                            </div>
                            
                            <EditField 
                                label="রিপোর্টার নাম" 
                                value={pendingEditForm.reporter} 
                                onChange={(v:string) => setPendingEditForm({...pendingEditForm, reporter: v})} 
                                icon={<UserIcon size={16}/>}
                            />
                            
                            <EditField 
                                label="সংবাদের শিরোনাম" 
                                value={pendingEditForm.title} 
                                onChange={(v:string) => setPendingEditForm({...pendingEditForm, title: v})} 
                                icon={<Newspaper size={16}/>}
                            />

                            <div className="text-left">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 block mb-1">বিস্তারিত বিবরণ</label>
                                <textarea 
                                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-medium text-slate-700 leading-relaxed text-sm h-40 outline-none focus:border-blue-400 transition-all"
                                    value={pendingEditForm.description}
                                    onChange={e => setPendingEditForm({...pendingEditForm, description: e.target.value})}
                                />
                            </div>

                            <EditField 
                                label="সংবাদের উৎস (ঐচ্ছিক)" 
                                value={pendingEditForm.source} 
                                onChange={(v:string) => setPendingEditForm({...pendingEditForm, source: v})} 
                                icon={<LinkIcon size={16}/>}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-4 border-t sticky bottom-0 bg-white">
                            <button 
                                type="button"
                                onClick={handleRejectNews}
                                disabled={isSubmitting}
                                className="py-4 bg-red-50 text-red-600 rounded-2xl font-black flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50"
                            >
                                {isSubmitting ? <Loader2 className="animate-spin" size={20}/> : <><X size={20} /> রিজেক্ট</>}
                            </button>
                            <button 
                                type="button"
                                onClick={handleApproveNews}
                                disabled={isSubmitting}
                                className="py-4 bg-green-600 text-white rounded-2xl font-black flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg shadow-green-500/20 disabled:opacity-50"
                            >
                                {isSubmitting ? <Loader2 className="animate-spin" size={20}/> : <><Check size={20} /> এপ্রুভ করুন</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
  }

  return (
    <div className="space-y-5 animate-in slide-in-from-right-4 duration-500 pb-20">
        <Header title="সংবাদ ম্যানেজার" onBack={onBack} />
        <div className="space-y-2">
            <button onClick={() => setView('incoming')} className="w-full py-3.5 bg-blue-50 text-[#0056b3] border border-blue-100 rounded-[22px] font-black shadow-sm flex items-center justify-center gap-3 active:scale-95 transition-all">
                <Inbox size={18} strokeWidth={2.5} /> আগত সংবাদ
                <div className="px-2 py-0.5 bg-red-500 text-white text-[9px] rounded-full">{toBn(pendingNewsList.length)}</div>
            </button>
            <button onClick={() => setView('breaking')} className="w-full py-3.5 bg-red-50 text-red-600 border border-red-100 rounded-[22px] font-black shadow-sm flex items-center justify-center gap-3 active:scale-95 transition-all">
                <Zap size={18} strokeWidth={2.5} fill="currentColor" className="animate-pulse" /> ব্রেকিং নিউজ সেটআপ
                <div className="px-2 py-0.5 bg-slate-200 text-slate-600 text-[9px] rounded-full">{toBn(breakingNewsList.length)}</div>
            </button>
        </div>
        <div className="bg-white border border-slate-100 rounded-[30px] overflow-hidden shadow-sm">
            <button onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)} className="w-full flex items-center justify-between p-5 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                   <div className="p-2 bg-blue-100 text-blue-600 rounded-xl"><LayoutGrid size={18} /></div>
                   <h4 className="font-black text-slate-800 text-sm">সংবাদ ক্যাটাগরি সমূহ</h4>
                </div>
                {isCategoryDropdownOpen ? <ChevronUp className="text-slate-400" size={18}/> : <ChevronDown className="text-slate-400" size={18}/>}
            </button>
            {isCategoryDropdownOpen && (
              <div className="p-5 space-y-4 animate-in slide-in-from-top-2 duration-300">
                <div className="space-y-2.5">
                    {categories.map(c => (
                        <div key={c.id} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                            <span className="text-sm font-black text-slate-700">{c.name}</span>
                            <div className="flex gap-3">
                                <button onClick={() => { setEditingCategoryId(c.id); setEditCategoryName(c.name); }} className="text-blue-500 p-1"><Edit2 size={16}/></button>
                                <button onClick={() => handleDeleteCategory(c.id)} className="text-red-500 p-1"><Trash2 size={16}/></button>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="flex gap-2 pt-2 border-t border-slate-50 mt-4">
                    <input className="flex-1 px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none text-sm focus:border-blue-400" placeholder="নতুন ক্যাটাগরি..." value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} />
                    <button onClick={handleAddCategory} className="p-4 bg-[#4CAF50] text-white rounded-2xl shadow-lg active:scale-90 border-b-4 border-green-700"><Plus size={24} strokeWidth={3}/></button>
                </div>
              </div>
            )}
        </div>
        <button onClick={() => { setEditingId(null); setForm({title: '', description: '', date: getCurrentDateTime(), reporter: '', photo: '', category: categories[0]?.id || '', source: ''}); setShowForm(true); }} className="w-full py-5 bg-[#4CAF50] text-white font-black rounded-[30px] shadow-xl flex items-center justify-center gap-3 active:scale-95 border-b-4 border-green-700">
            <Plus /> নতুন সংবাদ যোগ করুন
        </button>

        {/* Tab Selection Menu */}
        <div className="bg-slate-100 p-1.5 rounded-2xl border border-slate-200 flex items-center shadow-inner overflow-x-auto no-scrollbar">
            <button 
                type="button"
                onClick={() => setActiveNewsTab('admin')}
                className={`flex-1 min-w-[100px] flex items-center justify-center gap-2 py-3 px-3 rounded-xl font-black text-[11px] uppercase tracking-tighter transition-all active:scale-95 ${activeNewsTab === 'admin' ? 'bg-[#0056b3] text-white shadow-md' : 'text-slate-400 hover:bg-slate-200'}`}
            >
                <ShieldCheck size={14} /> এডমিন নিউজ
            </button>
            <button 
                type="button"
                onClick={() => setActiveNewsTab('approved')}
                className={`flex-1 min-w-[100px] flex items-center justify-center gap-2 py-3 px-3 rounded-xl font-black text-[11px] uppercase tracking-tighter transition-all active:scale-95 ${activeNewsTab === 'approved' ? 'bg-[#4CAF50] text-white shadow-md' : 'text-slate-400 hover:bg-slate-200'}`}
            >
                <UserCheck size={14} /> রিপোর্টার এপ্রুভ
            </button>
            <button 
                type="button"
                onClick={() => setActiveNewsTab('rejected')}
                className={`flex-1 min-w-[100px] flex items-center justify-center gap-2 py-3 px-3 rounded-xl font-black text-[11px] uppercase tracking-tighter transition-all active:scale-95 ${activeNewsTab === 'rejected' ? 'bg-red-600 text-white shadow-md' : 'text-slate-400'}`}
            >
                <XCircle size={14} /> রিপোর্টার রিজেক্ট
            </button>
        </div>

        <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    {activeNewsTab === 'admin' ? 'এডমিন প্রকাশিত সংবাদ' : activeNewsTab === 'approved' ? 'রিপোর্টার এপ্রুভড সংবাদ' : 'রিজেক্টেড সংবাদ'} ({toBn(displayedNews.length)})
                </p>
            </div>
            {displayedNews.length === 0 ? (
                <div className="py-20 text-center opacity-30 flex flex-col items-center gap-3">
                   <Newspaper size={40} className="text-slate-300" />
                   <p className="font-bold text-sm">কোনো সংবাদ পাওয়া যায়নি।</p>
                </div>
            ) : (
                displayedNews.map(news => (
                    <div key={news.id} className="bg-white p-4 rounded-[35px] border border-slate-100 flex items-center gap-4 shadow-sm group animate-in fade-in duration-300">
                        <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 overflow-hidden shrink-0 flex items-center justify-center text-slate-300">
                            {news.photo ? <img src={news.photo} className="w-full h-full object-cover" alt="Thumb" /> : <Newspaper size={24} />}
                        </div>
                        <div className="flex-1 overflow-hidden text-left space-y-1">
                            <h4 className="font-black text-slate-800 line-clamp-2 text-sm leading-tight">{news.title}</h4>
                            <div className="flex flex-wrap items-center gap-2 text-[9px] font-bold text-slate-400">
                                <span className="text-blue-600 font-black uppercase truncate max-w-[100px]">{news.reporter || 'ডেস্ক'}</span>
                                <span className="shrink-0">• {news.date}</span>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            {activeNewsTab !== 'rejected' && (
                                <button type="button" onClick={(e) => { e.stopPropagation(); setEditingId(news.id); setForm(news); setShowForm(true); }} className="p-3 bg-blue-50 text-blue-600 rounded-2xl active:scale-90 transition-all">
                                    <Edit2 size={16}/>
                                </button>
                            )}
                            <button 
                                type="button" 
                                onClick={(e) => { 
                                    e.stopPropagation(); 
                                    handleDeleteNewsDirectly(news.id, activeNewsTab); 
                                }} 
                                className="p-3 bg-red-50 text-red-500 rounded-2xl active:scale-90 transition-all hover:bg-red-100"
                            >
                                <Trash2 size={18}/>
                            </button>
                        </div>
                    </div>
                ))
            )}
        </div>

        {showForm && (
            <div className="fixed inset-0 z-[150] bg-slate-900/60 backdrop-blur-md p-5 flex items-center justify-center">
                <div className="bg-white w-full max-w-sm rounded-[45px] p-8 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto animate-in zoom-in duration-300">
                    <div className="flex justify-between items-center">
                        <h3 className="font-black text-xl text-slate-800">{editingId ? 'সংশোধন' : 'নতুন সংবাদ'}</h3>
                        <button onClick={()=>setShowForm(false)} className="p-2 text-slate-400 hover:text-red-500"><X/></button>
                    </div>
                    <div className="flex flex-col items-center">
                        <div className="relative w-full h-44">
                            <div className="w-full h-full rounded-[30px] bg-slate-50 border-2 border-dashed border-slate-200 overflow-hidden flex flex-col items-center justify-center text-slate-300 gap-2">
                                {form.photo ? <img src={form.photo} className="w-full h-full object-cover" alt="Upload" /> : <Camera size={40} />}
                            </div>
                            <button type="button" onClick={() => fileInputRef.current?.click()} className="absolute bottom-3 right-3 p-3 bg-[#4CAF50] text-white rounded-2xl shadow-xl border-4 border-white active:scale-90"><Plus size={18}/></button>
                            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                        </div>
                    </div>
                    <div className="space-y-4 pt-2">
                        <div className="text-left">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-2 block">ক্যাটাগরি নির্বাচন</label>
                            <div className="relative">
                                <select className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl appearance-none font-black text-slate-800 outline-none" value={form.category} onChange={(e) => setForm({...form, category: e.target.value})}>
                                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
                            </div>
                        </div>
                        <EditField label="শিরোনাম *" value={form.title} onChange={(v:any)=>setForm({...form, title:v})} placeholder="টাইটেল লিখুন" icon={<Newspaper size={18}/>} />
                        <EditField label="রিপোর্টার *" value={form.reporter} onChange={(v:any)=>setForm({...form, reporter:v})} placeholder="নাম লিখুন" icon={<UserIcon size={18}/>} />
                        <EditField label="তারিখ ও সময়" value={form.date} onChange={(v:any)=>setForm({...form, date:v})} placeholder="অটো ফিলাপ" icon={<Calendar size={18}/>} />
                        <div className="text-left">
                            <label className="text-[10px] font-bold text-slate-400 block mb-1.5 uppercase tracking-wider pl-1">বিস্তারিত</label>
                            <textarea className="w-full p-5 bg-slate-50 border border-slate-100 rounded-[30px] font-bold outline-none text-slate-800 h-44 text-sm" value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="বিস্তারিত লিখুন..." />
                        </div>
                        <EditField label="সংবাদের উৎস (ঐচ্ছিক)" value={form.source} onChange={(v:any)=>setForm({...form, source:v})} placeholder="উদাঃ বিডিনিউজ২৪ বা ফেসবুক" icon={<LinkIcon size={18}/>} />
                        <button onClick={handleSubmit} disabled={isSubmitting} className="w-full py-5 bg-[#4CAF50] text-white font-black rounded-[30px] shadow-lg mt-4 flex items-center justify-center gap-2 active:scale-95 border-b-4 border-green-700 disabled:opacity-50">
                            {isSubmitting ? <Loader2 className="animate-spin" /> : (editingId ? 'আপডেট করুন' : 'পাবলিশ করুন')}
                        </button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
}
