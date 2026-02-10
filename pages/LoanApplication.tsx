
import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { 
  ChevronLeft, 
  CheckCircle2, 
  Loader2, 
  HandCoins, 
  Banknote, 
  Target, 
  CalendarClock,
  ArrowRight,
  ShieldCheck,
  // Fix: Added Info to the import list from lucide-react
  Info
} from 'lucide-react';
import { User } from '../types';

// Firebase Imports
import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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

const LoanApplication: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    amount: '',
    purpose: 'ব্যবসা',
    period: '১২ মাস'
  });

  useEffect(() => {
    const saved = localStorage.getItem('kp_logged_in_user');
    if (saved) {
      setUser(JSON.parse(saved));
    }
  }, []);

  if (!localStorage.getItem('kp_logged_in_user')) {
    return <Navigate to="/auth?to=loan" />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || !user) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "loan_requests"), {
        userId: user.memberId,
        userName: user.fullName,
        userMobile: user.mobile,
        amount: formData.amount,
        purpose: formData.purpose,
        period: formData.period,
        status: 'pending',
        timestamp: new Date().toISOString()
      });
      
      setIsSuccess(true);
      setTimeout(() => navigate('/services'), 3000);
    } catch (err) {
      alert('আবেদন জমা দিতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] p-10 text-center animate-in zoom-in duration-500 bg-white">
        <div className="w-24 h-24 bg-blue-50 rounded-[35px] flex items-center justify-center text-blue-600 mb-8 shadow-xl">
          <CheckCircle2 size={56} strokeWidth={1.5} />
        </div>
        <h2 className="text-2xl font-black mb-4 text-slate-800">আবেদন সফল হয়েছে!</h2>
        <p className="text-slate-500 text-sm leading-relaxed max-w-xs mx-auto font-bold">
          আপনার লোন আবেদনটি সঠিকভাবে গ্রহণ করা হয়েছে। এডমিন প্যানেল থেকে আপনার তথ্য যাচাই করে দ্রুত যোগাযোগ করা হবে।
        </p>
        <div className="mt-12 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-400">
          <div className="w-2 h-2 rounded-full bg-blue-600 animate-ping"></div>
          হোমে ফিরে যাওয়া হচ্ছে
        </div>
      </div>
    );
  }

  return (
    <div className="p-5 pb-32 space-y-6 animate-in slide-in-from-right-4 duration-500 min-h-screen bg-white text-left">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/services')} className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100 active:scale-90 transition-all">
          <ChevronLeft size={20} className="text-slate-800" />
        </button>
        <div className="text-left">
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">লোন আবেদন</h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">সহজ শর্তে ঋণ সুবিধা</p>
        </div>
      </div>

      <div className="bg-white p-8 rounded-[45px] shadow-2xl border border-blue-50 space-y-8 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-50 rounded-full opacity-50 blur-3xl"></div>
        
        <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-[28px] border border-slate-100 shadow-inner">
           <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-sm shrink-0">
             <ShieldCheck size={24} />
           </div>
           <div className="overflow-hidden">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">আবেদনকারী</p>
              <p className="font-black text-slate-800 truncate">{user?.fullName}</p>
           </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 block mb-1.5 uppercase tracking-widest pl-1">ঋণের পরিমাণ (টাকা) *</label>
            <div className="relative">
              <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300"><Banknote size={20}/></div>
              <input 
                required
                type="number"
                placeholder="পরিমাণ লিখুন (উদাঃ ৫০০০০)"
                className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-[24px] font-black text-slate-800 outline-none focus:border-blue-400 transition-all shadow-sm"
                value={formData.amount}
                onChange={e => setFormData({...formData, amount: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 block mb-1.5 uppercase tracking-widest pl-1">ঋণের উদ্দেশ্য *</label>
            <div className="relative">
              <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300"><Target size={20}/></div>
              <select 
                className="w-full pl-14 pr-10 py-4 bg-slate-50 border border-slate-100 rounded-[24px] font-black text-slate-800 appearance-none outline-none focus:border-blue-400 transition-all shadow-sm"
                value={formData.purpose}
                onChange={e => setFormData({...formData, purpose: e.target.value})}
              >
                <option value="ব্যবসা">ব্যবসা</option>
                <option value="চিকিৎসা">চিকিৎসা</option>
                <option value="শিক্ষা">শিক্ষা</option>
                <option value="কৃষি">কৃষি</option>
              </select>
              <ArrowRight size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 rotate-90 pointer-events-none" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 block mb-1.5 uppercase tracking-widest pl-1">পরিশোধের মেয়াদ *</label>
            <div className="relative">
              <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300"><CalendarClock size={20}/></div>
              <select 
                className="w-full pl-14 pr-10 py-4 bg-slate-50 border border-slate-100 rounded-[24px] font-black text-slate-800 appearance-none outline-none focus:border-blue-400 transition-all shadow-sm"
                value={formData.period}
                onChange={e => setFormData({...formData, period: e.target.value})}
              >
                <option value="৬ মাস">৬ মাস</option>
                <option value="১২ মাস">১২ মাস</option>
                <option value="২৪ মাস">২৪ মাস</option>
              </select>
              <ArrowRight size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 rotate-90 pointer-events-none" />
            </div>
          </div>

          <button 
            type="submit"
            disabled={isSubmitting || !formData.amount}
            className="w-full py-5 bg-[#0056b3] text-white font-black rounded-[30px] shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {isSubmitting ? <Loader2 className="animate-spin" /> : (
              <>
                <HandCoins size={20} /> আবেদন সম্পন্ন করুন
              </>
            )}
          </button>
        </form>
      </div>

      <div className="p-6 bg-blue-50/30 rounded-[35px] border border-blue-50 flex items-start gap-4">
         <div className="p-3 bg-white rounded-2xl text-blue-600 shadow-sm"><Info size={20} /></div>
         <p className="text-xs font-bold text-slate-500 leading-relaxed">আপনার প্রদানকৃত তথ্যসমূহ গোপন রাখা হবে এবং শুধুমাত্র লোন প্রক্রিয়াকরণের জন্য ব্যবহৃত হবে। আবেদনের পর আপনার ফোন নম্বরটি সচল রাখুন।</p>
      </div>
    </div>
  );
};

export default LoanApplication;
