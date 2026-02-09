
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ChevronLeft, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  Copy, 
  Check, 
  CheckCircle2, 
  PartyPopper,
  ArrowRight,
  Loader2,
  User as UserIcon,
  LogOut,
  MapPin,
  Calendar,
  ShieldCheck,
  UserCheck,
  UserCircle,
  Smartphone,
  Info,
  Lock,
  Mail,
  PhoneCall,
  Camera,
  X,
  CreditCard,
  Wallet,
  Pencil,
  Newspaper,
  ChevronRight,
  History,
  FileText,
  Clock
} from 'lucide-react';
import { User } from '../types';
import CustomDateInput from '../components/CustomDateInput';

// Firebase Imports
import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, set, get, child, update, onValue } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

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

interface UserAuthProps {
  onLogin: (user: User | null) => void;
}

interface StoredUser extends User {
  password?: string;
  photoURL?: string;
}

const UserAuth: React.FC<UserAuthProps> = ({ onLogin }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const redirectTo = queryParams.get('to');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<'login' | 'register' | 'profile' | 'reporter'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showRegSuccess, setShowRegSuccess] = useState(false);
  const [showLoginSuccess, setShowLoginSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState<StoredUser | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showDetails, setShowDetails] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [editingName, setEditingName] = useState('');

  // Reporter Logic States
  const [myNews, setMyNews] = useState<any[]>([]);
  const [hasSubmittedAnyNews, setHasSubmittedAnyNews] = useState(false);

  const [loginData, setLoginData] = useState({ mobile: '', password: '' });
  const [regData, setRegData] = useState({
    fullName: '', mobile: '', email: '', dob: '', village: '', nid: '', password: '', confirmPassword: ''
  });
  const [generatedMemberId, setGeneratedMemberId] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('kp_logged_in_user');
    if (saved) {
      const user = JSON.parse(saved);
      setLoggedInUser(user);
      setEditingName(user.fullName);
      setMode('profile');
      onLogin(user);
      fetchUserNews(user.memberId);
    }
  }, []);

  const fetchUserNews = (memberId: string) => {
    const nodes = ['local_news/main', 'local_news/pending', 'local_news/rejected'];
    const promises = nodes.map(node => get(ref(db, node)));

    Promise.all(promises).then(results => {
        let all: any[] = [];
        results.forEach(snap => {
            if (snap.exists()) {
                const val = snap.val();
                const filtered = Object.values(val).filter((n: any) => n.userId === memberId);
                all = [...all, ...filtered];
            }
        });
        setMyNews(all.sort((a,b) => (b.timestamp || 0) - (a.timestamp || 0)));
        setHasSubmittedAnyNews(all.length > 0);
    });
  };

  const convertBnToEn = (str: string) => {
    const bn = ['০','১','২','৩','৪','৫','৬','৭','৮','৯'], en = ['0','1','2','3','4','5','6','7','8','9'];
    return str.split('').map(c => bn.indexOf(c) !== -1 ? en[bn.indexOf(c)] : c).join('');
  };

  const toBn = (num: string | number) => 
    (num || '').toString().replace(/\d/g, d => "০১২৩৪৫৬৭৮৯"[parseInt(d)]);

  useEffect(() => {
    const generateId = async () => {
      if (mode === 'register' && regData.mobile.length === 11 && regData.dob) {
        try {
          const dbRef = ref(db);
          const snapshot = await get(child(dbRef, 'users'));
          const usersCount = snapshot.exists() ? Object.keys(snapshot.val()).length : 0;
          
          const parts = regData.dob.split('-');
          const y = parts[0], m = parts[1], d = parts[2];
          const mob = regData.mobile;
          
          if (y && m && d && mob.length === 11) {
            const sequence = 2980 + usersCount;
            const prefix = `${y[3]}${mob[4]}${m[0]}${mob[8]}${d[1]}${mob[5]}${mob[7]}${mob[2]}${y.slice(0, 2)}`;
            setGeneratedMemberId(`${prefix}${sequence}`);
          }
        } catch (e) {
          console.error("ID generation failed", e);
        }
      }
    };
    generateId();
  }, [regData.mobile, regData.dob, mode]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsSubmitting(true);
    try {
      const dbRef = ref(db);
      const snapshot = await get(child(dbRef, 'users'));
      const users = snapshot.val();
      
      if (users) {
        const found = Object.values(users).find((u: any) => 
          String(u.mobile) === String(loginData.mobile) && 
          String(u.password) === String(loginData.password)
        ) as StoredUser | undefined;

        if (found) {
            setLoggedInUser(found);
            setEditingName(found.fullName);
            localStorage.setItem('kp_logged_in_user', JSON.stringify(found));
            setShowLoginSuccess(true);
            fetchUserNews(found.memberId);
        } else {
          setErrors({ login_error: 'মোবাইল নম্বর অথবা পাসওয়ার্ড ভুল।' });
        }
      } else {
        setErrors({ login_error: 'সার্ভারে কোনো ইউজার পাওয়া যায়নি।'});
      }
    } catch (err) {
      setErrors({ login_error: 'কানেকশন এরর! আবার চেষ্টা করুন।'});
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    if (!regData.fullName || regData.mobile.length !== 11 || !regData.dob || !regData.password) {
      alert('সঠিক তথ্য দিন।');
      return;
    }
    setIsSubmitting(true);
    try {
      const dbRef = ref(db);
      const snap = await get(child(dbRef, 'users'));
      const all = snap.val();
      if (all && Object.values(all).some((u: any) => u.mobile === regData.mobile)) {
        setErrors({ mobile: 'এই নম্বরটি ইতিমধ্যে নিবন্ধিত!' });
        setIsSubmitting(false);
        return;
      }
      const userData = { ...regData, memberId: generatedMemberId, status: 'active', createdAt: new Date().toISOString() };
      await set(ref(db, 'users/' + generatedMemberId), userData);
      setShowRegSuccess(true);
    } catch (err) {
      alert('রেজিস্ট্রেশন ব্যর্থ হয়েছে!');
    } finally { setIsSubmitting(false); }
  };

  const handleUpdateName = async () => {
    if (loggedInUser && editingName.trim() !== '' && editingName !== loggedInUser.fullName) {
      setIsSubmitting(true);
      try {
        const updatedUser = { ...loggedInUser, fullName: editingName };
        setLoggedInUser(updatedUser);
        localStorage.setItem('kp_logged_in_user', JSON.stringify(updatedUser));
        await update(ref(db, 'users/' + loggedInUser.memberId), { fullName: editingName });
        onLogin(updatedUser);
        alert('আপনার নাম সফলভাবে আপডেট করা হয়েছে।');
      } catch (err) {
        alert('নাম আপডেট করা সম্ভব হয়নি।');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(generatedMemberId);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleLogout = () => {
    localStorage.removeItem('kp_logged_in_user');
    setLoggedInUser(null);
    setMode('login');
    onLogin(null);
    setHasSubmittedAnyNews(false);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && loggedInUser) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        const updatedUser = { ...loggedInUser, photoURL: base64String };
        setLoggedInUser(updatedUser);
        localStorage.setItem('kp_logged_in_user', JSON.stringify(updatedUser));
        
        try {
          await update(ref(db, 'users/' + loggedInUser.memberId), { photoURL: base64String });
          onLogin(updatedUser);
        } catch (error) {
          console.error("Failed to save photo to DB", error);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  if (showLoginSuccess) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
        <div className="bg-white w-full max-w-sm rounded-[40px] p-10 shadow-2xl text-center space-y-6 animate-in zoom-in duration-500 border border-blue-50">
          <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center text-green-600 mx-auto shadow-inner">
            <CheckCircle2 size={52} strokeWidth={2.5} />
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-black text-slate-800">লগইন সফল!</h2>
            <p className="text-slate-500 font-bold">কয়রা-পাইকগাছা ডিজিটাল অ্যাপে আপনাকে স্বাগতম।</p>
          </div>
          <button 
            onClick={() => { 
              setShowLoginSuccess(false); 
              onLogin(loggedInUser!); 
              // Direct Flow Logic
              if (redirectTo === 'ledger') navigate('/ledger');
              else if (redirectTo === 'news') navigate('/category/14?action=submit'); // Back to news with submit action
              else setMode('profile');
            }} 
            className="w-full py-5 bg-gradient-to-br from-green-600 to-emerald-500 text-white font-black rounded-[24px] shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3"
          >
            {redirectTo === 'ledger' ? 'খাতা ওপেন করুন' : redirectTo === 'news' ? 'সংবাদ ফরমটি ওপেন করুন' : 'ড্যাশবোর্ডে প্রবেশ করুন'} <ArrowRight size={22} />
          </button>
        </div>
      </div>
    );
  }

  if (showRegSuccess) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/80 backdrop-blur-xl">
        <div className="bg-white w-full max-w-sm rounded-[45px] p-10 shadow-2xl text-center space-y-8 animate-in zoom-in duration-500 border border-blue-50">
          <div className="relative">
             <div className="absolute inset-0 bg-blue-100/50 rounded-full blur-2xl animate-pulse"></div>
             <PartyPopper size={72} className="mx-auto text-blue-600 relative animate-bounce" />
          </div>
          
          <div className="space-y-3">
            <h2 className="text-2xl font-black text-slate-800 leading-tight">অভিনন্দন, আপনি সফলভাবে রেজিষ্ট্রেশন করেছেন</h2>
            <p className="text-slate-500 font-bold text-sm">ভবিষ্যতের জন্য আপনার মেম্বার আইডিটি কপি করে সংরক্ষণ করুন</p>
          </div>

          <div className="relative group">
            <div className="absolute inset-0 bg-blue-500/5 rounded-[30px] border-2 border-dashed border-blue-200 group-hover:bg-blue-500/10 transition-all"></div>
            <div className="relative p-7 flex items-center justify-between gap-3">
               <p className="text-2xl font-black text-blue-700 tracking-tight font-inter">{generatedMemberId}</p>
               <button 
                 onClick={handleCopyId}
                 className={`p-3 rounded-2xl transition-all active:scale-90 ${isCopied ? 'bg-green-500 text-white shadow-lg shadow-green-500/30' : 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'}`}
               >
                 {isCopied ? <Check size={20} /> : <Copy size={20} />}
               </button>
            </div>
          </div>
          <button 
            onClick={() => { setShowRegSuccess(false); setMode('login'); }} 
            className="w-full py-5 bg-[#0056b3] text-white font-black rounded-[28px] shadow-xl shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-center gap-3"
          >
            লগইন করুন <ArrowRight size={20} />
          </button>
        </div>
      </div>
    );
  }

  if (mode === 'reporter' && loggedInUser) {
    return (
        <div className="p-5 pt-2 animate-in slide-in-from-right-4 duration-500 space-y-6 pb-40">
             <div className="flex items-center gap-4">
                <button onClick={() => setMode('profile')} className="p-3 bg-white rounded-xl shadow-sm border border-slate-100 active:scale-90 transition-all">
                    <ChevronLeft size={20} className="text-slate-800" />
                </button>
                <h2 className="text-xl font-black text-slate-800 tracking-tight">আমার সংবাদ ইতিহাস</h2>
            </div>

            <div className="space-y-4">
                {myNews.length === 0 ? (
                    <div className="py-20 text-center opacity-30">কোনো সংবাদ পাওয়া যায়নি</div>
                ) : (
                    myNews.map((n, i) => (
                        <div key={i} className="bg-white p-5 rounded-[32px] border border-slate-100 shadow-sm space-y-3">
                            <div className="flex justify-between items-start">
                                <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${n.status === 'published' ? 'bg-green-50 text-green-600' : n.status === 'rejected' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                                    {n.status === 'published' ? 'প্রকাশিত' : n.status === 'rejected' ? 'রিজেক্টেড' : 'অপেক্ষমান'}
                                </div>
                                <div className="flex items-center gap-1.5 text-slate-400">
                                    <Clock size={10} />
                                    <span className="text-[10px] font-bold">{n.date}</span>
                                </div>
                            </div>
                            <h4 className="font-black text-slate-800 text-sm leading-tight text-left">{n.title}</h4>
                            <div className="pt-2 border-t flex justify-between items-center">
                                <span className="text-[9px] font-bold text-slate-400 uppercase">রিপোর্টার: {n.reporter}</span>
                                {n.status === 'published' && <CheckCircle2 size={16} className="text-green-500" />}
                                {n.status === 'rejected' && <X size={16} className="text-red-500" />}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
  }

  if (mode === 'profile' && loggedInUser) {
    if (loggedInUser.status === 'suspended') {
      return (
        <div className="p-5 pt-8 animate-in zoom-in duration-500 min-h-[70vh] flex flex-col items-center justify-center text-center space-y-8">
            <div className="relative">
                <div className="absolute inset-0 bg-red-400/20 rounded-full blur-2xl animate-pulse"></div>
                <div className="relative w-32 h-32 bg-red-50 rounded-[40px] flex items-center justify-center text-red-500 border-4 border-white shadow-2xl animate-bounce">
                    <Lock size={64} strokeWidth={2.5} />
                </div>
            </div>
            <div className="space-y-3 px-6">
                <h2 className="text-3xl font-black text-slate-800 leading-tight">আপনার একাউন্টটি লক হয়ে আছে!</h2>
                <p className="text-slate-500 font-bold leading-relaxed">বিস্তারিত জানতে হেল্পলাইনে যোগাযোগ করুন।</p>
            </div>
            <div className="w-full space-y-4 max-w-xs">
                <button 
                  onClick={() => navigate('/hotline')}
                  className="w-full py-5 bg-gradient-to-br from-red-600 to-rose-500 text-white font-black rounded-[28px] shadow-xl shadow-red-500/20 active:scale-95 transition-all flex items-center justify-center gap-3"
                >
                    <PhoneCall size={22} /> হেল্প লাইনে যোগাযোগ করুন
                </button>
                <button onClick={handleLogout} className="text-slate-400 font-bold text-sm px-6 py-2 border border-slate-100 rounded-full hover:bg-slate-50">লগআউট করুন</button>
            </div>
        </div>
      );
    }

    return (
      <div className="p-5 pt-2 animate-in fade-in slide-in-from-bottom-6 duration-700 space-y-4 pb-40">
        
        <div className="flex items-center justify-between px-3">
          <h2 className="text-base font-black text-slate-800 tracking-tight">ইউজার লগইন এরিয়া</h2>
          <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-1 text-red-500 bg-red-50 rounded-xl active:scale-90 transition-all text-[10px] font-bold border border-red-50">
            <LogOut size={12} /> লগআউট
          </button>
        </div>

        <button 
            onClick={() => setShowDetails(true)}
            className="w-full text-left bg-gradient-to-br from-blue-50/50 to-white p-4 rounded-[32px] shadow-[0_15px_35px_rgba(0,86,179,0.08)] border border-blue-50/40 flex items-center gap-4 relative overflow-hidden group active:scale-[0.98] transition-all"
        >
          <div className="relative shrink-0">
            <div className="w-16 h-16 rounded-full border-[3px] border-white shadow-lg overflow-hidden bg-slate-100 flex items-center justify-center text-slate-300">
              {loggedInUser.photoURL ? (
                <img src={loggedInUser.photoURL} alt="User Profile" className="w-full h-full object-cover" />
              ) : (
                <UserCircle size={40} strokeWidth={1} />
              )}
            </div>
            <div className="absolute -top-1 -right-1 p-1.5 bg-[#0056b3] text-white rounded-full shadow-lg border-2 border-white">
              <Camera size={10} strokeWidth={3} />
            </div>
          </div>

          <div className="flex-1 text-left space-y-0.5">
            <h3 className="text-lg font-black text-slate-800 leading-tight tracking-tight">{loggedInUser.fullName}</h3>
            <p className="text-xs font-black text-blue-600/60 tracking-tight leading-none font-inter">{loggedInUser.memberId}</p>
            <div className="flex items-center gap-1.5 mt-1">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-tighter">সক্রিয় আছেন</span>
            </div>
          </div>
          <div className="pr-2 opacity-20"><ChevronLeft className="rotate-180" size={20} /></div>
        </button>

        <div className="space-y-3">
            <div onClick={() => navigate('/ledger')} className="w-full text-left bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex items-center gap-4 active:scale-95 transition-all">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl shadow-inner"><Wallet size={24} /></div>
                <div className="flex-1 text-left">
                    <h4 className="font-black text-slate-800">ডিজিটাল খাতা</h4>
                    <p className="text-xs font-bold text-slate-400">আপনার ব্যক্তিগত বকেয়া হিসাব নিয়ন্ত্রণ করুন</p>
                </div>
                <ArrowRight size={20} className="text-slate-300" />
            </div>

            {hasSubmittedAnyNews && (
                <div onClick={() => setMode('reporter')} className="w-full text-left bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex items-center gap-4 active:scale-95 transition-all animate-in slide-in-from-top-2">
                    <div className="p-3 bg-green-50 text-green-600 rounded-2xl shadow-inner"><Newspaper size={24} /></div>
                    <div className="flex-1 text-left">
                        <h4 className="font-black text-slate-800">রিপোর্টার ড্যাশবোর্ড</h4>
                        <p className="text-xs font-bold text-slate-400">আপনার পাঠানো সংবাদের বর্তমান অবস্থা দেখুন</p>
                    </div>
                    <ArrowRight size={20} className="text-slate-300" />
                </div>
            )}
        </div>

        {showDetails && (
          <div className="fixed inset-0 z-[110] bg-slate-950/40 backdrop-blur-md flex items-end justify-center animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-md rounded-t-[45px] p-8 pb-10 shadow-2xl animate-in slide-in-from-bottom duration-500 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-2xl font-black text-slate-800">প্রোফাইল তথ্য</h3>
                    <button onClick={() => setShowDetails(false)} className="p-3 bg-slate-50 rounded-full text-slate-400 active:scale-90 transition-all"><X size={24} /></button>
                </div>

                <div className="flex flex-col items-center gap-6 mb-8">
                  <div className="relative">
                    <div className="w-32 h-32 rounded-[40px] border-[5px] border-slate-50 shadow-xl overflow-hidden bg-slate-100 flex items-center justify-center text-slate-200">
                      {loggedInUser.photoURL ? (
                        <img src={loggedInUser.photoURL} alt="Large Profile" className="w-full h-full object-cover" />
                      ) : (
                        <UserCircle size={80} strokeWidth={1} />
                      )}
                    </div>
                    <button onClick={() => fileInputRef.current?.click()} className="absolute -bottom-2 -right-2 p-3 bg-[#0056b3] text-white rounded-2xl shadow-xl border-4 border-white active:scale-90 transition-all">
                      <Camera size={18} strokeWidth={3} />
                    </button>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                  </div>

                  <div className="w-full space-y-4">
                    <div className="text-left">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2 mb-1.5 block">আপনার নাম</label>
                      <div className="relative">
                        <input type="text" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-black text-slate-800 focus:border-blue-500 outline-none transition-all" value={editingName} onChange={(e) => setEditingName(e.target.value)} />
                        <Pencil size={14} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300" />
                      </div>
                      {editingName !== loggedInUser.fullName && editingName.trim() !== '' && (
                        <button onClick={handleUpdateName} disabled={isSubmitting} className="w-full mt-3 py-3 bg-blue-600 text-white rounded-xl font-black text-xs flex items-center justify-center gap-2">
                          {isSubmitting ? <Loader2 className="animate-spin" size={14} /> : 'পরিবর্তন করুন'}
                        </button>
                      )}
                    </div>
                    <DetailRow icon={<CreditCard size={18} />} label="মেম্বার আইডি" value={loggedInUser.memberId} />
                    <DetailRow icon={<Smartphone size={18} />} label="মোবাইল নম্বর" value={loggedInUser.mobile} />
                    <DetailRow icon={<MapPin size={18} />} label="গ্রাম/ইউনিয়ন" value={loggedInUser.village} />
                  </div>
                </div>
                <button onClick={() => setShowDetails(false)} className="w-full py-5 bg-slate-900 text-white font-black rounded-[28px] shadow-xl">বন্ধ করুন</button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-5 pt-1 space-y-6 animate-in slide-in-from-right-4 duration-500">
      <div className="text-center py-4">
        <h2 className="text-2xl font-black text-[#1A1A1A]">{mode === 'login' ? 'ইউজার লগইন' : 'সদস্য নিবন্ধন'}</h2>
        <div className="w-10 h-1 bg-blue-600 mx-auto mt-2 rounded-full"></div>
      </div>
      <div className="bg-white p-8 pt-3 rounded-[35px] shadow-2xl border border-blue-50 space-y-6">
        <div className="flex p-1.5 bg-slate-100 rounded-2xl">
          <button onClick={() => setMode('login')} className={`flex-1 py-2 rounded-xl font-black text-sm transition-all ${mode === 'login' ? 'bg-white shadow-md text-blue-600' : 'text-slate-400'}`}>লগইন</button>
          <button onClick={() => setMode('register')} className={`flex-1 py-2 rounded-xl font-black text-sm transition-all ${mode === 'register' ? 'bg-white shadow-md text-blue-600' : 'text-slate-400'}`}>নিবন্ধন</button>
        </div>
        {mode === 'login' ? (
          <form onSubmit={handleLoginSubmit} className="space-y-5">
            <Field label="মোবাইল নম্বর" value={loginData.mobile} placeholder="০১৭xxxxxxxx" onChange={v => setLoginData({...loginData, mobile: convertBnToEn(v)})} maxLength={11} icon={<Smartphone size={18} />} />
            <div className="relative">
              <Field label="পাসওয়ার্ড" type={showPassword ? 'text' : 'password'} value={loginData.password} placeholder="******" onChange={v => setLoginData({...loginData, password: v})} icon={<Lock size={18} />} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-10 text-slate-300 p-2">{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}</button>
            </div>
            <button disabled={isSubmitting} className="w-full py-5 bg-[#0056b3] text-white font-black rounded-[24px] shadow-xl">{isSubmitting ? <Loader2 className="animate-spin mx-auto" /> : 'প্রবেশ করুন'}</button>
          </form>
        ) : (
          <form onSubmit={handleRegisterSubmit} className="space-y-3">
            <Field label="পূর্ণ নাম *" value={regData.fullName} placeholder="আপনার নাম লিখুন" onChange={v => setRegData({...regData, fullName: v})} />
            <Field label="মোবাইল নম্বর *" value={regData.mobile} maxLength={11} placeholder="০১xxxxxxxxx" onChange={v => setRegData({...regData, mobile: convertBnToEn(v)})} />
            <CustomDateInput label="জন্ম তারিখ *" value={regData.dob} onChange={v => setRegData({...regData, dob: v})} required />
            <Field label="গ্রাম *" value={regData.village} placeholder="গ্রামের নাম" onChange={v => setRegData({...regData, village: v})} />
            <div className="grid grid-cols-2 gap-3">
              <Field label="পাসওয়ার্ড *" type="password" value={regData.password} placeholder="******" onChange={v => setRegData({...regData, password: v})} />
              <Field label="নিশ্চিত করুন *" type="password" value={regData.confirmPassword} placeholder="******" onChange={v => setRegData({...regData, confirmPassword: v})} />
            </div>
            <button disabled={isSubmitting} className="w-full py-5 bg-[#0056b3] text-white font-black rounded-[24px] mt-4">{isSubmitting ? <Loader2 className="animate-spin mx-auto" /> : 'নিবন্ধন সম্পন্ন করুন'}</button>
          </form>
        )}
      </div>
    </div>
  );
};

const DetailRow: React.FC<{ icon: React.ReactNode, label: string, value: string }> = ({ icon, label, value }) => (
    <div className="flex items-center gap-4 p-4 bg-slate-50/50 border border-slate-100 rounded-[22px] text-left">
        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-500 shadow-sm border border-slate-100/50">{icon}</div>
        <div className="overflow-hidden">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{label}</p>
            <p className="text-sm font-black text-slate-800 truncate leading-tight">{value}</p>
        </div>
    </div>
);

const Field: React.FC<{ label: string, value: string, type?: string, placeholder?: string, maxLength?: number, onChange: (v: string) => void, icon?: React.ReactNode }> = ({ label, value, type = 'text', placeholder, maxLength, onChange, icon }) => (
  <div className="text-left">
    <label className="text-[10px] font-black text-slate-400 block mb-1 uppercase tracking-widest pl-1">{label}</label>
    <div className="relative">
      {icon && <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300">{icon}</div>}
      <input type={type} maxLength={maxLength} placeholder={placeholder} className={`w-full ${icon ? 'pl-12' : 'px-5'} py-3.5 rounded-2xl bg-slate-50 border border-slate-200 outline-none font-bold text-slate-800 focus:border-blue-400 transition-all`} value={value} onChange={e => onChange(e.target.value)} />
    </div>
  </div>
);

export default UserAuth;
