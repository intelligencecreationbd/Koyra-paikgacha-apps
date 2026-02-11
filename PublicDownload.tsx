
import React, { useRef } from 'react';
import { 
  ChevronLeft, 
  Download, 
  Zap, 
  ShieldCheck, 
  Heart, 
  Star, 
  Gift, 
  Bus, 
  NotebookTabs, 
  CloudSun, 
  Newspaper, 
  Scale, 
  Phone, 
  Camera 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface DownloadFeatureCardProps {
  icon: React.ReactNode;
  title: string;
  text: string;
  titleColor: string;
}

const DownloadFeatureCard: React.FC<DownloadFeatureCardProps> = ({ icon, title, text, titleColor }) => (
  <div className="p-6 bg-white rounded-[32px] border border-slate-100 shadow-sm flex items-start gap-4 text-left animate-in slide-in-from-bottom-3 duration-500">
    <div className="p-3 bg-slate-50 text-blue-600 rounded-2xl shadow-inner shrink-0">
      {icon}
    </div>
    <div className="overflow-hidden">
      <h4 className={`font-black text-base mb-1 shimmer-text ${titleColor}`}>{title}</h4>
      <p className="text-xs font-bold text-slate-400 leading-relaxed">{text}</p>
    </div>
  </div>
);

interface PublicDownloadProps {
  appLogo: string;
  isAdminLoggedIn: boolean;
  onLogoChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

/**
 * @LOCKED_COMPONENT
 * @Section Public Download Page
 * @Status Design & Logic Finalized - Locked - Version Text Removed
 */
const PublicDownload: React.FC<PublicDownloadProps> = ({ appLogo, isAdminLoggedIn, onLogoChange }) => {
  const navigate = useNavigate();
  const logoInputRef = useRef<HTMLInputElement>(null);

  const handleDownload = () => {
    window.open('https://apk.e-droid.net/apk/app3918325-2w7cqi.apk?v=4', '_blank');
  };

  return (
    <div className="min-h-screen bg-white animate-in fade-in duration-500 pb-20 overflow-x-hidden">
      <header className="flex items-center justify-center px-6 pt-6 pb-4 relative z-10 w-full">
        <button 
          onClick={() => navigate(-1)} 
          className="absolute left-6 p-2 bg-white rounded-xl shadow-sm border border-slate-100 active:scale-90 transition-all"
        >
          <ChevronLeft size={20} className="text-slate-800" />
        </button>
        <div className="flex flex-col items-center text-center">
          <h2 className="text-lg font-black text-slate-800 tracking-tight leading-tight">কয়রা-পাইকগাছা কমিউনিটি এপস</h2>
          <p className="text-[10px] font-black uppercase tracking-widest animate-rainbow-text mt-1">বিপদে আপনার বন্ধু</p>
        </div>
      </header>

      <div className="px-6 space-y-8 flex flex-col items-center pt-4">
        {/* Highlighted Box for Logo and Button with Watermark */}
        <div className="w-full bg-slate-50/80 rounded-[45px] p-10 border border-slate-100 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] relative overflow-hidden flex flex-col items-center gap-8">
          {/* Watermark Logo */}
          <img 
            src={appLogo} 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-auto opacity-[0.04] pointer-events-none grayscale scale-125" 
            alt="Watermark" 
            onError={(e) => (e.target as any).style.display = 'none'}
          />

          <div className="relative animate-in zoom-in duration-1000 delay-200">
            <div className="absolute inset-0 bg-blue-400/20 rounded-full blur-[80px] animate-pulse"></div>
            <div className="relative w-32 h-32 bg-white rounded-full shadow-2xl flex items-center justify-center border-[4px] border-white overflow-hidden p-1">
              <img 
                src={appLogo} 
                className="w-full h-full object-cover rounded-full" 
                alt="App Logo"
                onError={(e) => {
                  (e.target as any).src = 'https://raw.githubusercontent.com/StackBlitz-User-Assets/logo/main/kp-logo.png';
                }}
              />
              {isAdminLoggedIn && (
                <>
                  <button 
                    onClick={() => logoInputRef.current?.click()}
                    className="absolute bottom-1 right-1 p-2.5 bg-slate-900/80 text-white rounded-full border-2 border-white shadow-xl active:scale-90 transition-all z-20"
                  >
                    <Camera size={14} />
                  </button>
                  <input 
                    type="file" 
                    ref={logoInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    onChange={onLogoChange} 
                  />
                </>
              )}
            </div>
          </div>

          <button 
            onClick={handleDownload}
            className="w-full py-4 download-btn-animate text-white font-black text-lg rounded-[25px] shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3 animate-in slide-in-from-bottom-6 duration-1000 relative z-10 border-b-4 border-indigo-900/20"
          >
            <Download size={22} className="live-download-icon" /> দ্রুত ডাউনলোড করুন
          </button>
        </div>

        <div className="w-full space-y-6">
          <div className="text-center">
            <h3 className="text-xl font-black text-blue-600 flex items-center justify-center gap-1">
              কেন এপসটি ডাউনলোড করবেন 
              <span className="text-red-600 inline-block animate-question ml-2 text-3xl font-black">?</span>
            </h3>
            <div className="w-12 h-1 bg-blue-600/10 mx-auto mt-3 rounded-full"></div>
          </div>

          <div className="grid gap-4 w-full">
            <DownloadFeatureCard 
              icon={<Gift size={22} />} 
              title="বিনামূল্যে সেবা গ্রহন" 
              titleColor="text-pink-600"
              text="এপসটি কোনো প্রকার চার্জ বা শর্ত ছাড়াই ব্যাবহার করুন" 
            />
            <DownloadFeatureCard 
              icon={<Bus size={22} />} 
              title="এক ক্লিকে সকল বাস কাউন্টারের নাম্বার" 
              titleColor="text-orange-600"
              text="কয়রা বা পাইকগাছা থেকে সকল রুটের সকল বাসের সকল কাউন্টারের মোবাইল নাম্বার" 
            />
            <DownloadFeatureCard 
              icon={<NotebookTabs size={22} />} 
              title="ডিজিটাল খাতা" 
              titleColor="text-indigo-600"
              text="আপনার ব্যাক্তিগত অর্থের হিসাব রাখুন সহজে, এটা সম্পূর্ণ নিরাপত্তা নিশ্চিত করা হয়েছে" 
            />
            <DownloadFeatureCard 
              icon={<CloudSun size={22} />} 
              title="আবহাওয়ার সংবাদ" 
              titleColor="text-cyan-600"
              text="কয়রা-পাইকগাছা উপকূলীয় উপজেলা এখানে প্রাকৃতিক দুর্যোগ প্রচুর আঘাত হানে, এজন্য 'আবহাওয়া' ফিচার টি দারুণ উপকারে আসবে" 
            />
            <DownloadFeatureCard 
              icon={<Newspaper size={22} />} 
              title="স্থানীয় সংবাদ" 
              titleColor="text-green-600"
              text="যদি কারর কোনো কিছু হারিয়ে যায় কিংবা কেউ কোনোকিছু পেয়েছে ফেরত দিতে চাই, তাছাড়া গুরুত্বপূর্ণ অথেন্টিক সংবাদ প্রকাশ করা হয়। আপনিও চাইলে সংবাদ প্রকাশ করতে পারবেন।" 
            />
            <DownloadFeatureCard 
              icon={<Scale size={22} />} 
              title="আইনি সেবা" 
              titleColor="text-blue-700"
              text="আপনার এলাকার আইনজীবীদের এবং সার্ভেয়ারদের সকল তথ্য পাবেন।" 
            />
            <DownloadFeatureCard 
              icon={<Phone size={22} />} 
              title="ডিজিটাল ফোন ডিরেক্টরি" 
              titleColor="text-purple-600"
              text="যা 'মোবাইল নাম্বার' মেনু নামে শো করছে, এখানে কয়রা এবং পাইকগাছার সকল নির্বাচিত নেতাকর্মী, সকল সরকারি অফিসের মোবাইল নং, ইমেইল ঠিকানা সহ প্রয়োজনীয় সবকিছু এক সাথে।" 
            />
            <DownloadFeatureCard 
              icon={<Zap size={22} />} 
              title="দ্রুততর এক্সেস" 
              titleColor="text-blue-600"
              text="কোনো ব্রাউজার ছাড়াই সরাসরি আপনার ফোন থেকে সকল সেবা ব্যবহার করতে পারবেন এক ক্লিকে।" 
            />
            <DownloadFeatureCard 
              icon={<ShieldCheck size={22} />} 
              title="নিরাপদ ব্যবহার" 
              titleColor="text-emerald-600"
              text="এপসটি গুগল এবং উন্নত সিকিউরিটি স্ট্যান্ডার্ড মেনে তৈরি করা হয়েছে, যা আপনার তথ্যের নিরাপত্তা নিশ্চিত করে।" 
            />
            <DownloadFeatureCard 
              icon={<Heart size={22} />} 
              title="ব্যবহারকারীর সুবিধা" 
              titleColor="text-rose-600"
              text="এপসের ইন্টারফেস অত্যন্ত সহজ এবং আকর্ষণীয়, যা বয়স্ক থেকে তরুণ সবার ব্যবহারের উপযোগী।" 
            />
            <DownloadFeatureCard 
              icon={<Star size={22} />} 
              title="অফলাইন সুবিধা" 
              titleColor="text-orange-600"
              text="একবার তথ্য লোড হলে ইন্টারনেটের গতি কম থাকলেও অনেক তথ্য আপনি দ্রুত ব্রাউজ করতে পারবেন।" 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicDownload;
