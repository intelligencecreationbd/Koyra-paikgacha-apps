
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, MessagesSquare, Sparkles, Clock } from 'lucide-react';

const KPCommunityChat: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="p-5 min-h-screen bg-white animate-in fade-in duration-500">
      <header className="flex items-center gap-4 mb-12">
        <button 
          onClick={() => navigate('/services')} 
          className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100 active:scale-90 transition-all"
        >
          <ChevronLeft size={24} className="text-slate-800" />
        </button>
        <div className="text-left">
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">কেপি চ্যাট</h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">কমিউনিটি কথোপকথন</p>
        </div>
      </header>

      <div className="flex flex-col items-center justify-center py-20 text-center space-y-8">
        <div className="relative">
          <div className="absolute inset-0 bg-blue-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="relative w-32 h-32 bg-blue-50 rounded-[40px] flex items-center justify-center text-blue-600 shadow-xl border border-blue-100 animate-bounce">
            <MessagesSquare size={56} strokeWidth={1.5} />
          </div>
          <div className="absolute -top-2 -right-2 p-2 bg-amber-400 text-white rounded-full shadow-lg border-4 border-white animate-spin-slow">
            <Sparkles size={16} />
          </div>
        </div>

        <div className="space-y-4 max-w-xs mx-auto">
          <h1 className="text-3xl font-black text-slate-800 leading-tight">
            কেপি কমিউনিটি চ্যাট <br /> 
            <span className="text-blue-600">শীঘ্রই আসছে!</span>
          </h1>
          <p className="text-sm font-bold text-slate-400 leading-relaxed">
            আমরা আমাদের নতুন চ্যাট ফিচার নিয়ে কাজ করছি। খুব শীঘ্রই আপনারা একে অপরের সাথে সরাসরি যোগাযোগ করতে পারবেন।
          </p>
        </div>

        <div className="flex items-center gap-2 px-6 py-3 bg-slate-50 rounded-2xl border border-slate-100 text-slate-500">
           <Clock size={16} className="animate-spin-slow" />
           <span className="text-xs font-black uppercase tracking-widest">উন্নয়ন কাজ চলছে</span>
        </div>
      </div>

      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default KPCommunityChat;
