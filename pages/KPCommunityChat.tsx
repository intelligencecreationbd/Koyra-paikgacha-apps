
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
  PhoneOff
} from 'lucide-react';

// Firebase Imports
import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, onValue, push, set, remove, onChildAdded, get } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
import { getFirestore, collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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

const toBn = (num: string | number) => 
    (num || '০').toString().replace(/\d/g, d => "০১২৩৪৫৬৭৮৯"[parseInt(d)]);

interface ChatMessage {
    id: string;
    senderId: string;
    text: string;
    timestamp: number;
}

const KPCommunityChat: React.FC = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [view, setView] = useState<'chats' | 'users' | 'requests' | 'friends'>('chats');
  const [loading, setLoading] = useState(true);
  
  // Jitsi State
  const [isCalling, setIsCalling] = useState(false);
  const jitsiContainerRef = useRef<HTMLDivElement>(null);
  const jitsiApiRef = useRef<any>(null);

  // Data States
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [friends, setFriends] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [blocks, setBlocks] = useState<Record<string, boolean>>({});
  const [activeChat, setActiveChat] = useState<any | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showOptions, setShowOptions] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('kp_logged_in_user');
    if (!saved) {
      setLoading(false);
      return;
    }
    const user = JSON.parse(saved);
    setCurrentUser(user);

    // Initial Data Fetch
    fetchUsers(user.memberId);
    listenToFriends(user.memberId);
    listenToRequests(user.memberId);
    listenToBlocks(user.memberId);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Jitsi Initialization
  useEffect(() => {
    if (isCalling && activeChat && currentUser && jitsiContainerRef.current) {
        // Generating a complex unique room ID to avoid collisions and moderator issues
        const ids = [currentUser.memberId, activeChat.memberId].sort();
        const roomName = `KP_SecureCall_${ids[0]}_v_${ids[1]}_Room`;
        
        // @ts-ignore
        if (window.JitsiMeetExternalAPI) {
            // @ts-ignore
            jitsiApiRef.current = new window.JitsiMeetExternalAPI("meet.jit.si", {
                roomName: roomName,
                width: '100%',
                height: '100%',
                parentNode: jitsiContainerRef.current,
                userInfo: {
                    displayName: currentUser.fullName
                },
                configOverwrite: {
                    prejoinPageEnabled: false, 
                    prejoinConfig: { enabled: false },
                    disableDeepLinking: true, 
                    startWithAudioMuted: false, 
                    startWithVideoMuted: true,
                    enableWelcomePage: false,
                    enableLobby: false, // Explicitly disable lobby to avoid moderator requirement
                    requireDisplayName: false, // Direct entry
                    enableNoAudioDetection: true,
                    defaultLanguage: 'bn',
                    p2p: { enabled: true },
                    // These flags help bypass some moderator restrictions on public instances
                    doNotStoreRoom: true,
                    remoteVideoMenu: {
                        disableKick: true
                    },
                    disableRemoteMute: true
                },
                interfaceConfigOverwrite: {
                    MOBILE_APP_PROMO: false,
                    SHOW_JITSI_WATERMARK: false,
                    SHOW_WATERMARK_FOR_GUESTS: false,
                    SHOW_BRAND_WATERMARK: false,
                    SHOW_CHROME_EXTENSION_BANNER: false,
                    DEFAULT_REMOTE_DISPLAY_NAME: 'কমিউনিটি মেম্বার',
                    TOOLBAR_BUTTONS: [
                        'microphone', 'hangup', 'fms', 'closedcaptions', 'settings', 'raisehand',
                        'videoquality', 'filmstrip', 'tileview', 'help', 'mute-everyone', 'security'
                    ]
                }
            });

            jitsiApiRef.current.addEventListeners({
                readyToClose: () => handleEndCall()
            });
        }
    }
    return () => {
        if (jitsiApiRef.current) {
            jitsiApiRef.current.dispose();
            jitsiApiRef.current = null;
        }
    };
  }, [isCalling]);

  const handleEndCall = () => {
    if (jitsiApiRef.current) {
        jitsiApiRef.current.dispose();
        jitsiApiRef.current = null;
    }
    setIsCalling(false);
  };

  const fetchUsers = async (myId: string) => {
    try {
        const q = query(collection(dbFs, "users"));
        const snap = await getDocs(q);
        const list = snap.docs
            .map(d => d.data())
            .filter(u => u.memberId !== myId);
        setAllUsers(list);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const listenToFriends = (myId: string) => {
    onValue(ref(db, `friends/${myId}`), (snap) => {
        const data = snap.val();
        if (data) {
            const friendIds = Object.keys(data);
            setFriends(friendIds);
        } else {
            setFriends([]);
        }
    });
  };

  const listenToRequests = (myId: string) => {
    onValue(ref(db, `requests/${myId}`), (snap) => {
        const data = snap.val();
        if (data) {
            setRequests(Object.keys(data).map(k => ({ id: k, ...data[k] })));
        } else {
            setRequests([]);
        }
    });
  };

  const listenToBlocks = (myId: string) => {
    onValue(ref(db, `blocks/${myId}`), (snap) => {
        setBlocks(snap.val() || {});
    });
  };

  const sendRequest = async (targetUser: any) => {
    if (!currentUser) return;
    try {
        await set(ref(db, `requests/${targetUser.memberId}/${currentUser.memberId}`), {
            name: currentUser.fullName,
            photo: currentUser.photoURL || '',
            timestamp: Date.now()
        });
        alert('বন্ধুত্বের অনুরোধ পাঠানো হয়েছে।');
    } catch (e) { alert('ত্রুটি হয়েছে!'); }
  };

  const handleRequest = async (request: any, action: 'accept' | 'reject') => {
    if (!currentUser) return;
    try {
        if (action === 'accept') {
            await set(ref(db, `friends/${currentUser.memberId}/${request.id}`), true);
            await set(ref(db, `friends/${request.id}/${currentUser.memberId}`), true);
        }
        await remove(ref(db, `requests/${currentUser.memberId}/${request.id}`));
    } catch (e) { alert('ত্রুটি!'); }
  };

  const unfriend = async (friendId: string) => {
    if (!currentUser || !confirm('বন্ধুতালিকা থেকে বাদ দিতে চান?')) return;
    await remove(ref(db, `friends/${currentUser.memberId}/${friendId}`));
    await remove(ref(db, `friends/${friendId}/${currentUser.memberId}`));
    setActiveChat(null);
    setShowOptions(false);
  };

  const toggleBlock = async (targetId: string) => {
    if (!currentUser) return;
    const isBlocked = blocks[targetId];
    if (!isBlocked && !confirm('এই ইউজারকে ব্লক করতে চান? তিনি আপনাকে আর মেসেজ দিতে পারবেন না।')) return;
    
    if (isBlocked) {
        await remove(ref(db, `blocks/${currentUser.memberId}/${targetId}`));
    } else {
        await set(ref(db, `blocks/${currentUser.memberId}/${targetId}`), true);
        await remove(ref(db, `friends/${currentUser.memberId}/${targetId}`));
        await remove(ref(db, `friends/${targetId}/${currentUser.memberId}`));
    }
    setActiveChat(null);
    setShowOptions(false);
  };

  const startChat = (user: any) => {
    setActiveChat(user);
    const chatId = [currentUser.memberId, user.memberId].sort().join('_');
    const chatRef = ref(db, `chats/${chatId}`);
    onValue(chatRef, (snap) => {
        const data = snap.val();
        if (data) {
            setMessages(Object.keys(data).map(k => ({ id: k, ...data[k] })));
        } else {
            setMessages([]);
        }
    });
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat) return;
    const chatId = [currentUser.memberId, activeChat.memberId].sort().join('_');
    const msg = {
        senderId: currentUser.memberId,
        text: newMessage,
        timestamp: Date.now()
    };
    await push(ref(db, `chats/${chatId}`), msg);
    setNewMessage('');
  };

  if (!currentUser && !loading) {
    return (
      <div className="p-10 flex flex-col items-center justify-center h-[80vh] text-center space-y-6">
        <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center text-blue-600"><MessagesSquare size={40}/></div>
        <h2 className="text-xl font-black text-slate-800">লগইন প্রয়োজন</h2>
        <p className="text-slate-400 font-bold">চ্যাট ফিচার ব্যবহার করতে দয়া করে লগইন করুন।</p>
        <button onClick={() => navigate('/auth?to=chat')} className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black shadow-lg active:scale-95 transition-all">লগইন করুন</button>
      </div>
    );
  }

  // Voice Call View (Embedded Iframe)
  if (isCalling && activeChat) {
    return (
        <div className="fixed inset-0 z-[160] bg-slate-950 flex flex-col animate-in fade-in duration-300">
            <header className="px-5 py-4 flex items-center justify-between border-b border-white/10 bg-slate-900 sticky top-0 z-10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden border border-white/20">
                        {activeChat.photoURL ? <img src={activeChat.photoURL} className="w-full h-full object-cover" /> : <UserCircle size={40} className="text-white/20" />}
                    </div>
                    <div className="text-left">
                        <h4 className="font-black text-white text-sm truncate leading-tight">{activeChat.fullName}</h4>
                        <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span> কলে আছেন</p>
                    </div>
                </div>
                <button onClick={handleEndCall} className="p-3.5 bg-red-600 text-white rounded-full active:scale-90 transition-all shadow-lg shadow-red-600/20"><PhoneOff size={24} /></button>
            </header>
            <div ref={jitsiContainerRef} className="flex-1 bg-slate-900" />
        </div>
    );
  }

  if (activeChat) {
    return (
      <div className="fixed inset-0 z-[120] bg-white flex flex-col animate-in slide-in-from-right duration-300">
          <header className="px-5 py-4 flex items-center gap-4 border-b border-slate-50 bg-white sticky top-0 z-10">
              <button onClick={() => setActiveChat(null)} className="p-2 -ml-2 text-slate-400"><ChevronLeft size={24}/></button>
              <div className="flex-1 flex items-center gap-3 overflow-hidden text-left">
                  <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                    {activeChat.photoURL ? <img src={activeChat.photoURL} className="w-full h-full object-cover" /> : <UserCircle size={40} className="text-slate-300" />}
                  </div>
                  <div className="overflow-hidden">
                      <h4 className="font-black text-slate-800 truncate leading-tight">{activeChat.fullName}</h4>
                      <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest">{activeChat.village}</p>
                  </div>
              </div>
              <div className="flex items-center gap-2">
                  <button onClick={() => setIsCalling(true)} className="p-3 bg-emerald-50 text-emerald-600 rounded-xl active:scale-90 transition-all"><Phone size={20}/></button>
                  <div className="relative">
                    <button onClick={() => setShowOptions(!showOptions)} className="p-3 text-slate-400 rounded-xl active:scale-90 transition-all"><MoreVertical size={20}/></button>
                    {showOptions && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 animate-in fade-in zoom-in duration-200 z-50">
                            <button onClick={() => unfriend(activeChat.memberId)} className="w-full px-4 py-3 flex items-center gap-3 text-sm font-bold text-slate-600 hover:bg-slate-50 text-left"><UserX size={18}/> আনফ্রেন্ড করুন</button>
                            <button onClick={() => toggleBlock(activeChat.memberId)} className="w-full px-4 py-3 flex items-center gap-3 text-sm font-bold text-red-500 hover:bg-red-50 text-left"><Trash2 size={18}/> ব্লক করুন</button>
                        </div>
                    )}
                  </div>
              </div>
          </header>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/50 no-scrollbar">
              {messages.map((m, idx) => {
                  const isMe = m.senderId === currentUser.memberId;
                  return (
                    <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-1`}>
                        <div className={`max-w-[80%] p-4 rounded-3xl text-left ${isMe ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white border border-slate-100 text-slate-800 rounded-tl-none shadow-sm'}`}>
                            <p className="text-sm font-bold leading-relaxed">{m.text}</p>
                            <p className={`text-[8px] mt-1 font-black uppercase opacity-50 ${isMe ? 'text-white' : 'text-slate-400'}`}>
                                {toBn(new Date(m.timestamp).toLocaleTimeString('bn-BD', {hour:'2-digit', minute:'2-digit'}))}
                            </p>
                        </div>
                    </div>
                  );
              })}
          </div>

          <form onSubmit={sendMessage} className="p-4 border-t border-slate-100 bg-white flex items-center gap-3">
              <input 
                  autoFocus
                  className="flex-1 px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-500" 
                  placeholder="মেসেজ লিখুন..." 
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
              />
              <button type="submit" disabled={!newMessage.trim()} className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg active:scale-90 transition-all disabled:opacity-50">
                  <Send size={24} />
              </button>
          </form>
      </div>
    );
  }

  const searchResults = allUsers.filter(u => 
    u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.village.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-5 pb-32 min-h-screen bg-white animate-in fade-in duration-500 text-left">
      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/services')} className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100 active:scale-90 transition-all"><ChevronLeft size={24} /></button>
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">কেপি চ্যাট</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">কমিউনিটি কথোপকথন</p>
          </div>
        </div>
        <div className="flex gap-1 bg-slate-100 p-1 rounded-2xl">
            <button onClick={() => setView('chats')} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${view === 'chats' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}>চ্যাট</button>
            <button onClick={() => setView('users')} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${view === 'users' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}>লিস্ট</button>
        </div>
      </header>

      {view === 'users' ? (
        <div className="space-y-6">
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input 
                    className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-100 rounded-[22px] font-bold outline-none focus:border-blue-400" 
                    placeholder="ইউজার খুঁজুন..." 
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>
            <div className="space-y-3">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">নিবন্ধিত ইউজার ({toBn(searchResults.length)})</p>
                {searchResults.map((u: any) => {
                    const isFriend = friends.includes(u.memberId);
                    const isBlocked = blocks[u.memberId];
                    return (
                        <div key={u.memberId} className="bg-white p-4 rounded-[32px] border border-slate-50 shadow-sm flex items-center justify-between group">
                            <div className="flex items-center gap-4 overflow-hidden">
                                <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden shrink-0">
                                    {u.photoURL ? <img src={u.photoURL} className="w-full h-full object-cover" /> : <UserCircle size={24} className="text-slate-300" />}
                                </div>
                                <div className="overflow-hidden">
                                    <h4 className="font-black text-slate-800 text-sm truncate">{u.fullName}</h4>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase truncate">{u.village}</p>
                                </div>
                            </div>
                            {isBlocked ? (
                                <button onClick={() => toggleBlock(u.memberId)} className="p-3 text-red-500 bg-red-50 rounded-xl"><UserX size={18}/></button>
                            ) : isFriend ? (
                                <button onClick={() => startChat(u)} className="p-3 bg-blue-50 text-blue-600 rounded-xl"><MessageCircle size={18}/></button>
                            ) : (
                                <button onClick={() => sendRequest(u)} className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-all"><UserPlus size={18}/></button>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
      ) : (
        <div className="space-y-6">
            {requests.length > 0 && (
                <div className="space-y-3 animate-in slide-in-from-top-4">
                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest pl-2">বন্ধুত্বের অনুরোধ ({toBn(requests.length)})</p>
                    {requests.map(r => (
                        <div key={r.id} className="bg-blue-50 p-4 rounded-[32px] border border-blue-100 flex items-center justify-between">
                            <div className="flex items-center gap-4 text-left overflow-hidden">
                                <div className="w-10 h-10 rounded-full bg-white overflow-hidden shrink-0 border border-blue-200">
                                    {r.photo ? <img src={r.photo} className="w-full h-full object-cover" /> : <UserCircle size={24} className="text-blue-200" />}
                                </div>
                                <h4 className="font-black text-blue-900 text-sm truncate">{r.name}</h4>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => handleRequest(r, 'accept')} className="p-2.5 bg-blue-600 text-white rounded-xl shadow-md"><UserCheck size={18}/></button>
                                <button onClick={() => handleRequest(r, 'reject')} className="p-2.5 bg-white text-red-500 rounded-xl border border-red-100"><X size={18}/></button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="space-y-3">
                <div className="flex items-center justify-between px-2">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">আপনার বন্ধুরা</p>
                   <p className="text-[10px] font-bold text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full">{toBn(friends.length)} জন</p>
                </div>
                
                {friends.length === 0 ? (
                    <div className="py-24 text-center opacity-30 flex flex-col items-center gap-4">
                        <Users size={48} className="text-slate-300" />
                        <p className="font-bold text-slate-500">কোনো বন্ধু নেই। ইউজার লিস্ট থেকে বন্ধু যোগ করুন।</p>
                    </div>
                ) : (
                    friends.map(fid => {
                        const friendData = allUsers.find(u => u.memberId === fid);
                        if (!friendData) return null;
                        return (
                            <button 
                                key={fid} 
                                onClick={() => startChat(friendData)}
                                className="w-full bg-white p-5 rounded-[35px] border border-slate-50 shadow-sm flex items-center justify-between group active:scale-[0.98] transition-all"
                            >
                                <div className="flex items-center gap-4 overflow-hidden text-left">
                                    <div className="w-14 h-14 rounded-[22px] bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                                        {friendData.photoURL ? <img src={friendData.photoURL} className="w-full h-full object-cover" /> : <UserCircle size={28} className="text-slate-300" />}
                                    </div>
                                    <div className="text-left overflow-hidden">
                                        <h4 className="font-black text-slate-800 text-base leading-tight truncate">{friendData.fullName}</h4>
                                        <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest truncate">{friendData.village}</p>
                                    </div>
                                </div>
                                <div className="w-10 h-10 bg-slate-50 text-slate-300 rounded-2xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
                                    <MessageCircle size={20} />
                                </div>
                            </button>
                        );
                    })
                )}
            </div>
        </div>
      )}

      {loading && (
          <div className="fixed inset-0 z-[200] bg-white/80 backdrop-blur-md flex items-center justify-center">
              <Loader2 className="animate-spin text-blue-600" size={40} />
          </div>
      )}
    </div>
  );
};

export default KPCommunityChat;
