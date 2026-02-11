
import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  Search, 
  Users, 
  User as UserIcon,
  ShieldCheck,
  Smartphone,
  Hash,
  Info,
  X,
  Edit,
  Lock,
  UserX,
  UserCheck,
  Save,
  Loader2,
  MapPin,
  Eye,
  EyeOff,
  Mail,
  Calendar
} from 'lucide-react';

// Firebase Imports
import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, onSnapshot, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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

const toBn = (num: string | number) => 
    (num || '').toString().replace(/\d/g, d => "০১২৩৪৫৬৭৮৯"[parseInt(d)]);

interface StoredUser {
  uid: string;
  memberId: string;
  fullName: string;
  mobile: string;
  village: string;
  dob: string;
  status?: 'active' | 'suspended';
  photoURL?: string;
  email?: string;
  password?: string;
}

const Header: React.FC<{ title: string; onBack: () => void }> = ({ title, onBack }) => (
  <div className="flex items-center gap-4 mb-6 text-left">
    <button onClick={onBack} className="p-3 bg-white rounded-xl shadow-sm border border-slate-100 active:scale-90 transition-all">
      <ChevronLeft size={20} className="text-slate-800" />
    </button>
    <h2 className="text-2xl font-black text-slate-800 tracking-tight">{title}</h2>
  </div>
);

const AdminUserList: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [users, setUsers] = useState<StoredUser[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<StoredUser | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<StoredUser>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [showPass, setShowPass] = useState(false);

  useEffect(() => {
    const usersCollection = collection(dbFs, 'users');
    const unsubscribe = onSnapshot(usersCollection, (snapshot) => {
      const list = snapshot.docs.map(doc => ({ ...doc.data(), uid: doc.id } as StoredUser));
      setUsers(list);
      setIsLoading(false);
    }, (error) => {
      console.error("Firestore Error:", error);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const filteredUsers = users.filter(u => 
    (u.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    (u.memberId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.mobile || '').includes(searchTerm)
  );

  const handleUserClick = (u: StoredUser) => {
    setSelectedUser(u);
    setEditForm({ ...u });
    setIsEditing(false);
    setShowPass(false);
  };

  const handleUpdateStatus = async (uid: string, currentStatus: string) => {
    const newStatus = currentStatus === 'suspended' ? 'active' : 'suspended';
    try {
        const userRef = doc(dbFs, 'users', uid);
        await updateDoc(userRef, { status: newStatus });
        if (selectedUser) setSelectedUser({ ...selectedUser, status: newStatus as any });
        alert(`ইউজার সফলভাবে ${newStatus === 'suspended' ? 'সাসপেন্ড' : 'সক্রিয়'} করা হয়েছে।`);
    } catch (e) {
        alert('স্ট্যাটাস আপডেট করা সম্ভব হয়নি!');
    }
  };

  const handleSaveEdits = async () => {
    if (!selectedUser?.uid) return;
    setIsSaving(true);
    try {
        const userRef = doc(dbFs, 'users', selectedUser.uid);
        await updateDoc(userRef, editForm);
        setSelectedUser({ ...selectedUser, ...editForm } as any);
        setIsEditing(false);
        alert('ইউজারের তথ্য সফলভাবে আপডেট করা হয়েছে।');
    } catch (e) {
        console.error("Update error:", e);
        alert('আপডেট ব্যর্থ হয়েছে!');
    } finally {
        setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-500 text-left">
      <Header title="নিবন্ধিত ইউজার লিস্ট" onBack={onBack} />

      <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50/50 p-5 rounded-[32px] border border-blue-100 text-left shadow-sm">
              <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">মোট সদস্য</p>
              <p className="text-2xl font-black text-slate-800">{toBn(users.length)} জন</p>
          </div>
          <div className="bg-emerald-50/50 p-5 rounded-[32px] border border-emerald-100 text-left shadow-sm">
              <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">সক্রিয় ইউজার</p>
              <p className="text-2xl font-black text-slate-800">{toBn(users.filter(u => u.status !== 'suspended').length)} জন</p>
          </div>
      </div>

      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
        <input 
          className="w-full pl-12 pr-5 py-4 bg-white border border-slate-100 rounded-[22px] font-bold outline-none shadow-sm focus:border-blue-400 focus:ring-4 focus:ring-blue-50 transition-all" 
          placeholder="নাম, আইডি বা মোবাইল নম্বর..." 
          value={searchTerm} 
          onChange={e => setSearchTerm(e.target.value)} 
        />
      </div>

      <div className="space-y-3 pb-20">
        <div className="flex items-center justify-between px-2">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ফলাফল ({toBn(filteredUsers.length)})</p>
        </div>

        {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-4 opacity-20">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="font-black text-[10px] uppercase tracking-widest">লোড হচ্ছে...</p>
            </div>
        ) : filteredUsers.length === 0 ? (
            <div className="py-20 text-center opacity-30 flex flex-col items-center gap-4">
                <Users size={48} className="text-slate-300" />
                <p className="font-bold text-slate-800">কোনো ইউজার পাওয়া যায়নি</p>
            </div>
        ) : (
            filteredUsers.map((u, i) => (
                <div 
                    key={u.uid} 
                    onClick={() => handleUserClick(u)}
                    className={`w-full flex items-center gap-4 p-4 bg-white border rounded-[30px] shadow-sm animate-in fade-in duration-300 group hover:border-blue-300 active:scale-[0.98] transition-all ${u.status === 'suspended' ? 'border-red-100 bg-red-50/10' : 'border-slate-50'}`}
                >
                    <div className="w-8 h-8 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center font-black text-[10px] shrink-0 border border-slate-100">
                        {toBn(i + 1)}
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 overflow-hidden flex items-center justify-center text-slate-300 shrink-0 shadow-sm">
                        {u.photoURL ? <img src={u.photoURL} className="w-full h-full object-cover" alt="" /> : <UserIcon size={24} />}
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <h4 className="font-black text-slate-800 truncate leading-tight">{u.fullName}</h4>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] font-black text-slate-700 font-inter">{u.mobile}</span>
                            {u.status === 'suspended' && <span className="px-1.5 py-0.5 bg-red-100 text-red-600 text-[8px] font-black rounded uppercase">সাসপেন্ড</span>}
                        </div>
                    </div>
                    <div className="shrink-0 text-slate-300 group-hover:text-blue-500 transition-colors">
                        <ChevronLeft className="rotate-180" size={18} />
                    </div>
                </div>
            ))
        )}
      </div>

      {/* User Detail & Edit Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-[160] bg-slate-900/70 backdrop-blur-md p-5 flex items-center justify-center">
            <div className="bg-white w-full max-w-sm rounded-[45px] p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto animate-in zoom-in duration-300 border border-white/20">
                <div className="flex justify-between items-center">
                    <h3 className="font-black text-xl text-slate-800">ইউজার প্রোফাইল</h3>
                    <div className="flex items-center gap-2">
                        {!isEditing && (
                            <button onClick={() => setIsEditing(true)} className="p-2 text-blue-600 bg-blue-50 rounded-xl active:scale-90 transition-all flex items-center gap-1.5 font-bold text-xs">
                              <Edit size={18}/> এডিট
                            </button>
                        )}
                        <button onClick={() => { setSelectedUser(null); setIsEditing(false); }} className="p-2 text-slate-400 hover:text-red-500"><X/></button>
                    </div>
                </div>

                <div className="flex flex-col items-center gap-4">
                    <div className="relative">
                        <div className="w-24 h-24 rounded-[35px] bg-slate-50 border-4 border-white shadow-xl overflow-hidden flex items-center justify-center text-slate-200">
                            {selectedUser.photoURL ? <img src={selectedUser.photoURL} className="w-full h-full object-cover" /> : <UserIcon size={40} />}
                        </div>
                        <div className={`absolute -bottom-1 -right-1 p-2 rounded-2xl shadow-lg border-4 border-white text-white ${selectedUser.status === 'suspended' ? 'bg-red-600' : 'bg-blue-600'}`}>
                            {selectedUser.status === 'suspended' ? <UserX size={14}/> : <ShieldCheck size={14}/>}
                        </div>
                    </div>
                    {!isEditing ? (
                        <div className="text-center">
                            <h4 className="text-2xl font-black text-slate-800 leading-tight">{selectedUser.fullName}</h4>
                            <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest flex items-center justify-center gap-1">
                                <MapPin size={10}/> {selectedUser.village}
                            </p>
                        </div>
                    ) : (
                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full">তথ্য সংশোধন মোড</p>
                    )}
                </div>

                <div className="space-y-3">
                    {isEditing ? (
                        <div className="space-y-4 animate-in fade-in duration-300">
                            <EditInput label="ইউজারের পুরো নাম" value={editForm.fullName} onChange={v => setEditForm({...editForm, fullName: v})} icon={<UserIcon size={18}/>} />
                            <EditInput label="গ্রামের নাম" value={editForm.village} onChange={v => setEditForm({...editForm, village: v})} icon={<MapPin size={18}/>} />
                            <EditInput label="জন্ম তারিখ" value={editForm.dob} type="date" onChange={v => setEditForm({...editForm, dob: v})} icon={<Calendar size={18}/>} />
                            <EditInput label="মোবাইল নম্বর" value={editForm.mobile} onChange={v => setEditForm({...editForm, mobile: v})} icon={<Smartphone size={18}/>} />
                            <EditInput label="ইমেইল এড্রেস" value={editForm.email} onChange={v => setEditForm({...editForm, email: v})} icon={<Mail size={18}/>} />
                            
                            <div className="relative">
                                <EditInput 
                                    label="ইউজার পাসওয়ার্ড" 
                                    type={showPass ? 'text' : 'password'} 
                                    value={editForm.password || ''} 
                                    onChange={v => setEditForm({...editForm, password: v})} 
                                    icon={<Lock size={18}/>} 
                                    placeholder="নতুন পাসওয়ার্ড লিখুন"
                                />
                                <button 
                                  type="button"
                                  onClick={() => setShowPass(!showPass)} 
                                  className="absolute right-4 top-10 text-slate-400 p-1 active:scale-90 transition-all"
                                >
                                    {showPass ? <EyeOff size={18}/> : <Eye size={18}/>}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="grid gap-2 animate-in fade-in duration-300">
                            <InfoBox label="মোবাইল নম্বর" value={selectedUser.mobile} icon={<Smartphone size={18} className="text-blue-500" />} />
                            <InfoBox label="মেম্বার আইডি" value={selectedUser.memberId} icon={<Hash size={18} className="text-slate-400" />} />
                            <InfoBox label="জন্ম তারিখ" value={selectedUser.dob || 'তথ্য নেই'} icon={<Calendar size={18} className="text-pink-500" />} />
                            
                            <div className="relative group">
                                <InfoBox 
                                    label="ইউজার পাসওয়ার্ড" 
                                    value={selectedUser.password ? (showPass ? selectedUser.password : '••••••') : 'সেট করা নেই'} 
                                    icon={<Lock size={18} className="text-orange-500" />} 
                                    isPassword
                                />
                                <button 
                                  type="button"
                                  onClick={() => setShowPass(!showPass)} 
                                  className={`absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-xl transition-all active:scale-90 ${showPass ? 'bg-blue-50 text-blue-600' : 'text-slate-300 hover:text-blue-400'}`}
                                >
                                    {showPass ? <EyeOff size={18}/> : <Eye size={18}/>}
                                </button>
                            </div>
                            
                            <InfoBox label="ইমেইল" value={selectedUser.email || 'তথ্য নেই'} icon={<Mail size={18} className="text-blue-400" />} />
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 gap-3 pt-2">
                    {isEditing ? (
                        <div className="grid grid-cols-2 gap-3">
                            <button onClick={() => { setIsEditing(false); setEditForm({...selectedUser}); }} className="py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-sm active:scale-95 transition-all">বাতিল</button>
                            <button onClick={handleSaveEdits} disabled={isSaving} className="py-4 bg-[#0056b3] text-white rounded-2xl font-black text-sm active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20">
                                {isSaving ? <Loader2 size={18} className="animate-spin"/> : <><Save size={18}/> সেভ করুন</>}
                            </button>
                        </div>
                    ) : (
                        <>
                            <button 
                                onClick={() => handleUpdateStatus(selectedUser.uid, selectedUser.status || 'active')}
                                className={`w-full py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm ${selectedUser.status === 'suspended' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'}`}
                            >
                                {selectedUser.status === 'suspended' ? <><UserCheck size={18}/> একাউন্ট সক্রিয় করুন</> : <><UserX size={18}/> একাউন্ট সাসপেন্ড করুন</>}
                            </button>
                            <button 
                                onClick={() => setSelectedUser(null)}
                                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-sm active:scale-95 transition-all shadow-xl"
                            >
                                বন্ধ করুন
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

const InfoBox = ({ label, value, icon, isPassword = false }: any) => (
    <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-3xl border border-slate-100 text-left overflow-hidden hover:bg-slate-100 transition-colors">
        <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shrink-0 shadow-sm">{icon}</div>
        <div className="overflow-hidden pr-8">
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{label}</p>
            <p className={`text-sm font-black text-slate-800 truncate ${isPassword ? 'font-inter tracking-wider' : ''}`}>{value}</p>
        </div>
    </div>
);

const EditInput = ({ label, value, placeholder, onChange, icon, type = 'text' }: any) => (
    <div className="text-left w-full">
        <label className="text-[10px] font-black text-slate-400 block mb-1.5 uppercase tracking-widest pl-1">{label}</label>
        <div className="relative">
            {icon && <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300">{icon}</div>}
            <input 
                type={type}
                placeholder={placeholder}
                className={`w-full ${icon ? 'pl-11' : 'px-5'} py-3.5 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none text-slate-800 text-sm focus:border-blue-400 transition-all shadow-sm`} 
                value={value || ''} 
                onChange={e => onChange(e.target.value)} 
            />
        </div>
    </div>
);

export default AdminUserList;
