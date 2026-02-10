
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, 
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
  CheckCircle2
} from 'lucide-react';
import { User as AppUser } from '../types';

// Firebase Imports
import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, doc, setDoc, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  sendEmailVerification, 
  sendPasswordResetEmail,
  signOut
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

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
const auth = getAuth(app);
auth.languageCode = 'bn'; 

interface UserAuthProps {
  onLogin: (user: AppUser | null) => void;
}

const UserAuth: React.FC<UserAuthProps> = ({ onLogin }) => {
  const navigate = useNavigate();
  
  const [mode, setMode] = useState<'login' | 'register' | 'profile' | 'forgot'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  const [loggedInUser, setLoggedInUser] = useState<any | null>(null);
  
  // Forms
  const [loginData, setLoginData] = useState({ mobile: '', password: '' });
  const [regData, setRegData] = useState({
    fullName: '', email: '', mobile: '', village: '', password: '', confirmPassword: ''
  });
  const [forgotEmail, setForgotEmail] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('kp_logged_in_user');
    if (saved) {
      const user = JSON.parse(saved);
      setLoggedInUser(user);
      setMode('profile');
      onLogin(user);
    }
  }, []);

  const convertDigits = (str: string) => {
    const bn = ['০','১','২','৩','৪','৫','৬','৭','৮','৯'];
    const en = ['0','1','2','3','4','5','6','7','8','9'];
    return str.toString().replace(/[০-৯]/g, (s) => en[bn.indexOf(s)]).replace(/[^0-9]/g, '');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const cleanMobile = convertDigits(loginData.mobile);
    if (!cleanMobile || !loginData.password) {
      setErrorMsg('মোবাইল নম্বর এবং পাসওয়ার্ড প্রদান করুন।');
      return;
    }

    setIsSubmitting(true);
    try {
      const q = query(collection(db, "users"), where("mobile", "==", cleanMobile));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        setErrorMsg('এই মোবাইল নম্বরে কোনো অ্যাকাউন্ট পাওয়া যায়নি।');
        setIsSubmitting(false);
        return;
      }

      const userData = querySnapshot.docs[0].data();
      const userEmail = userData.email;

      if (userData.status === 'suspended') {
        setErrorMsg('আপনার একাউন্টটি সাময়িকভাবে বন্ধ রাখা হয়েছে।');
        setIsSubmitting(false);
        return;
      }

      const userCredential = await signInWithEmailAndPassword(auth, userEmail, loginData.password);
      
      const finalUser = { ...userData, uid: userCredential.user.uid };
      setLoggedInUser(finalUser);
      localStorage.setItem('kp_logged_in_user', JSON.stringify(finalUser));
      onLogin(finalUser as any);
      setMode('profile');
      
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        setErrorMsg('ভুল পাসওয়ার্ড, আবার চেষ্টা করুন।');
      } else {
        setErrorMsg('লগইন করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    const { fullName, email, mobile, village, password, confirmPassword } = regData;
    const cleanMobile = convertDigits(mobile);

    if (!fullName || !email || !cleanMobile || !village || !password) {
      setErrorMsg('সবগুলো তথ্য পূরণ করা বাধ্যতামূলক।');
      return;
    }
    if (!email.includes('@') || !email.includes('.')) {
      setErrorMsg('সঠিক ইমেইল এড্রেস প্রদান করুন।');
      return;
    }
    if (cleanMobile.length !== 11) {
      setErrorMsg('সঠিক মোবাইল নম্বর দিন।');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('পাসওয়ার্ড অমিল।');
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Check Mobile Existence
      const q = query(collection(db, "users"), where("mobile", "==", cleanMobile));
      const snap = await getDocs(q);
      if (!snap.empty) {
        setErrorMsg('এই মোবাইল নম্বরটি ইতিমধ্যে ব্যবহৃত হয়েছে।');
        setIsSubmitting(false);
        return;
      }

      // 2. Create User Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // 3. Prepare User Data for Firestore
      const memberId = `KP${Date.now().toString().slice(-8)}`;
      const userData = {
        uid: userCredential.user.uid,
        memberId,
        fullName,
        email,
        mobile: cleanMobile,
        village,
        status: 'active',
        createdAt: new Date().toISOString()
      };
      
      // 4. Save to Firestore
      await setDoc(doc(db, "users", userCredential.user.uid), userData);

      // 5. Send Verification Email using auth.currentUser
      try {
        if (auth.currentUser) {
          await sendEmailVerification(auth.currentUser);
          console.log("Verification email sent successfully.");
          setSuccessMsg('নিবন্ধন সফল! আপনার ইমেইলে একটি ভেরিফিকেশন লিঙ্ক পাঠানো হয়েছে, দয়া করে স্প্যাম ফোল্ডার চেক করুন।');
        }
      } catch (verificationError: any) {
        console.error("Verification email failed:", verificationError);
        alert(`ভেরিফিকেশন ইমেইল পাঠানো যায়নি: ${verificationError.message}`);
        setSuccessMsg('নিবন্ধন হয়েছে, কিন্তু ইমেইল পাঠানো সম্ভব হয়নি। পরে চেষ্টা করুন।');
      }
      
      // Logout after registration to force email verification awareness
      await signOut(auth);
      
      setTimeout(() => {
        setMode('login');
        setSuccessMsg('');
      }, 7000);

    } catch (err: any) {
      console.error("Registration Error:", err);
      if (err.code === 'auth/email-already-in-use') {
        setErrorMsg('এই ইমেইলটি ইতিমধ্যে নিবন্ধিত।');
      } else if (err.code === 'auth/invalid-email') {
        setErrorMsg('ইমেইল ফরম্যাট সঠিক নয়।');
      } else if (err.code === 'auth/operation-not-allowed') {
        setErrorMsg('ইমেইল/পাসওয়ার্ড সাইন-আপ বর্তমানে বন্ধ রয়েছে।');
      } else {
        alert(`রেজিস্ট্রেশনে ত্রুটি: ${err.message}`);
        setErrorMsg('নিবন্ধন করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    
    if (!forgotEmail || !forgotEmail.includes('@')) {
      setErrorMsg('সঠিক ইমেইল এড্রেস প্রদান করুন।');
      return;
    }

    setIsSubmitting(true);
    try {
      // Correct use of input email and handle error cases
      await sendPasswordResetEmail(auth, forgotEmail);
      console.log(`Password reset link sent to: ${forgotEmail}`);
      setSuccessMsg('আপনার ইমেইলে পাসওয়ার্ড রিসেট লিঙ্ক পাঠানো হয়েছে।');
      setForgotEmail('');
      setTimeout(() => {
        setMode('login');
        setSuccessMsg('');
      }, 6000);
    } catch (err: any) {
      console.error("Password Reset Error:", err);
      if (err.code === 'auth/user-not-found') {
        setErrorMsg('এই ইমেইলে কোনো অ্যাকাউন্ট পাওয়া যায়নি।');
      } else if (err.code === 'auth/too-many-requests') {
        setErrorMsg('অনেকবার চেষ্টা করা হয়েছে। কিছুক্ষণ পর ট্রাই করুন।');
      } else {
        alert(`রিসেট লিঙ্ক পাঠাতে ব্যর্থ: ${err.message}`);
        setErrorMsg('লিঙ্ক পাঠাতে সমস্যা হয়েছে। সঠিক ইমেইল দিন।');
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

  return (
    <div className="p-5 pt-1 space-y-6 animate-in slide-in-from-right-4 duration-500 relative">
      
      {mode === 'forgot' && (
        <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
          <div className="text-center">
            <h2 className="text-2xl font-black text-slate-800">পাসওয়ার্ড পুনরুদ্ধার</h2>
            <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">আপনার নিবন্ধিত ইমেইল এড্রেসটি দিন</p>
          </div>
          <div className="bg-white p-8 rounded-[40px] shadow-2xl border border-blue-50 space-y-6 text-left">
            <Field label="ইমেইল এড্রেস" value={forgotEmail} type="email" onChange={v => setForgotEmail(v)} placeholder="example@gmail.com" icon={<Mail size={18}/>} />
            <div className="space-y-3">
              <button 
                onClick={handleForgotPassword}
                disabled={isSubmitting}
                className="w-full py-5 bg-[#0056b3] text-white font-black rounded-3xl shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                {isSubmitting ? <Loader2 className="animate-spin" /> : 'লিঙ্ক পাঠান'}
              </button>
              {errorMsg && <p className="text-red-500 text-[11px] font-bold text-center px-4 animate-bounce">{errorMsg}</p>}
              {successMsg && <p className="text-green-600 text-[11px] font-black text-center px-4">{successMsg}</p>}
            </div>
            <button onClick={() => { setMode('login'); setErrorMsg(''); setSuccessMsg(''); }} className="w-full text-slate-400 font-bold text-xs uppercase tracking-widest hover:underline text-center">লগইন পেজে ফিরুন</button>
          </div>
        </div>
      )}

      {mode === 'profile' && loggedInUser && (
        <div className="animate-in fade-in duration-700 space-y-4 pb-40 text-left">
          <div className="flex items-center justify-between px-3">
            <h2 className="text-base font-black text-slate-800 tracking-tight">আমার প্রোফাইল</h2>
            <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-1.5 text-red-500 bg-red-50 rounded-xl active:scale-90 transition-all text-[10px] font-bold border border-red-50 uppercase tracking-widest">
              লগআউট
            </button>
          </div>
          <div className="w-full bg-white p-6 rounded-[35px] shadow-lg border border-blue-50 flex items-center gap-5">
            <div className="w-20 h-20 rounded-3xl border-[4px] border-slate-50 shadow-md overflow-hidden bg-slate-100 flex items-center justify-center text-slate-300">
              {loggedInUser.photoURL ? <img src={loggedInUser.photoURL} className="w-full h-full object-cover" /> : <UserCircle size={50} />}
            </div>
            <div className="flex-1 overflow-hidden">
              <h3 className="text-xl font-black text-slate-800 leading-tight truncate">{loggedInUser.fullName}</h3>
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
      )}

      {(mode === 'login' || mode === 'register') && (
        <>
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
              <form onSubmit={handleLogin} className="space-y-5 text-left">
                <Field label="মোবাইল নম্বর" value={loginData.mobile} placeholder="০১xxxxxxxxx" onChange={v => setLoginData({...loginData, mobile: convertDigits(v)})} maxLength={11} icon={<Smartphone size={18}/>} />
                <div className="relative">
                  <Field label="পাসওয়ার্ড" type={showPassword ? 'text' : 'password'} value={loginData.password} placeholder="******" onChange={v => setLoginData({...loginData, password: v})} icon={<Lock size={18}/>} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-10 text-slate-300 p-2">{showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}</button>
                </div>
                <div className="space-y-3 pt-2">
                  <button disabled={isSubmitting} className="w-full py-5 bg-[#0056b3] text-white font-black rounded-3xl shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2">
                    {isSubmitting ? <Loader2 className="animate-spin" /> : 'প্রবেশ করুন'}
                  </button>
                  {errorMsg && <p className="text-red-500 text-[11px] font-bold text-center px-4 animate-bounce">{errorMsg}</p>}
                </div>
                <div className="text-center pt-2">
                  <button type="button" onClick={() => { setMode('forgot'); setErrorMsg(''); setSuccessMsg(''); }} className="text-[11px] font-black text-blue-600 uppercase tracking-widest hover:underline opacity-70">পাসওয়ার্ড ভুলে গেছেন?</button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-4 text-left">
                <Field label="পূর্ণ নাম *" value={regData.fullName} placeholder="নাম লিখুন" onChange={v => setRegData({...regData, fullName: v})} icon={<UserIcon size={18}/>} />
                <Field label="ইমেইল এড্রেস *" value={regData.email} type="email" placeholder="example@gmail.com" onChange={v => setRegData({...regData, email: v})} icon={<Mail size={18}/>} />
                <Field label="মোবাইল নম্বর *" value={regData.mobile} maxLength={11} placeholder="০১xxxxxxxxx" onChange={v => setRegData({...regData, mobile: convertDigits(v)})} icon={<Smartphone size={18}/>} />
                <Field label="গ্রামের নাম *" value={regData.village} placeholder="গ্রামের নাম" onChange={v => setRegData({...regData, village: v})} icon={<MapPin size={18}/>} />
                <div className="grid grid-cols-2 gap-3">
                  <Field label="পাসওয়ার্ড *" type="password" value={regData.password} placeholder="******" onChange={v => setRegData({...regData, password: v})} />
                  <Field label="নিশ্চিত করুন *" type="password" value={regData.confirmPassword} placeholder="******" onChange={v => setRegData({...regData, confirmPassword: v})} />
                </div>
                <div className="space-y-3 pt-4">
                  <button disabled={isSubmitting} className="w-full py-5 bg-[#0056b3] text-white font-black rounded-3xl shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2">
                    {isSubmitting ? <Loader2 className="animate-spin" /> : 'নিবন্ধন করুন'}
                  </button>
                  {errorMsg && <p className="text-red-500 text-[11px] font-bold text-center px-4 animate-bounce">{errorMsg}</p>}
                  {successMsg && <p className="text-green-600 text-[11px] font-black text-center px-4">{successMsg}</p>}
                </div>
              </form>
            )}
          </div>
        </>
      )}
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
