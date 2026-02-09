
import React, { useState, useEffect, useMemo } from 'react';
import { 
  ChevronLeft, 
  Plus, 
  Trash2, 
  Info, 
  Phone, 
  X, 
  Loader2, 
  ArrowDownToLine, 
  ArrowUpFromLine, 
  History, 
  MapPin,
  UserCircle,
  Smartphone,
  CheckCircle2,
  ChevronRight,
  Clock,
  AlertTriangle,
  Wallet,
  ArrowRightLeft
} from 'lucide-react';
import { User } from '../types';

// Firebase Imports
import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, set, onValue, remove } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

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

const toBn = (num: string | number) => 
  (num || '০').toString().replace(/\d/g, d => "০১২৩৪৫৬৭৮৯"[parseInt(d)]);

const convertBnToEn = (str: string) => {
    const bn = ['০','১','২','৩','৪','৫','৬','৭','৮','৯'], en = ['0','1','2','3','4','5','6','7','8','9'];
    return (str || '').toString().split('').map(c => bn.indexOf(c) !== -1 ? en[bn.indexOf(c)] : c).join('');
};

/**
 * @LOCKED_COMPONENT
 * @Section Public Digital Ledger Service (ডিজিটাল খাতা)
 * @Status UPDATED - Removed delete button from list, available only in detail view.
 */
interface PublicLedgerProps {
  user: User;
  onBack: () => void;
}

const PublicLedger: React.FC<PublicLedgerProps> = ({ user, onBack }) => {
  const [ledgerEntries, setLedgerEntries] = useState<any[]>([]);
  const [showLedgerForm, setShowLedgerForm] = useState(false);
  const [showDetailView, setShowDetailView] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'pabo' | 'debo' | null>(null);
  const [entryToDelete, setEntryToDelete] = useState<any | null>(null);

  // Form States
  const [selectedPersonId, setSelectedPersonId] = useState<'new' | string>('new');
  const [ledgerFormData, setLedgerFormData] = useState({
    personName: '',
    mobile: '',
    address: '',
    type: 'pabo' as 'pabo' | 'debo' | 'repay',
    amount: ''
  });

  useEffect(() => {
    if (!user) return;
    const ledgerRef = ref(db, `ledger/${user.memberId}`);
    const unsubscribe = onValue(ledgerRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.keys(data).map(key => ({ ...data[key], id: key }));
        setLedgerEntries(list.sort((a, b) => (b.lastUpdate || b.createdAt).localeCompare(a.lastUpdate || a.createdAt)));
      } else {
        setLedgerEntries([]);
      }
    });
    return () => unsubscribe();
  }, [user]);

  const ledgerSummary = useMemo(() => {
    return ledgerEntries.reduce((acc, entry) => {
      if (entry.dueAmount > 0) acc.totalPabo += entry.dueAmount;
      else if (entry.dueAmount < 0) acc.totalDebo += Math.abs(entry.dueAmount);
      return acc;
    }, { totalPabo: 0, totalDebo: 0 });
  }, [ledgerEntries]);

  const filteredEntries = useMemo(() => {
    if (!activeFilter) return ledgerEntries;
    if (activeFilter === 'pabo') return ledgerEntries.filter(entry => entry.dueAmount > 0);
    return ledgerEntries.filter(entry => entry.dueAmount < 0);
  }, [ledgerEntries, activeFilter]);

  const handleLedgerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    const amount = parseFloat(ledgerFormData.amount) || 0;
    if (amount <= 0) { alert('সঠিক টাকার অংক লিখুন'); return; }

    setIsSubmitting(true);
    
    let existingEntry = selectedPersonId !== 'new' ? ledgerEntries.find(e => e.id === selectedPersonId) : null;
    const currentBalance = existingEntry ? existingEntry.dueAmount : 0;
    let history = existingEntry?.history || [];
    let newBalance = currentBalance;

    // Smart Logic for New Balance and History Splitting
    if (ledgerFormData.type === 'pabo') {
        newBalance += amount;
        history.push({ date: new Date().toISOString(), amount, type: 'pabo', note: 'হাওলাত দিয়েছি' });
    } else if (ledgerFormData.type === 'debo') {
        newBalance -= amount;
        history.push({ date: new Date().toISOString(), amount, type: 'debo', note: 'হাওলাত নিয়েছি' });
    } else if (ledgerFormData.type === 'repay') {
        // Advanced Split Logic
        if (currentBalance > 0 && amount > currentBalance) {
            // Case: Debtor pays more than they owe
            const extra = amount - currentBalance;
            history.push({ date: new Date().toISOString(), amount: currentBalance, type: 'repay', note: 'বকেয়া পরিশোধ' });
            history.push({ date: new Date().toISOString(), amount: extra, type: 'debo', note: 'অতিরিক্ত (হাওলাত নিয়েছি)' });
            newBalance = -extra;
        } else if (currentBalance < 0 && amount > Math.abs(currentBalance)) {
            // Case: Creditor is paid more than I owe them
            const absBal = Math.abs(currentBalance);
            const extra = amount - absBal;
            history.push({ date: new Date().toISOString(), amount: absBal, type: 'repay', note: 'বকেয়া পরিশোধ' });
            history.push({ date: new Date().toISOString(), amount: extra, type: 'pabo', note: 'অতিরিক্ত (হাওলাত দিয়েছি)' });
            newBalance = extra;
        } else {
            // Normal repayment
            history.push({ date: new Date().toISOString(), amount: amount, type: 'repay', note: 'পরিশোধ করা হয়েছে' });
            newBalance = currentBalance > 0 ? currentBalance - amount : currentBalance + amount;
        }
    }

    const entryId = existingEntry ? existingEntry.id : Math.random().toString(36).substr(2, 9);
    const entryData = {
      id: entryId,
      personName: existingEntry ? existingEntry.personName : ledgerFormData.personName,
      mobile: existingEntry ? existingEntry.mobile : ledgerFormData.mobile,
      address: existingEntry ? existingEntry.address : ledgerFormData.address,
      dueAmount: newBalance,
      history: history,
      lastUpdate: new Date().toISOString(),
      createdAt: existingEntry ? existingEntry.createdAt : new Date().toISOString()
    };

    try {
      await set(ref(db, `ledger/${user.memberId}/${entryId}`), entryData);
      setShowLedgerForm(false);
      setSelectedPersonId('new');
      setLedgerFormData({ personName: '', mobile: '', address: '', type: 'pabo', amount: '' });
      if (showDetailView) setSelectedEntry(entryData);
    } catch (err) {
      alert('তথ্য সংরক্ষণে সমস্যা হয়েছে!');
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDeleteEntry = async () => {
    if (!entryToDelete || !user) return;
    setIsSubmitting(true);
    try {
      await remove(ref(db, `ledger/${user.memberId}/${entryToDelete.id}`));
      setEntryToDelete(null);
      setShowDetailView(false);
      setSelectedEntry(null);
    } catch (err) {
      alert('ডিলিট করা সম্ভব হয়নি!');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openDetail = (entry: any) => {
    setSelectedEntry(entry);
    setShowDetailView(true);
  };

  return (
    <div className="animate-in fade-in duration-500">
      {/* User Info Bar */}
      <div className="flex items-center gap-3 p-3 bg-slate-50/80 border border-slate-100 rounded-[24px] mb-4 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]">
        <div className="w-11 h-11 rounded-full border-2 border-white shadow-md overflow-hidden bg-slate-100 shrink-0">
          {(user as any).photoURL ? (
            <img src={(user as any).photoURL} className="w-full h-full object-cover" alt="User" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-300">
              <UserCircle size={26} />
            </div>
          )}
        </div>
        <div className="text-left overflow-hidden">
          <p className="font-black text-slate-800 text-sm leading-tight truncate">{user.fullName}</p>
          <p className="text-[9px] font-bold text-blue-500 uppercase tracking-wider font-inter mt-0.5">{user.memberId}</p>
        </div>
      </div>

      {/* Header */}
      <header className="bg-white py-2 flex items-center gap-4 mb-5">
        <button onClick={onBack} className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-600 active:scale-90 transition-all shadow-sm">
          <ChevronLeft size={22} />
        </button>
        <div className="flex-1 text-left">
          <h2 className="text-2xl font-black text-slate-800 leading-tight">আমার লেনদেন</h2>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">ব্যক্তিগত ডিজিটাল খাতা</p>
        </div>
        <button 
          onClick={() => { setShowLedgerForm(true); setSelectedPersonId('new'); setLedgerFormData({personName: '', mobile: '', address: '', type: 'pabo', amount: ''}); }}
          className="w-12 h-12 bg-[#0056b3] text-white rounded-2xl flex items-center justify-center shadow-lg active:scale-90 transition-all border-b-4 border-[#004494]"
        >
          <Plus size={26} strokeWidth={2.5} />
        </button>
      </header>

      <div className="space-y-5">
        {/* Summary Section - Acts as Filter */}
        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={() => setActiveFilter(activeFilter === 'pabo' ? null : 'pabo')}
            className={`p-5 rounded-[32px] flex flex-col gap-1 text-left transition-all border ${activeFilter === 'pabo' ? 'bg-emerald-500 text-white border-emerald-500 shadow-xl' : 'bg-emerald-50/60 border-emerald-100 text-emerald-800'}`}
          >
            <span className={`text-[9px] font-black uppercase tracking-widest ${activeFilter === 'pabo' ? 'text-emerald-100' : 'text-emerald-600'}`}>দেনাদার (আমি পাবো)</span>
            <span className="text-2xl font-black">৳ {toBn(ledgerSummary.totalPabo)}</span>
          </button>
          <button 
            onClick={() => setActiveFilter(activeFilter === 'debo' ? null : 'debo')}
            className={`p-5 rounded-[32px] flex flex-col gap-1 text-left transition-all border ${activeFilter === 'debo' ? 'bg-rose-500 text-white border-rose-500 shadow-xl' : 'bg-rose-50/60 border-rose-100 text-rose-800'}`}
          >
            <span className={`text-[9px] font-black uppercase tracking-widest ${activeFilter === 'debo' ? 'text-rose-100' : 'text-rose-600'}`}>পাওনাদার (আমার কাছে পাবে)</span>
            <span className="text-2xl font-black">৳ {toBn(ledgerSummary.totalDebo)}</span>
          </button>
        </div>

        {/* Entries List - REMOVED DELETE BUTTON FROM HERE */}
        <div className="space-y-4 pb-28">
          {filteredEntries.length === 0 ? (
            <div className="py-24 text-center opacity-30 flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 border border-slate-100"><Info size={32} /></div>
              <p className="font-black text-slate-800">কোনো তথ্য খুঁজে পাওয়া যায়নি</p>
            </div>
          ) : (
            filteredEntries.map((entry) => (
              <div key={entry.id} className="relative group">
                <div 
                  onClick={() => openDetail(entry)}
                  className="w-full bg-white p-6 rounded-[35px] border border-slate-100 shadow-[0_10px_25px_-10px_rgba(0,0,0,0.05)] animate-in slide-in-from-bottom-3 duration-500 flex items-center justify-between text-left active:scale-[0.98] transition-all relative z-10"
                >
                  <div className="flex gap-4 items-center overflow-hidden">
                    <div className={`w-14 h-14 rounded-[22px] flex items-center justify-center shrink-0 shadow-sm border ${entry.dueAmount > 0 ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                      {entry.dueAmount > 0 ? <ArrowDownToLine size={28} /> : <ArrowUpFromLine size={28} />}
                    </div>
                    <div className="overflow-hidden">
                      <h4 className="font-black text-slate-800 text-lg leading-tight truncate">{entry.personName}</h4>
                      <div className="space-y-0.5 mt-0.5">
                        <div className="flex items-center gap-1.5">
                           <Smartphone size={10} className="text-slate-400" />
                           <p className="text-[11px] font-bold text-slate-500 font-inter">{entry.mobile}</p>
                        </div>
                        <p className="text-xs font-black text-blue-600">ব্যালেন্স: ৳ {toBn(Math.abs(entry.dueAmount))}</p>
                      </div>
                    </div>
                  </div>
                  <ChevronRight size={20} className="text-slate-200" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {entryToDelete && (
        <div className="fixed inset-0 z-[200] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-sm rounded-[40px] p-8 shadow-2xl text-center space-y-6 animate-in zoom-in duration-300">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center text-red-500 mx-auto"><AlertTriangle size={40} /></div>
            <div className="space-y-2">
              <h3 className="text-xl font-black text-slate-800">আপনি কি নিশ্চিত?</h3>
              <p className="text-sm font-bold text-slate-500">"{entryToDelete.personName}" এর লেনদেন তথ্যটি স্থায়ীভাবে মুছে যাবে।</p>
            </div>
            <div className="flex gap-3">
               <button onClick={() => setEntryToDelete(null)} className="flex-1 py-4 bg-slate-100 text-slate-600 font-black rounded-2xl">বাতিল</button>
               <button onClick={confirmDeleteEntry} className="flex-1 py-4 bg-red-600 text-white font-black rounded-2xl shadow-lg">হ্যাঁ, ডিলিট</button>
            </div>
          </div>
        </div>
      )}

      {/* Detailed View Modal */}
      {showDetailView && selectedEntry && (
        <div className="fixed inset-0 z-[120] bg-slate-950/60 backdrop-blur-md flex items-end justify-center animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-md rounded-t-[50px] p-8 pb-12 shadow-2xl animate-in slide-in-from-bottom-8 duration-600 max-h-[95vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                 <h3 className="text-2xl font-black text-slate-800">বিস্তারিত তথ্য</h3>
                 <button onClick={() => setShowDetailView(false)} className="p-3 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 active:scale-90 transition-all"><X size={24} /></button>
              </div>

              <div className="flex flex-col items-center gap-4 mb-8 text-center">
                 <div className="space-y-1">
                    <h2 className="text-3xl font-black text-slate-800 leading-tight">{selectedEntry.personName}</h2>
                    <p className="text-blue-500 font-bold font-inter tracking-wide">{selectedEntry.mobile}</p>
                    <div className="flex items-center justify-center gap-1.5 text-slate-400">
                       <MapPin size={14} />
                       <span className="text-sm font-bold">{selectedEntry.address || 'ঠিকানা সংরক্ষিত নেই'}</span>
                    </div>
                 </div>
              </div>

              <div className="bg-slate-50 p-6 rounded-[32px] border border-slate-100 text-center mb-8">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{selectedEntry.dueAmount >= 0 ? 'বকেয়া পাওনা (দেনাদার)' : 'বকেয়া দেনা (পাওনাদার)'}</p>
                 <p className={`text-3xl font-black ${selectedEntry.dueAmount >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>৳ {toBn(Math.abs(selectedEntry.dueAmount))}</p>
              </div>

              <div className="space-y-4 mb-8">
                 <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-2">
                       <History size={16} className="text-blue-500" />
                       <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">লেনদেন ইতিহাস</h4>
                    </div>
                    <button 
                        onClick={() => {
                            setSelectedPersonId(selectedEntry.id);
                            setLedgerFormData({
                                ...ledgerFormData, 
                                personName: selectedEntry.personName, 
                                mobile: selectedEntry.mobile, 
                                address: selectedEntry.address,
                                type: 'repay' 
                            });
                            setShowLedgerForm(true);
                        }}
                        className="text-[10px] font-black text-white bg-blue-600 px-5 py-2.5 rounded-full uppercase tracking-widest shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
                    >
                        আবারও লেনদেন করুন
                    </button>
                 </div>
                 <div className="bg-slate-50/50 rounded-[35px] border border-slate-100 p-4 space-y-3">
                    {selectedEntry.history && selectedEntry.history.length > 0 ? (
                        selectedEntry.history.slice().reverse().map((log: any, i: number) => (
                            <div key={i} className="bg-white p-4 rounded-[24px] border border-slate-50 shadow-sm flex items-center justify-between animate-in fade-in duration-300">
                                <div className="text-left">
                                    <p className={`text-[10px] font-black uppercase mb-1 ${log.type === 'pabo' ? 'text-emerald-500' : log.type === 'debo' ? 'text-rose-500' : 'text-blue-500'}`}>{log.note}</p>
                                    <div className="flex items-center gap-1.5 text-slate-400">
                                        <Clock size={10} />
                                        <p className="text-[10px] font-bold">{new Date(log.date).toLocaleDateString('bn-BD')} | {new Date(log.date).toLocaleTimeString('bn-BD', {hour:'2-digit', minute:'2-digit'})}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-black text-slate-800">৳ {toBn(log.amount)}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="py-8 text-center opacity-30"><p className="text-xs font-bold">হিস্ট্রি পাওয়া যায়নি</p></div>
                    )}
                 </div>
              </div>

              <div className="flex gap-3">
                 <a href={`tel:${convertBnToEn(selectedEntry.mobile)}`} className="flex-1 bg-[#0056b3] text-white py-5 rounded-[28px] font-black text-sm flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all font-inter">
                    <Phone size={18} /> কল করুন
                 </a>
                 <button onClick={() => setEntryToDelete(selectedEntry)} className="w-16 h-16 bg-red-50 text-red-500 rounded-[28px] flex items-center justify-center border border-red-100 active:scale-90"><Trash2 size={24} /></button>
              </div>
           </div>
        </div>
      )}

      {/* Form Modal */}
      {showLedgerForm && (
        <div className="fixed inset-0 z-[150] bg-slate-950/60 backdrop-blur-md flex items-end justify-center animate-in fade-in duration-300">
          <form onSubmit={handleLedgerSubmit} className="bg-white w-full max-w-md rounded-t-[50px] p-8 pb-14 shadow-2xl animate-in slide-in-from-bottom-8 duration-600 max-h-[92vh] overflow-y-auto space-y-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-left">
                <h3 className="text-3xl font-black text-slate-800">নতুন এন্ট্রি</h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">সঠিক তথ্য দিয়ে পূরণ করুন</p>
              </div>
              <button type="button" onClick={() => setShowLedgerForm(false)} className="p-3 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 border border-slate-100"><X size={24} /></button>
            </div>

            {/* Dropdown 1: Transaction Type */}
            <div className="space-y-2 text-left">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 block">লেনদেনের ধরন *</label>
              <div className="relative">
                <select 
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-[22px] font-black text-slate-800 appearance-none outline-none focus:border-blue-400 transition-all"
                    value={ledgerFormData.type}
                    onChange={(e) => setLedgerFormData({...ledgerFormData, type: e.target.value as any})}
                >
                    {selectedPersonId === 'new' ? (
                        <>
                            <option value="pabo">হাওলাত দিচ্ছি</option>
                            <option value="debo">হাওলাত নিচ্ছি</option>
                        </>
                    ) : (
                        (() => {
                            const person = ledgerEntries.find(p => p.id === selectedPersonId);
                            if (person && person.dueAmount > 0) { // Debtor (He owes me)
                                return (
                                    <>
                                        <option value="repay">পরিশোধ (তার থেকে পেলাম)</option>
                                        <option value="pabo">আবারও হাওলাত দিচ্ছি</option>
                                    </>
                                );
                            } else if (person && person.dueAmount < 0) { // Creditor (I owe him)
                                return (
                                    <>
                                        <option value="repay">পরিশোধ (তাকে দিলাম)</option>
                                        <option value="debo">আবারও হাওলাত নিচ্ছি</option>
                                    </>
                                );
                            } else {
                                return (
                                    <>
                                        <option value="pabo">হাওলাত দিচ্ছি</option>
                                        <option value="debo">হাওলাত নিচ্ছি</option>
                                    </>
                                );
                            }
                        })()
                    )}
                </select>
                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300"><ChevronRight className="rotate-90" size={18} /></div>
              </div>
            </div>

            {/* Dropdown 2: Person Selection */}
            <div className="space-y-2 text-left">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 block">ব্যক্তি নির্বাচন করুন *</label>
              <div className="relative">
                <select 
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-[22px] font-black text-slate-800 appearance-none outline-none focus:border-blue-400 transition-all"
                    value={selectedPersonId}
                    onChange={(e) => {
                        const val = e.target.value;
                        setSelectedPersonId(val);
                        if (val === 'new') {
                            setLedgerFormData({...ledgerFormData, personName: '', mobile: '', address: '', type: 'pabo'});
                        } else {
                            const person = ledgerEntries.find(p => p.id === val);
                            if (person) {
                                setLedgerFormData({
                                    ...ledgerFormData, 
                                    personName: person.personName, 
                                    mobile: person.mobile, 
                                    address: person.address,
                                    type: person.dueAmount !== 0 ? 'repay' : 'pabo'
                                });
                            }
                        }
                    }}
                >
                    <option value="new">নতুন ব্যক্তি (+)</option>
                    {ledgerEntries.map(p => (
                        <option key={p.id} value={p.id}>{p.personName} ({p.mobile})</option>
                    ))}
                </select>
                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300"><ChevronRight className="rotate-90" size={18} /></div>
              </div>
            </div>

            <div className="space-y-5">
              {selectedPersonId === 'new' ? (
                <div className="space-y-5 animate-in slide-in-from-top-2 duration-300">
                    <div className="text-left">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-2 block">ব্যক্তির নাম *</label>
                        <input required className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-[22px] font-bold outline-none focus:border-blue-400 focus:bg-white transition-all shadow-inner" value={ledgerFormData.personName} onChange={e => setLedgerFormData({...ledgerFormData, personName: e.target.value})} placeholder="নাম লিখুন" />
                    </div>
                    <div className="text-left">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-2 block">মোবাইল নম্বর *</label>
                        <div className="relative">
                           <Smartphone className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                           <input required className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-[22px] font-black text-slate-800 outline-none focus:border-blue-400 focus:bg-white transition-all shadow-inner font-inter" value={ledgerFormData.mobile} onChange={e => setLedgerFormData({...ledgerFormData, mobile: convertBnToEn(e.target.value)})} placeholder="০১xxxxxxxxx" maxLength={11} />
                        </div>
                    </div>
                    <div className="text-left">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-2 block">ঠিকানা বা এলাকা</label>
                        <input className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-[22px] font-bold outline-none focus:border-blue-400 focus:bg-white transition-all shadow-inner" value={ledgerFormData.address} onChange={e => setLedgerFormData({...ledgerFormData, address: e.target.value})} placeholder="ঠিকানা" />
                    </div>
                </div>
              ) : (
                <div className="p-5 bg-blue-50/50 border border-blue-100 rounded-[32px] text-left space-y-2">
                    <div className="flex items-center gap-3">
                       <UserCircle size={20} className="text-blue-500" />
                       <p className="font-black text-slate-800">{ledgerFormData.personName}</p>
                    </div>
                    <div className="flex items-center gap-3">
                       <Smartphone size={16} className="text-slate-400" />
                       <p className="text-xs font-bold text-slate-500 font-inter">{ledgerFormData.mobile}</p>
                    </div>
                    {(() => {
                        const person = ledgerEntries.find(p => p.id === selectedPersonId);
                        if (person) {
                            return <p className={`text-[10px] font-black uppercase tracking-widest mt-2 px-3 py-1 bg-white rounded-full w-fit ${person.dueAmount >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>বর্তমান ব্যালেন্স: ৳ {toBn(Math.abs(person.dueAmount))}</p>
                        }
                    })()}
                </div>
              )}

              <div className="text-left">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-2 block">টাকার পরিমাণ *</label>
                <div className="relative">
                   <div className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-black text-slate-300">৳</div>
                   <input required type="number" className="w-full pl-12 pr-6 py-5 bg-slate-50 border border-slate-100 rounded-[22px] font-black text-3xl text-slate-800 outline-none focus:border-blue-400 focus:bg-white transition-all shadow-inner font-inter" value={ledgerFormData.amount} onChange={e => setLedgerFormData({...ledgerFormData, amount: e.target.value})} placeholder="0.00" />
                </div>
              </div>
            </div>

            <button 
              disabled={isSubmitting} 
              className={`w-full py-6 bg-slate-900 text-white font-black rounded-[30px] shadow-2xl active:scale-[0.98] transition-all flex items-center justify-center gap-3 ${isSubmitting ? 'opacity-70' : ''}`}
            >
              {isSubmitting ? <Loader2 className="animate-spin" /> : (
                <>
                   <CheckCircle2 size={20} />
                   হিসাবটি সম্পন্ন করুন
                </>
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default PublicLedger;
