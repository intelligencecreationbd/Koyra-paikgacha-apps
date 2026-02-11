
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
  CheckCircle2,
  MessageSquare,
  ShieldAlert,
  PhoneCall,
  ShoppingBag,
  Plus,
  Trash2,
  Edit2,
  Camera,
  ShoppingBasket,
  Store,
  Tag,
  ChevronDown,
  Info,
  // Added X icon for modal close button
  X
} from 'lucide-react';
import { User as AppUser } from '../types';

// Firebase Imports
import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, doc, setDoc, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js"; // This path seems wrong in original, correcting to firestore if needed, but per prompt I use what was there
import { getDatabase, ref, onValue, set, push, remove } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  sendEmailVerification, 
  sendPasswordResetEmail,
  signOut
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore as getFs, doc as docFs, setDoc as setDocFs, collection as collectionFs, query as queryFs, where as whereFs, getDocs as getDocsFs, updateDoc as updateDocFs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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
const dbFs = getFs(app);
const db = getDatabase(app);
const auth = getAuth(app);
auth.languageCode = 'bn'; 

const toBn = (num: string | number) => 
    (num || '০').toString().replace(/\d/g, d => "০১২৩৪৫৬৭৮৯"[parseInt(d)]);

interface UserAuthProps {
  onLogin: (user: AppUser | null) => void;
}

const UserAuth: React.FC<UserAuthProps> = ({ onLogin }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const targetAction = queryParams.get('to');
  
  const [mode, setMode] = useState<'login' | 'register' | 'profile' | 'forgot' | 'my_haat'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  const [loggedInUser, setLoggedInUser] = useState<any | null>(null);
  
  // My Haat States
  const [userProducts, setUserProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<{id: string, name: string}[]>([]);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [productForm, setProductForm] = useState({
    name: '', category: '', price: '', unit: 'কেজি', sellerName: '', mobile: '', location: '', description: '', photo: ''
  });

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
      onLogin(user);
      if (targetAction === 'haat') {
        setMode('my_haat');
      } else {
        setMode('profile');
      }
    }
  }, [targetAction]);

  // Fetch Categories for Haat
  useEffect(() => {
    const catRef = ref(db, 'online_haat_categories');
    const unsubscribe = onValue(catRef, snap => {
      const val = snap.val();
      const list = val ? Object.keys(val).map(k => ({ id: k, name: val[k].name })) : [];
      setCategories(list);
      if (list.length > 0 && !productForm.category) {
        setProductForm(prev => ({ ...prev, category: list[0].id }));
      }
    });
    return () => unsubscribe();
  }, []);

  // Fetch User's Products
  useEffect(() => {
    if (loggedInUser && mode === 'my_haat') {
      const haatRef = ref(db, 'online_haat');
      const unsubscribe = onValue(haatRef, snap => {
        const val = snap.val();
        if (val) {
          const list = Object.keys(val)
            .map(k => ({ ...val[k], id: k }))
            .filter(p => p.userId === loggedInUser.memberId);
          setUserProducts(list);
        } else {
          setUserProducts([]);
        }
      });
      return () => unsubscribe();
    }
  }, [loggedInUser, mode]);

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
      setErrorMsg('মোাবাইল নম্বর এবং পাসওয়ার্ড প্রদান করুন।');
      return;
    }

    setIsSubmitting(true);
    try {
      const q = queryFs(collectionFs(dbFs, "users"), whereFs("mobile", "==", cleanMobile));
      const querySnapshot = await getDocsFs(q);
      
      if (querySnapshot.empty) {
        setErrorMsg('এই মোবাইল নম্বরে কোনো অ্যাকাউন্ট পাওয়া যায়নি।');
        setIsSubmitting(false);
        return;
      }

      const userData = querySnapshot.docs[0].data();
      const userEmail = userData.email;

      if (!userEmail) {
        setErrorMsg('আপনার অ্যাকাউন্টে কোনো ইমেইল সংযুক্ত নেই। দয়াকরে এডমিনের সাথে যোগাযোগ করুন।');
        setIsSubmitting(false);
        return;
      }

      if (userData.status === 'suspended') {
        setErrorMsg('আপনার একাউন্টটি সাসপেন্ড করা হয়েছে, দয়াকরে আমাদের হেল্প লাইনে যোগাযোগ করুন।');
        setIsSubmitting(false);
        return;
      }

      const userCredential = await signInWithEmailAndPassword(auth, userEmail, loginData.password);
      
      const finalUser = { ...userData, uid: userCredential.user.uid };
      setLoggedInUser(finalUser);
      localStorage.setItem('kp_logged_in_user', JSON.stringify(finalUser));
      onLogin(finalUser as any);
      
      if (targetAction === 'haat') {
        setMode('my_haat');
      } else {
        setMode('profile');
      }
      
    } catch (err: any) {
      setErrorMsg('ভুল মোবাইল নম্বর অথবা পাসওয়ার্ড। আবার চেষ্টা করুন।');
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
      const q = queryFs(collectionFs(dbFs, "users"), whereFs("mobile", "==", cleanMobile));
      const snap = await getDocsFs(q);
      if (!snap.empty) {
        setErrorMsg('এই মোবাইল নম্বরটি ইতিমধ্যে ব্যবহৃত হয়েছে।');
        setIsSubmitting(false);
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      const memberId = `KP${Date.now().toString().slice(-8)}`;
      const userData = {
        uid: userCredential.user.uid,
        memberId,
        fullName,
        email,
        mobile: cleanMobile,
        village,
        status: 'active',
        password, 
        createdAt: new Date().toISOString()
      };
      
      await setDocFs(docFs(dbFs, "users", userCredential.user.uid), userData);

      try {
        if (auth.currentUser) {
          await sendEmailVerification(auth.currentUser);
          setSuccessMsg('নিবন্ধন সফল! আপনার ইমেইলে একটি ভেরিফিকেশন লিঙ্ক পাঠানো হয়েছে।');
        }
      } catch (verificationError: any) {
        setSuccessMsg('নিবন্ধন হয়েছে, কিন্তু ইমেইল পাঠানো সম্ভব হয়নি।');
      }
      
      await signOut(auth);
      setTimeout(() => { setMode('login'); setSuccessMsg(''); }, 5000);

    } catch (err: any) {
      setErrorMsg('নিবন্ধন করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    } finally { setIsSubmitting(false); }
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
      await sendPasswordResetEmail(auth, forgotEmail);
      setSuccessMsg('আপনার ইমেইলে পাসওয়ার্ড রিসেট লিঙ্ক পাঠানো হয়েছে।');
      setForgotEmail('');
      setTimeout(() => { setMode('login'); setSuccessMsg(''); }, 5000);
    } catch (err: any) {
      setErrorMsg('লিঙ্ক পাঠাতে সমস্যা হয়েছে। সঠিক ইমেইল দিন।');
    } finally { setIsSubmitting(false); }
  };

  const handleLogout = async () => {
    await signOut(auth);
    localStorage.removeItem('kp_logged_in_user');
    setLoggedInUser(null);
    setMode('login');
    onLogin(null);
  };

  // Product Handlers
  const handleProductPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setProductForm(prev => ({ ...prev, photo: reader.result as string }));
      reader.readAsDataURL(file);
    }
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.name || !productForm.price || !productForm.mobile || !productForm.category) {
        alert('নাম, ক্যাটাগরি, মূল্য এবং মোবাইল নম্বর অবশ্যই পূরণ করুন');
        return;
    }
    setIsSubmitting(true);
    try {
        const id = editingProductId || push(ref(db, 'online_haat')).key;
        const finalData = { 
          ...productForm, 
          id, 
          userId: loggedInUser.memberId, 
          timestamp: new Date().toISOString() 
        };
        await set(ref(db, `online_haat/${id}`), finalData);
        setShowProductForm(false);
        setEditingProductId(null);
        setProductForm({ name: '', category: categories[0]?.id || '', price: '', unit: 'কেজি', sellerName: loggedInUser.fullName, mobile: loggedInUser.mobile, location: loggedInUser.village, description: '', photo: '' });
    } catch (e) { alert('সংরক্ষণ ব্যর্থ হয়েছে!'); }
    finally { setIsSubmitting(false); }
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm('আপনি কি এই পণ্যটি মুছে ফেলতে চান?')) {
      try {
        await remove(ref(db, `online_haat/${id}`));
      } catch (e) {
        alert('মুছে ফেলা সম্ভব হয়নি।');
      }
    }
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
              <button onClick={handleForgotPassword} disabled={isSubmitting} className="w-full py-5 bg-[#0056b3] text-white font-black rounded-3xl shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2">
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
          {loggedInUser.status === 'suspended' ? (
             <div className="bg-red-50 border border-red-100 p-10 rounded-[45px] text-center space-y-8 shadow-inner animate-in zoom-in duration-500">
                <div className="w-24 h-24 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto shadow-lg animate-pulse">
                    <ShieldAlert size={56} />
                </div>
                <div className="space-y-3">
                    <h3 className="text-2xl font-black text-red-600">একাউন্ট সীমিত</h3>
                    <p className="text-base font-bold text-slate-600 leading-relaxed">
                        আপনার একাউন্টটি সাসপেন্ড করা হয়েছে, দয়াকরে আমাদের হেল্প লাইনে যোগাযোগ করুন।
                    </p>
                </div>
                <div className="pt-4 space-y-4">
                    <button 
                        onClick={() => navigate('/hotline')}
                        className="w-full py-5 bg-red-600 text-white font-black rounded-[28px] shadow-xl shadow-red-500/30 active:scale-95 transition-all flex items-center justify-center gap-3"
                    >
                        <PhoneCall size={20} /> হেল্প লাইন (চ্যাট)
                    </button>
                    <button onClick={handleLogout} className="text-xs font-black text-slate-400 uppercase tracking-widest hover:underline">লগআউট করুন</button>
                </div>
             </div>
          ) : (
            <>
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

                    <div onClick={() => setMode('my_haat')} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex items-center gap-4 active:scale-95 transition-all cursor-pointer">
                    <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl"><ShoppingBag size={24} /></div>
                    <div className="flex-1">
                        <h4 className="font-black text-slate-800">অনলাইন হাট</h4>
                        <p className="text-xs font-bold text-slate-400">আপনার পণ্যের বিজ্ঞাপন ম্যানেজ করুন</p>
                    </div>
                    <ArrowRight size={20} className="text-slate-200" />
                    </div>
                </div>
            </>
          )}
        </div>
      )}

      {mode === 'my_haat' && loggedInUser && (
        <div className="animate-in slide-in-from-right-4 duration-500 pb-40 space-y-6 text-left">
           <header className="flex items-center gap-4 mb-2">
            <button onClick={() => setMode('profile')} className="p-3 bg-white border border-slate-100 rounded-xl shadow-sm transition-transform active:scale-90 shrink-0">
              <ChevronLeft size={24} />
            </button>
            <div className="flex-1 overflow-hidden">
                <h2 className="text-xl font-black text-slate-800 leading-tight">আমার পন্য</h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 truncate">অনলাইন হাট বিজ্ঞাপন তালিকা</p>
            </div>
            <button 
                onClick={() => {
                  setEditingProductId(null);
                  setProductForm({ name: '', category: categories[0]?.id || '', price: '', unit: 'কেজি', sellerName: loggedInUser.fullName, mobile: loggedInUser.mobile, location: loggedInUser.village, description: '', photo: '' });
                  setShowProductForm(true);
                }}
                className="w-12 h-12 bg-amber-500 text-white rounded-2xl flex items-center justify-center shadow-lg active:scale-90 transition-all"
            >
                <Plus size={24} strokeWidth={3} />
            </button>
          </header>

          <div className="grid gap-4">
             {userProducts.length === 0 ? (
               <div className="py-24 text-center opacity-30 flex flex-col items-center gap-4">
                  <ShoppingBasket size={64} className="text-slate-300" />
                  <p className="font-bold text-slate-400">আপনার কোনো পণ্য যোগ করা নেই</p>
               </div>
             ) : (
               userProducts.map(p => (
                 <div key={p.id} className="bg-white p-4 rounded-[32px] border border-slate-100 flex items-center gap-4 shadow-sm group">
                    <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 overflow-hidden flex items-center justify-center text-slate-300 shrink-0">
                        {p.photo ? <img src={p.photo} className="w-full h-full object-cover" /> : <ShoppingBasket size={24} />}
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <h4 className="font-black text-slate-800 truncate text-sm">{p.name}</h4>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          {categories.find(c => c.id === p.category)?.name || 'পণ্য'}
                        </p>
                        <p className="text-[10px] font-black text-orange-600 mt-1">৳ {toBn(p.price)} / {p.unit}</p>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => { setEditingProductId(p.id); setProductForm(p); setShowProductForm(true); }} className="p-3 bg-blue-50 text-blue-600 rounded-xl active:scale-90 transition-all">
                            <Edit2 size={16}/>
                        </button>
                        <button onClick={() => handleDeleteProduct(p.id)} className="p-3 bg-red-50 text-red-500 rounded-xl active:scale-90 transition-all">
                            <Trash2 size={16}/>
                        </button>
                    </div>
                 </div>
               ))
             )}
          </div>

          {showProductForm && (
            <div className="fixed inset-0 z-[150] bg-slate-900/60 backdrop-blur-md p-5 flex items-center justify-center">
                <div className="bg-white w-full max-w-sm rounded-[45px] p-8 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto animate-in zoom-in duration-300 text-left">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="font-black text-xl text-slate-800">{editingProductId ? 'পণ্য সংশোধন' : 'পণ্যের তথ্য প্রদান'}</h3>
                        <button onClick={()=>setShowProductForm(false)} className="p-2 text-slate-400 hover:text-red-500"><X/></button>
                    </div>
                    
                    <div className="flex flex-col items-center">
                        <div className="relative group w-full">
                            <div className="w-full h-40 rounded-[30px] bg-slate-50 border-2 border-dashed border-slate-200 shadow-inner overflow-hidden flex flex-col items-center justify-center text-slate-300 gap-2">
                                {productForm.photo ? (
                                    <img src={productForm.photo} className="w-full h-full object-cover" />
                                ) : (
                                    <>
                                        <Camera size={40} />
                                        <span className="text-[10px] font-black uppercase tracking-widest">পণ্যের ছবি দিন</span>
                                    </>
                                )}
                            </div>
                            <button 
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute bottom-2 right-2 p-3 bg-[#F1C40F] text-slate-900 rounded-2xl shadow-xl border-4 border-white active:scale-90 transition-all"
                            >
                                <Camera size={16} strokeWidth={3} />
                            </button>
                            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleProductPhotoUpload} />
                        </div>
                    </div>

                    <div className="space-y-4 pt-2">
                        <div className="text-left">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-2 block">ক্যাটাগরি</label>
                            <div className="relative">
                                <select 
                                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl appearance-none font-black text-slate-800 focus:ring-2 focus:ring-blue-500 shadow-sm outline-none"
                                    value={productForm.category}
                                    onChange={(e) => setProductForm({...productForm, category: e.target.value})}
                                >
                                    <option value="" disabled>ক্যাটাগরি নির্বাচন করুন</option>
                                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
                            </div>
                        </div>

                        <Field label="পণ্যের নাম" value={productForm.name} onChange={v=>setProductForm({...productForm, name:v})} placeholder="উদাঃ টাটকা রুই মাছ" icon={<ShoppingBasket size={18}/>} />
                        
                        <div className="grid grid-cols-2 gap-3">
                            <Field label="মূল্য (টাকা)" value={productForm.price} onChange={v=>setProductForm({...productForm, price:v})} placeholder="৳ 00" type="number" />
                            <Field label="একক" value={productForm.unit} onChange={v=>setProductForm({...productForm, unit:v})} placeholder="কেজি / হালি" />
                        </div>

                        <Field label="বিক্রেতার নাম" value={productForm.sellerName} onChange={v=>setProductForm({...productForm, sellerName:v})} placeholder="নাম লিখুন" icon={<Store size={18}/>} />
                        <Field label="মোবাইল নম্বর" value={productForm.mobile} onChange={v=>setProductForm({...productForm, mobile:v})} placeholder="০১xxxxxxxxx" icon={<Smartphone size={18}/>} />
                        <Field label="এলাকা / ঠিকানা" value={productForm.location} onChange={v=>setProductForm({...productForm, location:v})} placeholder="যেমন: কপিলমুনি বাজার" icon={<MapPin size={18}/>} />
                        
                        <div className="text-left">
                            <label className="text-[10px] font-bold text-slate-400 block mb-1.5 uppercase tracking-wider pl-1">বিস্তারিত (ঐচ্ছিক)</label>
                            <textarea 
                                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none text-slate-800 h-24 text-sm"
                                value={productForm.description}
                                onChange={e => setProductForm({...productForm, description: e.target.value})}
                                placeholder="পণ্যের গুণাগুণ সম্পর্কে লিখুন..."
                            />
                        </div>

                        <button 
                            onClick={handleProductSubmit} 
                            disabled={isSubmitting} 
                            className="w-full py-5 bg-amber-500 text-white font-black rounded-3xl shadow-lg mt-4 flex items-center justify-center gap-2 active:scale-95 transition-all"
                        >
                            {isSubmitting ? <Loader2 className="animate-spin" /> : (editingProductId ? 'পণ্য আপডেট করুন' : 'পণ্য পাবলিশ করুন')}
                        </button>
                    </div>
                </div>
            </div>
          )}
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
