
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Sun, Moon, Lock, ChevronLeft, LogOut, Home as HomeIcon, User as UserIcon, PlusCircle, Menu, X, ArrowRight, Sparkles, NotebookTabs, MessageSquare, UserCircle } from 'lucide-react';
import Home from './pages/Home';
import CategoryView from './pages/CategoryView';
import InfoSubmit from './pages/InfoSubmit';
import UserAuth from './pages/UserAuth';
import AdminDashboard from './pages/AdminDashboard';
import HotlineDetail from './pages/HotlineDetail';
import DigitalLedger from './pages/DigitalLedger';
import OnlineHaat from './pages/OnlineHaat';
import WeatherPage from './pages/WeatherPage';
import DateTimeBox from './components/DateTimeBox';
import { Submission, Notice, User } from './types';

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

  // NEW SMART BACK LOGIC: Concept of "Up" instead of just "Temporal Back"
  const handleGlobalBack = () => {
    const { pathname, search } = location;

    // 1. Profile view with ?item=id
    if (search.includes('item=')) {
      // Stripping the query param goes back to the current list
      navigate(pathname, { replace: true });
      return;
    }

    // 2. Deep Nested Categories (/category/15/sub1/sub2...)
    if (pathname.startsWith('/category/')) {
      const parts = pathname.split('/').filter(Boolean); // ['category', '15', 'sub1', 'sub2']
      if (parts.length > 2) {
        // Pop last part to go up one level
        const parentPath = '/' + parts.slice(0, -1).join('/');
        navigate(parentPath);
      } else {
        // At the category root (e.g., /category/15), go to main menu
        navigate('/services');
      }
      return;
    }

    // 3. Hotline Nested Routes
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

    // 4. Standalone modules
    if (pathname === '/services') {
      navigate('/');
    } else if (['/hotline', '/online-haat', '/weather', '/info-submit', '/auth'].includes(pathname)) {
      navigate('/services');
    } else if (pathname === '/ledger') {
      navigate('/auth');
    } else if (pathname === '/') {
      const confirmExit = window.confirm("আপনি কি অ্যাপটি বন্ধ করতে চান?");
      if (confirmExit) {
        // Exit logic
      }
    } else {
      navigate('/services');
    }
  };

  if (isAtLanding) return null;

  return (
    <div className="fixed bottom-6 left-0 right-0 z-[80] flex justify-center items-end gap-5 pointer-events-none px-6">
      <button 
        onClick={() => navigate('/info-submit')}
        className={`w-12 h-12 rounded-full metallic-blue pointer-events-auto transition-all duration-300 ${isSubmit ? 'glow-active scale-110' : 'opacity-90'}`}
      >
        <PlusCircle size={22} strokeWidth={isSubmit ? 3 : 2} className="text-white" />
      </button>

      <button 
        onClick={handleGlobalBack}
        className={`w-14 h-14 rounded-full metallic-blue pointer-events-auto -translate-y-1.5 transition-all duration-300 shadow-xl`}
      >
        <ChevronLeft size={28} strokeWidth={3} className="text-white" />
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

const LandingScreen: React.FC<{ isDarkMode: boolean, setIsDarkMode: (v: boolean) => void }> = ({ isDarkMode, setIsDarkMode }) => {
  const navigate = useNavigate();
  return (
    <div className={`min-h-screen w-full relative flex flex-col items-center pt-10 pb-12 px-6 transition-colors duration-500 overflow-x-hidden ${isDarkMode ? 'bg-slate-950' : 'bg-white'}`}>
      
      <div className="w-full flex justify-end pr-2 mb-2 animate-in fade-in duration-1000">
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-4 rounded-[22px] bg-slate-900 dark:bg-slate-800 shadow-2xl text-white transition-all active:scale-90"
          >
            {isDarkMode ? <Sun size={24} /> : <Moon size={24} />}
          </button>
      </div>

      <div className="w-full max-w-sm mb-16 animate-in slide-in-from-top-6 duration-1000">
         <DateTimeBox />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-14 w-full max-w-sm animate-in fade-in zoom-in duration-1000 delay-200">
         <div className="space-y-6 text-center">
            <h1 className="text-5xl font-black tracking-tight text-[#0056b3] dark:text-blue-500 drop-shadow-sm">
              কয়রা-পাইকগাছা
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-bold text-xl px-4 leading-relaxed max-w-[320px] mx-auto">
              আপনার এলাকার সকল ডিজিটাল সেবা এখন এক ঠিকানায়
            </p>
         </div>

         <button 
           onClick={() => navigate('/services')}
           className="group relative w-[80%] py-6 bg-[#0056b3] dark:bg-blue-600 text-white font-black text-xl rounded-[35px] shadow-[0_20px_40px_-10px_rgba(0,86,179,0.4)] overflow-hidden active:scale-95 transition-all flex items-center justify-center gap-4"
         >
            সকল সেবা <ArrowRight size={26} className="group-hover:translate-x-2 transition-transform" />
         </button>
      </div>

      <div className="mt-auto pt-10 flex flex-col items-center justify-center gap-1.5 opacity-90 animate-in slide-in-from-bottom-4 duration-1000 delay-500">
          <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em]">Development by</p>
          <p className="text-[13px] font-black tracking-[0.05em] text-[#0056b3] dark:text-blue-400 uppercase">Intelligence Creation BD</p>
      </div>
    </div>
  );
};

const AppContent: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminPassword, setAdminPassword] = useState('Tayeb');
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [loginInput, setLoginInput] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [notices, setNotices] = useState<Notice[]>([
    { id: '1', content: 'কয়রা-পাইকগাছা ডিজিটাল অ্যাপে আপনাকে স্বাগতম!', date: new Date().toLocaleDateString() },
    { id: '2', content: 'জরুরি রক্তের প্রয়োজনে আমাদের সেচ্ছাসেবক টীমের সাথে যোগাযোগ করুন।', date: new Date().toLocaleDateString() }
  ]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('kp_logged_in_user');
    return saved ? JSON.parse(saved) : null;
  });

  const location = useLocation();
  const isLanding = location.pathname === '/';

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
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

  const handleLogout = () => {
    setIsAdminLoggedIn(false);
    setCurrentUser(null);
    setIsDrawerOpen(false);
    localStorage.removeItem('kp_logged_in_user');
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-slate-950 text-white' : 'bg-white text-[#1A1A1A]'}`}>
      
      {!isLanding && (
        <>
          <div className={`fixed inset-0 z-[100] transition-opacity duration-300 ${isDrawerOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <div className="absolute inset-0 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-sm" onClick={() => setIsDrawerOpen(false)} />
            <div className={`absolute top-0 left-0 bottom-0 w-80 bg-white dark:bg-slate-950 shadow-2xl transition-transform duration-300 ease-out border-r border-slate-100 dark:border-slate-800 flex flex-col ${isDrawerOpen ? 'translate-x-0' : '-translate-x-full'}`}>
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
                <div className="text-left flex flex-col">
                  <h2 className="font-black text-xl text-[#0056b3] dark:text-blue-400 shimmer-text">কয়রা-পাইকগাছা</h2>
                  <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest animate-pulse mt-0.5">ডিজিটাল অ্যাপে স্বাগতম</p>
                </div>
                <button onClick={() => setIsDrawerOpen(false)} className="p-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm text-slate-400 dark:text-slate-500 transition-colors">
                  <X size={20} />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto pt-4 space-y-4">
                 <nav className="px-4 space-y-1">
                    {currentUser ? (
                      <button 
                        onClick={() => { setIsDrawerOpen(false); window.location.hash = '/auth'; }}
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
                      <MenuLink icon={<UserIcon size={20} />} label="আমার প্রোফাইল" onClick={() => { setIsDrawerOpen(false); window.location.hash = '/auth'; }} />
                    )}
                    
                    <MenuLink icon={<PlusCircle size={20} />} label="তথ্য প্রদান" onClick={() => { setIsDrawerOpen(false); window.location.hash = '/info-submit'; }} />
                    <MenuLink icon={<MessageSquare size={20} />} label="Help Chat" onClick={() => { setIsDrawerOpen(false); window.location.hash = '/hotline'; }} />
                    
                    {isAdminLoggedIn && (
                       <MenuLink icon={<Lock size={20} />} label="এডমিন প্যানেল" onClick={() => { setIsDrawerOpen(false); window.location.hash = '/admin'; }} />
                    )}
                 </nav>
              </div>

              <div className="p-6 border-t border-slate-100 dark:border-slate-800 space-y-6 bg-slate-50/30 dark:bg-slate-900/20">
                {(isAdminLoggedIn || currentUser) ? (
                  <button onClick={handleLogout} className="w-full py-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-2xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-all">
                    <LogOut size={20} /> লগআউট করুন
                  </button>
                ) : (
                  <button onClick={() => { setIsDrawerOpen(false); window.location.hash = '/auth'; }} className="w-full py-4 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-red-400 rounded-2xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-all">
                    <LogInIcon size={20} /> লগইন করুন
                  </button>
                )}
                <div className="flex flex-col items-center justify-center gap-1 float-small">
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
                <button onClick={() => setShowAdminLogin(true)} className={`group p-2.5 rounded-xl transition-all duration-300 active:scale-90 ${isAdminLoggedIn ? 'text-white bg-white/10' : 'text-white/70 hover:text-white hover:bg-white/10'}`}>
                  <Lock size={20} strokeWidth={2} />
                </button>
              </div>
              <div className="flex flex-col items-center">
                <h1 className="font-black text-2xl tracking-tight text-white leading-none drop-shadow-sm">কয়রা-পাইকগাছা</h1>
                <span className="text-[10px] font-black text-cyan-300 tracking-wider animate-sub-title mt-1.5 uppercase">এক ক্লিকে সকল তথ্য</span>
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

      <main className={`max-w-md mx-auto ${isLanding ? 'p-0 m-0 w-full h-screen' : 'min-h-[calc(100vh-64px)] pb-40'}`}>
        <Routes>
          <Route path="/" element={<LandingScreen isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />} />
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
          <Route 
            path="/admin" 
            element={isAdminLoggedIn ? <AdminDashboard submissions={submissions} notices={notices} onUpdateNotices={setNotices} onUpdatePassword={setAdminPassword} adminPassword={adminPassword} onUpdateSubmissions={setSubmissions} /> : <Navigate to="/auth" />} 
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>

      {!isLanding && <BottomNav />}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;
