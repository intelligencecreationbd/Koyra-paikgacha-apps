
import React, { useState, useEffect, useMemo } from 'react';
import { 
  ChevronLeft, 
  Plus, 
  Trash2, 
  X, 
  Loader2, 
  ArrowDownToLine, 
  ArrowUpFromLine, 
  History, 
  MapPin,
  CheckCircle2,
  ChevronRight,
  AlertTriangle,
  Wallet,
  ArrowRightLeft,
  UserPlus,
  Users,
  Banknote,
  ChevronDown,
  Edit2,
  Save,
  User as UserIcon,
  Smartphone,
  Download
} from 'lucide-react';
import { User } from '../types';

// Firebase Imports
import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, set, onValue, remove, update } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

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
const db = getDatabase(app);

const toBn = (num: string | number) => 
  (num || '০').toString().replace(/\d/g, d => "০১২৩৪৫৬৭৮৯"[parseInt(d)]);

interface PublicLedgerProps {
  user: User;
  onBack: () => void;
}

const PublicLedger: React.FC<PublicLedgerProps> = ({ user, onBack }) => {
  const [ledgerEntries, setLedgerEntries] = useState<any[]>([]);
  // Form visibility states
  const [showLedgerForm, setShowLedgerForm] = useState(false);
  const [showDetailView, setShowDetailView] = useState(false);
  const [showPersonProfile, setShowPersonProfile] = useState(false);
  const [isEditingPerson, setIsEditingPerson] = useState(false);
  const [isAddingQuickTransaction, setIsAddingQuickTransaction] = useState(false);
  
  const [selectedEntry, setSelectedEntry] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'pabo' | 'debo' | null>(null);
  const [entryToDelete, setEntryToDelete] = useState<any | null>(null);

  const [ledgerFormData, setLedgerFormData] = useState({
    personName: '', mobile: '', address: '', type: 'pabo' as 'pabo' | 'debo', amount: ''
  });

  const [personEditForm, setPersonEditForm] = useState({
    personName: '', mobile: '', address: ''
  });

  useEffect(() => {
    if (!user) return;
    const ledgerRef = ref(db, `ledger/${user.memberId}`);
    const unsubscribe = onValue(ledgerRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.keys(data).map(key => ({ ...data[key], id: key }));
        setLedgerEntries(list.sort((a, b) => (b.lastUpdate || b.createdAt).localeCompare(a.lastUpdate || a.createdAt)));
        
        if (selectedEntry) {
          const updated = list.find(e => e.id === selectedEntry.id);
          if (updated) setSelectedEntry(updated);
        }
      }
      else setLedgerEntries([]);
    });
    return () => unsubscribe();
  }, [user, selectedEntry?.id]);

  const ledgerSummary = useMemo(() => ledgerEntries.reduce((acc, entry) => {
    if (entry.dueAmount > 0) acc.totalPabo += entry.dueAmount;
    else if (entry.dueAmount < 0) acc.totalDebo += Math.abs(entry.dueAmount);
    return acc;
  }, { totalPabo: 0, totalDebo: 0 }), [ledgerEntries]);

  const filteredEntries = useMemo(() => {
    if (!activeFilter) return ledgerEntries;
    if (activeFilter === 'pabo') return ledgerEntries.filter(e => e.dueAmount > 0);
    return ledgerEntries.filter(e => e.dueAmount < 0);
  }, [ledgerEntries, activeFilter]);

  const handleLedgerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(ledgerFormData.amount) || 0;
    if (amount <= 0) {
      alert('সঠিক টাকার পরিমাণ দিন');
      return;
    }
    
    setIsSubmitting(true);
    
    // Distinguish between adding a new person and updating selected person
    const isNewMemberAction = showLedgerForm;
    let targetEntry = isNewMemberAction ? null : selectedEntry;
    
    const currentBalance = targetEntry ? targetEntry.dueAmount : 0;
    let history = targetEntry?.history ? [...targetEntry.history] : [];
    let newBalance = currentBalance;
    
    const timestamp = new Date().toISOString();
    
    if (ledgerFormData.type === 'pabo') { 
      // Giving Money (I will get it back or it's a repayment of what I owe)
      if (currentBalance < 0) {
          // Case: I owed money (Balance < 0)
          const absoluteDebt = Math.abs(currentBalance);
          if (amount <= absoluteDebt) {
              // Entire amount is a repayment of my debt
              history.push({ date: timestamp, amount, type: 'pabo', note: 'পরিশোধ' });
          } else {
              // Amount is more than my debt
              const repaymentAmount = absoluteDebt;
              const loanGivenAmount = amount - absoluteDebt;
              // Add two entries
              history.push({ date: timestamp, amount: repaymentAmount, type: 'pabo', note: 'পরিশোধ' });
              history.push({ date: timestamp, amount: loanGivenAmount, type: 'pabo', note: 'হাওলাত দিয়েছি' });
          }
      } else {
          // Case: Balance was 0 or I was already owed money
          history.push({ date: timestamp, amount, type: 'pabo', note: 'হাওলাত দিয়েছি' });
      }
      newBalance += amount; 
    }
    else if (ledgerFormData.type === 'debo') { 
      // Taking Money (I will give it back or it's a repayment)
      if (currentBalance > 0) {
          // Case: I was owed money (Balance > 0)
          if (amount <= currentBalance) {
              // Entire amount is a repayment
              history.push({ date: timestamp, amount, type: 'debo', note: 'পরিশোধ' });
          } else {
              // Amount is more than my পাওনা
              const repaymentAmount = currentBalance;
              const loanTakenAmount = amount - currentBalance;
              // Add two entries
              history.push({ date: timestamp, amount: repaymentAmount, type: 'debo', note: 'পরিশোধ' });
              history.push({ date: timestamp, amount: loanTakenAmount, type: 'debo', note: 'হাওলাত নিয়েছি' });
          }
      } else {
          // Case: Balance was 0 or I already owed money
          history.push({ date: timestamp, amount, type: 'debo', note: 'হাওলাত নিয়েছি' });
      }
      newBalance -= amount; 
    }

    const entryId = targetEntry ? targetEntry.id : Math.random().toString(36).substr(2, 9);
    
    try {
      await set(ref(db, `ledger/${user.memberId}/${entryId}`), { 
        id: entryId, 
        personName: targetEntry?.personName || ledgerFormData.personName, 
        mobile: targetEntry?.mobile || ledgerFormData.mobile, 
        address: targetEntry?.address || ledgerFormData.address, 
        dueAmount: newBalance, 
        history, 
        lastUpdate: timestamp, 
        createdAt: targetEntry?.createdAt || timestamp 
      });
      setShowLedgerForm(false);
      setIsAddingQuickTransaction(false);
      setLedgerFormData({ personName: '', mobile: '', address: '', type: 'pabo', amount: '' });
    } catch (err) { 
      alert('ত্রুটি! তথ্য সংরক্ষণ করা যায়নি।'); 
    } finally { 
      setIsSubmitting(false); 
    }
  };

  const handleUpdatePersonInfo = async () => {
    if (!selectedEntry || !user || !personEditForm.personName) return;
    setIsSubmitting(true);
    try {
      const updates = {
        personName: personEditForm.personName,
        mobile: personEditForm.mobile,
        address: personEditForm.address
      };
      await update(ref(db, `ledger/${user.memberId}/${selectedEntry.id}`), updates);
      setSelectedEntry({ ...selectedEntry, ...updates });
      setIsEditingPerson(false);
      alert('তথ্য সফলভাবে আপডেট হয়েছে।');
    } catch (e) {
      alert('আপডেট করা সম্ভব হয়নি!');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteEntry = async () => {
    if (!entryToDelete || !user) return;
    try {
      await remove(ref(db, `ledger/${user.memberId}/${entryToDelete.id}`));
      setEntryToDelete(null);
      setShowPersonProfile(false);
      setShowDetailView(false);
      setSelectedEntry(null);
    } catch (e) {
      alert('মুছে ফেলা সম্ভব হয়নি!');
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] animate-in fade-in duration-500">
      <header className="flex items-center gap-4 mb-5 shrink-0 px-1">
        <button onClick={onBack} className="p-3 bg-white border border-slate-100 rounded-2xl shadow-sm active:scale-90 transition-all"><ChevronLeft size={22} /></button>
        <div className="flex-1 text-left">
          <h2 className="text-2xl font-black text-slate-800 leading-tight">আমার লেনদেন</h2>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">ব্যক্তিগত ডিজিটাল খাতা</p>
        </div>
        <button 
          onClick={() => {
            setSelectedEntry(null); // Ensure no old member is selected when adding new
            setLedgerFormData({ personName: '', mobile: '', address: '', type: 'pabo', amount: '' });
            setShowLedgerForm(true);
          }} 
          className="w-12 h-12 bg-[#0056b3] text-white rounded-2xl flex items-center justify-center shadow-lg active:scale-90 transition-all"
        >
          <Plus size={26} strokeWidth={2.5} />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-40 space-y-5">
        <div className="grid grid-cols-2 gap-4 px-1">
          <button onClick={() => setActiveFilter(activeFilter === 'pabo' ? null : 'pabo')} className={`p-5 rounded-[32px] flex flex-col gap-1 text-left border transition-all duration-300 ${activeFilter === 'pabo' ? 'bg-emerald-500 text-white border-emerald-500 shadow-lg scale-[1.02]' : 'bg-emerald-50/60 border-emerald-100 text-emerald-800'}`}>
            <span className="text-[9px] font-black uppercase tracking-widest">দেনাদার (পাবো)</span>
            <span className="text-2xl font-black">৳ {toBn(ledgerSummary.totalPabo)}</span>
          </button>
          <button onClick={() => setActiveFilter(activeFilter === 'debo' ? null : 'debo')} className={`p-5 rounded-[32px] flex flex-col gap-1 text-left border transition-all duration-300 ${activeFilter === 'debo' ? 'bg-rose-500 text-white border-rose-500 shadow-lg scale-[1.02]' : 'bg-rose-50/60 border-rose-100 text-rose-800'}`}>
            <span className="text-[9px] font-black uppercase tracking-widest">পাওনাদার (দেবো)</span>
            <span className="text-2xl font-black">৳ {toBn(ledgerSummary.totalDebo)}</span>
          </button>
        </div>

        <div className="space-y-4 px-1">
          {filteredEntries.length === 0 ? (
            <div className="py-24 text-center opacity-30 flex flex-col items-center gap-4">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-200">
                <Wallet size={40} />
              </div>
              <p className="font-black text-slate-400 text-sm uppercase tracking-widest">কোনো লেনদেন পাওয়া যায়নি</p>
            </div>
          ) : (
            filteredEntries.map((entry) => (
              <div key={entry.id} onClick={() => { setSelectedEntry(entry); setShowDetailView(true); setIsAddingQuickTransaction(false); }} className="w-full bg-white p-6 rounded-[35px] border border-slate-100 shadow-sm flex items-center justify-between active:scale-[0.98] transition-all group">
                <div className="flex gap-4 items-center overflow-hidden">
                  <div className={`w-14 h-14 rounded-[22px] flex items-center justify-center shrink-0 shadow-sm border ${entry.dueAmount > 0 ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                    {entry.dueAmount > 0 ? <ArrowDownToLine size={24} /> : <ArrowUpFromLine size={24} />}
                  </div>
                  <div className="flex-1 overflow-hidden text-left">
                    <p className="font-black text-slate-800 text-lg truncate">{entry.personName}</p>
                    <div className="flex items-center gap-2">
                       <p className={`text-[10px] font-black uppercase ${entry.dueAmount > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                         {entry.dueAmount > 0 ? 'পাবো' : 'দেবো'} • ৳ {toBn(Math.abs(entry.dueAmount))}
                       </p>
                       <span className="text-[8px] font-bold text-slate-300 uppercase tracking-tighter">• {toBn(entry.history?.length || 0)} এন্ট্রি</span>
                    </div>
                  </div>
                </div>
                <ChevronRight size={20} className="text-slate-200 group-hover:text-blue-500 transition-colors" />
              </div>
            ))
          )}
        </div>
      </div>
      
      {/* New Member Modal */}
      {showLedgerForm && (
        <div className="fixed inset-0 z-[150] bg-slate-900/60 backdrop-blur-md flex items-end justify-center">
            <div className="bg-white w-full max-w-md rounded-t-[45px] p-8 shadow-2xl max-h-[95vh] overflow-y-auto animate-in slide-in-from-bottom duration-500 text-left no-scrollbar">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-black text-xl text-slate-800">নতুন সদস্য যোগ করুন</h3>
                    <button onClick={() => { setShowLedgerForm(false); setSelectedEntry(null); }} className="p-3 bg-slate-50 rounded-2xl text-slate-400 hover:text-red-500 transition-all active:scale-90"><X size={24}/></button>
                </div>

                <form onSubmit={handleLedgerSubmit} className="space-y-6">
                    <div className="space-y-4 animate-in fade-in duration-500">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">নাম *</label>
                            <input 
                                required
                                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-800 outline-none focus:border-blue-400 shadow-sm"
                                placeholder="সদস্যের নাম"
                                value={ledgerFormData.personName}
                                onChange={e => setLedgerFormData({...ledgerFormData, personName: e.target.value})}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">মোবাইল</label>
                                <input 
                                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-800 outline-none focus:border-blue-400 shadow-sm"
                                    placeholder="০১xxxxxxxxx"
                                    value={ledgerFormData.mobile}
                                    onChange={e => setLedgerFormData({...ledgerFormData, mobile: e.target.value})}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">ঠিকানা</label>
                                <input 
                                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-800 outline-none focus:border-blue-400 shadow-sm"
                                    placeholder="গ্রাম/ইউনিয়ন"
                                    value={ledgerFormData.address}
                                    onChange={e => setLedgerFormData({...ledgerFormData, address: e.target.value})}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">লেনদেনের ধরণ</label>
                            <div className="grid grid-cols-2 gap-2">
                                <button 
                                    type="button" 
                                    onClick={() => setLedgerFormData({...ledgerFormData, type: 'pabo'})}
                                    className={`py-3 rounded-xl text-[11px] font-black uppercase tracking-tighter transition-all border ${ledgerFormData.type === 'pabo' ? 'bg-emerald-500 text-white border-emerald-500 shadow-md' : 'bg-white text-emerald-600 border-emerald-100'}`}
                                >
                                    দিয়েছি (পাবো)
                                </button>
                                <button 
                                    type="button" 
                                    onClick={() => setLedgerFormData({...ledgerFormData, type: 'debo'})}
                                    className={`py-3 rounded-xl text-[11px] font-black uppercase tracking-tighter transition-all border ${ledgerFormData.type === 'debo' ? 'bg-rose-500 text-white border-rose-500 shadow-md' : 'bg-white text-rose-600 border-rose-100'}`}
                                >
                                    নিয়েছি (দেবো)
                                </button>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">টাকার পরিমাণ (৳) *</label>
                            <div className="relative">
                                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300"><Banknote size={20}/></div>
                                <input 
                                    required
                                    type="number"
                                    className="w-full pl-14 pr-5 py-5 bg-slate-50 border border-slate-100 rounded-3xl font-black text-xl text-slate-800 outline-none focus:border-blue-400 shadow-inner"
                                    placeholder="০.০০"
                                    value={ledgerFormData.amount}
                                    onChange={e => setLedgerFormData({...ledgerFormData, amount: e.target.value})}
                                />
                            </div>
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="w-full py-5 bg-[#0056b3] text-white font-black rounded-3xl shadow-xl shadow-blue-500/20 flex items-center justify-center gap-3 active:scale-95 transition-all disabled:opacity-50"
                    >
                        {isSubmitting ? <Loader2 className="animate-spin" /> : <><Plus size={20}/> সদস্য যোগ করুন</>}
                    </button>
                </form>
            </div>
        </div>
      )}
      
      {/* Entry Detail Modal */}
      {showDetailView && selectedEntry && (
        <div className="fixed inset-0 z-[150] bg-slate-900/60 backdrop-blur-md flex items-end justify-center">
            <div className="bg-white w-full max-w-md rounded-t-[45px] p-8 shadow-2xl max-h-[95vh] overflow-y-auto animate-in slide-in-from-bottom duration-500 text-left no-scrollbar">
                <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4 group">
                       <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm border bg-emerald-50 text-emerald-600 border-emerald-100`}>
                          <Download size={24} />
                       </div>
                       <div className="overflow-hidden">
                          <h3 className="font-black text-2xl text-slate-800 leading-tight truncate">{selectedEntry.personName}</h3>
                          <button 
                            onClick={() => {
                              setPersonEditForm({
                                personName: selectedEntry.personName,
                                mobile: selectedEntry.mobile || '',
                                address: selectedEntry.address || ''
                              });
                              setIsEditingPerson(false);
                              setShowPersonProfile(true);
                            }}
                            className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mt-0.5 hover:underline"
                          >
                            বিস্তারিত তথ্য দেখতে ক্লিক করুন
                          </button>
                       </div>
                    </div>
                    <button onClick={() => { setShowDetailView(false); setIsAddingQuickTransaction(false); setSelectedEntry(null); }} className="p-3 bg-slate-50 rounded-2xl text-slate-400 shrink-0 active:scale-90"><X size={24}/></button>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="p-5 bg-slate-50/50 rounded-[30px] border border-slate-100">
                        <p className="text-[10px] font-black text-slate-400 uppercase mb-1 tracking-widest">ব্যালেন্স</p>
                        <p className={`text-2xl font-black ${selectedEntry.dueAmount >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>৳ {toBn(Math.abs(selectedEntry.dueAmount))}</p>
                    </div>
                    <div className="p-5 bg-slate-50/50 rounded-[30px] border border-slate-100">
                        <p className="text-[10px] font-black text-slate-400 uppercase mb-1 tracking-widest">অবস্থা</p>
                        <p className={`text-2xl font-black ${selectedEntry.dueAmount >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{selectedEntry.dueAmount >= 0 ? 'পাবো' : 'দেবো'}</p>
                    </div>
                </div>

                {/* NEW TRANSACTION SECTION */}
                <div className="mt-2 mb-8">
                    {isAddingQuickTransaction ? (
                        <form onSubmit={handleLedgerSubmit} className="space-y-5 animate-in slide-in-from-bottom-2 duration-300 bg-slate-50/50 p-6 rounded-[35px] border border-slate-100">
                             <div className="flex justify-between items-center mb-1">
                                <h4 className="font-black text-sm text-slate-800 uppercase tracking-widest">নতুন এন্ট্রি</h4>
                                <button type="button" onClick={() => setIsAddingQuickTransaction(false)} className="text-slate-400"><X size={18}/></button>
                             </div>
                             
                             <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <button 
                                        type="button" 
                                        onClick={() => setLedgerFormData({...ledgerFormData, type: 'pabo'})}
                                        className={`py-4 rounded-2xl text-[11px] font-black uppercase tracking-tighter transition-all border ${ledgerFormData.type === 'pabo' ? 'bg-emerald-600 text-white border-emerald-600 shadow-md' : 'bg-white text-emerald-600 border-emerald-100'}`}
                                    >
                                        দিচ্ছি
                                    </button>
                                    <button 
                                        type="button" 
                                        onClick={() => setLedgerFormData({...ledgerFormData, type: 'debo'})}
                                        className={`py-4 rounded-2xl text-[11px] font-black uppercase tracking-tighter transition-all border ${ledgerFormData.type === 'debo' ? 'bg-rose-600 text-white border-rose-600 shadow-md' : 'bg-white text-rose-600 border-rose-100'}`}
                                    >
                                        নিচ্ছি
                                    </button>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">টাকার পরিমাণ (৳)</label>
                                    <div className="relative">
                                        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300"><Banknote size={20}/></div>
                                        <input 
                                            required
                                            autoFocus
                                            type="number"
                                            className="w-full pl-14 pr-5 py-5 bg-white border border-slate-200 rounded-[24px] font-black text-xl text-slate-800 outline-none focus:border-blue-400 shadow-inner"
                                            placeholder="০.০০"
                                            value={ledgerFormData.amount}
                                            onChange={e => setLedgerFormData({...ledgerFormData, amount: e.target.value})}
                                        />
                                    </div>
                                </div>
                                
                                <button 
                                    type="submit" 
                                    disabled={isSubmitting}
                                    className="w-full py-5 bg-blue-600 text-white font-black rounded-3xl shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all disabled:opacity-50"
                                >
                                    {isSubmitting ? <Loader2 className="animate-spin" /> : 'লেনদেন সেভ করুন'}
                                </button>
                             </div>
                        </form>
                    ) : (
                        <button 
                            onClick={() => {
                                setLedgerFormData({
                                    personName: selectedEntry.personName,
                                    mobile: selectedEntry.mobile,
                                    address: selectedEntry.address,
                                    type: 'pabo',
                                    amount: ''
                                });
                                setIsAddingQuickTransaction(true);
                            }}
                            className="w-full py-5 bg-blue-600 text-white rounded-[28px] font-black text-base active:scale-95 transition-all shadow-xl shadow-blue-500/20 flex items-center justify-center gap-3"
                        >
                            <Plus size={22} strokeWidth={3} /> নতুন লেনদেন যোগ করুন
                        </button>
                    )}
                </div>

                {/* TRANSACTION HISTORY SECTION */}
                {!isAddingQuickTransaction && (
                    <div className="space-y-4 animate-in fade-in duration-300">
                        <div className="flex items-center gap-2 mb-2">
                           <History size={16} className="text-blue-500" />
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">লেনদেনের ইতিহাস</p>
                        </div>
                        <div className="space-y-3">
                            {(selectedEntry.history || []).slice().reverse().map((h: any, idx: number) => (
                                <div key={idx} className="flex items-center justify-between p-4 bg-white border border-slate-50 rounded-[28px] shadow-sm animate-in fade-in">
                                    <div className="flex items-center gap-4">
                                       <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${h.type === 'pabo' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                          {h.type === 'pabo' ? <Download size={18}/> : <Plus size={18} className="rotate-45" />}
                                       </div>
                                       <div>
                                          <p className="text-sm font-black text-slate-800">{h.note}</p>
                                          <p className="text-[10px] font-bold text-slate-300 uppercase tracking-tighter">{toBn(new Date(h.date).toLocaleDateString('bn-BD'))} • {toBn(new Date(h.date).toLocaleTimeString('bn-BD', {hour:'2-digit', minute:'2-digit'}))}</p>
                                       </div>
                                    </div>
                                    <p className={`font-black text-base ${h.type === 'pabo' ? 'text-emerald-600' : 'text-rose-600'}`}>৳ {toBn(h.amount)}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
      )}

      {/* Person Profile Modal */}
      {showPersonProfile && selectedEntry && (
        <div className="fixed inset-0 z-[160] bg-slate-900/60 backdrop-blur-md flex items-end justify-center">
            <div className="bg-white w-full max-w-md rounded-t-[45px] p-8 shadow-2xl max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom duration-500 text-left no-scrollbar">
                <div className="flex justify-between items-center mb-8">
                    <h3 className="font-black text-xl text-slate-800">{isEditingPerson ? 'তথ্য সংশোধন' : 'ব্যক্তিগত তথ্য'}</h3>
                    <button onClick={() => setShowPersonProfile(false)} className="p-3 bg-slate-50 rounded-2xl text-slate-400 active:scale-90"><X size={24}/></button>
                </div>

                <div className="flex flex-col items-center mb-8">
                    <div className="relative">
                        <div className="w-24 h-24 rounded-[35px] bg-slate-50 border-4 border-white shadow-xl flex items-center justify-center text-slate-200 overflow-hidden">
                            {selectedEntry.photoURL ? <img src={selectedEntry.photoURL} className="w-full h-full object-cover" /> : <UserIcon size={48} />}
                        </div>
                    </div>
                </div>

                {isEditingPerson ? (
                    <div className="space-y-5 animate-in fade-in duration-300">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">নাম *</label>
                            <input 
                                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-800 outline-none focus:border-blue-400"
                                value={personEditForm.personName}
                                onChange={e => setPersonEditForm({...personEditForm, personName: e.target.value})}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">মোবাইল নম্বর</label>
                            <input 
                                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-800 outline-none focus:border-blue-400"
                                value={personEditForm.mobile}
                                onChange={e => setPersonEditForm({...personEditForm, mobile: e.target.value})}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">ঠিকানা</label>
                            <input 
                                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-800 outline-none focus:border-blue-400"
                                value={personEditForm.address}
                                onChange={e => setPersonEditForm({...personEditForm, address: e.target.value})}
                            />
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4 animate-in fade-in duration-300">
                        <div className="p-5 bg-slate-50/50 rounded-[30px] border border-slate-100 space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-slate-400 shadow-sm"><UserIcon size={18}/></div>
                                <div>
                                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">নাম</p>
                                   <p className="text-base font-black text-slate-800">{selectedEntry.personName}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-slate-400 shadow-sm"><Smartphone size={18}/></div>
                                <div>
                                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">মোবাইল</p>
                                   <p className="text-base font-black text-slate-800 font-inter tracking-tight">{selectedEntry.mobile || 'নম্বর নেই'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-slate-400 shadow-sm"><MapPin size={18}/></div>
                                <div>
                                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">ঠিকানা</p>
                                   <p className="text-base font-black text-slate-800">{selectedEntry.address || 'ঠিকানা নেই'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="mt-10 flex gap-3 pb-6">
                    {isEditingPerson ? (
                        <>
                            <button onClick={() => setIsEditingPerson(false)} className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-sm active:scale-95 transition-all">বাতিল</button>
                            <button onClick={handleUpdatePersonInfo} disabled={isSubmitting} className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black text-sm active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2">
                                {isSubmitting ? <Loader2 className="animate-spin" size={18}/> : <><Save size={18}/> সেভ করুন</>}
                            </button>
                        </>
                    ) : (
                        <>
                            <button onClick={() => setIsEditingPerson(true)} className="flex-1 py-4 bg-blue-50 text-blue-600 border border-blue-100 rounded-2xl font-black text-sm active:scale-95 transition-all flex items-center justify-center gap-2"><Edit2 size={18}/> এডিট</button>
                            <button onClick={() => setEntryToDelete(selectedEntry)} className="flex-1 py-4 bg-red-50 text-red-500 border border-red-100 rounded-2xl font-black text-sm active:scale-95 transition-all flex items-center justify-center gap-2"><Trash2 size={18}/> মুছুন</button>
                        </>
                    )}
                </div>
            </div>
        </div>
      )}

      {entryToDelete && (
        <div className="fixed inset-0 z-[200] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-6">
            <div className="bg-white w-full max-w-xs rounded-[40px] p-8 shadow-2xl text-center space-y-6 animate-in zoom-in duration-300 border border-white/20">
                <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center text-red-500 mx-auto">
                    <AlertTriangle size={40} />
                </div>
                <div>
                    <h4 className="font-black text-xl text-slate-800">আপনি কি নিশ্চিত?</h4>
                    <p className="text-sm font-bold text-slate-400 mt-2 leading-relaxed">এই ব্যক্তির সকল লেনদেনের তথ্য চিরতরে মুছে যাবে।</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => setEntryToDelete(null)} className="py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-xs active:scale-95 transition-all">বাতিল</button>
                    <button onClick={handleDeleteEntry} className="py-4 bg-red-600 text-white rounded-2xl font-black text-xs shadow-lg active:scale-95 transition-all">হ্যাঁ, মুছুন</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default PublicLedger;
