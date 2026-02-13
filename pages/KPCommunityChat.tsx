
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ChevronLeft, 
  Search, 
  UserPlus, 
  MessageCircle, 
  Phone, 
  Send, 
  MoreVertical, 
  UserCircle,
  Loader2,
  X,
  User,
  Check,
  CheckCheck,
  Smile,
  MoreHorizontal,
  CheckCircle2,
  Headphones,
  Headset,
  Fingerprint,
  Hash,
  MapPin,
  Clock,
  UserCheck,
  UserX,
  Bell,
  Users2
} from 'lucide-react';

// Firebase Imports
import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, onValue, set, push, remove, update, serverTimestamp, get } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
import { getFirestore, collection, onSnapshot } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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
const dbFs = getFirestore(app);

const HELPLINE_ID = 'KP37224995';
const HELPLINE_NAME = 'কয়রা-পাইকগাছা কমিউনিটি এপস';
const MESSAGE_EXPIRY_MS = 24 * 60 * 60 * 1000;

const getGuestToken = () => {
  let token = localStorage.getItem('kp_guest_token');
  if (!token) {
    const rand = Math.floor(100000 + Math.random() * 900000);
    token = `${rand}`;
    localStorage.setItem('kp_guest_token', token);
  }
  return token;
};

const HelplineCareIcon = ({ size = "md" }: { size?: "sm" | "md" | "lg" }) => {
  const containerClasses = {
    sm: "w-8 h-8 rounded-xl",
    md: "w-12 h-12 rounded-2xl",
    lg: "w-16 h-16 rounded-[24px]"
  };
  const iconSize = {
    sm: 16,
    md: 24,
    lg: 32
  };
  
  return (
    <div className={`${containerClasses[size]} bg-gradient-to-br from-pink-500 to-indigo-600 flex items-center justify-center text-white shadow-lg relative overflow-hidden`}>
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
      <Headset size={iconSize[size]} strokeWidth={2.5} className="relative z-10 animate-pulse-slow" />
    </div>
  );
};

const toBn = (num: string | number) => 
    (num || '').toString().replace(/\d/g, d => "০১২৩৪৫৬৭৮৯"[parseInt(d)]);

const formatTime = (ts: number) => {
    if (!ts) return '';
    const date = new Date(ts);
    return date.toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit', hour12: true });
};

const KPCommunityChat: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [activeChat, setActiveChat] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [view, setView] = useState<'chats' | 'friends_manager'>('chats');
  const [managerTab, setManagerTab] = useState<'my_friends' | 'requests' | 'search'>('my_friends');
  const [isLoading, setIsLoading] = useState(true);
  
  const [messages, setMessages] = useState<any[]>([]);
  const [chatRooms, setChatRooms] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [otherTyping, setOtherTyping] = useState(false);

  // Friend Request States
  const [friends, setFriends] = useState<Record<string, boolean>>({});
  const [sentRequests, setSentRequests] = useState<Record<string, boolean>>({});
  const [receivedRequests, setReceivedRequests] = useState<any[]>([]);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('kp_logged_in_user');
    const params = new URLSearchParams(location.search);
    const isOpenHelpline = params.get('open') === 'helpline';

    if (isOpenHelpline && !saved) {
      const token = getGuestToken();
      const guestUser = {
        memberId: `GUEST-${token}`,
        fullName: `পাবলিক ইউজার (টোকেন: ${toBn(token)})`,
        isGuest: true,
        token: token
      };
      setCurrentUser(guestUser);
      setIsGuest(true);
      setActiveChat({ memberId: HELPLINE_ID, fullName: HELPLINE_NAME, status: 'online' });
      setIsLoading(false);
      return;
    }

    if (saved) {
      const u = JSON.parse(saved);
      setCurrentUser(u);
      setIsGuest(false);
      
      if (isOpenHelpline) {
          setActiveChat({ memberId: HELPLINE_ID, fullName: HELPLINE_NAME, status: 'online' });
          navigate(location.pathname, { replace: true });
      }

      const presenceRef = ref(db, `presence/${u.memberId}`);
      set(presenceRef, { status: 'online', lastActive: serverTimestamp() });
      setIsLoading(false);
      return;
    }

    if (!isOpenHelpline) {
      alert('চ্যাট করতে লগইন করুন');
      navigate('/auth?to=chat');
    }
  }, [navigate, location]);

  // Global user listener to keep verification status updated everywhere
  useEffect(() => {
    if (!currentUser || isGuest) return;
    const usersCollection = collection(dbFs, 'users');
    const unsubscribeUsers = onSnapshot(usersCollection, (snapshot) => {
        const list = snapshot.docs.map(doc => ({ ...doc.data() }));
        setUsers(list);
    });
    return () => unsubscribeUsers();
  }, [currentUser, isGuest]);

  useEffect(() => {
    if (!currentUser || isGuest) return;

    const friendsRef = ref(db, `user_friends/${currentUser.memberId}`);
    onValue(friendsRef, snap => {
        setFriends(snap.val() || {});
    });

    const outgoingRef = ref(db, `user_outgoing_requests/${currentUser.memberId}`);
    onValue(outgoingRef, snap => {
        setSentRequests(snap.val() || {});
    });

    const incomingRef = ref(db, `user_incoming_requests/${currentUser.memberId}`);
    onValue(incomingRef, snap => {
        const val = snap.val();
        if (val) {
            setReceivedRequests(Object.keys(val).map(k => ({ ...val[k], senderId: k })));
        } else {
            setReceivedRequests([]);
        }
    });

    const roomsRef = ref(db, `user_chats/${currentUser.memberId}`);
    const unsub = onValue(roomsRef, (snap) => {
        const val = snap.val();
        if (val) {
            const list = Object.keys(val).map(k => ({ ...val[k], otherId: k }));
            const filteredList = list.filter(room => room.otherId !== HELPLINE_ID);
            setChatRooms(filteredList.sort((a, b) => b.lastTimestamp - a.lastTimestamp));
        } else {
            setChatRooms([]);
        }
    });
    return () => unsub();
  }, [currentUser, isGuest]);

  useEffect(() => {
    if (!activeChat || !currentUser) return;
    const chatId = [currentUser.memberId, activeChat.memberId].sort().join('_');
    const msgRef = ref(db, `messages/${chatId}`);
    const unsub = onValue(msgRef, (snap) => {
        const val = snap.val();
        if (val) {
            const now = Date.now();
            const list: any[] = [];
            const expiredIds: string[] = [];
            Object.keys(val).forEach(k => {
                const m = val[k];
                if (now - m.timestamp > MESSAGE_EXPIRY_MS) {
                    expiredIds.push(k);
                } else {
                    list.push({ ...m, id: k });
                }
            });
            expiredIds.forEach(id => remove(ref(db, `messages/${chatId}/${id}`)));
            setMessages(list.sort((a, b) => a.timestamp - b.timestamp));
            list.forEach(m => {
                if (m.receiverId === currentUser.memberId && m.status !== 'seen') {
                    update(ref(db, `messages/${chatId}/${m.id}`), { status: 'seen' });
                }
            });
            if (!isGuest) {
              update(ref(db, `user_chats/${currentUser.memberId}/${activeChat.memberId}`), { unseenCount: 0 });
            }
        } else {
            setMessages([]);
        }
    });
    const typingRef = ref(db, `typing/${chatId}/${activeChat.memberId}`);
    const unsubTyping = onValue(typingRef, snap => setOtherTyping(!!snap.val()));
    return () => { unsub(); unsubTyping(); };
  }, [activeChat, currentUser, isGuest]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputText.trim() || !currentUser || !activeChat) return;
    const chatId = [currentUser.memberId, activeChat.memberId].sort().join('_');
    const msgId = push(ref(db, `messages/${chatId}`)).key;
    const messageData = {
        senderId: currentUser.memberId,
        senderName: currentUser.fullName,
        receiverId: activeChat.memberId,
        text: inputText,
        timestamp: Date.now(),
        status: 'sent',
        reactions: {}
    };
    const receiverPresenceRef = ref(db, `presence/${activeChat.memberId}`);
    const recSnap = await get(receiverPresenceRef);
    if (recSnap.val()?.status === 'online') messageData.status = 'delivered';
    await set(ref(db, `messages/${chatId}/${msgId}`), messageData);
    const updateRoom = (userId: string, otherId: string, otherData: any, isSender: boolean) => {
        if (userId.startsWith('GUEST-')) return; 
        update(ref(db, `user_chats/${userId}/${otherId}`), {
            lastMessage: inputText,
            lastTimestamp: Date.now(),
            otherName: otherData.fullName || otherData.name,
            otherPhoto: otherData.photoURL || otherData.photo || '',
            unseenCount: isSender ? 0 : 1
        });
    };
    updateRoom(currentUser.memberId, activeChat.memberId, activeChat, true);
    updateRoom(activeChat.memberId, currentUser.memberId, currentUser, false);
    setInputText('');
    set(ref(db, `typing/${chatId}/${currentUser.memberId}`), false);
  };

  const sendFriendRequest = async (user: any) => {
    if (!currentUser) return;
    const requestData = {
        senderName: currentUser.fullName,
        senderPhoto: currentUser.photoURL || '',
        senderVillage: currentUser.village || '',
        timestamp: Date.now()
    };
    await update(ref(db, `user_incoming_requests/${user.memberId}/${currentUser.memberId}`), requestData);
    await update(ref(db, `user_outgoing_requests/${currentUser.memberId}/${user.memberId}`), { timestamp: Date.now() });
    alert(`${user.fullName} কে বন্ধুত্বের অনুরোধ পাঠানো হয়েছে।`);
  };

  const acceptFriendRequest = async (request: any) => {
    if (!currentUser) return;
    const { senderId, senderName, senderPhoto } = request;
    const updates: any = {};
    updates[`user_friends/${currentUser.memberId}/${senderId}`] = true;
    updates[`user_friends/${senderId}/${currentUser.memberId}`] = true;
    updates[`user_incoming_requests/${currentUser.memberId}/${senderId}`] = null;
    updates[`user_outgoing_requests/${senderId}/${currentUser.memberId}`] = null;
    await update(ref(db), updates);
    alert(`${senderName} এখন আপনার বন্ধু!`);
  };

  const rejectFriendRequest = async (request: any) => {
    if (!currentUser) return;
    await remove(ref(db, `user_incoming_requests/${currentUser.memberId}/${request.senderId}`));
    await remove(ref(db, `user_outgoing_requests/${request.senderId}/${currentUser.memberId}`));
  };

  const unfriend = async (otherId: string, otherName: string) => {
    if (!currentUser || !window.confirm(`${otherName} কে কি আনফ্রেন্ড করতে চান?`)) return;
    const updates: any = {};
    updates[`user_friends/${currentUser.memberId}/${otherId}`] = null;
    updates[`user_friends/${otherId}/${currentUser.memberId}`] = null;
    await update(ref(db), updates);
  };

  const handleTyping = (val: string) => {
    setInputText(val);
    if (!currentUser || !activeChat) return;
    const chatId = [currentUser.memberId, activeChat.memberId].sort().join('_');
    const typingRef = ref(db, `typing/${chatId}/${currentUser.memberId}`);
    if (val.length > 0 && !isTyping) { setIsTyping(true); set(typingRef, true); } 
    else if (val.length === 0) { setIsTyping(false); set(typingRef, false); }
  };

  const StatusIcon = ({ status }: { status: string }) => {
    if (status === 'seen') return <CheckCheck size={14} className="text-emerald-500" />;
    if (status === 'delivered') return <CheckCheck size={14} className="text-slate-400" />;
    return <Check size={14} className="text-slate-300" />;
  };

  const filteredUsers = useMemo(() => users.filter(u => 
    u.memberId !== currentUser?.memberId &&
    ((u.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    (u.village || '').toLowerCase().includes(searchTerm.toLowerCase()))
  ), [users, currentUser, searchTerm]);

  const friendsList = useMemo(() => users.filter(u => !!friends[u.memberId]), [users, friends]);

  const roomsWithVerification = useMemo(() => {
    return chatRooms.map(room => {
        const u = users.find(usr => usr.memberId === room.otherId);
        return {
            ...room,
            isVerified: u?.isVerified || false,
            fullName: u?.fullName || room.otherName,
            photoURL: u?.photoURL || room.otherPhoto
        };
    });
  }, [chatRooms, users]);

  const activeChatWithVerification = useMemo(() => {
    if (!activeChat) return null;
    if (activeChat.memberId === HELPLINE_ID) return { ...activeChat, isVerified: true, fullName: HELPLINE_NAME };
    const u = users.find(usr => usr.memberId === activeChat.memberId);
    return { ...activeChat, isVerified: u?.isVerified || false, fullName: u?.fullName || activeChat.fullName };
  }, [activeChat, users]);

  if (isLoading && view === 'chats' && !currentUser) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-white gap-4">
        <Loader2 className="animate-spin text-blue-500" size={40} />
        <p className="font-black text-[10px] text-slate-400 uppercase tracking-widest">সার্ভারের সাথে সংযোগ হচ্ছে...</p>
      </div>
    );
  }

  if (isGuest && !activeChat) {
    navigate('/services');
    return null;
  }

  if (activeChatWithVerification) {
    return (
      <div className="fixed inset-0 z-[120] bg-white flex flex-col animate-in slide-in-from-right duration-300">
          <header className="px-4 py-3 flex items-center gap-3 border-b border-slate-50 bg-white sticky top-0 z-10 shadow-sm">
              <button onClick={() => { if(isGuest) navigate('/services'); else setActiveChat(null); }} className="p-2 -ml-2 text-slate-400 active:scale-90"><ChevronLeft size={24}/></button>
              <div className="flex-1 flex items-center gap-3 overflow-hidden text-left">
                  <div className="relative shrink-0">
                    {activeChatWithVerification.memberId === HELPLINE_ID ? <HelplineCareIcon size="sm" /> : (
                        <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden border border-slate-200 shadow-inner">
                            {(activeChatWithVerification.photoURL || activeChatWithVerification.photo) ? <img src={activeChatWithVerification.photoURL || activeChatWithVerification.photo} className="w-full h-full object-cover" /> : <UserCircle size={40} className="text-slate-300" />}
                        </div>
                    )}
                    {activeChatWithVerification.memberId === HELPLINE_ID && <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white shadow-sm animate-pulse"></div>}
                  </div>
                  <div className="overflow-hidden">
                      <div className="flex items-center gap-1.5 overflow-hidden">
                        <h4 className="font-black text-slate-800 truncate leading-tight text-sm">{activeChatWithVerification.fullName || activeChatWithVerification.name}</h4>
                        {activeChatWithVerification.isVerified && <CheckCircle2 size={13} fill="#1877F2" className="text-white shrink-0" />}
                      </div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{activeChatWithVerification.memberId === HELPLINE_ID ? 'অফিসিয়াল হেল্পলাইন' : 'সক্রিয়'}</p>
                  </div>
              </div>
              <div className="flex gap-1">
                 <button className="p-2 text-blue-500 active:scale-90"><Phone size={20} /></button>
                 <button className="p-2 text-slate-400 active:scale-90"><MoreVertical size={20} /></button>
              </div>
          </header>
          <div ref={scrollRef} className="flex-1 bg-[#F7F8FA] overflow-y-auto p-4 space-y-3 no-scrollbar">
            {messages.map((m) => {
                const isMe = m.senderId === currentUser.memberId;
                return (
                    <div key={m.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} group animate-in fade-in duration-300`}>
                        <div className="relative max-w-[80%]">
                            <div className={`px-4 py-2.5 rounded-2xl text-sm font-medium shadow-sm relative ${isMe ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white text-slate-800 rounded-tl-none border border-slate-100'}`}>{m.text}</div>
                        </div>
                        <div className="flex items-center gap-1.5 mt-1 px-1">
                            <span className="text-[8px] font-bold text-slate-400 uppercase">{formatTime(m.timestamp)}</span>
                            {isMe && <StatusIcon status={m.status} />}
                        </div>
                    </div>
                );
            })}
            {otherTyping && <div className="flex items-center gap-2 animate-pulse text-slate-400"><div className="shrink-0">{activeChatWithVerification.memberId === HELPLINE_ID ? <HelplineCareIcon size="sm" /> : <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden"><UserCircle size={20} /></div>}</div><div className="bg-white border border-slate-100 px-4 py-2 rounded-2xl rounded-tl-none"><MoreHorizontal size={20} className="animate-bounce" /></div></div>}
          </div>
          <div className="p-4 bg-white border-t border-slate-50 flex items-end gap-3 pb-8">
              <button className="p-2 text-blue-500 active:scale-90"><Smile size={24}/></button>
              <div className="flex-1 bg-slate-50 rounded-3xl px-5 py-3 flex items-center border border-slate-100 focus-within:border-blue-200 transition-all">
                  <textarea rows={1} className="flex-1 bg-transparent border-none outline-none font-bold text-sm text-slate-800 placeholder:text-slate-400 resize-none max-h-32" placeholder="মেসেজ লিখুন..." value={inputText} onChange={(e) => handleTyping(e.target.value)} />
              </div>
              <button onClick={handleSendMessage} disabled={!inputText.trim()} className={`p-3.5 rounded-full shadow-lg transition-all active:scale-90 ${inputText.trim() ? 'bg-blue-600 text-white shadow-blue-500/20' : 'bg-slate-100 text-slate-300'}`}><Send size={20} /></button>
          </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500 bg-white">
      <header className="px-5 pt-4 pb-2">
        <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-4 text-left overflow-hidden">
                <div className="w-12 h-12 rounded-full border-2 border-slate-50 shadow-md overflow-hidden bg-slate-100 shrink-0 flex items-center justify-center">
                    {currentUser?.photoURL ? <img src={currentUser.photoURL} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-300 bg-slate-50"><UserCircle size={32} /></div>}
                </div>
                <div className="overflow-hidden">
                  <div className="flex items-center gap-1.5 overflow-hidden">
                    <h2 className="text-[18px] font-black text-slate-800 leading-tight truncate">{currentUser?.fullName || 'ইউজার'}</h2>
                    {currentUser?.isVerified && <CheckCircle2 size={16} fill="#1877F2" className="text-white shrink-0" />}
                  </div>
                  <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mt-0.5">ID: {toBn(currentUser?.memberId || 'KP-000')}</p>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <div className="relative">
                    <button 
                      onClick={() => {
                        setView(view === 'friends_manager' ? 'chats' : 'friends_manager');
                        if (receivedRequests.length > 0) setManagerTab('requests');
                        else if (view === 'chats') setManagerTab('my_friends');
                      }} 
                      className={`w-12 h-12 flex items-center justify-center rounded-2xl border transition-all ${view === 'friends_manager' ? 'bg-blue-600 text-white border-blue-600 shadow-lg' : 'bg-slate-50 border-slate-100 text-slate-400'}`}
                    >
                        {receivedRequests.length > 0 ? <Bell size={22} className="animate-pulse" /> : <UserPlus size={22} />}
                    </button>
                    {receivedRequests.length > 0 && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white rounded-full flex items-center justify-center text-[10px] font-bold border-2 border-white shadow-sm">{toBn(receivedRequests.length)}</div>
                    )}
                </div>
                <button onClick={() => setActiveChat({ memberId: HELPLINE_ID, fullName: HELPLINE_NAME, status: 'online' })} className="active:scale-90 transition-all">
                    <HelplineCareIcon size="md" />
                </button>
            </div>
        </div>
        <div className="relative mb-2">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={20} strokeWidth={2.5} />
            <input className="w-full pl-14 pr-6 py-4 bg-[#F8FAFC] border border-slate-100 rounded-[24px] font-bold text-slate-600 outline-none shadow-sm placeholder:text-slate-300" placeholder={view === 'friends_manager' ? "নাম বা গ্রাম দিয়ে খুঁজুন..." : "চ্যাট খুঁজুন..."} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
        
        {/* Slim Label Tabs */}
        {view === 'friends_manager' && (
          <div className="flex gap-2 mt-3 mb-2 px-1">
             <button onClick={() => setManagerTab('my_friends')} className={`flex-1 py-2 px-1 rounded-xl text-[11px] font-black uppercase tracking-tighter transition-all ${managerTab === 'my_friends' ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-100 text-slate-400'}`}>আমার বন্ধু</button>
             <button onClick={() => setManagerTab('requests')} className={`flex-1 py-2 px-1 rounded-xl text-[11px] font-black uppercase tracking-tighter transition-all relative ${managerTab === 'requests' ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-100 text-slate-400'}`}>
                নতুন রিকোয়েস্ট {receivedRequests.length > 0 && <span className="ml-1 bg-red-500 text-white rounded-full px-1.5 py-0.5 text-[8px]">{toBn(receivedRequests.length)}</span>}
             </button>
             <button onClick={() => setManagerTab('search')} className={`flex-1 py-2 px-1 rounded-xl text-[11px] font-black uppercase tracking-tighter transition-all ${managerTab === 'search' ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-100 text-slate-400'}`}>সদস্য খুঁজুন</button>
          </div>
        )}
      </header>

      <div className="flex-1 overflow-y-auto no-scrollbar px-5 pb-32 pt-3">
        {view === 'chats' ? (
            <div className="space-y-5">
                {roomsWithVerification.length === 0 ? (
                    <div className="py-24 text-center opacity-40 flex flex-col items-center gap-6 animate-in fade-in duration-700">
                        <MessageCircle size={70} className="text-slate-100" strokeWidth={1} />
                        <p className="font-black text-slate-300 uppercase tracking-widest text-[11px]">আপনার কোনো মেসেজ নেই</p>
                    </div>
                ) : roomsWithVerification.map(room => (
                    <button key={room.otherId} onClick={() => setActiveChat({ memberId: room.otherId, fullName: room.fullName, photoURL: room.photoURL })} className="w-full flex items-center gap-4 p-5 bg-white rounded-[35px] border border-slate-100 shadow-sm active:scale-[0.98] transition-all group">
                        <div className="w-16 h-16 rounded-[24px] bg-slate-50 border border-slate-100 overflow-hidden flex items-center justify-center text-slate-300 shrink-0 shadow-inner">
                            {room.photoURL ? <img src={room.photoURL} className="w-full h-full object-cover" /> : <UserCircle size={36} />}
                        </div>
                        <div className="flex-1 text-left overflow-hidden">
                            <div className="flex items-center gap-1.5 overflow-hidden">
                                <h4 className="font-black text-slate-800 truncate text-[15px] leading-tight">{room.fullName}</h4>
                                {room.isVerified && <CheckCircle2 size={13} fill="#1877F2" className="text-white shrink-0" />}
                            </div>
                            <p className="text-[12px] font-bold text-slate-400 truncate mt-1.5">{room.lastMessage}</p>
                        </div>
                        <div className="flex flex-col items-end gap-2 shrink-0">
                            <span className="text-[9px] font-black text-slate-300 uppercase tracking-tighter">{toBn(formatTime(room.lastTimestamp).split(' ')[0])}</span>
                            {room.unseenCount > 0 && <div className="w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center text-[10px] font-black shadow-lg border-2 border-white">{toBn(room.unseenCount)}</div>}
                        </div>
                    </button>
                ))}
            </div>
        ) : (
            <div className="space-y-4 animate-in slide-in-from-bottom-2 duration-300">
                {managerTab === 'requests' && (
                    <div className="space-y-3">
                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] pl-2 text-left">আগত বন্ধুত্বের অনুরোধ ({toBn(receivedRequests.length)})</p>
                        {receivedRequests.length === 0 ? (
                            <div className="py-20 text-center opacity-30 flex flex-col items-center gap-4">
                                <Users2 size={48} className="text-slate-200" />
                                <p className="font-bold text-slate-400">কোনো নতুন অনুরোধ নেই</p>
                            </div>
                        ) : receivedRequests.map(req => (
                            <div key={req.senderId} className="w-full flex items-center gap-4 p-4 bg-blue-50/50 rounded-[35px] border border-blue-100 shadow-sm animate-in zoom-in">
                                <div className="w-12 h-12 rounded-[22px] bg-white border border-blue-50 overflow-hidden flex items-center justify-center text-slate-200 shrink-0">{req.senderPhoto ? <img src={req.senderPhoto} className="w-full h-full object-cover" /> : <User size={24} />}</div>
                                <div className="flex-1 text-left overflow-hidden"><h4 className="font-black text-slate-800 truncate text-sm">{req.senderName}</h4><p className="text-[10px] font-bold text-slate-400 truncate">{req.senderVillage}</p></div>
                                <div className="flex gap-2">
                                    <button onClick={() => acceptFriendRequest(req)} className="p-3 bg-blue-600 text-white rounded-2xl active:scale-90 transition-all shadow-sm"><UserCheck size={18}/></button>
                                    <button onClick={() => rejectFriendRequest(req)} className="p-3 bg-red-50 text-red-500 rounded-2xl active:scale-90 transition-all shadow-sm"><UserX size={18}/></button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {managerTab === 'my_friends' && (
                    <div className="space-y-3">
                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] pl-2 text-left">আপনার বন্ধুদের তালিকা ({toBn(friendsList.length)})</p>
                        {friendsList.length === 0 ? (
                            <div className="py-20 text-center opacity-30 flex flex-col items-center gap-4">
                                <UserPlus size={48} className="text-slate-200" />
                                <p className="font-bold text-slate-400">আপনার কোনো বন্ধু নেই</p>
                            </div>
                        ) : friendsList.map(u => (
                            <div key={u.memberId} className="w-full flex items-center gap-4 p-4 bg-white rounded-[35px] border border-slate-100 shadow-sm">
                                <div className="w-12 h-12 rounded-[22px] bg-slate-50 border border-slate-100 overflow-hidden flex items-center justify-center text-slate-200 shrink-0">{u.photoURL ? <img src={u.photoURL} className="w-full h-full object-cover" /> : <User size={24} />}</div>
                                <div className="flex-1 text-left overflow-hidden">
                                    <div className="flex items-center gap-1.5 overflow-hidden">
                                        <h4 className="font-black text-slate-800 truncate text-sm">{u.fullName}</h4>
                                        {u.isVerified && <CheckCircle2 size={13} fill="#1877F2" className="text-white shrink-0" />}
                                    </div>
                                    <p className="text-[10px] font-bold text-slate-400 truncate">{u.village}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => setActiveChat({ memberId: u.memberId, fullName: u.fullName, photoURL: u.photoURL })} className="p-3 bg-blue-50 text-blue-600 rounded-2xl active:scale-90 shadow-sm"><MessageCircle size={18}/></button>
                                    <button onClick={() => unfriend(u.memberId, u.fullName)} className="p-3 bg-red-50 text-red-500 rounded-2xl active:scale-90 shadow-sm"><UserX size={18}/></button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {managerTab === 'search' && (
                    <div className="space-y-3">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-2 text-left">নতুন বন্ধু যোগ করুন</p>
                        {filteredUsers.map(user => {
                            const isOfficial = user.memberId === HELPLINE_ID;
                            const isRequested = !!sentRequests[user.memberId];
                            const isFriend = !!friends[user.memberId];
                            if (isFriend) return null; // Don't show already added friends in search tab

                            return (
                                <div key={user.memberId} className="w-full flex items-center gap-4 p-5 bg-white rounded-[35px] border border-slate-100 shadow-sm animate-in fade-in">
                                    <div className="w-14 h-14 rounded-[22px] bg-slate-50 border border-slate-100 overflow-hidden flex items-center justify-center text-slate-200 shrink-0 shadow-inner">{isOfficial ? <HelplineCareIcon size="sm" /> : (user.photoURL ? <img src={user.photoURL} className="w-full h-full object-cover" /> : <User size={28} />)}</div>
                                    <div className="flex-1 text-left overflow-hidden">
                                        <div className="flex items-center gap-1.5 overflow-hidden"><h4 className="font-black text-slate-800 truncate text-[15px] leading-tight">{user.fullName}</h4>{(user.isVerified || isOfficial) && <CheckCircle2 size={13} fill="#1877F2" className="text-white shrink-0" />}</div>
                                        <div className="flex items-center gap-1.5 mt-1 overflow-hidden"><div className="p-0.5 bg-blue-50 text-blue-600 rounded shrink-0"><MapPin size={10} strokeWidth={3} /></div><p className="text-[11px] font-bold text-slate-500 truncate">{user.village || 'ঠিকানা নেই'}</p></div>
                                    </div>
                                    <div className="flex gap-2">
                                        {isOfficial ? (
                                            <button onClick={() => setActiveChat({ memberId: user.memberId, fullName: user.fullName, photoURL: user.photoURL })} className="p-3.5 bg-blue-50 text-blue-600 rounded-2xl active:scale-90 transition-all shadow-sm"><MessageCircle size={20}/></button>
                                        ) : isRequested ? (
                                            <div className="p-3.5 bg-slate-50 text-slate-300 rounded-2xl flex items-center justify-center"><Clock size={20}/></div>
                                        ) : (
                                            <button onClick={() => sendFriendRequest(user)} className="p-3.5 bg-blue-600 text-white rounded-2xl active:scale-90 transition-all shadow-md flex items-center justify-center"><UserPlus size={20}/></button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        )}
      </div>
    </div>
  );
};

export default KPCommunityChat;
