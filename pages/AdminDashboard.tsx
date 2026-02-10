
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, 
  Trash2, 
  Inbox, 
  Megaphone,
  Users,
  X,
  Lock,
  ArrowRight,
  Bus,
  Search,
  Plus,
  Mail,
  ShieldAlert,
  Scale,
  Loader2,
  Camera,
  Smartphone,
  Tag,
  Building2,
  Home as HomeIcon,
  ShieldCheck,
  UserCheck,
  FolderPlus,
  User as UserIcon,
  Phone,
  Newspaper,
  ShoppingBag
} from 'lucide-react';
import { Submission, Notice, User as AppUser, HotlineContact, BusCounter, LegalServiceContact } from '../types';
import AdminHotlineMgmt from '../components/AdminHotlineMgmt';
import AdminBusMgmt from '../components/AdminBusMgmt';
import AdminLegalMgmt from '../components/AdminLegalMgmt';
import AdminDirectoryMgmt from '../components/AdminDirectoryMgmt';
import AdminNewsMgmt from '../components/AdminNewsMgmt';
import AdminHaatMgmt from '../components/AdminHaatMgmt';

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

interface AdminDashboardProps {
  submissions: Submission[];
  notices: Notice[];
  onUpdateNotices: (notices: Notice[]) => void;
  onUpdatePassword: (pass: string) => void;
  onUpdateSubmissions: (subs: Submission[]) => void;
  adminPassword: string;
}

interface StoredUser extends AppUser {
  password?: string;
}

type AdminView = 'menu' | 'users' | 'notices' | 'hotline_mgmt' | 'bus_mgmt' | 'legal_mgmt' | 'directory_mgmt' | 'news_mgmt' | 'haat_mgmt' | 'change_pass' | 'user_submissions';

const toBn = (num: string | number) => 
    (num || '').toString().replace(/\d/g, d => "০১২৩৪৫৬৭৮৯"[parseInt(d)]);

const Header: React.FC<{ title: string; onBack: () => void }> = ({ title, onBack }) => (
  <div className="flex items-center gap-4 mb-6">
    <button onClick={onBack} className="p-3 bg-white rounded-xl shadow-sm border border-slate-100 active:scale-90 transition-all">
      <ChevronLeft size={20} className="text-slate-800" />
    </button>
    <h2 className="text-2xl font-black text-slate-800 tracking-tight">{title}</h2>
  </div>
);

const MenuListItem: React.FC<{ onClick: () => void; icon: React.ReactNode; label: string; color: string; badge?: number }> = ({ onClick, icon, label, color, badge }) => (
  <button
    onClick={onClick}
    className="flex flex-row items-center gap-5 p-4 rounded-[26px] bg-white border border-slate-100 active:scale-[0.98] transition-all shadow-sm group w-full"
  >
    <div 
      className="w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110"
      style={{ backgroundColor: `${color}12`, color: color }}
    >
      {icon}
    </div>
    <div className="flex-1 flex items-center justify-between">
      <span className="text-lg font-black tracking-tight text-slate-800 text-left">{label}</span>
      <div className="flex items-center gap-2">
        {badge !== undefined && badge > 0 && (
          <div className="bg-red-500 text-white text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center">
            {badge}
          </div>
        )}
        <ArrowRight size={18} className="text-slate-300" />
      </div>
    </div>
  </button>
);

const EditField: React.FC<{ label: string; value: string; placeholder?: string; onChange: (v: string) => void; icon?: React.ReactNode; type?: string }> = ({ label, value, placeholder, onChange, icon, type = 'text' }) => (
  <div className="text-left">
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

export default function AdminDashboard({ submissions, notices, onUpdateNotices, onUpdatePassword, onUpdateSubmissions, adminPassword }: AdminDashboardProps) {
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState<AdminView>('menu');
  const [users, setUsers] = useState<StoredUser[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [newNoticeText, setNewNoticeText] = useState('');
  const [newPassInput, setNewPassInput] = useState('');

  useEffect(() => {
    let unsubs: (() => void)[] = [];
    if (currentView === 'users') {
        const usersRef = ref(db, 'users');
        unsubs.push(onValue(usersRef, (snapshot) => {
          if (snapshot.exists()) setUsers(Object.values(snapshot.val()));
        }));
    }
    return () => unsubs.forEach(fn => fn());
  }, [currentView]);

  const handleAddNotice = async () => {
    if (!newNoticeText.trim()) return;
    const id = Date.now().toString();
    const newNotice = { id, content: newNoticeText, date: new Date().toLocaleDateString() };
    try {
      await set(ref(db, `notices/${id}`), newNotice);
      setNewNoticeText('');
    } catch (e) {
      alert('নোটিশ পাবলিশ করতে সমস্যা হয়েছে!');
    }
  };

  const deleteNotice = async (id: string) => {
    try {
      await remove(ref(db, `notices/${id}`));
    } catch (e) {
      alert('মুছে ফেলা সম্ভব হয়নি।');
    }
  };

  const handlePassUpdate = () => {
    if (newPassInput.trim()) {
      onUpdatePassword(newPassInput);
      setNewPassInput('');
    } else {
      alert('দয়া করে নতুন পাসওয়ার্ড লিখুন।');
    }
  };

  return (
    <div className="p-5 pb-28 min-h-screen bg-white">
      {currentView === 'menu' && (
        <div className="space-y-6 animate-in fade-in duration-500">
          <Header title="এডমিন ড্যাশবোর্ড" onBack={() => navigate('/')} />
          <div className="flex flex-col gap-3">
            <MenuListItem onClick={() => setCurrentView('hotline_mgmt')} icon={<ShieldAlert size={26} />} label="জরুরি হটলাইন ম্যানেজমেন্ট" color="#FF4D4D" />
            <MenuListItem onClick={() => setCurrentView('directory_mgmt')} icon={<Phone size={26} />} label="মোবাইল নাম্বার ম্যানেজার" color="#673AB7" />
            <MenuListItem onClick={() => setCurrentView('news_mgmt')} icon={<Newspaper size={26} />} label="সংবাদ ম্যানেজার" color="#4CAF50" />
            <MenuListItem onClick={() => setCurrentView('haat_mgmt')} icon={<ShoppingBag size={26} />} label="অনলাইন হাট ম্যানেজার" color="#F1C40F" />
            <MenuListItem onClick={() => setCurrentView('bus_mgmt')} icon={<Bus size={26} />} label="বাস কাউন্টার ম্যানেজার" color="#E67E22" />
            <MenuListItem onClick={() => setCurrentView('legal_mgmt')} icon={<Scale size={26} />} label="আইনি সেবা ম্যানেজার" color="#2980B9" />
            <MenuListItem onClick={() => setCurrentView('users')} icon={<Users size={26} />} label="ইউজার লিস্ট" color="#2ECC71" />
            <MenuListItem onClick={() => setCurrentView('notices')} icon={<Megaphone size={26} />} label="নোটিশ" color="#FF9F43" />
            <MenuListItem onClick={() => setCurrentView('user_submissions')} icon={<Inbox size={26} />} label="তথ্য পাঠিয়েছেন" color="#E91E63" badge={submissions.length} />
            <MenuListItem onClick={() => setCurrentView('change_pass')} icon={<Lock size={26} />} label="পাসওয়ার্ড পরিবর্তন" color="#9B59B6" />
          </div>
        </div>
      )}

      {currentView === 'hotline_mgmt' && <AdminHotlineMgmt onBack={() => setCurrentView('menu')} />}
      {currentView === 'directory_mgmt' && <AdminDirectoryMgmt onBack={() => setCurrentView('menu')} />}
      {currentView === 'news_mgmt' && <AdminNewsMgmt onBack={() => setCurrentView('menu')} />}
      {currentView === 'haat_mgmt' && <AdminHaatMgmt onBack={() => setCurrentView('menu')} />}
      {currentView === 'bus_mgmt' && <AdminBusMgmt onBack={() => setCurrentView('menu')} />}
      {currentView === 'legal_mgmt' && <AdminLegalMgmt onBack={() => setCurrentView('menu')} />}
      
      {currentView === 'users' && (
        <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
          <Header title="ইউজার লিস্ট" onBack={() => setCurrentView('menu')} />
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-100 rounded-[22px] font-bold outline-none" placeholder="নাম বা আইডি দিয়ে খুঁজুন..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
          <div className="space-y-3">
            {users.filter(u => u.fullName.includes(searchTerm)).map((u, i) => (
              <div key={u.memberId} className="w-full flex items-center gap-4 p-4 bg-white border border-slate-100 rounded-[26px] text-left">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center font-black">{toBn(i + 1)}</div>
                <div className="flex-1">
                    <p className="font-black text-slate-800 leading-tight">{u.fullName}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">ID: {u.memberId} | {u.mobile}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {currentView === 'notices' && (
        <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
          <Header title="নোটিশ" onBack={() => setCurrentView('menu')} />
          <div className="bg-white p-6 rounded-[35px] border border-slate-100 shadow-sm space-y-4">
            <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 block pl-1 tracking-widest">নতুন নোটিশ যোগ করুন</label>
                <textarea className="w-full p-5 bg-slate-50 rounded-[24px] border border-slate-100 font-bold text-slate-800 outline-none focus:border-blue-400" rows={3} placeholder="নোটিশের বিস্তারিত লিখুন..." value={newNoticeText} onChange={e=>setNewNoticeText(e.target.value)} />
            </div>
            <button onClick={handleAddNotice} className="w-full py-4 bg-[#0056b3] text-white rounded-2xl font-black shadow-lg shadow-blue-500/10 active:scale-95 transition-all flex items-center justify-center gap-2">
                <Plus size={20} /> পাবলিশ করুন
            </button>
          </div>
          <div className="space-y-3">
            {notices.map(n => (
              <div key={n.id} className="bg-white p-5 rounded-[28px] border border-slate-100 flex justify-between items-start shadow-sm animate-in slide-in-from-bottom-2 duration-300">
                <div className="flex-1 pr-4">
                    <p className="font-bold text-slate-800 text-sm leading-relaxed">{n.content}</p>
                    <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-tighter">{n.date}</p>
                </div>
                <button onClick={()=>deleteNotice(n.id)} className="p-3 bg-red-50 text-red-500 rounded-xl active:scale-90 transition-all"><Trash2 size={18}/></button>
              </div>
            ))}
          </div>
        </div>
      )}

      {currentView === 'change_pass' && (
        <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
          <Header title="পাসওয়ার্ড পরিবর্তন" onBack={() => setCurrentView('menu')} />
          <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm space-y-6">
             <div className="flex flex-col items-center gap-4 mb-2">
                 <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center"><Lock size={32}/></div>
                 <p className="text-sm font-bold text-slate-400 text-center px-4 leading-relaxed">অ্যাডমিন প্যানেলের নিরাপত্তা বজায় রাখতে নিয়মিত পাসওয়ার্ড পরিবর্তন করুন।</p>
             </div>
             <EditField label="বর্তমান পাসওয়ার্ড" value={adminPassword} onChange={()=>{}} placeholder="Current Password" icon={<ShieldCheck size={18}/>} type="password" />
             <EditField label="নতুন পাসওয়ার্ড" value={newPassInput} onChange={setNewPassInput} placeholder="New Password" icon={<Lock size={18}/>} type="password" />
             <button onClick={handlePassUpdate} className="w-full py-5 bg-slate-900 text-white font-black rounded-2xl shadow-xl active:scale-95 transition-all">পাসওয়ার্ড আপডেট করুন</button>
          </div>
        </div>
      )}

      {currentView === 'user_submissions' && (
        <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
          <Header title="তথ্য পাঠিয়েছেন" onBack={() => setCurrentView('menu')} />
          <div className="space-y-3">
            {submissions.length === 0 ? (
                <div className="py-20 text-center opacity-30">কোনো আবেদন পাওয়া যায়নি।</div>
            ) : (
                submissions.map(s => (
                  <div key={s.id} className="bg-white p-5 rounded-[28px] border border-slate-100 shadow-sm space-y-3">
                    <div className="flex justify-between items-start">
                        <div className="text-left">
                            <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest">{s.type}</span>
                            <h4 className="font-black text-slate-800 mt-2">{s.mainMenu} - {s.subMenu}</h4>
                        </div>
                        <p className="text-[10px] font-bold text-slate-400">{new Date(s.timestamp).toLocaleDateString('bn-BD')}</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl text-left">
                        {s.details.map((d, i) => <p key={i} className="text-xs font-bold text-slate-600">• {d}</p>)}
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-slate-50">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">প্রেরক: {s.identity.isAnonymous ? 'গোপন' : s.identity.name}</p>
                        <button className="p-2 text-red-500 active:scale-90 transition-all"><Trash2 size={16}/></button>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
