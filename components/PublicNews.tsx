
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  User, 
  Share2, 
  Clock, 
  Newspaper,
  ArrowRight,
  Bookmark,
  TrendingUp,
  Layout,
  MessageCircle,
  Plus,
  Minus,
  BookmarkPlus,
  BookmarkCheck,
  Zap,
  Menu as MenuIcon,
  X,
  ChevronLeft,
  Send,
  Camera,
  ChevronDown,
  Loader2,
  CheckCircle2,
  Link as LinkIcon,
  ThumbsUp,
  ThumbsDown,
  Heart,
  Angry,
  MessageSquare
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

// Firebase Imports
import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, onValue, set, push, update, increment, get } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

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

export default function PublicNews({ onBack }: { onBack: () => void }) {
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pressTimerRef = useRef<any>(null);

  const [newsList, setNewsList] = useState<any[]>([]);
  const [breakingNews, setBreakingNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedNews, setSelectedNews] = useState<any | null>(null);
  const [fontSize, setFontSize] = useState(18); 
  const [savedNewsIds, setSavedNewsIds] = useState<string[]>([]);
  const [categories, setCategories] = useState<{id: string, name: string}[]>([]);

  // Interaction States
  const [interactions, setInteractions] = useState<any>({});
  const [comments, setComments] = useState<any[]>([]);
  const [commentInput, setCommentInput] = useState('');
  const [showReactMenu, setShowReactMenu] = useState(false);
  const [userVote, setUserVote] = useState<string | null>(null);

  // Submission States
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

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

  // Sync logic for URL parameters (Direct Form Opening after Login)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const action = params.get('action');
    const savedUser = localStorage.getItem('kp_logged_in_user');
    
    if (action === 'submit' && savedUser) {
        const u = JSON.parse(savedUser);
        setCurrentUser(u);
        setForm(prev => ({ 
            ...prev, 
            reporter: `${u.fullName} - ${u.village}`,
            date: getCurrentDateTime() 
        }));
        setShowSubmitForm(true);
        // Clear the URL parameter so it doesn't reopen on refresh
        navigate(location.pathname, { replace: true });
    }
  }, [location, navigate]);

  useEffect(() => {
    const syncUser = () => {
        const savedUser = localStorage.getItem('kp_logged_in_user');
        if (savedUser) {
            const u = JSON.parse(savedUser);
            setCurrentUser(u);
            setForm(prev => ({ ...prev, reporter: `${u.fullName} - ${u.village}` }));
        } else {
            setCurrentUser(null);
        }
    };
    
    syncUser();

    // Fetch News Categories
    const catRef = ref(db, 'news_categories');
    onValue(catRef, snap => {
      const val = snap.val();
      const dynamic = val ? Object.keys(val).map(k => ({ id: k, name: val[k].name })) : [];
      setCategories(dynamic);
      if (dynamic.length > 0) setForm(prev => ({...prev, category: dynamic[0].id}));
    });

    setLoading(true);
    const newsRef = ref(db, 'local_news/main');
    onValue(newsRef, snap => {
      const val = snap.val();
      const list = val ? Object.keys(val).map(key => ({ ...val[key], id: key })) : [];
      setNewsList(list.sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime()));
      setLoading(false);
    });

    const breakingRef = ref(db, 'breaking_news');
    onValue(breakingRef, snap => {
        const val = snap.val();
        const list = val ? Object.keys(val).map(k => ({...val[k], id: k})).sort((a, b) => b.timestamp - a.timestamp) : [];
        setBreakingNews(list);
    });

    const saved = localStorage.getItem('kp_saved_news');
    if (saved) setSavedNewsIds(JSON.parse(saved));
  }, []);

  // Fetch interactions when a news is selected
  useEffect(() => {
    if (selectedNews) {
        const interRef = ref(db, `news_interactions/${selectedNews.id}`);
        const unsubscribeInter = onValue(interRef, snap => {
            setInteractions(snap.val() || { likes: 0, dislikes: 0, loves: 0, angrys: 0 });
        });

        const commRef = ref(db, `news_interactions/${selectedNews.id}/comments`);
        const unsubscribeComm = onValue(commRef, snap => {
            const val = snap.val();
            setComments(val ? Object.values(val).sort((a:any, b:any) => b.timestamp - a.timestamp) : []);
        });

        const myVotes = JSON.parse(localStorage.getItem('kp_news_votes') || '{}');
        setUserVote(myVotes[selectedNews.id] || null);

        return () => {
            unsubscribeInter();
            unsubscribeComm();
        };
    }
  }, [selectedNews]);

  const handleInteraction = async (type: 'likes' | 'dislikes' | 'loves' | 'angrys') => {
    if (!selectedNews) return;
    
    const myVotes = JSON.parse(localStorage.getItem('kp_news_votes') || '{}');
    const prevVote = myVotes[selectedNews.id];

    if (prevVote === type) return;

    const updates: any = {};
    if (prevVote) {
        updates[`${prevVote}s`] = increment(-1);
    }
    updates[type] = increment(1);

    try {
        await update(ref(db, `news_interactions/${selectedNews.id}`), updates);
        myVotes[selectedNews.id] = type.replace('s', '');
        localStorage.setItem('kp_news_votes', JSON.stringify(myVotes));
        setUserVote(myVotes[selectedNews.id]);
        setShowReactMenu(false);
    } catch (e) {
        console.error("Interaction failed", e);
    }
  };

  const handleCommentSubmit = async () => {
    if (!commentInput.trim() || !selectedNews) return;

    const newComment = {
        userName: currentUser ? currentUser.fullName : 'অজ্ঞাতনামা',
        text: commentInput,
        timestamp: Date.now(),
        userPhoto: currentUser?.photoURL || ''
    };

    try {
        const commRef = ref(db, `news_interactions/${selectedNews.id}/comments`);
        await push(commRef, newComment);
        setCommentInput('');
    } catch (e) {
        alert('কমেন্ট করা সম্ভব হয়নি।');
    }
  };

  const handleLikeTouchStart = () => {
    pressTimerRef.current = setTimeout(() => {
        setShowReactMenu(true);
    }, 600);
  };

  const handleLikeTouchEnd = () => {
    if (pressTimerRef.current) {
        clearTimeout(pressTimerRef.current);
        if (!showReactMenu) {
            handleInteraction('likes');
        }
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

  const handleSubmissionClick = () => {
    const savedUser = localStorage.getItem('kp_logged_in_user');
    if (!savedUser) {
        alert('সংবাদ পাঠাতে দয়া করে লগইন করুন বা নিবন্ধন করুন।');
        navigate('/auth?to=news');
    } else {
        const u = JSON.parse(savedUser);
        setCurrentUser(u);
        setForm(prev => ({ 
            ...prev, 
            reporter: `${u.fullName} - ${u.village}`,
            date: getCurrentDateTime() 
        }));
        setShowSubmitForm(true);
    }
  };

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.description) {
        alert('শিরোনাম ও বিবরণ অবশ্যই পূরণ করুন');
        return;
    }
    setIsSubmitting(true);
    try {
        const id = push(ref(db, 'local_news/pending')).key;
        await set(ref(db, `local_news/pending/${id}`), { 
            ...form, 
            id, 
            status: 'pending',
            userId: currentUser.memberId,
            timestamp: Date.now()
        });
        setShowSubmitForm(false);
        setShowSuccessMessage(true);
        setForm({ 
            title: '', description: '', date: getCurrentDateTime(), 
            reporter: `${currentUser.fullName} - ${currentUser.village}`, 
            photo: '', category: categories[0]?.id || '', source: '' 
        });
    } catch (e) { alert('সংরক্ষণ ব্যর্থ হয়েছে!'); }
    finally { setIsSubmitting(false); }
  };

  const toggleSaveNews = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    let newSaved = [...savedNewsIds];
    if (newSaved.includes(id)) {
      newSaved = newSaved.filter(i => i !== id);
    } else {
      newSaved.push(id);
    }
    setSavedNewsIds(newSaved);
    localStorage.setItem('kp_saved_news', JSON.stringify(newSaved));
  };

  const filteredNews = useMemo(() => {
    return newsList.filter(n => activeCategory === 'all' || n.category === activeCategory);
  }, [newsList, activeCategory]);

  const featuredNews = useMemo(() => filteredNews.length > 0 ? filteredNews[0] : null, [filteredNews]);
  const regularNews = useMemo(() => filteredNews.length > 1 ? filteredNews.slice(1) : (activeCategory !== 'all' ? filteredNews : []), [filteredNews, activeCategory]);

  const handleShare = (news: any) => {
    const text = `*${news.title}*\n${news.description?.substring(0, 100)}...\n\nবিস্তারিত পড়ুন কয়রা-পাইকগাছা অ্যাপে।`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  if (showSubmitForm) {
    return (
        <div className="bg-white min-h-screen animate-in slide-in-from-right-4 duration-500 p-5 pb-20 overflow-y-auto">
             <div className="flex items-center gap-4 mb-6">
                <button onClick={() => setShowSubmitForm(false)} className="p-3 bg-white rounded-xl shadow-sm border border-slate-100 active:scale-90 transition-all">
                  <ChevronLeft size={20} className="text-slate-800" />
                </button>
                <div className="text-left">
                    <h2 className="text-xl font-black text-slate-800 tracking-tight leading-none">সংবাদ পাঠান</h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase mt-1 tracking-widest">আপনার চারপাশের খবর দিন</p>
                </div>
            </div>

            <div className="bg-white p-6 rounded-[40px] border border-slate-100 shadow-xl space-y-6">
                <div className="flex flex-col items-center">
                    <div className="relative w-full h-44">
                        <div className="w-full h-full rounded-[30px] bg-slate-50 border-2 border-dashed border-slate-200 overflow-hidden flex flex-col items-center justify-center text-slate-300 gap-2">
                            {form.photo ? <img src={form.photo} className="w-full h-full object-cover" /> : (
                                <>
                                    <Camera size={40} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">ছবি যোগ করুন</span>
                                </>
                            )}
                        </div>
                        <button type="button" onClick={() => fileInputRef.current?.click()} className="absolute bottom-3 right-3 p-3 bg-[#4CAF50] text-white rounded-2xl shadow-xl border-4 border-white active:scale-90 transition-all"><Plus size={18}/></button>
                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                    </div>
                </div>
                
                <div className="space-y-4 pt-2">
                    <div className="text-left">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-2 block">ক্যাটাগরি নির্বাচন</label>
                        <div className="relative">
                            <select className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl appearance-none font-black text-slate-800 outline-none focus:ring-2 focus:ring-blue-500" value={form.category} onChange={(e) => setForm({...form, category: e.target.value})}>
                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
                        </div>
                    </div>
                    <EditField label="শিরোনাম *" value={form.title} onChange={(v:any)=>setForm({...form, title:v})} placeholder="সংবাদের টাইটেল লিখুন" icon={<Newspaper size={18}/>} />
                    <EditField label="রিপোর্টার *" value={form.reporter} readOnly={true} icon={<User size={18}/>} />
                    <EditField label="তারিখ ও সময়" value={form.date} readOnly={true} icon={<Clock size={18}/>} />
                    <div className="text-left">
                        <label className="text-[10px] font-bold text-slate-400 block mb-1.5 uppercase tracking-wider pl-1">বিস্তারিত বিবরণ *</label>
                        <textarea className="w-full p-5 bg-slate-50 border border-slate-100 rounded-[30px] font-bold outline-none text-slate-800 h-44 text-sm focus:ring-2 focus:ring-blue-500 transition-all" value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="ঘটনার বিস্তারিত এখানে লিখুন..." />
                    </div>
                    <EditField label="সংবাদের উৎস (ঐচ্ছিক)" value={form.source} onChange={(v:any)=>setForm({...form, source:v})} placeholder="উদাঃ প্রত্যক্ষদর্শী বা ওয়েবসাইট" icon={<LinkIcon size={18}/>} />
                    
                    <button onClick={handleUserSubmit} disabled={isSubmitting} className="w-full py-5 bg-[#4CAF50] text-white font-black rounded-[30px] shadow-lg mt-4 flex items-center justify-center gap-2 active:scale-95 border-b-4 border-green-700 disabled:opacity-50">
                        {isSubmitting ? <Loader2 className="animate-spin" /> : <><Send size={18}/> সংবাদ জমা দিন</>}
                    </button>
                </div>
            </div>
        </div>
    );
  }

  if (selectedNews) {
    const relatedNews = newsList.filter(n => n.id !== selectedNews.id).slice(0, 3);

    return (
      <div className="bg-white min-h-screen animate-in fade-in duration-500 pb-20">
        <header className="flex items-center justify-between sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 px-4 h-16 shadow-sm">
          <button onClick={() => setSelectedNews(null)} className="p-2 -ml-2 text-slate-800 active:scale-90 transition-all">
            <ChevronLeft size={28} />
          </button>
          <div className="flex items-center gap-3">
             <div className="flex bg-slate-100 rounded-full p-1 border border-slate-200">
                <button onClick={() => setFontSize(prev => Math.max(14, prev - 2))} className="p-1.5 text-slate-500 hover:text-blue-600"><Minus size={16}/></button>
                <div className="px-2 flex items-center justify-center border-x border-slate-200"><span className="text-[10px] font-black text-slate-400">A</span></div>
                <button onClick={() => setFontSize(prev => Math.min(28, prev + 2))} className="p-1.5 text-slate-500 hover:text-blue-600"><Plus size={16}/></button>
             </div>
             <button onClick={() => handleShare(selectedNews)} className="p-2 text-emerald-600 active:scale-90 transition-all">
               <Share2 size={22} />
             </button>
          </div>
        </header>

        <article className="max-w-2xl mx-auto px-5 pt-8 space-y-8">
          <div className="space-y-4">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-red-600 text-white text-[9px] font-black uppercase tracking-widest rounded-md">নিউজ</span>
                    <span className="text-[11px] font-bold text-slate-400">• {toBn(selectedNews.date || 'আজ')}</span>
                </div>
                <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{categories.find(c=>c.id===selectedNews.category)?.name || 'সাধারণ'}</span>
             </div>
             
             <h1 className="text-3xl font-black text-slate-900 leading-[1.3] tracking-tight">
               {selectedNews.title}
             </h1>

             <div className="flex items-center justify-between pt-4 border-y border-slate-50 py-4">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-500">
                      <User size={20} />
                   </div>
                   <div className="flex flex-col text-left">
                      <p className="text-sm font-black text-slate-800">{selectedNews.reporter || 'নিজস্ব প্রতিবেদক'}</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">কয়রা-পাইকগাছা নিউজ ডেস্ক</p>
                   </div>
                </div>
                <button 
                  onClick={(e) => toggleSaveNews(e, selectedNews.id)}
                  className={`p-3 rounded-2xl border transition-all ${savedNewsIds.includes(selectedNews.id) ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-slate-50 border-slate-100 text-slate-400'}`}
                >
                   {savedNewsIds.includes(selectedNews.id) ? <BookmarkCheck size={20}/> : <BookmarkPlus size={20}/>}
                </button>
             </div>
          </div>

          {selectedNews.photo && (
            <div className="w-full">
              <div className="w-full rounded-[30px] overflow-hidden shadow-lg border border-slate-100">
                <img src={selectedNews.photo} className="w-full h-auto object-cover" alt="Article Hero" />
              </div>
              <p className="text-[10px] font-bold text-slate-400 mt-3 text-center italic">ছবি: সংগৃহীত</p>
          </div>
          )}

          <div className="prose prose-slate max-w-none pb-6">
             <p 
                style={{ fontSize: `${fontSize}px` }}
                className="font-medium text-slate-700 leading-[1.8] text-justify whitespace-pre-line first-letter:text-5xl first-letter:font-black first-letter:text-blue-600 first-letter:mr-3 first-letter:float-left transition-all duration-300"
             >
               {selectedNews.description}
             </p>
          </div>

          <div className="pt-6 border-t border-slate-100 space-y-6">
              <div className="flex items-center justify-between px-2 relative">
                <div className="flex items-center gap-6">
                    <div className="relative">
                        {showReactMenu && (
                            <div className="absolute bottom-16 left-0 flex items-center gap-3 p-2 bg-white rounded-full shadow-2xl border border-slate-100 animate-in slide-in-from-bottom-4 duration-300 z-[60]">
                                <button onClick={() => handleInteraction('likes')} className="w-12 h-12 flex items-center justify-center bg-blue-50 text-blue-600 rounded-full active:scale-125 transition-all"><ThumbsUp size={24} fill="currentColor" /></button>
                                <button onClick={() => handleInteraction('loves')} className="w-12 h-12 flex items-center justify-center bg-rose-50 text-rose-600 rounded-full active:scale-125 transition-all"><Heart size={24} fill="currentColor" /></button>
                                <button onClick={() => handleInteraction('angrys')} className="w-12 h-12 flex items-center justify-center bg-orange-50 text-orange-600 rounded-full active:scale-125 transition-all"><Angry size={24} fill="currentColor" /></button>
                                <button onClick={() => setShowReactMenu(false)} className="p-2 text-slate-300"><X size={16}/></button>
                            </div>
                        )}
                        <button 
                            onMouseDown={handleLikeTouchStart}
                            onMouseUp={handleLikeTouchEnd}
                            onTouchStart={handleLikeTouchStart}
                            onTouchEnd={handleLikeTouchEnd}
                            className={`flex items-center gap-2 transition-all active:scale-90 ${userVote === 'like' ? 'text-blue-600' : userVote === 'love' ? 'text-rose-600' : userVote === 'angry' ? 'text-orange-600' : 'text-slate-400'}`}
                        >
                            {userVote === 'love' ? <Heart size={24} fill="currentColor" /> : userVote === 'angry' ? <Angry size={24} fill="currentColor" /> : <ThumbsUp size={24} fill={userVote === 'like' ? 'currentColor' : 'none'} />}
                            <span className="font-black text-sm">{toBn(interactions.likes + interactions.loves + interactions.angrys || 0)}</span>
                        </button>
                    </div>

                    <button 
                        onClick={() => handleInteraction('dislikes')}
                        className={`flex items-center gap-2 transition-all active:scale-90 ${userVote === 'dislike' ? 'text-red-600' : 'text-slate-400'}`}
                    >
                        <ThumbsDown size={24} fill={userVote === 'dislike' ? 'currentColor' : 'none'} />
                        <span className="font-black text-sm">{toBn(interactions.dislikes || 0)}</span>
                    </button>
                </div>

                <div className="flex items-center gap-2 text-slate-400">
                    <MessageSquare size={22} />
                    <span className="font-black text-sm">{toBn(comments.length)}</span>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 shrink-0 overflow-hidden border border-slate-200 flex items-center justify-center">
                        {currentUser?.photoURL ? <img src={currentUser.photoURL} className="w-full h-full object-cover" /> : <User size={20} className="text-slate-300"/>}
                    </div>
                    <div className="flex-1 flex gap-2">
                        <input 
                            className="flex-1 px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-sm focus:border-blue-300 transition-all"
                            placeholder="আপনার মতামত লিখুন..."
                            value={commentInput}
                            onChange={e => setCommentInput(e.target.value)}
                            onKeyPress={e => e.key === 'Enter' && handleCommentSubmit()}
                        />
                        <button 
                            onClick={handleCommentSubmit}
                            disabled={!commentInput.trim()}
                            className="p-3 bg-blue-600 text-white rounded-xl shadow-lg active:scale-90 transition-all disabled:opacity-50"
                        >
                            <Send size={18} />
                        </button>
                    </div>
                </div>

                <div className="space-y-4">
                    {comments.map((c, i) => (
                        <div key={i} className="flex gap-3 animate-in fade-in duration-300">
                            <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 shrink-0 overflow-hidden flex items-center justify-center">
                                {c.userPhoto ? <img src={c.userPhoto} className="w-full h-full object-cover" /> : <User size={14} className="text-slate-300"/>}
                            </div>
                            <div className="flex-1 text-left">
                                <div className="bg-slate-50 p-3 px-4 rounded-2xl rounded-tl-none inline-block max-w-full">
                                    <p className="text-[10px] font-black text-blue-600 uppercase mb-1">{c.userName}</p>
                                    <p className="text-sm font-bold text-slate-700 leading-snug">{c.text}</p>
                                </div>
                                <p className="text-[8px] font-bold text-slate-300 mt-1 uppercase tracking-tighter">{toBn(new Date(c.timestamp).toLocaleTimeString('bn-BD', {hour:'2-digit', minute:'2-digit'}))}</p>
                            </div>
                        </div>
                    ))}
                    {comments.length === 0 && (
                        <p className="text-center text-xs font-bold text-slate-300 py-4 uppercase tracking-widest">এখনও কোনো কমেন্ট নেই</p>
                    )}
                </div>
              </div>
          </div>

          {selectedNews.source && (
             <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-left">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">সংবাদের উৎস</p>
                <p className="text-xs font-bold text-slate-600 italic mt-1">{selectedNews.source}</p>
             </div>
          )}

          <div className="bg-emerald-50 rounded-[30px] p-6 flex flex-col items-center gap-4 border border-emerald-100">
             <p className="text-xs font-black text-emerald-700 uppercase tracking-widest">খবরটি আপনার বন্ধুকে পাঠান</p>
             <button 
                onClick={() => handleShare(selectedNews)}
                className="w-full py-4 bg-[#25D366] text-white font-black rounded-2xl shadow-lg flex items-center justify-center gap-3 active:scale-95 transition-all"
             >
                <MessageCircle size={22} /> WhatsApp এ শেয়ার করুন
             </button>
          </div>

          <div className="pt-10 space-y-6">
             <div className="flex items-center gap-3">
                <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
                <h4 className="text-lg font-black text-slate-800">আরও পড়ুন</h4>
             </div>
             <div className="grid gap-4">
                {relatedNews.map(rn => (
                   <button key={rn.id} onClick={() => setSelectedNews(rn)} className="flex gap-4 text-left group">
                      <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-100">
                         {rn.photo ? <img src={rn.photo} className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center text-slate-300"><Newspaper size={20}/></div>}
                      </div>
                      <div className="flex-1 space-y-1">
                         <h5 className="font-black text-slate-800 text-sm leading-tight group-hover:text-blue-600 transition-colors line-clamp-2">{rn.title}</h5>
                         <p className="text-[10px] font-bold text-slate-400">{toBn(rn.date || 'আজ')}</p>
                      </div>
                   </button>
                ))}
             </div>
          </div>

          <button 
            onClick={() => setSelectedNews(null)}
            className="w-full py-5 bg-slate-900 text-white font-black rounded-3xl active:scale-95 transition-all flex items-center justify-center gap-3 shadow-xl"
          >
            <Layout size={20} /> সংবাদ তালিকায় ফিরুন
          </button>
        </article>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen animate-in fade-in duration-500 pb-32">
      {showSuccessMessage && (
          <div className="fixed inset-0 z-[180] bg-slate-900/60 backdrop-blur-md p-5 flex items-center justify-center">
              <div className="bg-white w-full max-w-xs rounded-[45px] p-8 shadow-2xl text-center space-y-5 animate-in zoom-in duration-300">
                  <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center text-green-600 mx-auto">
                    <CheckCircle2 size={50} />
                  </div>
                  <h3 className="font-black text-lg text-slate-800 leading-tight">সংবাদ পাঠানোর জন্য আপনাকে ধন্যবাদ</h3>
                  <p className="text-sm font-bold text-slate-500">যাচাই করা শেষে আপনার সংবাদটি প্রকাশ করা হবে।</p>
                  <button 
                    onClick={() => { setShowSuccessMessage(false); setActiveCategory('all'); }}
                    className="p-3 bg-red-50 text-red-600 rounded-full shadow-inner active:scale-90 transition-all mx-auto block border border-red-100"
                  >
                    <X size={24} />
                  </button>
              </div>
          </div>
      )}

      <div className="px-5 pt-4 pb-4 space-y-5 bg-white sticky top-0 z-30 border-b border-slate-50 shadow-sm">
        <header className="relative flex items-center justify-center min-h-[60px]">
          <button className="absolute left-0 p-2.5 text-slate-800 active:scale-90 transition-all bg-slate-50 rounded-xl border border-slate-100">
            <MenuIcon size={24} strokeWidth={2.5} />
          </button>
          
          <div className="text-center flex flex-col items-center">
            <h2 className="text-2xl font-black text-slate-900 leading-none tracking-tight">স্থানীয় সংবাদ</h2>
            <div className="flex items-center gap-2 mt-2">
               <div className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse shadow-[0_0_8px_rgba(220,38,38,0.6)]"></div>
               <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest shimmer-text animate-sub-title">
                 কয়রা পাইকগাছা কমিউনিটি এপস
               </p>
            </div>
          </div>
          
          <div className="absolute right-0 top-1 flex items-center">
            <button 
               onClick={handleSubmissionClick}
               className="px-4 py-2.5 premium-btn-animate text-white rounded-xl font-black text-[10px] uppercase tracking-wide shadow-lg active:scale-95 transition-all flex items-center gap-2"
            >
               <Plus size={12} strokeWidth={4} /> সংবাদ পাঠান
            </button>
          </div>
        </header>

        {breakingNews.length > 0 && (
          <div className="bg-red-50 border-y border-red-100 overflow-hidden py-2.5 relative flex items-center rounded-2xl">
             <div className="absolute left-0 z-10 bg-red-600 text-white px-3 py-1 text-[10px] font-black uppercase tracking-widest shadow-lg rounded-r-lg">ব্রেকিং</div>
             <div className="overflow-hidden w-full h-full flex items-center">
                <div 
                    className="scrolling-text text-[13px] font-bold text-red-700 whitespace-nowrap"
                    style={{ animationDuration: '20s' }}
                >
                    {breakingNews.map((n, idx) => `  ${toBn(idx + 1)}. ${n.text}`).join('   •   ')}
                </div>
             </div>
          </div>
        )}

        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
           <button 
                onClick={() => setActiveCategory('all')}
                className={`whitespace-nowrap px-6 py-3 rounded-2xl font-black text-xs transition-all border ${activeCategory === 'all' ? 'bg-[#0056b3] text-white border-[#0056b3] shadow-lg shadow-blue-500/20' : 'bg-white text-slate-400 border-slate-100'}`}
             >
                সব সংবাদ
             </button>
           {categories.map(cat => (
             <button 
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`whitespace-nowrap px-6 py-3 rounded-2xl font-black text-xs transition-all border ${activeCategory === cat.id ? 'bg-[#0056b3] text-white border-[#0056b3] shadow-lg shadow-blue-500/20' : 'bg-white text-slate-400 border-slate-100'}`}
             >
                {cat.name}
             </button>
           ))}
        </div>
      </div>

      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center gap-4 opacity-30">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="font-black text-[10px] uppercase tracking-widest">সংবাদ লোড হচ্ছে...</p>
        </div>
      ) : filteredNews.length === 0 ? (
        <div className="py-32 text-center opacity-30 flex flex-col items-center gap-5">
           <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 border border-slate-100">
              <Newspaper size={48} />
           </div>
           <p className="font-black text-slate-600">কোনো সংবাদ পাওয়া যায়নি</p>
        </div>
      ) : (
        <div className="pt-6 px-5 space-y-10">
          {featuredNews && activeCategory === 'all' && (
            <div className="animate-in slide-in-from-bottom-4 duration-700">
               <div className="flex items-center gap-2 mb-4">
                  <TrendingUp size={16} className="text-red-600" />
                  <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">শীর্ষ সংবাদ</span>
               </div>
               
               <button 
                 onClick={() => setSelectedNews(featuredNews)}
                 className="w-full text-left group transition-all"
               >
                 <div className="w-full aspect-[16/9] rounded-[35px] overflow-hidden bg-slate-100 border border-slate-100 mb-5 relative shadow-md">
                    {featuredNews.photo ? (
                       <img src={featuredNews.photo} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" alt="Featured headline" />
                    ) : (
                       <div className="w-full h-full flex items-center justify-center text-slate-300"><Newspaper size={48}/></div>
                    )}
                    <div className="absolute top-4 left-4 flex gap-2">
                       <span className="px-3 py-1 bg-red-600 text-white text-[9px] font-black uppercase tracking-widest rounded-lg shadow-lg">আজকের খবর</span>
                    </div>
                    <div className="absolute bottom-4 left-4">
                       <span className="px-3 py-1 bg-blue-600/90 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-widest rounded-lg shadow-lg">{categories.find(c=>c.id===featuredNews.category)?.name || 'সাধারণ'}</span>
                    </div>
                 </div>
                 <h3 className="text-2xl font-black text-slate-900 leading-tight group-hover:text-blue-600 transition-colors">
                   {featuredNews.title}
                 </h3>
                 <p className="text-sm font-medium text-slate-500 mt-3 line-clamp-3 leading-relaxed">
                   {featuredNews.description}
                 </p>
                 <div className="flex items-center justify-between mt-5 pt-5 border-t border-slate-50">
                    <div className="flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        <span>{toBn(featuredNews.date || 'আজ')}</span>
                        <span>•</span>
                        <span className="text-blue-500">বিস্তারিত পড়ুন <ArrowRight size={10} className="inline ml-1" /></span>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={(e) => toggleSaveNews(e, featuredNews.id)} className={`p-2 rounded-xl border transition-all ${savedNewsIds.includes(featuredNews.id) ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-slate-100 text-slate-300'}`}>
                           <Bookmark size={16} />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); handleShare(featuredNews); }} className="p-2 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100 active:scale-90 transition-all">
                           <Share2 size={16} />
                        </button>
                    </div>
                 </div>
               </button>
            </div>
          )}

          <div className="space-y-8">
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-3">
                  <Bookmark size={18} className="text-blue-600" />
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em]">অন্যান্য সংবাদ</h4>
               </div>
               <div className="h-px bg-slate-100 flex-1 ml-4"></div>
            </div>

            <div className="space-y-10">
              {(activeCategory !== 'all' ? filteredNews : regularNews).map((news, idx) => (
                <button 
                  key={news.id}
                  onClick={() => setSelectedNews(news)}
                  className="w-full flex gap-5 text-left group animate-in slide-in-from-bottom-4 duration-500"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <div className="flex-1 space-y-2 py-0.5">
                     <div className="flex items-center gap-2 text-[8px] font-black text-blue-500 uppercase tracking-widest">
                        <span className="text-red-600 font-black">{categories.find(c=>c.id===news.category)?.name || 'সাধারণ'}</span>
                        <span>•</span>
                        <span>{toBn(news.date || 'আজ')}</span>
                     </div>
                     <h3 className="text-base font-black text-slate-900 leading-snug line-clamp-3 group-hover:text-blue-600 transition-colors">
                       {news.title}
                     </h3>
                     <div className="flex items-center gap-3 pt-1">
                        <button onClick={(e) => toggleSaveNews(e, news.id)} className={`transition-colors ${savedNewsIds.includes(news.id) ? 'text-blue-600' : 'text-slate-300'}`}>
                           <Bookmark size={12} fill={savedNewsIds.includes(news.id) ? "currentColor" : "none"} />
                        </button>
                        <span className="text-[9px] font-bold text-slate-400">রিপোর্টার: {news.reporter?.split(' ')[0] || 'ডেস্ক'}</span>
                     </div>
                  </div>
                  <div className="w-24 h-24 rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 shadow-sm shrink-0">
                    {news.photo ? (
                        <img src={news.photo} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-200"><Newspaper size={24}/></div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
