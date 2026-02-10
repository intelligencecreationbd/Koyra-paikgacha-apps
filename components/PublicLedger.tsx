
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
        if (currentBalance > 0 && amount > currentBalance) {
            const extra = amount - currentBalance;
            history.push({ date: new Date().toISOString(), amount: currentBalance, type: 'repay', note: 'বকেয়া পরিশোধ' });
            history.push({ date: new Date().toISOString(), amount: extra, type: 'debo', note: 'অতিরিক্ত (হাওলাত নিয়েছি)' });
            newBalance = -extra;
        } else if (currentBalance < 0 && amount > Math.abs(currentBalance)) {
            const absBal = Math.abs(currentBalance);
            const extra = amount - absBal;
            history.push({ date: new Date().toISOString(), amount: absBal, type: 'repay', note: 'বকেয়া পরিশোধ' });
            history.push({ date: new Date().toISOString(), amount: extra, type: 'pabo', note: 'অতিরিক্ত (হাওলাত দিয়েছি)' });
            newBalance = extra;
        } else {
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
                      {entry.dueAmount > 0 ? <ArrowDownToLine size={24} /> : <ArrowUpFromLine size={24} />}
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="font-black text-slate-800 text-lg leading-tight truncate">{entry.personName}</p>
                      <p className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${entry.dueAmount > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {entry.dueAmount > 0 ? 'পাবো' : 'দেবো'} • {toBn(Math.abs(entry.dueAmount))} টাকা
                      </p>
                    </div>
                  </div>
                  <ChevronRight size={20} className="text-slate-300" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Detail View Overlay */}
      {showDetailView && selectedEntry && (
        <div className="fixed inset-0 z-[150] bg-slate-900/60 backdrop-blur-md flex items-end justify-center">
            <div className="bg-white w-full max-w-md rounded-t-[45px] p-8 shadow-2xl animate-in slide-in-from-bottom-full duration-500 max-h-[95vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <button onClick={() => setShowDetailView(false)} className="p-2 text-slate-400"><X size={24}/></button>
                    <div className="text-center flex-1">
                      <h3 className="font-black text-xl text-slate-800">লেনদেনের বিস্তারিত</h3>
                    </div>
                    <button onClick={() => setEntryToDelete(selectedEntry)} className="p-2 text-red-500"><Trash2 size={24}/></button>
                </div>

                <div className="bg-slate-50 p-6 rounded-[35px] border border-slate-100 mb-6 flex flex-col items-center gap-4">
                    <div className={`w-20 h-20 rounded-[30px] flex items-center justify-center border-4 border-white shadow-xl ${selectedEntry.dueAmount > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                      {selectedEntry.dueAmount > 0 ? <ArrowDownToLine size={32} /> : <ArrowUpFromLine size={32} />}
                    </div>
                    <div className="text-center">
                        <h4 className="text-2xl font-black text-slate-800">{selectedEntry.personName}</h4>
                        <p className="text-sm font-bold text-slate-400 mt-1">{selectedEntry.mobile}</p>
                        <div className={`mt-4 px-6 py-3 rounded-2xl font-black text-lg shadow-sm border ${selectedEntry.dueAmount > 0 ? 'bg-emerald-500 text-white border-emerald-400' : 'bg-rose-500 text-white border-rose-400'}`}>
                           {selectedEntry.dueAmount > 0 ? 'পাবো' : 'দেবো'} ৳ {toBn(Math.abs(selectedEntry.dueAmount))}
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                        <History size={18} className="text-blue-600" />
                        <h5 className="font-black text-slate-800">লেনদেনের ইতিহাস</h5>
                    </div>
                    <div className="space-y-3">
                        {selectedEntry.history?.map((h: any, idx: number) => (
                            <div key={idx} className="flex items-center justify-between p-4 bg-white border border-slate-50 rounded-2xl shadow-sm">
                                <div className="text-left">
                                    <p className="text-xs font-black text-slate-800">{h.note}</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{new Date(h.date).toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                </div>
                                <p className={`font-black text-sm ${h.type === 'pabo' ? 'text-emerald-600' : h.type === 'debo' ? 'text-rose-600' : 'text-blue-600'}`}>
                                   {h.type === 'pabo' ? '+' : h.type === 'debo' ? '-' : '✓'} {toBn(h.amount)}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-8">
                    <button 
                        onClick={() => {
                          setSelectedPersonId(selectedEntry.id);
                          setLedgerFormData({...ledgerFormData, type: 'repay'});
                          setShowLedgerForm(true);
                        }}
                        className="py-4 bg-blue-600 text-white font-black rounded-2xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                      <ArrowRightLeft size={18} /> বকেয়া পরিশোধ
                    </button>
                    <button 
                        onClick={() => {
                          setSelectedPersonId(selectedEntry.id);
                          setLedgerFormData({...ledgerFormData, type: selectedEntry.dueAmount > 0 ? 'pabo' : 'debo'});
                          setShowLedgerForm(true);
                        }}
                        className="py-4 bg-slate-100 text-slate-700 font-black rounded-2xl shadow-sm active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                      <Plus size={18} /> নতুন লেনদেন
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Form Modal */}
      {showLedgerForm && (
        <div className="fixed inset-0 z-[170] bg-slate-900/60 backdrop-blur-md p-5 flex items-center justify-center">
            <div className="bg-white w-full max-w-sm rounded-[45px] p-8 shadow-2xl space-y-5 animate-in zoom-in duration-300 max-h-[90vh] overflow-y-auto text-left">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="font-black text-xl text-slate-800">{selectedPersonId === 'new' ? 'নতুন হিসাব' : 'লেনদেন যোগ'}</h3>
                    <button onClick={() => setShowLedgerForm(false)} className="p-2 text-slate-400"><X/></button>
                </div>

                <form onSubmit={handleLedgerSubmit} className="space-y-4">
                    {selectedPersonId === 'new' ? (
                        <>
                            <div className="text-left">
                                <label className="text-[10px] font-black text-slate-400 block mb-1.5 uppercase pl-1">ব্যক্তির নাম</label>
                                <input required className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none" placeholder="নাম লিখুন" value={ledgerFormData.personName} onChange={e => setLedgerFormData({...ledgerFormData, personName: e.target.value})} />
                            </div>
                            <div className="text-left">
                                <label className="text-[10px] font-black text-slate-400 block mb-1.5 uppercase pl-1">মোবাইল (ঐচ্ছিক)</label>
                                <input className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none" placeholder="০১xxxxxxxxx" value={ledgerFormData.mobile} onChange={e => setLedgerFormData({...ledgerFormData, mobile: e.target.value})} />
                            </div>
                        </>
                    ) : (
                        <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 text-left">
                           <p className="text-[10px] font-black text-blue-500 uppercase">ব্যক্তির নাম</p>
                           <p className="text-base font-black text-slate-800">{ledgerEntries.find(e=>e.id===selectedPersonId)?.personName}</p>
                        </div>
                    )}

                    <div className="text-left">
                        <label className="text-[10px] font-black text-slate-400 block mb-1.5 uppercase pl-1">লেনদেনের ধরণ</label>
                        <select className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl font-black outline-none" value={ledgerFormData.type} onChange={e => setLedgerFormData({...ledgerFormData, type: e.target.value as any})}>
                            <option value="pabo">হাওলাত দিয়েছি (আমি পাবো)</option>
                            <option value="debo">হাওলাত নিয়েছি (আমি দেবো)</option>
                            <option value="repay">বকেয়া পরিশোধ</option>
                        </select>
                    </div>

                    <div className="text-left">
                        <label className="text-[10px] font-black text-slate-400 block mb-1.5 uppercase pl-1">টাকার অংক (৳)</label>
                        <input required type="number" className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl font-black outline-none text-xl" placeholder="৳ ০০" value={ledgerFormData.amount} onChange={e => setLedgerFormData({...ledgerFormData, amount: e.target.value})} />
                    </div>

                    <button disabled={isSubmitting} className="w-full py-5 bg-[#0056b3] text-white font-black rounded-3xl shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2 mt-4">
                        {isSubmitting ? <Loader2 className="animate-spin" /> : 'হিসাব সংরক্ষণ করুন'}
                    </button>
                </form>
            </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {entryToDelete && (
        <div className="fixed inset-0 z-[180] bg-slate-900/60 backdrop-blur-sm p-5 flex items-center justify-center">
            <div className="bg-white w-full max-w-xs rounded-[40px] p-8 shadow-2xl text-center space-y-6 animate-in zoom-in duration-300">
                <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto">
                    <AlertTriangle size={32} />
                </div>
                <div>
                  <h3 className="font-black text-lg text-slate-800">আপনি কি নিশ্চিত?</h3>
                  <p className="text-xs font-bold text-slate-400 mt-2">এই ব্যক্তির সকল হিসাব স্থায়ীভাবে মুছে যাবে!</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => setEntryToDelete(null)} className="py-4 bg-slate-100 text-slate-500 font-black rounded-2xl">না</button>
                  <button onClick={confirmDeleteEntry} className="py-4 bg-red-600 text-white font-black rounded-2xl shadow-lg shadow-red-500/20">হ্যাঁ, মুছুন</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default PublicLedger;
