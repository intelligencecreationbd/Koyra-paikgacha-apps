
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ChevronLeft, 
  Eye, 
  EyeOff, 
  Check, 
  CheckCircle2, 
  PartyPopper,
  ArrowRight,
  Loader2,
  Smartphone,
  Lock,
  Camera,
  X,
  UserCircle,
  PhoneCall,
  ShieldCheck,
  KeyRound,
  User as UserIcon,
  MapPin,
  Calendar,
  Wallet,
  Newspaper,
  Pencil,
  CreditCard
} from 'lucide-react';
import { User as AppUser } from '../types';
import CustomDateInput from '../components/CustomDateInput';

// Firebase Imports
import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc, collection, query, where, getDocs, updateDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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
const db = getFirestore(app);

interface UserAuthProps {
  onLogin: (user: AppUser | null) => void;
}

/**
 * @LOCKED_COMPONENT
 * @Section User Authentication (Login & Registration)
 * @Logic Firebase Firestore + OTP Flow + Strict Validation + BN to EN Digit Conv
 */
const UserAuth: React.FC<UserAuthProps> = ({ onLogin }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const redirectTo = queryParams.get('to');
  
  const [mode, setMode] = useState<'login' | 'register' | 'profile' | 'otp' | 'forgot' | 'reset'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  const [loggedInUser, setLoggedInUser] = useState<any | null>(null);
  const [otpValue, setOtpValue] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [pendingAction, setPendingAction] = useState<'reg' | 'forgot' | null>(null);
  
  const [loginData, setLoginData] = useState({ mobile: '', password: '' });
  const [regData, setRegData] = useState({
    fullName: '', mobile: '', dob: '', village: '', password: '', confirmPassword: ''
  });
  const [forgotMobile, setForgotMobile] = useState('');
  const [resetData, setResetData] = useState({ password: '', confirmPassword: '' });

  // Load user from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('kp_logged_in_user');
    if (saved) {
      const user = JSON.parse(saved);
      setLoggedInUser(user);
      setMode('profile');
      onLogin(user);
    }
  }, []);

  // Utility: Convert Bengali digits to English digits
  const convertDigits = (str: string) => {
    const bn = ['০','১','২','৩','৪','৫','৬','৭','৮','৯'];
    const en = ['0','1','2','3','4','5','6','7','8','9'];
    let converted = str.replace(/[০-৯]/g, (s) => en[bn.indexOf(s)]);
    return converted.replace(/[^0-9]/g, '');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!loginData.mobile || !loginData.password) {
      setErrorMsg('মোবাইল নম্বর এবং পাসওয়ার্ড প্রদান করুন।');
      return;
    }

    setIsSubmitting(true);
    try {
      const q = query(collection(db, "users"), where("mobile", "==", loginData.mobile));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const userData = querySnapshot.docs[0].data();
        if (userData.password === loginData.password) {
          if (userData.status === 'suspended') {
            setErrorMsg('আপনার একাউন্টটি সাময়িকভাবে বন্ধ রাখা হয়েছে।');
          } else {
            setLoggedInUser(userData);
            localStorage.setItem('kp_logged_in_user', JSON.stringify(userData));
            onLogin(userData as any);
            setMode('profile');
          }
        } else {
          setErrorMsg('ভুল মোবাইল নম্বর অথবা পাসওয়ার্ড, আবার চেষ্টা করুন।');
        }
      } else {
        setErrorMsg('ভুল মোবাইল নম্বর অথবা পাসওয়ার্ড, আবার চেষ্টা করুন।');
      }
    } catch (err) {
      setErrorMsg('সার্ভার সংযোগে ত্রুটি! অনুগ্রহ করে আবার চেষ্টা করুন।');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterInitiate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const { fullName, mobile, dob, village, password, confirmPassword } = regData;

    if (!fullName || !mobile || !dob || !village || !password || !confirmPassword) {
      setErrorMsg('কোনো ইনপুট ফিল্ড ফাঁকা রাখা যাবে না।');
      return;
    }
    if (mobile.length !== 11) {
      setErrorMsg('মোবাইল নম্বরটি অবশ্যই ১১ সংখ্যার হতে হবে।');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('পাসওয়ার্ড এবং নিশ্চিত করুন ফিল্ড অমিল।');
      return;
    }

    setIsSubmitting(true);
    try {
      const userRef = doc(db, "users", mobile);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        setErrorMsg('এই মোবাইল নম্বরটি দিয়ে ইতিমধ্যে নিবন্ধন করা হয়েছে।');
        setIsSubmitting(false);
        return;
      }
      
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(code);
      setPendingAction('reg');
      alert(`আপনার ওটিপি কোডটি হলো: ${code}`); // Simulated SMS
      setMode('otp');
    } catch (err) {
      setErrorMsg('রেজিস্ট্রেশন প্রক্রিয়ায় ত্রুটি হয়েছে।');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotInitiate = async () => {
    setErrorMsg('');
    if (forgotMobile.length !== 11) {
      setErrorMsg('সঠিক ১১ সংখ্যার মোবাইল নম্বর দিন।');
      return;
    }

    setIsSubmitting(true);
    try {
      const q = query(collection(db, "users"), where("mobile", "==", forgotMobile));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        setGeneratedOtp(code);
        setPendingAction('forgot');
        alert(`পাসওয়ার্ড রিসেট কোড: ${code}`);
        setMode('otp');
      } else {
        setErrorMsg('এই মোবাইল নম্বরটি ডাটাবেসে পাওয়া যায়নি।');
      }
    } catch (err) {
      setErrorMsg('ত্রুটি হয়েছে, আবার চেষ্টা করুন।');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOtpVerify = async () => {
    if (otpValue !== generatedOtp) {
      setErrorMsg('ভুল ওটিপি কোড! আবার চেষ্টা করুন।');
      return;
    }

    if (pendingAction === 'reg') {
      setIsSubmitting(true);
      try {
        const memberId = `KP${Date.now().toString().slice(-8)}`;
        const finalUser = {
          memberId,
          fullName: regData.fullName,
          mobile: regData.mobile,
          dob: regData.dob,
          village: regData.village,
          password: regData.password,
          status: 'active',
          createdAt: new Date().toISOString()
        };
        await setDoc(doc(db, "users", regData.mobile), finalUser);
        setSuccessMsg('রেজিষ্ট্রেশন সম্পন্ন, কয়রা-পাইকগাছা কমিউনিটি এপসে আপনাকে স্বাগতম।');
        setTimeout(() => {
          setSuccessMsg('');
          setMode('login');
          setRegData({ fullName: '', mobile: '', dob: '', village: '', password: '', confirmPassword: '' });
          setPendingAction(null);
        }, 2000);
      } catch (err) {
        setErrorMsg('তথ্য সেভ করতে সমস্যা হয়েছে।');
      } finally {
        setIsSubmitting(false);
      }
    } else if (pendingAction === 'forgot') {
      setMode('reset');
    }
  };

  const handlePasswordResetSave = async () => {
    setErrorMsg('');
    if (resetData.password.length < 6) {
      setErrorMsg('পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।');
      return;
    }
    if (resetData.password !== resetData.confirmPassword) {
      setErrorMsg('পাসওয়ার্ড মেলেনি।');
      return;
    }

    setIsSubmitting(true);
    try {
      await updateDoc(doc(db, "users", forgotMobile), {
        password: resetData.password
      });
      setSuccessMsg('পাসওয়ার্ড সফলভাবে আপডেট হয়েছে।');
      setTimeout(() => {
        setSuccessMsg('');
        setMode('login');
        setForgotMobile('');
        setPendingAction(null);
      }, 2000);
    } catch (err) {
      setErrorMsg('আপডেট করা সম্ভব হয়নি।');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('kp_logged_in_user');
    setLoggedInUser(null);
    setMode('login');
    onLogin(null);
  };

  // UI Components
  if (mode === 'otp') {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[70vh] animate-in zoom-in duration-500">
        <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mb-6 shadow-inner">
          <ShieldCheck size={42} />
        </div>
        <h2 className="text-2xl font-black text-slate-800 mb-2">কোড যাচাই করুন</h2>
        <p className="text-sm font-bold text-slate-400 text-center mb-8">আপনার মোবাইলে পাঠানো ৬ সংখ্যার কোডটি দিন</p>
        
        <div className="w-full max-w-xs space-y-6">
          <input 
            type="text" 
            maxLength={6}
            className="w-full text-center text-3xl font-black tracking-[0.5em] py-5 bg-slate-50 border-2 border-slate-100 rounded-3xl outline-none focus:border-blue-500 transition-all shadow-sm font-inter"
            value={otpValue}
            onChange={(e) => setOtpValue(convertDigits(e.target.value))}
          />
          <div className="space-y-3">
            <button 
              onClick={handleOtpVerify}
              disabled={otpValue.length !== 6 || isSubmitting}
              className="w-full py-5 bg-[#0056b3] text-white font-black rounded-3xl shadow-xl active:scale-95 transition-all disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="animate-spin mx-auto" /> : 'ভেরিফাই করুন'}
            </button>
            {errorMsg && <p className="text-red-500 text-[11px] font-bold text-center animate-bounce">{errorMsg}</p>}
            {successMsg && <p className="text-green-600 text-[11px] font-black text-center">{successMsg}</p>}
          </div>
          <button onClick={() => { setMode(pendingAction === 'reg' ? 'register' : 'forgot'); setErrorMsg(''); }} className="w-full text-slate-400 font-bold text-xs uppercase tracking-widest">পিছনে যান</button>
        </div>
      </div>
    );
  }

  if (mode === 'forgot') {
    return (
      <div className="p-6 space-y-6 animate-in slide-in-from-right-4 duration-500">
        <div className="text-center">
          <h2 className="text-2xl font-black text-slate-800">পাসওয়ার্ড রিসেট</h2>
          <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">আপনার রেজিস্টার্ড মোবাইল নম্বরটি দিন</p>
        </div>
        <div className="bg-white p-8 rounded-[40px] shadow-2xl border border-blue-50 space-y-6">
          <Field label="মোবাইল নম্বর" value={forgotMobile} onChange={v => setForgotMobile(convertDigits(v))} placeholder="০১xxxxxxxxx" maxLength={11} icon={<Smartphone size={18}/>} />
          <div className="space-y-3">
            <button 
              onClick={handleForgotInitiate}
              disabled={isSubmitting}
              className="w-full py-5 bg-[#0056b3] text-white font-black rounded-3xl shadow-xl active:scale-95 transition-all"
            >
              {isSubmitting ? <Loader2 className="animate-spin mx-auto" /> : 'কোড পাঠান'}
            </button>
            {errorMsg && <p className="text-red-500 text-[11px] font-bold text-center">{errorMsg}</p>}
          </div>
          <button onClick={() => setMode('login')} className="w-full text-slate-400 font-bold text-xs uppercase tracking-widest hover:underline">লগইন পেজে ফিরুন</button>
        </div>
      </div>
    );
  }

  if (mode === 'reset') {
    return (
      <div className="p-6 space-y-6 animate-in slide-in-from-bottom-4 duration-500">
        <div className="text-center">
          <h2 className="text-2xl font-black text-slate-800">নতুন পাসওয়ার্ড</h2>
          <p className="text-xs font-bold text-slate-400 mt-1">সুরক্ষার জন্য একটি শক্তিশালী পাসওয়ার্ড সেট করুন</p>
        </div>
        <div className="bg-white p-8 rounded-[40px] shadow-2xl border border-blue-50 space-y-6">
          <Field label="নতুন পাসওয়ার্ড (ন্যূনতম ৬ অক্ষর)" type="password" value={resetData.password} onChange={v => setResetData({...resetData, password: v})} placeholder="******" icon={<Lock size={18}/>} />
          <Field label="পাসওয়ার্ড নিশ্চিত করুন" type="password" value={resetData.confirmPassword} onChange={v => setResetData({...resetData, confirmPassword: v})} placeholder="******" icon={<KeyRound size={18}/>} />
          <div className="space-y-3">
            <button 
              onClick={handlePasswordResetSave}
              disabled={isSubmitting}
              className="w-full py-5 bg-green-600 text-white font-black rounded-3xl shadow-xl active:scale-95"
            >
              {isSubmitting ? <Loader2 className="animate-spin mx-auto" /> : 'পাসওয়ার্ড পরিবর্তন করুন'}
            </button>
            {errorMsg && <p className="text-red-500 text-[11px] font-bold text-center">{errorMsg}</p>}
            {successMsg && <p className="text-green-600 text-[11px] font-black text-center">{successMsg}</p>}
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'profile' && loggedInUser) {
    return (
      <div className="p-5 pt-2 animate-in fade-in duration-700 space-y-4 pb-40 text-left">
        <div className="flex items-center justify-between px-3">
          <h2 className="text-base font-black text-slate-800 tracking-tight">আমার ড্যাশবোর্ড</h2>
          <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-1.5 text-red-500 bg-red-50 rounded-xl active:scale-90 transition-all text-[10px] font-bold border border-red-50 uppercase tracking-widest">
            লগআউট
          </button>
        </div>
        <div className="w-full bg-white p-6 rounded-[35px] shadow-lg border border-blue-50 flex items-center gap-5">
          <div className="w-20 h-20 rounded-3xl border-[4px] border-slate-50 shadow-md overflow-hidden bg-slate-100 flex items-center justify-center text-slate-300">
            {loggedInUser.photoURL ? <img src={loggedInUser.photoURL} className="w-full h-full object-cover" /> : <UserCircle size={50} />}
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-black text-slate-800 leading-tight">{loggedInUser.fullName}</h3>
            <p className="text-xs font-black text-blue-600 tracking-tighter uppercase mt-1 font-inter">{loggedInUser.memberId}</p>
            <p className="text-[10px] font-bold text-slate-400 mt-0.5 uppercase tracking-widest">{loggedInUser.village}</p>
          </div>
        </div>
        <div className="grid gap-3">
          <div onClick={() => navigate('/ledger')} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex items-center gap-4 active:scale-95 transition-all cursor-pointer">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><Wallet size={24} /></div>
            <div className="flex-1">
              <h4 className="font-black text-slate-800">ডিজিটাল খাতা</h4>
              <p className="text-xs font-bold text-slate-400">আপনার লেনদেনের হিসাব রাখুন</p>
            </div>
            <ArrowRight size={20} className="text-slate-200" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-5 pt-1 space-y-6 animate-in slide-in-from-right-4 duration-500">
      <div className="text-center py-4">
        <h2 className="text-2xl font-black text-[#1A1A1A]">{mode === 'login' ? 'ইউজার লগইন' : 'সদস্য নিবন্ধন'}</h2>
        <div className="w-10 h-1 bg-[#0056b3] mx-auto mt-2 rounded-full"></div>
      </div>
      <div className="bg-white p-8 pt-3 rounded-[40px] shadow-2xl border border-blue-50 space-y-6">
        <div className="flex p-1.5 bg-slate-100 rounded-2xl">
          <button onClick={() => { setMode('login'); setErrorMsg(''); setSuccessMsg(''); }} className={`flex-1 py-3 rounded-xl font-black text-sm transition-all ${mode === 'login' ? 'bg-white shadow-md text-[#0056b3]' : 'text-slate-400'}`}>লগইন</button>
          <button onClick={() => { setMode('register'); setErrorMsg(''); setSuccessMsg(''); }} className={`flex-1 py-3 rounded-xl font-black text-sm transition-all ${mode === 'register' ? 'bg-white shadow-md text-[#0056b3]' : 'text-slate-400'}`}>নিবন্ধন</button>
        </div>
        
        {mode === 'login' ? (
          <form onSubmit={handleLogin} className="space-y-5">
            <Field label="মোবাইল নম্বর" value={loginData.mobile} placeholder="০১xxxxxxxxx" onChange={v => setLoginData({...loginData, mobile: convertDigits(v)})} maxLength={11} icon={<Smartphone size={18}/>} />
            <div className="relative">
              <Field label="পাসওয়ার্ড" type={showPassword ? 'text' : 'password'} value={loginData.password} placeholder="******" onChange={v => setLoginData({...loginData, password: v})} icon={<Lock size={18}/>} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-10 text-slate-300 p-2">{showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}</button>
            </div>
            <div className="space-y-3 pt-2">
              <button disabled={isSubmitting} className="w-full py-5 bg-[#0056b3] text-white font-black rounded-3xl shadow-xl active:scale-95 transition-all">
                {isSubmitting ? <Loader2 className="animate-spin mx-auto" /> : 'প্রবেশ করুন'}
              </button>
              {errorMsg && <p className="text-red-500 text-[11px] font-bold text-center px-4 animate-bounce">{errorMsg}</p>}
            </div>
            <div className="text-center pt-2">
              <button type="button" onClick={() => setMode('forgot')} className="text-[11px] font-black text-blue-600 uppercase tracking-widest hover:underline opacity-70">পাসওয়ার্ড ভুলে গেছেন?</button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleRegisterInitiate} className="space-y-4">
            <Field label="পূর্ণ নাম *" value={regData.fullName} placeholder="আপনার নাম লিখুন" onChange={v => setRegData({...regData, fullName: v})} icon={<UserIcon size={18}/>} />
            <Field label="মোবাইল নম্বর *" value={regData.mobile} maxLength={11} placeholder="০১xxxxxxxxx" onChange={v => setRegData({...regData, mobile: convertDigits(v)})} icon={<Smartphone size={18}/>} />
            <CustomDateInput label="জন্ম তারিখ *" value={regData.dob} onChange={v => setRegData({...regData, dob: v})} required />
            <Field label="গ্রামের নাম *" value={regData.village} placeholder="আপনার গ্রামের নাম" onChange={v => setRegData({...regData, village: v})} icon={<MapPin size={18}/>} />
            <div className="grid grid-cols-2 gap-3">
              <Field label="পাসওয়ার্ড *" type="password" value={regData.password} placeholder="******" onChange={v => setRegData({...regData, password: v})} />
              <Field label="নিশ্চিত করুন *" type="password" value={regData.confirmPassword} placeholder="******" onChange={v => setRegData({...regData, confirmPassword: v})} />
            </div>
            <div className="space-y-3 pt-4">
              <button disabled={isSubmitting} className="w-full py-5 bg-[#0056b3] text-white font-black rounded-3xl shadow-xl active:scale-95 transition-all">
                {isSubmitting ? <Loader2 className="animate-spin mx-auto" /> : 'নিবন্ধন সম্পন্ন করুন'}
              </button>
              {errorMsg && <p className="text-red-500 text-[11px] font-bold text-center px-4 animate-bounce">{errorMsg}</p>}
              {successMsg && <p className="text-green-600 text-[11px] font-black text-center px-4">{successMsg}</p>}
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

const Field: React.FC<{ label: string; value: string; type?: string; placeholder?: string; maxLength?: number; onChange: (v: string) => void; icon?: React.ReactNode }> = ({ label, value, type = 'text', placeholder, maxLength, onChange, icon }) => (
  <div className="text-left w-full">
    <label className="text-[10px] font-black text-slate-400 block mb-1.5 uppercase tracking-widest pl-1">{label}</label>
    <div className="relative">
      {icon && <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300">{icon}</div>}
      <input type={type} maxLength={maxLength} placeholder={placeholder} className={`w-full ${icon ? 'pl-11' : 'px-5'} py-3.5 rounded-2xl bg-slate-50 border border-slate-200 outline-none font-bold text-slate-800 focus:border-blue-400 transition-all shadow-sm`} value={value} onChange={e => onChange(e.target.value)} />
    </div>
  </div>
);

export default UserAuth;
