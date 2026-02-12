
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
  FileText
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

const toBn = (num: string | number) => 
    (num || '০').toString().replace(/\d/g, d => "০১২৩৪৫৬৭৮৯"[parseInt(d)]);

interface UserAuthProps {
  onLogin: (user: AppUser | null) => void;
}

const UserAuth: React.FC<UserAuthProps> = ({ onLogin }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const profilePicRef = useRef<HTMLInputElement>(null);
  const queryParams = new URLSearchParams(location.search);
  const targetAction = queryParams.get('to');
  
  const [mode, setMode] = useState<'login' | 'register' | 'profile' | 'forgot' | 'my_haat'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  const [loggedInUser, setLoggedInUser] = useState<any | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileEditForm, setProfileEditForm] = useState({ fullName: '', village: '', photoURL: '' });
  
  const [userProducts, setUserProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<{id: string, name: string}[]>([]);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [productForm, setProductForm] = useState({
    name: '', category: '', price: '', offerPrice: '', condition: 'new', unit: 'কেজি', sellerName: '', mobile: '', location: '', description: '', photo: ''
  });

  const [loginData, setLoginData] = useState({ mobile: '', password: '' });
  const [regData, setRegData] = useState({
    fullName: '', email: '', mobile: '', dob: '', village: '', password: '', confirmPassword: ''
  });
  const [forgotEmail, setForgotEmail] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('kp_logged_in_user');
    if (saved) {
      const user = JSON.parse(saved);
      const syncUserStatus = async () => {
        try {
          const q = query(collection(dbFs, "users"), where("uid", "==", user.uid));
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
              const freshData = querySnapshot.docs[0].data();
              const syncedUser = { ...user, ...freshData };
              setLoggedInUser(syncedUser);
              localStorage.setItem('kp_logged_in_user', JSON.stringify(syncedUser));
              onLogin(syncedUser as any);
          } else {
              setLoggedInUser(user);
              onLogin(user);
          }
        } catch (e) {
          setLoggedInUser(user);
          onLogin(user);
        }
      };
      syncUserStatus();
      
      if (targetAction === 'haat') {
        setMode('my_haat');
      } else {
        setMode('profile');
      }
    }
  }, [targetAction, onLogin]);

  useEffect(() => {
    const catRef = ref(db, 'online_haat_categories');
    onValue(catRef, snap => {
      const val = snap.val();
      const list = val ? Object.keys(val).map(k => ({ id: k, name: val[k].name })) : [];
      setCategories(list);
    });
  }, []);

  useEffect(() => {
    if (loggedInUser && mode === 'my_haat') {
      const haatRef = ref(db, 'online_haat');
      onValue(haatRef, snap => {
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
      setErrorMsg('মোবাইল নম্বর এবং পাসওয়ার্ড প্রদান করুন।');
      return;
    }

    setIsSubmitting(true);
    try {
      const q = query(collection(dbFs, "users"), where("mobile", "==", cleanMobile));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        setErrorMsg('এই মোবাইল নম্বরে কোনো অ্যাকাউন্ট পাওয়া যায়নি।');
        setIsSubmitting(false);
        return;
      }

      const userData = querySnapshot.docs[0].data();
      if (userData.status === 'suspended') {
        setErrorMsg('আপনার একাউন্টটি সাসপেন্ড করা হয়েছে।');
        setIsSubmitting(false);
        return;
      }

      const userCredential = await signInWithEmailAndPassword(auth, userData.email, loginData.password);
      const finalUser = { ...userData, uid: userCredential.user.uid };
      setLoggedInUser(finalUser);
      localStorage.setItem('kp_logged_in_user', JSON.stringify(finalUser));
      onLogin(finalUser as any);
      setMode('profile');
    } catch (err: any) {
      setErrorMsg('ভুল মোবাইল নম্বর অথবা পাসওয়ার্ড।');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const { fullName, email, mobile, dob, village, password, confirmPassword } = regData;
    const cleanMobile = convertDigits(mobile);

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
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const memberId = `KP${Date.now().toString().slice(-8)}`;
      const userData = {
        uid: userCredential.user.uid,
        memberId,
        fullName,
        email,
        mobile: cleanMobile,
        dob,
        village,
        status: 'active',
        createdAt: new Date().toISOString()
      };
      
      await setDoc(doc(dbFs, "users", userCredential.user.uid), userData);
      setLoggedInUser(userData);
      localStorage.setItem('kp_logged_in_user', JSON.stringify(userData));
      onLogin(userData as any);
      setMode('profile');
    } catch (err: any) {
      setErrorMsg('নিবন্ধন ব্যর্থ হয়েছে। অন্য ইমেইল ব্যবহার করুন।');
    } finally { setIsSubmitting(false); }
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

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.name || !productForm.price || !productForm.category) {
        alert('পণ্যের নাম, ক্যাটাগরি এবং মূল্য অবশ্যই পূরণ করুন।');
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
        setProductForm({ name: '', category: categories[0]?.id || '', price: '', offerPrice: '', condition: 'new', unit: 'কেজি', sellerName: loggedInUser.fullName, mobile: loggedInUser.mobile, location: loggedInUser.village, description: '', photo: '' });
        alert('আপনার বিজ্ঞপনটি সফলভাবে প্রকাশিত হয়েছে!');
    } catch (e) { alert('সংরক্ষণ ব্যর্থ হয়েছে!'); }
    finally { setIsSubmitting(false); }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setProductForm(prev => ({ ...prev, photo: reader.result as string }));
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="p-5 pt-1 space-y-6 relative text-left">
      {mode === 'profile' && loggedInUser && (
        <div className="animate-in fade-in duration-700 space-y-4 pb-40">
            <div className="flex items-center justify-between px-3">
                <h2 className="text-base font-black text-slate-800">আমার প্রোফাইল</h2>
                <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-1.5 text-red-500 bg-red-50 rounded-xl text-[10px] font-bold border border-red-50 uppercase tracking-widest">লগআউট</button>
            </div>
            
            <div 
              onClick={() => {
                setProfileEditForm({ fullName: loggedInUser.fullName, village: loggedInUser.village, photoURL: loggedInUser.photoURL || '' });
                setIsEditingProfile(true);
              }}
              className="w-full bg-white p-6 rounded-[35px] shadow-lg border border-blue-50 flex items-center gap-5 active:scale-[0.98] transition-all cursor-pointer group relative overflow-hidden"
            >
                <div className="absolute top-4 right-4 text-slate-200 group-hover:text-blue-500 transition-colors"><Edit2 size={16} /></div>
                <div className="w-20 h-20 rounded-3xl border-[4px] border-slate-50 shadow-md overflow-hidden bg-slate-100 flex items-center justify-center text-slate-300 shrink-0">
                  {loggedInUser.photoURL ? <img src={loggedInUser.photoURL} className="w-full h-full object-cover" /> : <UserCircle size={50} />}
                </div>
                <div className="flex-1 overflow-hidden">
                  <div className="flex items-center gap-1.5 overflow-hidden">
                    <h3 className="text-xl font-black text-slate-800 leading-tight truncate group-hover:text-[#0056b3] transition-colors">{loggedInUser.fullName}</h3>
                    {loggedInUser.isVerified && (
                      <div className="bg-white rounded-full flex items-center justify-center shrink-0">
                         <CheckCircle2 size={16} fill="#1877F2" className="text-white" />
                      </div>
                    )}
                  </div>
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
        </div>
      )}

      {mode === 'my_haat' && loggedInUser && (
        <div className="animate-in slide-in-from-right-4 duration-500 pb-40 space-y-6">
           <header className="flex items-center gap-4 mb-2">
            <button onClick={() => setMode('profile')} className="p-3 bg-white border border-slate-100 rounded-xl shadow-sm transition-transform active:scale-90 shrink-0"><ChevronLeft size={24} /></button>
            <div className="flex-1 overflow-hidden">
                <h2 className="text-xl font-black text-slate-800 leading-tight">আমার পণ্য</h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">অনলাইন হাট বিজ্ঞাপন তালিকা</p>
            </div>
            <button onClick={() => { setEditingProductId(null); setProductForm({ name: '', category: categories[0]?.id || '', price: '', offerPrice: '', condition: 'new', unit: 'কেজি', sellerName: loggedInUser.fullName, mobile: loggedInUser.mobile, location: loggedInUser.village, description: '', photo: '' }); setShowProductForm(true); }} className="w-12 h-12 bg-amber-500 text-white rounded-2xl flex items-center justify-center shadow-lg active:scale-90 transition-all"><Plus size={24} strokeWidth={3} /></button>
          </header>
          <div className="grid gap-4">
             {userProducts.length === 0 ? (
               <div className="py-24 text-center opacity-30 flex flex-col items-center gap-4">
                 <ShoppingBasket size={64} className="text-slate-300" />
                 <p className="font-bold text-slate-400">আপনার কোনো বিজ্ঞাপন নেই</p>
               </div>
             ) : userProducts.map(p => (
                 <div key={p.id} className="bg-white p-4 rounded-[32px] border border-slate-100 flex items-center gap-4 shadow-sm group">
                    <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 overflow-hidden flex items-center justify-center text-slate-300 shrink-0 shadow-inner">
                        {p.photo ? <img src={p.photo} className="w-full h-full object-cover" /> : <ShoppingBasket size={24} />}
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <h4 className="font-black text-slate-800 truncate text-sm">{p.name}</h4>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{categories.find(c => c.id === p.category)?.name || 'পণ্য'}</p>
                        <p className="text-[10px] font-black text-orange-600 mt-1">
                          {p.offerPrice ? `৳ ${toBn(p.offerPrice)} (৳ ${toBn(p.price)})` : `৳ ${toBn(p.price)}`} / {p.unit}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => { setEditingProductId(p.id); setProductForm(p); setShowProductForm(true); }} className="p-3 bg-blue-50 text-blue-600 rounded-xl active:scale-90 transition-all"><Edit2 size={16}/></button>
                        <button onClick={() => { if(confirm('বিজ্ঞাপনটি মুছতে চান?')) remove(ref(db, `online_haat/${p.id}`)); }} className="p-3 bg-red-50 text-red-500 rounded-xl active:scale-90 transition-all"><Trash2 size={16}/></button>
                    </div>
                 </div>
             ))}
          </div>

          {showProductForm && (
            <div className="fixed inset-0 z-[200] bg-slate-900/60 backdrop-blur-md p-5 flex items-center justify-center overflow-hidden">
                <div className="bg-white w-full max-w-sm rounded-[45px] p-8 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto animate-in zoom-in duration-300 text-left relative">
                    <div className="flex justify-between items-center border-b pb-4 mb-2">
                        <div className="flex items-center gap-3">
                           <div className="p-2 bg-blue-50 text-blue-600 rounded-xl"><Edit2 size={20}/></div>
                           <h3 className="font-black text-xl text-slate-800">{editingProductId ? 'পণ্য সংশোধন' : 'নতুন পণ্য যোগ'}</h3>
                        </div>
                        <button onClick={()=>setShowProductForm(false)} className="p-2 text-slate-400 hover:text-red-500 transition-colors"><X size={24}/></button>
                    </div>
                    
                    <div className="flex flex-col items-center">
                        <div className="relative group w-full">
                            <div className="w-full h-44 rounded-[30px] bg-slate-50 border-2 border-dashed border-slate-200 shadow-inner overflow-hidden flex flex-col items-center justify-center text-slate-300 gap-2">
                                {productForm.photo ? (
                                    <img src={productForm.photo} className="w-full h-full object-cover" alt="Product" />
                                ) : (
                                    <>
                                        <Camera size={40} />
                                        <span className="text-[10px] font-black uppercase tracking-widest">পণ্যের ছবি আপলোড করুন</span>
                                    </>
                                )}
                            </div>
                            <button 
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute bottom-3 right-3 p-3 bg-blue-600 text-white rounded-2xl shadow-xl border-4 border-white active:scale-90 transition-all"
                            >
                                <Camera size={18} strokeWidth={3} />
                            </button>
                            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                        </div>
                    </div>

                    <div className="space-y-4 pt-2">
                        <div className="text-left">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-1.5 block">ক্যাটাগরি নির্বাচন *</label>
                            <div className="relative">
                                <select 
                                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-[22px] appearance-none font-black text-slate-800 focus:ring-2 focus:ring-blue-500 shadow-sm outline-none"
                                    value={productForm.category}
                                    onChange={(e) => setProductForm({...productForm, category: e.target.value})}
                                >
                                    <option value="" disabled>ক্যাটাগরি বেছে নিন</option>
                                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={20} />
                            </div>
                        </div>

                        <div className="text-left">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-1.5 block">পণ্যের কন্ডিশন *</label>
                            <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl">
                                <button 
                                  type="button"
                                  onClick={() => setProductForm({...productForm, condition: 'new'})}
                                  className={`flex-1 py-3 rounded-xl font-black text-xs transition-all ${productForm.condition === 'new' ? 'bg-white shadow-md text-emerald-600' : 'text-slate-400'}`}
                                >
                                  নতুন
                                </button>
                                <button 
                                  type="button"
                                  onClick={() => setProductForm({...productForm, condition: 'used'})}
                                  className={`flex-1 py-3 rounded-xl font-black text-xs transition-all ${productForm.condition === 'used' ? 'bg-white shadow-md text-orange-600' : 'text-slate-400'}`}
                                >
                                  পুরাতন
                                </button>
                            </div>
                        </div>

                        <Field label="পণ্যের নাম *" value={productForm.name} onChange={v=>setProductForm({...productForm, name:v})} placeholder="যেমন: দেশি মুরগী" icon={<ShoppingBasket size={18}/>} />
                        
                        <div className="grid grid-cols-2 gap-3">
                            <Field label="মূল্য (৳) *" value={productForm.price} onChange={v=>setProductForm({...productForm, price:v})} placeholder="৳ ০০" type="number" />
                            <Field label="অফার মূল্য (৳)" value={productForm.offerPrice} onChange={v=>setProductForm({...productForm, offerPrice:v})} placeholder="৳ ০০" type="number" />
                        </div>
                        <Field label="একক (যেমন: কেজি) *" value={productForm.unit} onChange={v=>setProductForm({...productForm, unit:v})} placeholder="কেজি / হালি" icon={<Tag size={16}/>} />

                        <div className="p-4 bg-blue-50/50 rounded-[30px] border border-blue-100 space-y-4">
                           <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] pl-1">বিক্রেতার তথ্য</p>
                           <Field label="নাম" value={productForm.sellerName} onChange={v=>setProductForm({...productForm, sellerName:v})} placeholder="নাম লিখুন" icon={<Store size={18}/>} readOnly />
                           <Field label="মোবাইল নম্বর *" value={productForm.mobile} onChange={v=>setProductForm({...productForm, mobile:v})} placeholder="০১xxxxxxxxx" icon={<Smartphone size={18}/>} readOnly />
                           <Field label="ঠিকানা" value={productForm.location} onChange={v=>setProductForm({...productForm, location:v})} placeholder="যেমন: কয়রা বাজার" icon={<MapPin size={18}/>} readOnly />
                        </div>
                        
                        <div className="text-left">
                            <label className="text-[10px] font-bold text-slate-400 block mb-1.5 uppercase tracking-wider pl-1">বিস্তারিত বিবরণ</label>
                            <textarea 
                                className="w-full p-5 bg-slate-50 border border-slate-100 rounded-[28px] font-bold outline-none text-slate-800 h-24 text-sm focus:ring-2 focus:ring-blue-500 transition-all"
                                value={productForm.description}
                                onChange={e => setProductForm({...productForm, description: e.target.value})}
                                placeholder="পণ্যের গুণাগুণ বা বিশেষত্ব লিখুন..."
                            />
                        </div>

                        <button 
                            onClick={handleProductSubmit} 
                            disabled={isSubmitting} 
                            className="w-full py-5 bg-blue-600 text-white font-black rounded-[28px] shadow-2xl mt-4 flex items-center justify-center gap-2 active:scale-95 transition-all shadow-blue-500/20 disabled:opacity-50"
                        >
                            {isSubmitting ? <Loader2 className="animate-spin" /> : (editingProductId ? 'তথ্য আপডেট করুন' : 'পণ্য পাবলিশ করুন')}
                        </button>
                    </div>
                </div>
            </div>
          )}
        </div>
      )}

      {(mode === 'login' || mode === 'register' || mode === 'forgot') && !loggedInUser && (
        <>
          <div className="text-center py-4">
            <h2 className="text-2xl font-black text-[#1A1A1A]">
              {mode === 'login' ? 'ইউজার লগইন' : mode === 'register' ? 'সদস্য নিবন্ধন' : 'পাসওয়ার্ড রিসেট'}
            </h2>
          </div>
          <div className="bg-white p-8 rounded-[40px] shadow-2xl border border-blue-50 space-y-6">
            <div className="flex p-1.5 bg-slate-100 rounded-2xl">
              <button onClick={() => setMode('login')} className={`flex-1 py-3 rounded-xl font-black text-sm transition-all ${mode === 'login' ? 'bg-white shadow-md text-[#0056b3]' : 'text-slate-400'}`}>লগইন</button>
              <button onClick={() => setMode('register')} className={`flex-1 py-3 rounded-xl font-black text-sm transition-all ${mode === 'register' ? 'bg-white shadow-md text-[#0056b3]' : 'text-slate-400'}`}>নিবন্ধন</button>
            </div>

            {mode === 'login' ? (
              <form onSubmit={handleLogin} className="space-y-5">
                <Field label="মোবাইল নম্বর" value={loginData.mobile} placeholder="০১xxxxxxxxx" onChange={v => setLoginData({...loginData, mobile: v})} icon={<Smartphone size={18}/>} />
                <div className="space-y-2">
                  <div className="relative">
                    <Field label="পাসওয়ার্ড" type={showPassword ? 'text' : 'password'} value={loginData.password} placeholder="******" onChange={v => setLoginData({...loginData, password: v})} icon={<Lock size={18}/>} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-10 text-slate-300 p-2">{showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}</button>
                  </div>
                  <div className="text-right pr-1">
                    <button type="button" onClick={() => setMode('forgot')} className="text-[10px] font-black text-blue-500 uppercase tracking-widest hover:underline transition-all">পাসওয়ার্ড ভুলে গেছেন?</button>
                  </div>
                </div>
                <button disabled={isSubmitting} className="w-full py-5 bg-[#0056b3] text-white font-black rounded-3xl shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2">
                    {isSubmitting ? <Loader2 className="animate-spin" /> : 'প্রবেশ করুন'}
                </button>
                {errorMsg && <p className="text-red-500 text-[11px] font-bold text-center">{errorMsg}</p>}
              </form>
            ) : mode === 'register' ? (
              <form onSubmit={handleRegister} className="space-y-4">
                <Field label="পূর্ণ নাম" value={regData.fullName} onChange={v => setRegData({...regData, fullName: v})} icon={<UserIcon size={18}/>} />
                <Field label="ইমেইল" value={regData.email} type="email" onChange={v => setRegData({...regData, email: v})} icon={<Mail size={18}/>} />
                <Field label="মোবাইল" value={regData.mobile} onChange={v => setRegData({...regData, mobile: v})} icon={<Smartphone size={18}/>} />
                <Field label="জন্ম তারিখ *" value={regData.dob} type="date" onChange={v => setRegData({...regData, dob: v})} icon={<Calendar size={18}/>} />
                <Field label="গ্রাম" value={regData.village} onChange={v => setRegData({...regData, village: v})} icon={<MapPin size={18}/>} />
                <div className="grid grid-cols-2 gap-3">
                  <Field label="পাসওয়ার্ড" type="password" value={regData.password} onChange={v => setRegData({...regData, password: v})} />
                  <Field label="নিশ্চিত করুন" type="password" value={regData.confirmPassword} onChange={v => setRegData({...regData, confirmPassword: v})} />
                </div>
                <button disabled={isSubmitting} className="w-full py-5 bg-[#0056b3] text-white font-black rounded-3xl active:scale-95 transition-all">নিবন্ধন করুন</button>
                {errorMsg && <p className="text-red-500 text-[11px] font-bold text-center">{errorMsg}</p>}
              </form>
            ) : (
              <div className="space-y-6 animate-in zoom-in duration-300">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center"><KeyRound size={32}/></div>
                  <p className="text-xs font-bold text-slate-400 text-center px-4">আপনার একাউন্টের ইমেইল দিন। আমরা পাসওয়ার্ড রিসেট লিঙ্ক পাঠাবো।</p>
                </div>
                <Field label="ইমেইল এড্রেস" value={forgotEmail} type="email" placeholder="example@gmail.com" onChange={setForgotEmail} icon={<Mail size={18}/>} />
                <button onClick={() => alert('সিমুলেটেড: লিঙ্ক পাঠানো হয়েছে!')} className="w-full py-5 bg-[#0056b3] text-white font-black rounded-3xl">লিঙ্ক পাঠান</button>
                <button onClick={() => setMode('login')} className="w-full py-3 text-slate-400 font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2"><ChevronLeft size={16}/> লগইনে ফিরে যান</button>
              </div>
            )}
          </div>
        </>
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
                        <button type="button" onClick={() => profilePicRef.current?.click()} className="absolute bottom-0 right-0 p-3 bg-blue-600 text-white rounded-2xl shadow-xl border-4 border-white active:scale-90 transition-all"><Camera size={18} /></button>
                        <input type="file" ref={profilePicRef} className="hidden" accept="image/*" onChange={handleProfilePhotoUpload} />
                    </div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-4">প্রোফাইল ফটো নির্বাচন করুন</p>
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
        className={`w-full ${icon ? 'pl-11' : 'px-5'} py-3.5 rounded-2xl bg-slate-50 text-slate-800 border border-slate-200 outline-none font-bold focus:border-blue-400 transition-all shadow-sm ${readOnly ? 'opacity-60' : ''}`} 
        value={value} 
        onChange={e => onChange(e.target.value)} 
      />
    </div>
  </div>
);

export default UserAuth;
