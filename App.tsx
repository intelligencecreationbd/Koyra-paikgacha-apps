
import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Sun, Moon, Lock, ChevronLeft, LogOut, Home as HomeIcon, User as UserIcon, PlusCircle, Menu, X, ArrowRight, Sparkles, NotebookTabs, MessageSquare, UserCircle, Download, ShieldCheck, Zap, Heart, Star, Smartphone, Camera, Gift, Bus, CloudSun, Newspaper, Scale, Phone, HeartPulse, Calculator } from 'lucide-react';
import Home from './pages/Home';
import CategoryView from './pages/CategoryView';
import InfoSubmit from './pages/InfoSubmit';
import UserAuth from './pages/UserAuth';
import AdminDashboard from './pages/AdminDashboard';
import HotlineDetail from './pages/HotlineDetail';
import DigitalLedger from './pages/DigitalLedger';
import OnlineHaat from './pages/OnlineHaat';
import WeatherPage from './pages/WeatherPage';
import KPCommunityChat from './pages/KPCommunityChat';
import PublicMedical from './components/PublicMedical';
import AgeCalculator from './components/AgeCalculator';
import DateTimeBox from './components/DateTimeBox';
import PublicDownload from './components/PublicDownload';
import { Submission, Notice, User } from './types';

// Firebase Imports
import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, onValue, set, get } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

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

const LogInIcon = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" x2="3" y2="12"/></svg>
);

const MenuLink: React.FC<{ icon: React.ReactNode, label: string, onClick: () => void }> = ({ icon, label, onClick }) => (
  <button onClick={onClick} className="w-full flex items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded-2xl text-slate-700 dark:text-slate-300 font-bold text-sm transition-all active:scale-95 group">
    <div className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30 transition-all">
      {icon}
    </div>
    {label}
  </button>
);

const BottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isAtLanding = location.pathname === '/';
  const isSubmit = location.pathname === '/info-submit';
  const isProfile = location.pathname === '/auth';

  const handleGlobalBack = () => {
    const { pathname, search } = location;
    if (search.includes('item=')) {
      navigate(pathname, { replace: true });
      return;
    }
    if (pathname.startsWith('/category/')) {
      const parts = pathname.split('/').filter(Boolean);
      if (parts.length > 2) {
        const parentPath = '/' + parts.slice(0, -1).join('/');
        navigate(parentPath);
      } else {
        navigate('/services');
      }
      return;
    }
    if (pathname.startsWith('/hotline/')) {
      const parts = pathname.split('/').filter(Boolean);
      if (parts.length > 1) {
        const parentPath = '/' + parts.slice(0, -1).join('/');
        navigate(parentPath);
      } else {
        navigate('/services');
      }
      return;
    }
    if (pathname === '/services') {
      navigate('/');
    } else if (['/hotline', '/online-haat', '/weather', '/info-submit', '/auth', '/download', '/chat', '/medical', '/age-calculator'].includes(pathname)) {
      navigate('/services');
    } else if (pathname === '/ledger') {
      navigate('/auth');
    } else {
      navigate('/services');
    }
  };

  if (isAtLanding) return null;

  return (
    <div className="fixed bottom-2 left-0 right-0 z-[80] flex justify-center items-end gap-5 pointer-events-none px-6 pb-2">
      <button 
        onClick={() => navigate('/info-submit')}
        className={`w-12 h-12 rounded-full metallic-blue pointer-events-auto transition-all duration-300 ${isSubmit ? 'glow-active scale-110' : 'opacity-90'}`}
      >
        <PlusCircle size={22} strokeWidth={isSubmit ? 3 : 2} className="text-white" />
      </button>

      <button 
        onClick={handleGlobalBack}
        className={`w-14 h-14 rounded-full metallic-blue pointer-events-auto -translate-y-1 transition-all duration-300 shadow-xl flex items-center justify-center`}
      >
        <span className="text-white font-black text-[12px] uppercase tracking-tighter">Back</span>
      </button>

      <button 
        onClick={() => navigate('/auth')}
        className={`w-12 h-12 rounded-full metallic-blue pointer-events-auto transition-all duration-300 ${isProfile ? 'glow-active scale-110' : 'opacity-90'}`}
      >
        <UserIcon size={22} strokeWidth={isProfile ? 3 : 2} className="text-white" />
      </button>
    </div>
  );
};

const LandingScreen: React.FC<{ isDarkMode: boolean, setIsDarkMode: (v: boolean) => void, appLogo: string }> = ({ isDarkMode, setIsDarkMode, appLogo }) => {
  const navigate = useNavigate();
  return (
    <div className={`h-screen w-full relative flex flex-col items-center pt-2 pb-6 px-6 transition-colors duration-500 overflow-hidden ${isDarkMode ? 'bg-slate-950' : 'bg-white'}`}>
      <button 
        onClick={() => setIsDarkMode(!isDarkMode)}
        className="absolute top-4 right-6 p-3.5 rounded-[18px] bg-slate-900 dark:bg-slate-800 shadow-2xl text-white transition-all active:scale-90 z-20"
      >
        {isDarkMode ? <Sun size={22} /> : <Moon size={22} />}
      </button>

      <div className="flex-1 flex flex-col items-center justify-start w-full max-w-sm pt-2">
         <div className="relative mb-3 animate-in zoom-in duration-1000">
            <div className="absolute inset-0 bg-blue-400/20 rounded-full blur-[80px] animate-pulse"></div>
            <div className="relative w-56 h-56 bg-white rounded-full shadow-[0_25px_60px_-12px_rgba(0,0,0,0.2)] flex items-center justify-center border-[10px] border-white overflow-hidden p-2.5">
              <img 
                src={appLogo} 
                className="w-full h-full object-cover rounded-full" 
                alt="App Logo"
                onError={(e) => {
                  (e.target as any).src = 'https://raw.githubusercontent.com/StackBlitz-User-Assets/logo/main/kp-logo.png';
                }}
              />
            </div>
         </div>

         <div className="w-full mb-4 animate-in slide-in-from-top-4 duration-1000">
            <DateTimeBox />
         </div>

         <div className="space-y-4 text-center animate-in fade-in zoom-in duration-1000 delay-200">
            <div className="space-y-2">
              <h1 className="text-5xl font-black tracking-tight text-[#0056b3] dark:text-blue-500 drop-shadow-sm">
                কয়রা-পাইকগাছা
              </h1>
              <p className="text-slate-500 dark:text-slate-400 font-bold text-lg px-4 leading-snug max-w-[320px] mx-auto">
                আপনার এলাকার সকল ডিজিটাল সেবা এখন এক ঠিকানায়
              </p>
            </div>
            
            <button 
              onClick={() => navigate('/services')}
              className="group relative w-full mt-4 py-5 bg-[#0056b3] dark:bg-blue-600 text-white font-black text-xl rounded-[35px] shadow-[0_20px_40px_-10px_rgba(0,86,179,0.4)] overflow-hidden active:scale-95 transition-all flex items-center justify-center gap-4 mx-auto max-w-[260px]"
            >
                সকল সেবা <ArrowRight size={26} className="group-hover:translate-x-2 transition-transform" />
            </button>
         </div>
      </div>

      <div className="w-full pb-4 flex flex-col items-center justify-center gap-1 opacity-90 animate-in slide-in-from-bottom-4 duration-1000 delay-500">
          <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em]">Development by</p>
          <p className="text-[12px] font-black tracking-[0.05em] text-[#0056b3] dark:text-blue-400 uppercase">Intelligence Creation BD</p>
      </div>
    </div>
  );
};

const App = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminPassword, setAdminPassword] = useState('Tayeb');
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [loginInput, setLoginInput] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [appLogo, setAppLogo] = useState('https://raw.githubusercontent.com/StackBlitz-User-Assets/logo/main/kp-logo.png');
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('kp_logged_in_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [subtitleIndex, setSubtitleIndex] = useState(0);
  const subtitles = ["এক ক্লিকে সকল তথ্য", "বিপদে আপনার বন্ধু"];

  const longPressTimer = useRef<any>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const isLanding = location.pathname === '/';
  const isChatPage = location.pathname === '/chat';

  useEffect(() => {
    const interval = setInterval(() => {
      setSubtitleIndex((prev) => (prev + 1) % subtitles.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [subtitles.length]);

  useEffect(() => {
    const passRef = ref(db, 'admin_settings/password');
    onValue(passRef, (snap) => {
      if (snap.exists()) {
        setAdminPassword(snap.val());
      } else {
        set(passRef, 'Tayeb');
      }
    });

    const noticeRef = ref(db, 'notices');
    onValue(noticeRef, (snap) => {
      const data = snap.val();
      setNotices(data ? Object.values(data) : []);
    });

    const logoRef = ref(db, 'app_settings/logo');
    onValue(logoRef, (snap) => {
      if (snap.exists()) {
        setAppLogo(snap.val());
      }
    });
  }, []);

  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDarkMode]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginInput === adminPassword) {
      setIsAdminLoggedIn(true);
      setShowAdminLogin(false);
      setLoginInput('');
    } else {
      alert('ভুল পাসওয়ার্ড! আবার চেষ্টা করুন।');
    }
  };

  const handleLongPressStart = () => {
    longPressTimer.current = setTimeout(() => {
      setShowAdminLogin(true);
      setIsDrawerOpen(false);
    }, 3000);
  };

  const handleLongPressEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
  };

  const handleUpdatePassword = async (newPass: string) => {
    if (!newPass.trim()) return;
    try {
      await set(ref(db, 'admin_settings/password'), newPass);
      setAdminPassword(newPass);
      alert('পাসওয়ার্ড সফলভাবে আপডেট করা হয়েছে।');
    } catch (e) {
      alert('পাসওয়ার্ড আপডেট করতে সমস্যা হয়েছে!');
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && isAdminLoggedIn) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        try {
          await set(ref(db, 'app_settings/logo'), base64);
          setAppLogo(base64);
          alert('এপসের প্রোফাইল পিকচার আপডেট হয়েছে!');
        } catch (err) {
          alert('আপলোড ব্যর্থ হয়েছে!');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogout = () => {
    setIsAdminLoggedIn(false);
    setCurrentUser(null);
    setIsDrawerOpen(false);
    localStorage.removeItem('kp_logged_in_user');
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 overflow-x-hidden ${isDarkMode ? 'bg-slate-950 text-white' : 'bg-white text-[#1A1A1A]'}`}>
      {!isLanding && (
        <>
          <div className={`fixed inset-0 z-[100] transition-opacity duration-300 ${isDrawerOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <div className="absolute inset-0 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-sm" onClick={() => setIsDrawerOpen(false)} />
            <div className={`absolute top-0 left-0 bottom-0 w-80 bg-white dark:bg-slate-950 shadow-2xl transition-transform duration-300 ease-out border-r border-slate-100 dark:border-slate-800 flex flex-col ${isDrawerOpen ? 'translate-x-0' : '-translate-x-full'}`}>
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
                <div className="text-left flex flex-col">
                  <div className="flex items-baseline gap-1.5">
                    <h2 className="font-black text-xl text-[#0056b3] dark:text-blue-400 shimmer-text leading-none">কয়রা-পাইকগাছা</h2>
                    <span className="text-[10px] font-black whitespace-nowrap animate-rainbow-text">কমিউনিটি এপস</span>
                  </div>
                  <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest animate-pulse mt-1">ডিজিটাল অ্যাপে স্বাগতম</p>
                </div>
                <button 
                  onPointerDown={handleLongPressStart}
                  onPointerUp={handleLongPressEnd}
                  onPointerLeave={handleLongPressEnd}
                  onClick={() => setIsDrawerOpen(false)} 
                  className="p-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm text-slate-400 dark:text-slate-500 transition-colors active:scale-90"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto pt-4 space-y-4">
                 <nav className="px-4 space-y-1">
                    {currentUser ? (
                      <button 
                        onClick={() => { setIsDrawerOpen(false); navigate('/auth'); }}
                        className="w-full flex items-center gap-4 p-4 mb-2 bg-blue-50/50 dark:bg-blue-900/20 rounded-2xl text-left active:scale-[0.98] transition-all group"
                      >
                        <div className="w-12 h-12 rounded-xl border-2 border-white dark:border-slate-700 shadow-sm overflow-hidden bg-slate-100 shrink-0">
                          {(currentUser as any).photoURL ? (
                            <img src={(currentUser as any).photoURL} className="w-full h-full object-cover" alt="Profile" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                              <UserCircle size={28} />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <p className="font-black text-slate-800 dark:text-slate-200 text-base leading-tight truncate">{currentUser.fullName}</p>
                          <p className="text-[10px] font-black text-blue-500/80 uppercase tracking-tighter mt-0.5">আমার প্রোফাইল</p>
                        </div>
                        <ArrowRight size={16} className="text-blue-400/50 group-hover:translate-x-1 transition-transform" />
                      </button>
                    ) : (
                      <MenuLink icon={<UserIcon size={20} />} label="আমার প্রোফাইল" onClick={() => { setIsDrawerOpen(false); navigate('/auth'); }} />
                    )}
                    <MenuLink icon={<PlusCircle size={20} />} label="তথ্য প্রদান" onClick={() => { setIsDrawerOpen(false); navigate('/info-submit'); }} />
                    <MenuLink icon={<MessageSquare size={20} />} label="Help Chat" onClick={() => { setIsDrawerOpen(false); navigate('/hotline'); }} />
                    {isAdminLoggedIn && (
                       <MenuLink icon={<Lock size={20} />} label="এডমিন প্যানেল" onClick={() => { setIsDrawerOpen(false); navigate('/admin'); }} />
                    )}
                 </nav>
              </div>
              <div className="p-6 border-t border-slate-100 dark:border-slate-800 space-y-3 bg-slate-50/30 dark:bg-slate-900/20">
                {(isAdminLoggedIn || currentUser) ? (
                  <button onClick={handleLogout} className="w-full py-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-2xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-all">
                    <LogOut size={20} /> লগআউট করুন
                  </button>
                ) : (
                  <button onClick={() => { setIsDrawerOpen(false); navigate('/auth'); }} className="w-full py-4 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-red-400 rounded-2xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-all">
                    <LogInIcon size={20} /> লগইন করুন
                  </button>
                )}

                <button onClick={() => { setIsDrawerOpen(false); navigate('/download'); }} className="w-full py-4 download-btn-animate text-white rounded-2xl font-black flex items-center justify-center gap-3 active:scale-95 transition-all overflow-hidden relative group">
                    <Download size={22} className="live-download-icon group-hover:animate-pulse" />
                    <span className="shimmer-text">এপস ডাউনলোড করুন</span>
                </button>

                <div className="flex flex-col items-center justify-center gap-1 float-small mt-3">
                  <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Development by</p>
                  <p className="text-xs font-black tracking-widest shimmer-text uppercase">Intelligence Creation BD</p>
                </div>
              </div>
            </div>
          </div>

          <header className={`sticky top-0 z-50 transition-all duration-500 header-liquid header-curves glass-header border-b ${isScrolled ? 'opacity-100 shadow-[0_8px_30px_rgba(0,0,0,0.4)]' : 'opacity-90 shadow-[0_4px_15px_rgba(0,0,0,0.1)]'}`}>
            <div className="max-w-md mx-auto px-5 h-16 flex items-center justify-between relative z-10">
              <div className="flex items-center gap-0">
                <button onClick={() => setIsDrawerOpen(true)} className="p-2.5 rounded-xl text-white/70 hover:text-white transition-all duration-300 active:scale-90">
                  <Menu size={20} strokeWidth={2} />
                </button>
              </div>
              <div className="flex flex-col items-center">
                <div className="flex items-baseline gap-1.5">
                  <h1 className="font-black text-2xl tracking-tight text-white leading-none drop-shadow-sm">
                    {isChatPage ? 'কেপি চ্যাট' : 'কয়রা-পাইকগাছা'}
                  </h1>
                  {!isChatPage && (
                    <span className="text-[10px] font-black whitespace-nowrap animate-rainbow-text">কমিউনিটি এপস</span>
                  )}
                </div>
                <div className="relative h-4 flex items-center justify-center mt-1.5 overflow-hidden w-full">
                  {isChatPage ? (
                    <span className="text-[10px] font-black tracking-wider uppercase whitespace-nowrap text-blue-100">
                      কয়রা-পাইকগাছা কমিউনিটি এপস
                    </span>
                  ) : (
                    <span 
                      key={subtitleIndex}
                      className="text-[10px] font-black tracking-wider uppercase whitespace-nowrap animate-rainbow-text animate-in fade-in zoom-in duration-500"
                    >
                      {subtitles[subtitleIndex]}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => setIsDarkMode(!isDarkMode)} className="group p-2.5 rounded-xl text-white/70 transition-all duration-300 hover:text-white hover:bg-white/10 active:scale-90">
                  {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                </button>
              </div>
            </div>
          </header>
        </>
      )}

      {showAdminLogin && !isAdminLoggedIn && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 w-full max-w-xs rounded-[28px] p-8 shadow-2xl animate-in zoom-in duration-500 border border-slate-100">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Lock className="text-[#0056b3] icon-floating" size={32} />
            </div>
            <h2 className="text-2xl font-bold mb-6 text-center text-[#1A1A1A] dark:text-white">এডমিন লগইন</h2>
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <input 
                type="password"
                placeholder="পাসওয়ার্ড দিন"
                className="w-full px-5 py-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0056b3] transition-all font-semibold text-center"
                value={loginInput}
                onChange={(e) => setLoginInput(e.target.value)}
                autoFocus
              />
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button type="button" onClick={() => {setShowAdminLogin(false); setLoginInput('');}} className="py-4 rounded-xl bg-slate-100 dark:bg-slate-700 font-bold text-slate-600 text-sm">বন্ধ করুন</button>
                <button type="submit" className="py-4 rounded-xl bg-gradient-to-br from-[#0056b3] to-[#007BFF] text-white font-bold text-sm shadow-lg shadow-blue-500/20">প্রবেশ করুন</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <main className={`max-w-md mx-auto relative ${isLanding ? 'p-0 m-0 w-full h-screen' : 'h-[calc(100vh-64px)] overflow-y-auto no-scrollbar'}`}>
        <Routes>
          <Route path="/" element={<LandingScreen isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} appLogo={appLogo} />} />
          <Route path="/services" element={<Home notices={notices} isAdmin={isAdminLoggedIn} user={currentUser} />} />
          <Route path="/category/:id/*" element={<CategoryView />} />
          <Route path="/hotline" element={<HotlineDetail />} />
          <Route path="/hotline/:serviceType" element={<HotlineDetail />} />
          <Route path="/hotline/:serviceType/:upazila" element={<HotlineDetail />} />
          <Route path="/info-submit" element={<InfoSubmit onSubmission={(s) => setSubmissions([...submissions, s])} />} />
          <Route path="/auth" element={<UserAuth onLogin={setCurrentUser} />} />
          <Route path="/ledger" element={currentUser ? <DigitalLedger /> : <Navigate to="/auth?to=ledger" />} />
          <Route path="/online-haat" element={<OnlineHaat />} />
          <Route path="/weather" element={<WeatherPage />} />
          <Route path="/chat" element={<KPCommunityChat />} />
          <Route path="/medical" element={<PublicMedical onBack={() => navigate('/services')} />} />
          <Route path="/age-calculator" element={<AgeCalculator onBack={() => navigate('/services')} />} />
          <Route path="/download" element={
            <PublicDownload 
              appLogo={appLogo} 
              isAdminLoggedIn={isAdminLoggedIn} 
              onLogoChange={handleLogoChange} 
            />
          } />
          <Route 
            path="/admin" 
            element={isAdminLoggedIn ? <AdminDashboard submissions={submissions} notices={notices} onUpdateNotices={setNotices} onUpdatePassword={handleUpdatePassword} adminPassword={adminPassword} onUpdateSubmissions={setSubmissions} /> : <Navigate to="/auth" />} 
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
      {!isLanding && <BottomNav />}
    </div>
  );
}

export default App;
