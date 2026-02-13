
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ChevronLeft, 
  ChevronRight,
  Eye, 
  EyeOff, 
  ArrowRight,
  Loader2,
  Smartphone,
  Lock,
  Mail,
  UserCircle,
  User as UserIcon,
  MapPin,
  Wallet,
  ShieldCheck,
  CheckCircle2,
  ShoppingBag,
  Plus,
  Trash2,
  Edit2,
  ShoppingBasket,
  ChevronDown,
  X,
  Calendar,
  KeyRound,
  Camera,
  Store,
  Tag,
  Save,
  FileText,
  Hash,
  Newspaper,
  LayoutGrid,
  LogOut,
  Key
} from 'lucide-react';
import { User as AppUser } from '../types';

// Firebase Imports
import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, onValue, set, push, remove } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  sendEmailVerification, 
  sendPasswordResetEmail,
  signOut
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  collection, 
  query, 
  where, 
  getDocs,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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
const dbFs = getFirestore(app);
const db = getDatabase(app);
const auth = getAuth(app);
auth.languageCode = 'bn'; 

const toBn = (num: string | number | undefined) => 
    (num || '').toString().replace(/\d/g, d => "০১২৩৪৫৬৭৮৯"[parseInt(d)]);

const convertToEn = (str: string) => {
    if (!str) return '';
    const bn = ['০','১','২','৩','৪','৫','৬','৭','৮','৯'], en = ['0','1','2','3','4','5','6','7','8','9'];
    let result = str.toString().replace(/[০-৯]/g, (s) => en[bn.indexOf(s)]).replace(/[^0-9]/g, '').trim();
    if (result.startsWith('880') && result.length === 13) {
        result = result.substring(2);
    }
    if (result.length === 10 && result.startsWith('1')) {
        result = '0' + result;
    }
    return result;
};

interface UserAuthProps {
  onLogin: (user: AppUser | null) => void;
}

const UserAuth: React.FC<UserAuthProps> = ({ onLogin }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const profilePicRef = useRef<HTMLInputElement>(null);
  const queryParams = new URLSearchParams(location.search);
  const targetAction = queryParams.get('to');
  
  const [loggedInUser, setLoggedInUser] = useState<any | null>(() => {
    const saved = localStorage.getItem('kp_logged_in_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [mode, setMode] = useState<'login' | 'register' | 'profile' | 'forgot' | 'my_haat'>(() => {
    const saved = localStorage.getItem('kp_logged_in_user');
    return saved ? 'profile' : 'login';
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileEditForm, setProfileEditForm] = useState({ fullName: '', village: '', photoURL: '' });
  
  const [loginData, setLoginData] = useState({ mobile: '', password: '' });
  const [regData, setRegData] = useState({
    fullName: '', email: '', mobile: '', dob: '', village: '', password: '', confirmPassword: ''
  });

  useEffect(() => {
    if (loggedInUser) {
      const syncUserStatus = async () => {
        try {
          const q = query(collection(dbFs, "users"), where("uid", "==", loggedInUser.uid));
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
              const freshData = querySnapshot.docs[0].data();
              const syncedUser = { ...loggedInUser, ...freshData };
              setLoggedInUser(syncedUser);
              localStorage.setItem('kp_logged_in_user', JSON.stringify(syncedUser));
              onLogin(syncedUser as any);
          }
        } catch (e) {
          onLogin(loggedInUser);
        }
      };
      syncUserStatus();
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    const cleanMobile = convertToEn(loginData.mobile);
    
    if (!cleanMobile || !loginData.password) {
      setErrorMsg('মোবাইল নম্বর এবং পাসওয়ার্ড প্রদান করুন।');
      return;
    }

    setIsSubmitting(true);
    try {
      const q = query(collection(dbFs, "users"), where("mobile", "==", cleanMobile));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        setErrorMsg('এই মোবাইল নম্বরটি দিয়ে কোনো একাউন্ট খুঁজে পাওয়া যায়নি।');
        setIsSubmitting(false);
        return;
      }

      const userData = querySnapshot.docs[0].data();
      if (userData.status === 'suspended') {
        setErrorMsg('আপনার একাউন্টটি সাসপেন্ড করা হয়েছে। এডমিনের সাথে যোগাযোগ করুন।');
        setIsSubmitting(false);
        return;
      }

      const userCredential = await signInWithEmailAndPassword(auth, userData.email, loginData.password);
      
      // Mandatory Email Verification Check
      if (!userCredential.user.emailVerified) {
        await signOut(auth);
        setErrorMsg('আপনার ইমেইলটি এখনও ভেরিফাই করা হয়নি। অনুগ্রহ করে আপনার ইমেইল চেক করে ভেরিফিকেশন লিঙ্কটি ক্লিক করুন।');
        setIsSubmitting(false);
        return;
      }

      const finalUser = { ...userData, uid: userCredential.user.uid, password: loginData.password };
      
      setLoggedInUser(finalUser);
      localStorage.setItem('kp_logged_in_user', JSON.stringify(finalUser));
      onLogin(finalUser as any);
      
      if (targetAction === 'ledger') navigate('/ledger');
      else if (targetAction === 'haat') navigate('/online-haat');
      else setMode('profile');

    } catch (err: any) {
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
          setErrorMsg('মোবাইল নম্বর অথবা পাসওয়ার্ডটি সঠিক নয়।');
      } else if (err.code === 'auth/too-many-requests') {
          setErrorMsg('অতিরিক্ত ভুল চেষ্টার কারণে লগইন সাময়িকভাবে বন্ধ আছে। কিছুক্ষণ পর চেষ্টা করুন।');
      } else {
          setErrorMsg('লগইন ব্যর্থ হয়েছে। আপনার ইন্টারনেট কানেকশন চেক করুন।');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    const cleanMobile = convertToEn(regData.mobile);
    const { fullName, email, dob, village, password, confirmPassword } = regData;

    if (!fullName || !email || !cleanMobile || !dob || !village || !password) {
      setErrorMsg('সবগুলো তথ্য পূরণ করা বাধ্যতামূলক।');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('পাসওয়ার্ড অমিল।');
      return;
    }

    setIsSubmitting(true);
    try {
      const q = query(collection(dbFs, "users"), where("mobile", "==", cleanMobile));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
          setErrorMsg('এই মোবাইল নম্বরটি দিয়ে ইতিমধ্যে একাউন্ট খোলা হয়েছে।');
          setIsSubmitting(false);
          return;
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Send Email Verification Link
      await sendEmailVerification(userCredential.user);

      const memberId = `KP${Date.now().toString().slice(-8)}`;
      const userData = {
        uid: userCredential.user.uid,
        memberId,
        fullName,
        email,
        mobile: cleanMobile,
        dob,
        village,
        password,
        status: 'active',
        createdAt: new Date().toISOString()
      };
      
      await setDoc(doc(dbFs, "users", userCredential.user.uid), userData);
      
      // CRITICAL: Force Sign Out after registration until they verify email
      await signOut(auth);
      
      setSuccessMsg('নিবন্ধন সফল হয়েছে! আপনার ইমেইলে একটি ভেরিফিকেশন লিঙ্ক পাঠানো হয়েছে। অনুগ্রহ করে ইমেইলটি যাচাই করে লগইন করুন।');
      setMode('login');
      setRegData({ fullName: '', email: '', mobile: '', dob: '', village: '', password: '', confirmPassword: '' });
      
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
          setErrorMsg('এই ইমেইলটি ইতিমধ্যে ব্যবহৃত হয়েছে।');
      } else if (err.code === 'auth/weak-password') {
          setErrorMsg('পাসওয়ার্ডটি অন্তত ৬ অক্ষরের হতে হবে।');
      } else {
          setErrorMsg('নিবন্ধন ব্যর্থ হয়েছে। অন্য ইমেইল ব্যবহার করে চেষ্টা করুন।');
      }
    } finally { setIsSubmitting(false); }
  };

  const handleResetPassword = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    if (!regData.email) {
      setErrorMsg('অনুগ্রহ করে আপনার একাউন্টের ইমেইল এড্রেসটি দিন।');
      return;
    }
    setIsSubmitting(true);
    try {
      await sendPasswordResetEmail(auth, regData.email);
      setSuccessMsg('পাসওয়ার্ড রিসেট করার লিঙ্কটি আপনার ইমেইলে পাঠানো হয়েছে। অনুগ্রহ করে ইনবক্স বা স্প্যাম ফোল্ডার চেক করুন।');
      setMode('login');
    } catch (err: any) {
      if (err.code === 'auth/user-not-found') {
        setErrorMsg('এই ইমেইল দিয়ে কোনো একাউন্ট পাওয়া যায়নি।');
      } else {
        setErrorMsg('রিসেট লিঙ্ক পাঠাতে সমস্যা হয়েছে। সঠিক ইমেইল দিয়েছেন কিনা নিশ্চিত করুন।');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    localStorage.removeItem('kp_logged_in_user');
    setLoggedInUser(null);
    setMode('login');
    onLogin(null);
  };

  const handleProfileSave = async () => {
    if (!profileEditForm.fullName || !profileEditForm.village || !loggedInUser?.uid) return;
    setIsSubmitting(true);
    try {
        const userRef = doc(dbFs, "users", loggedInUser.uid);
        const updates = {
            fullName: profileEditForm.fullName,
            village: profileEditForm.village,
            photoURL: profileEditForm.photoURL || loggedInUser.photoURL || ''
        };
        await updateDoc(userRef, updates);
        const updatedUser = { ...loggedInUser, ...updates };
        setLoggedInUser(updatedUser);
        localStorage.setItem('kp_logged_in_user', JSON.stringify(updatedUser));
        setIsEditingProfile(false);
        alert('তথ্য আপডেট হয়েছে!');
    } catch (err) { alert('ত্রুটি!'); }
    finally { setIsSubmitting(false); }
  };

  const handleProfilePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setProfileEditForm(prev => ({ ...prev, photoURL: reader.result as string }));
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="p-5 pb-32 animate-in fade-in duration-500 min-h-screen bg-white">
      {mode === 'profile' && loggedInUser ? (
        <div className="w-full max-w-sm mx-auto animate-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center justify-between mb-8 px-1 pt-2">
                <button 
                    onClick={() => {
                        setProfileEditForm({ fullName: loggedInUser.fullName, village: loggedInUser.village, photoURL: loggedInUser.photoURL || '' });
                        setIsEditingProfile(true);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-[11px] font-black uppercase tracking-widest active:scale-95 transition-all"
                >
                    <Edit2 size={13} /> এডিট
                </button>
                <h2 className="text-[12px] font-black text-slate-400 uppercase tracking-[0.2em] flex-1 text-center">আমার ড্যাশবোর্ড</h2>
                <button 
                  onClick={handleLogout} 
                  className="flex items-center gap-1.5 px-4 py-2 bg-red-50 text-red-600 rounded-xl text-[11px] font-black uppercase tracking-widest active:scale-95 transition-all"
                >
                    লগআউট
                </button>
            </div>

            <div className="flex items-center gap-5 bg-[#F8FAFC]/60 p-6 rounded-[35px] border border-slate-50 shadow-sm mb-10 text-left">
                <div className="relative shrink-0">
                    <div className="w-16 h-16 rounded-[22px] border-[3px] border-white shadow-md overflow-hidden bg-slate-100 flex items-center justify-center text-slate-200">
                        {loggedInUser.photoURL ? <img src={loggedInUser.photoURL} className="w-full h-full object-cover" /> : <UserCircle size={45} />}
                    </div>
                    <div className="absolute -bottom-1 -right-1 p-1 bg-blue-600 text-white rounded-full shadow-lg border-[3px] border-white">
                       <ShieldCheck size={12} fill="currentColor" className="text-white" />
                    </div>
                </div>
                <div className="overflow-hidden">
                    <div className="flex items-center gap-1.5 overflow-hidden">
                        <h1 className="text-xl font-black text-slate-800 leading-tight truncate">{loggedInUser.fullName}</h1>
                        {loggedInUser.isVerified && (
                          <div className="bg-white rounded-full flex items-center justify-center shrink-0">
                             <CheckCircle2 size={16} fill="#1877F2" className="text-white shrink-0" />
                          </div>
                        )}
                    </div>
                    <p className="text-[11px] font-black text-blue-500 uppercase tracking-widest mt-1">ID: {loggedInUser.memberId}</p>
                </div>
            </div>

            <div className="space-y-4">
                <button onClick={() => navigate('/ledger')} className="w-full p-6 bg-[#0056b3] text-white rounded-[35px] flex items-center gap-5 shadow-xl active:scale-95 transition-all text-left overflow-hidden relative group">
                    <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center shrink-0 shadow-inner group-hover:bg-white/30 transition-colors"><Wallet size={28}/></div>
                    <div className="flex-1"><p className="font-black text-base uppercase tracking-[0.1em]">ডিজিটাল খাতা</p><p className="text-[11px] font-bold opacity-70 mt-1">লেনদেনের হিসাব রাখুন</p></div>
                    <ChevronRight className="opacity-30 group-hover:opacity-100 group-hover:translate-x-1 transition-all" size={24} />
                </button>
                <button onClick={() => navigate('/online-haat')} className="w-full p-6 bg-[#10B981] text-white rounded-[35px] flex items-center gap-5 shadow-xl active:scale-95 transition-all text-left overflow-hidden relative group">
                    <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center shrink-0 shadow-inner group-hover:bg-white/30 transition-colors"><ShoppingBasket size={28}/></div>
                    <div className="flex-1"><p className="font-black text-base uppercase tracking-[0.1em]">আমার পন্য</p><p className="text-[11px] font-bold opacity-70 mt-1">আপনার বিজ্ঞাপনের লিস্ট</p></div>
                    <ChevronRight className="opacity-30 group-hover:opacity-100 group-hover:translate-x-1 transition-all" size={24} />
                </button>
                <button onClick={() => navigate('/category/14')} className="w-full p-6 bg-[#3B82F6] text-white rounded-[35px] flex items-center gap-5 shadow-xl active:scale-95 transition-all text-left overflow-hidden relative group">
                    <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center shrink-0 shadow-inner group-hover:bg-white/30 transition-colors"><Newspaper size={28}/></div>
                    <div className="flex-1"><p className="font-black text-base uppercase tracking-[0.1em]">আমার সংবাদ</p><p className="text-[11px] font-bold opacity-70 mt-1">পাঠানো সংবাদের স্ট্যাটাস</p></div>
                    <ChevronRight className="opacity-30 group-hover:opacity-100 group-hover:translate-x-1 transition-all" size={24} />
                </button>
            </div>
            <div className="mt-20 flex justify-center items-center gap-6 opacity-80 pointer-events-none">
                <div className="w-12 h-12 rounded-full border-2 border-slate-100 flex items-center justify-center text-slate-300"><Plus size={20}/></div>
                <div className="px-6 py-2 rounded-full border-2 border-slate-100 font-black text-[10px] text-slate-300 uppercase">BACK</div>
                <div className="w-12 h-12 rounded-full border-2 border-slate-100 flex items-center justify-center text-slate-300"><UserIcon size={20}/></div>
            </div>
        </div>
      ) : (
        <div className="w-full max-w-sm mx-auto animate-in fade-in duration-500">
          <div className="text-center py-6">
            <h2 className="text-3xl font-black text-[#1A1A1A] tracking-tight">
              {mode === 'login' ? 'ইউজার লগইন' : mode === 'register' ? 'সদস্য নিবন্ধন' : 'পাসওয়ার্ড রিসেট'}
            </h2>
          </div>

          <div className="bg-white p-8 rounded-[45px] shadow-[0_20px_60px_rgba(0,0,0,0.06)] border border-slate-50 space-y-8">
            <div className="flex p-1.5 bg-slate-100 rounded-2xl">
              <button 
                onClick={() => { setMode('login'); setErrorMsg(''); setSuccessMsg(''); }} 
                className={`flex-1 py-3.5 rounded-xl font-black text-sm transition-all ${mode === 'login' ? 'bg-white shadow-md text-[#0056b3]' : 'text-slate-400'}`}
              >
                লগইন
              </button>
              <button 
                onClick={() => { setMode('register'); setErrorMsg(''); setSuccessMsg(''); }} 
                className={`flex-1 py-3.5 rounded-xl font-black text-sm transition-all ${mode === 'register' ? 'bg-white shadow-md text-[#0056b3]' : 'text-slate-400'}`}
              >
                নিবন্ধন
              </button>
            </div>

            {/* Notification Messages */}
            {errorMsg && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-2xl animate-in shake duration-300">
                    <p className="text-red-600 text-xs font-bold text-center leading-relaxed">{errorMsg}</p>
                </div>
            )}
            {successMsg && (
                <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl animate-in zoom-in duration-300">
                    <p className="text-emerald-600 text-xs font-bold text-center leading-relaxed">{successMsg}</p>
                </div>
            )}

            {mode === 'login' ? (
              <form onSubmit={handleLogin} className="space-y-6">
                <Field label="মোবাইল নম্বর" value={loginData.mobile} placeholder="০১xxxxxxxxx" onChange={v => setLoginData({...loginData, mobile: v})} icon={<Smartphone size={18}/>} />
                <div className="space-y-2">
                  <div className="relative">
                    <Field label="পাসওয়ার্ড" type={showPassword ? 'text' : 'password'} value={loginData.password} placeholder="******" onChange={v => setLoginData({...loginData, password: v})} icon={<Lock size={18}/>} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-10 text-slate-300 p-2">{showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}</button>
                  </div>
                  <div className="text-right pr-1">
                    <button type="button" onClick={() => { setMode('forgot'); setErrorMsg(''); setSuccessMsg(''); }} className="text-[11px] font-black text-blue-500 uppercase tracking-widest hover:underline">পাসওয়ার্ড ভুলে গেছেন?</button>
                  </div>
                </div>
                <button disabled={isSubmitting} className="w-full py-5 bg-[#0056b3] text-white font-black rounded-[25px] shadow-xl shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-center gap-2">
                    {isSubmitting ? <Loader2 className="animate-spin" /> : 'প্রবেশ করুন'}
                </button>
              </form>
            ) : mode === 'register' ? (
              <form onSubmit={handleRegister} className="space-y-4">
                <Field label="পূর্ণ নাম" value={regData.fullName} onChange={v => setRegData({...regData, fullName: v})} icon={<UserIcon size={18}/>} />
                <Field label="ইমেইল (লগইন আইডি)" value={regData.email} type="email" placeholder="example@gmail.com" onChange={v => setRegData({...regData, email: v})} icon={<Mail size={18}/>} />
                <Field label="মোবাইল নম্বর" value={regData.mobile} placeholder="০১xxxxxxxxx" onChange={v => setRegData({...regData, mobile: v})} icon={<Smartphone size={18}/>} />
                <Field label="জন্ম তারিখ *" value={regData.dob} type="date" onChange={v => setRegData({...regData, dob: v})} icon={<Calendar size={18}/>} />
                <Field label="গ্রাম" value={regData.village} onChange={v => setRegData({...regData, village: v})} icon={<MapPin size={18}/>} />
                <div className="grid grid-cols-2 gap-3">
                  <Field label="পাসওয়ার্ড" type="password" value={regData.password} onChange={v => setRegData({...regData, password: v})} />
                  <Field label="নিশ্চিত করুন" type="password" value={regData.confirmPassword} onChange={v => setRegData({...regData, confirmPassword: v})} />
                </div>
                <button disabled={isSubmitting} className="w-full py-5 bg-[#0056b3] text-white font-black rounded-[25px] shadow-xl active:scale-95 transition-all mt-4">
                  {isSubmitting ? <Loader2 className="animate-spin" /> : 'নিবন্ধন করুন'}
                </button>
              </form>
            ) : (
              <div className="space-y-8 animate-in zoom-in duration-300">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-[28px] flex items-center justify-center shadow-inner group"><Key size={36} className="group-hover:rotate-12 transition-transform duration-300" /></div>
                  <p className="text-xs font-bold text-slate-400 text-center px-4 leading-relaxed">আপনার একাউন্টের ইমেইল দিন। আমরা পাসওয়ার্ড রিসেট লিঙ্ক পাঠাবো।</p>
                </div>
                <Field label="ইমেইল এড্রেস" value={regData.email} type="email" placeholder="example@gmail.com" onChange={v => setRegData({...regData, email: v})} icon={<Mail size={18}/>} />
                <button 
                  onClick={handleResetPassword} 
                  disabled={isSubmitting}
                  className="w-full py-5 bg-[#0056b3] text-white font-black rounded-[22px] shadow-xl shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  {isSubmitting ? <Loader2 className="animate-spin" /> : 'লিঙ্ক পাঠান'}
                </button>
                <button onClick={() => { setMode('login'); setErrorMsg(''); setSuccessMsg(''); }} className="w-full py-3 text-slate-400 font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:text-blue-500 transition-colors"><ChevronLeft size={16}/> লগইনে ফিরে যান</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Profile Edit Overlay */}
      {isEditingProfile && (
        <div className="fixed inset-0 z-[200] bg-slate-900/60 backdrop-blur-md p-5 flex items-center justify-center">
            <div className="bg-white w-full max-w-sm rounded-[45px] p-8 shadow-2xl space-y-6 animate-in zoom-in duration-300 text-left">
                <div className="flex justify-between items-center border-b pb-4">
                    <h3 className="font-black text-xl text-slate-800">তথ্য পরিবর্তন করুন</h3>
                    <button onClick={()=>setIsEditingProfile(false)} className="p-2 text-slate-400 hover:text-red-500"><X size={24}/></button>
                </div>
                
                <div className="flex flex-col items-center">
                    <div className="relative">
                        <div className="w-28 h-28 rounded-[35px] bg-slate-50 border-4 border-white shadow-xl overflow-hidden flex items-center justify-center text-slate-200">
                            {profileEditForm.photoURL ? <img src={profileEditForm.photoURL} className="w-full h-full object-cover" /> : <UserIcon size={45} />}
                        </div>
                        <button type="button" onClick={() => profilePicRef.current?.click()} className="absolute bottom-0 right-0 p-3 bg-blue-600 text-white rounded-2xl shadow-xl border-4 border-white active:scale-90 transition-all"><Camera size={18} strokeWidth={3} /></button>
                        <input type="file" ref={profilePicRef} className="hidden" accept="image/*" onChange={handleProfilePhotoUpload} />
                    </div>
                </div>

                <div className="space-y-4">
                    <Field label="আপনার নাম" value={profileEditForm.fullName} onChange={v => setProfileEditForm({...profileEditForm, fullName: v})} icon={<UserIcon size={18}/>} />
                    <Field label="গ্রামের নাম" value={profileEditForm.village} onChange={v => setProfileEditForm({...profileEditForm, village: v})} icon={<MapPin size={18}/>} />
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                    <button onClick={() => setIsEditingProfile(false)} className="py-4 bg-slate-100 text-slate-500 font-black rounded-[22px] active:scale-95 transition-all text-sm">বাতিল</button>
                    <button onClick={handleProfileSave} disabled={isSubmitting} className="py-4 bg-[#0056b3] text-white font-black rounded-[22px] shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all text-sm">
                        {isSubmitting ? <Loader2 className="animate-spin" size={18}/> : <><Save size={18}/> সেভ করুন</>}
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

const Field: React.FC<{ label: string; value: string; type?: string; placeholder?: string; onChange: (v: string) => void; icon?: React.ReactNode; readOnly?: boolean }> = ({ label, value, type = 'text', placeholder, onChange, icon, readOnly = false }) => (
  <div className="text-left w-full">
    <label className="text-[10px] font-black text-slate-400 block mb-1.5 uppercase tracking-widest pl-1">{label}</label>
    <div className="relative">
      {icon && <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300">{icon}</div>}
      <input 
        type={type} 
        placeholder={placeholder} 
        readOnly={readOnly}
        className={`w-full ${icon ? 'pl-11' : 'px-5'} py-4 rounded-[22px] bg-[#F8FAFC]/70 text-slate-800 border border-slate-200 outline-none font-bold focus:border-blue-400 transition-all shadow-inner ${readOnly ? 'opacity-60' : ''}`} 
        value={value} 
        onChange={e => onChange(e.target.value)} 
      />
    </div>
  </div>
);

export default UserAuth;
