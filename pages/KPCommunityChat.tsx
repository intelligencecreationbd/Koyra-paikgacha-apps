
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, 
  MessagesSquare, 
  Search, 
  UserPlus, 
  UserCheck, 
  MessageCircle, 
  Phone, 
  Send, 
  MoreVertical, 
  UserX, 
  Trash2, 
  UserCircle,
  Loader2,
  Users,
  X,
  User,
  PhoneOff,
  CheckCircle2
} from 'lucide-react';

/**
 * @LOCKED_COMPONENT
 * @Section KP Community Chat
 * @Status Functional with Verified Badge support
 */
const KPCommunityChat: React.FC = () => {
  const navigate = useNavigate();
  const [activeChat, setActiveChat] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [friends, setFriends] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  if (activeChat) {
    return (
      <div className="fixed inset-0 z-[120] bg-white flex flex-col animate-in slide-in-from-right duration-300">
          <header className="px-5 py-4 flex items-center gap-4 border-b border-slate-50 bg-white sticky top-0 z-10">
              <button onClick={() => setActiveChat(null)} className="p-2 -ml-2 text-slate-400"><ChevronLeft size={24}/></button>
              <div className="flex-1 flex items-center gap-3 overflow-hidden text-left">
                  <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                    {activeChat.photoURL ? <img src={activeChat.photoURL} className="w-full h-full object-cover" alt="Profile" /> : <UserCircle size={40} className="text-slate-300" />}
                  </div>
                  <div className="overflow-hidden">
                      <div className="flex items-center gap-1.5 overflow-hidden">
                        <h4 className="font-black text-slate-800 truncate leading-tight">{activeChat.fullName}</h4>
                        {activeChat.isVerified && (
                           <CheckCircle2 size={14} fill="#1877F2" className="text-white shrink-0" />
                        )}
                      </div>
                      <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest">{activeChat.village}</p>
                  </div>
              </div>
          </header>
          <div className="flex-1 bg-slate-50 flex flex-col items-center justify-center p-10 opacity-30 gap-3">
            <MessagesSquare size={48} className="text-blue-200" />
            <p className="font-bold text-slate-400">মেসেজ লোড হচ্ছে...</p>
          </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500 p-5">
      <header className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="p-3 bg-white border border-slate-100 rounded-xl shadow-sm active:scale-90 transition-all"><ChevronLeft size={24} /></button>
        <div className="text-left">
          <h2 className="text-xl font-black text-slate-800">কেপি চ্যাট</h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">কমিউনিটির সাথে সংযুক্ত থাকুন</p>
        </div>
      </header>

      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
        <input 
          className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-100 rounded-[22px] font-bold outline-none focus:border-blue-400" 
          placeholder="কাউকে খুঁজুন..." 
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center py-20 text-center opacity-30 gap-4">
        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 border border-slate-100">
           <MessagesSquare size={40} />
        </div>
        <div className="space-y-1">
          <p className="font-black text-slate-800">চ্যাট ফিচারটি শীঘ্রই আসছে</p>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">কয়রা-পাইকগাছা ডিজিটাল আপডেট</p>
        </div>
      </div>
    </div>
  );
};

export default KPCommunityChat;
