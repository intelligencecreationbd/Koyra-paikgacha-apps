
import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  Info, 
  History as HistoryIcon,
  Map,
  Waves,
  Landmark as LandmarkIcon,
  Users2,
  Users,
  GraduationCap,
  Trophy,
  Store,
  School,
  Trees,
  Home as HomeIcon,
  Telescope,
  Fish,
  Anchor as AnchorIcon,
  Droplets,
  Shrub,
  Church,
  Palmtree,
  ChevronUp,
  ChevronDown,
  Navigation,
  Layers,
  Milestone,
  Library,
  BookOpen
} from 'lucide-react';
import { ICON_MAP } from '../constants';

// Firebase Imports
import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, set, get } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

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

const SkeletonItem = () => (
  <div className="w-full flex items-center justify-between p-5 bg-white border border-slate-100 rounded-[24px] shadow-sm animate-pulse">
    <div className="space-y-3 flex-1">
      <div className="h-5 bg-slate-200 rounded-lg w-3/4"></div>
      <div className="h-3 bg-slate-100 rounded-lg w-1/2"></div>
      <div className="h-3 bg-slate-50 rounded-lg w-1/3"></div>
    </div>
    <div className="w-12 h-12 bg-slate-100 rounded-xl ml-4"></div>
  </div>
);

/**
 * @LOCKED_COMPONENT
 * @Section Traditional & Historical Information (ঐতিহ্য)
 * @Status Design & Content Finalized
 */
const TraditionalHistory: React.FC<{ busId: string; onBack: () => void }> = ({ busId, onBack }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [content, setContent] = useState<any>(null);
  const [isSectionExpanded, setIsSectionExpanded] = useState<Record<string, boolean>>({});

  const getIconStyle = (iconName: string) => {
    switch (iconName) {
      case 'Navigation': return { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-100' };
      case 'Map': return { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100' };
      case 'Layers': return { bg: 'bg-violet-50', text: 'text-violet-600', border: 'border-violet-100' };
      case 'Milestone': return { bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-100' };
      case 'Library': return { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100' };
      case 'Waves':
      case 'WavesIcon': return { bg: 'bg-cyan-50', text: 'text-cyan-600', border: 'border-cyan-100' };
      case 'Landmark':
      case 'LandmarkIcon': return { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100' };
      case 'Users2':
      case 'Users': return { bg: 'bg-pink-50', text: 'text-pink-600', border: 'border-pink-100' };
      case 'GraduationCap':
      case 'School': return { bg: 'bg-teal-50', text: 'text-teal-600', border: 'border-teal-100' };
      case 'History': return { bg: 'bg-fuchsia-50', text: 'text-fuchsia-600', border: 'border-fuchsia-100' };
      case 'BookOpen': return { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-100' };
      case 'Trophy': return { bg: 'bg-yellow-50', text: 'text-yellow-600', border: 'border-yellow-100' };
      case 'Store': return { bg: 'bg-sky-50', text: 'text-sky-600', border: 'border-sky-100' };
      case 'Trees': return { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-100' };
      case 'HomeIcon': return { bg: 'bg-lime-50', text: 'text-lime-600', border: 'border-lime-100' };
      case 'Telescope': return { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-100' };
      case 'Fish': return { bg: 'bg-blue-50', text: 'text-blue-500', border: 'border-blue-100' };
      case 'AnchorIcon': return { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-200' };
      case 'Droplets': return { bg: 'bg-blue-50', text: 'text-blue-400', border: 'border-blue-100' };
      case 'Shrub': return { bg: 'bg-emerald-50', text: 'text-emerald-500', border: 'border-emerald-100' };
      case 'Church': return { bg: 'bg-indigo-50', text: 'text-indigo-400', border: 'border-indigo-100' };
      default: return { bg: 'bg-slate-50', text: 'text-slate-500', border: 'border-slate-100' };
    }
  };

  useEffect(() => {
    const handleTraditionalDataSync = async () => {
      setIsLoading(true);
      const dataRef = ref(db, `traditional_and_historical/${busId}`);
      try {
        const snapshot = await get(dataRef);
        const fullMigrationSource: any = {
          "9-1-1": {
            id: "9-1-1",
            title: 'কয়রা উপজেলা: সুন্দরবন সংলগ্ন ঐতিহাসিক জনপদ',
            cards: [
              { title: 'ভৌগোলিক অবস্থান', icon: 'Navigation', text: 'কয়রার ভৌগোলিক অবস্থান ', highlight: '২২.৩৪১৭° উত্তর ৮৯.৩০০০° পূর্ব।', subText: 'এখানে ২৮০৬১ পরিবারের ইউনিট রয়েছে এবং মোট এলাকা ১৭৭৫.৪১ কিমি²।' },
              { title: 'ভৌগোলিক সীমানা', icon: 'Map', text: 'উত্তরে পাইকগাছা উপজেলা, দক্ষিণ বঙ্গোপসাগর ও সুন্দরবন, পূর্বে দাকোপ উপজেলা, পশ্চিমে ', highlight: 'সাতক্ষীরা জেলার শ্যামনগর ও আশাশুনি উপজেলা।', subText: 'এটি খুলনার সর্বদক্ষিণের শেষ সীমান্ত।' },
              { title: 'প্রশাসনিক ইউনিটসমূহ', icon: 'Layers', text: 'কয়রায় রয়েছে ', highlight: '৭টি ইউনিয়ন, ৭২টি মৌজা/মহল্লা এবং ১৩িল গ্রাম।', subText: 'ইউনিয়নগুলি: আমাদী, বাগালী, মহেশ্বরীপুর, মহারাজপুর, কয়রা, উত্তর বেদকাশী ও দক্ষিণ বেদকাশী।' },
              { title: 'সূচনা ও প্রশাসনিক গঠন', icon: 'Milestone', text: 'কয়রা ১৯৭৯ সালে থানা হিসেবে যাত্রা শুরু করে এবং পরবর্তীতে ', highlight: '১৯৮৩ সালের ৭ নভেম্বর', subText: 'এটি পূর্ণাঙ্গ উপজেলায় রূপান্তরিত হয়।' },
              { title: 'ঐতিহাসিক প্রেক্ষাপট ও নামকরণ', icon: 'Library', text: '১৫শ শতাব্দীতে খান জাহান আলী (র.)-এর অনুসারীরা এখানে বসতি স্থাপন করেন। নামকরণ নিয়ে মতভেদ থাকলেও ', highlight: 'কাওরা গোষ্ঠী', subText: 'অথবা কয়লা পরিবহনের ঘাট থেকে "কয়রা" নামটি এসেছে বলে ধারণা করা হয়।' },
              { title: 'নদ-নদী ও সুন্দরবন', icon: 'Waves', text: 'এটি কপোতাক্ষ, শাকবাড়িয়া ও শিবসা নদীবেষ্টিত জনপদ। কয়রাকে বলা হয় ', highlight: 'সুন্দরবনের প্রবেশদ্বার।', subText: 'উপজেলার দক্ষিণে সুন্দরবনের কাশিয়াবাদ রেঞ্জ অবস্থিত যা পর্যটনের অন্যতম আকর্ষণ।' },
              { title: 'পুরাকীর্তি ও দর্শনীয় স্থান', icon: 'Landmark', text: 'খান জাহান আলী শৈলীর ', highlight: 'মসজিদকুঁড় ৯ গুম্বুজ মসজিদ', subText: 'এবং সুন্দরবনের তীরে অবস্থিত মোগল আমলের শেষার্ধের মন্দির এর প্রধান আকর্ষণ।' },
              { title: 'সংস্কৃতি ও নৃগোষ্ঠী', icon: 'Users2', text: 'এখানে ', highlight: 'মাহাতো ও মুণ্ডা', subText: 'ক্ষুদ্র নৃগোষ্ঠীর বসবাস রয়েছে। বনবিবির পালা ও গাজীর গান এখানকার লোকসংস্কৃতির অবিচ্ছেদ্য অংশ।' }
            ],
            expandables: [
              { id: 'koy_war', title: 'মুক্তিযুদ্ধের স্মৃতি ও গৌরব', icon: 'History', text: 'মুক্তিযুদ্ধের সময় কয়রা উপজেলা ৯নং সেক্টরের অধীন ছিল। এখানে ৯ নং সাব-সেক্টর হেডকোয়ার্টার স্থাপিত হয়েছিল যেটা আমাদী ইউনিয়নে বাছাড়বাড়ি-মনোরঞ্জন ক্যাম্প নামে সুপরিচিত এবং এখান থেকেই মুক্তিবাহিনী ও মুজিববাহিনীর মোট ২৩টি ক্যাম্প ও অধিকাংশ অভিযান পরিচালিত হতো।' },
              { id: 'koy_notable', title: 'উল্লেখযোগ্য ব্যক্তি', icon: 'Trophy', text: 'খান সাহেব কোমর উদ্দিন ঢালী - ব্রিটিশ সরকার কর্তৃক খানসাহেব উপাধিপ্রাপ্ত ও পাকিস্তান সরকার কর্তৃক সমাজসেবক পতাকার খেদমত উপাধিপ্রাপ্ত।\nরোমান সানা - স্বর্ণপদক বিজয়ী তীরন্দাজ।' }
            ]
          },
          "9-1-2": {
            id: "9-1-2",
            title: 'পাইকগাছা উপজেলা: দক্ষিণ খুলনার প্রাণকেন্দ্র',
            cards: [
              { title: 'ভৌগোলিক অবস্থান ও পরিচয়', icon: 'Navigation', text: 'পাইকগাছা বাংলাদেশের খুলনা জেলার দক্ষিণে অবস্থিত একটি উপজেলা। এটি ', highlight: '২২°৩৫\'৩১" উত্তর ৮৯°২০\'১৩" পূর্ব', subText: 'অস্থান করছে। এটি দক্ষিণ খুলনার অন্যতম সমৃদ্ধ বাণিজ্যিক ও উর্বর জনপদ।' },
              { title: 'সীমানা ও আয়তন', icon: 'Map', text: 'উপজেলার মোট আয়তন ', highlight: '৩৮৩.৮৭ বর্গকিলোমিটার।', subText: 'উত্তরে তালা ও ডুমুরিয়া, দক্ষিণে সুন্দরবন ও কয়রা, পূর্বে বটিয়াঘাটা ও দাকোপ।' },
              { title: 'নদ-নদী ও প্রকৃতি', icon: 'Waves', text: 'উপজেলার মধ্য দিয়ে শিবসা, কপোতাক্ষ, ভদ্রা, ডেলুটি ও কড়ুলিয়া নদী প্রবাহিত। এটি ', highlight: 'সুন্দরবনের কোল ঘেঁষে', subText: 'গড়ে ওঠা এক নয়নাভিরাম প্রাকৃতিক সৌন্দর্যমণ্ডিত জনপদ।' }
            ],
            expandables: [
              { id: 'pai_hist', title: 'ঐতিহাসিক প্রেক্ষাপট', icon: 'History', text: 'মুক্তিযুদ্ধের ইতিহাসে পাইকগাছা একটি গুরুত্বপূর্ণ নাম. ১৯৭১ সালের ৬ ডিসেম্বর কপিলমুনি রাজাকার ক্যাম্পটি দখলের জন্য বীর মুক্তিযোদ্ধাদের নেতৃত্বে এক সাঁড়াশি অভিযান শুরু হয়। তিন দিন একটানা যুদ্ধের পর ৯ ডিসেম্বর কপিলমুনি যুদ্ধের অবসান হয়।' },
              { id: 'pai_name', title: 'নামকরণের ইতিহাস', icon: 'BookOpen', text: 'পাইকগাছার নামকরণের পেছনে রয়েছে নানা কিংবদন্তি. কথিত আছে, অতীতে এই অঞ্চলে প্রচুর "পাইক" বা বরকন্দাজরা গাছে চড়ে পাহারা দিত বলে এর নাম হয়েছে "পাইকগাছা"।' }
            ]
          },
          "9-2-1": {
            id: "9-2-1",
            title: 'কয়রা উপজেলার দর্শনীয় স্থান',
            spots: [
              { title: 'বিশ্ব ঐতিহ্যবাহী সুন্দরবন', highlight: 'ইউনেস্কো ঘোষিত বিশ্ব ঐতিহ্য', desc: 'কয়রা উপজেলার দক্ষিণাঞ্চল জুড়ে বিশ্বের বৃহত্তম ম্যানগ্রোভ বন সুন্দরবন বিস্তৃত। সুন্দরবনের প্রাকৃতিক সৌন্দর্য ও রয়্যাল বেঙ্গল টাইগারের অন্যতম আবাসভূমি.', icon: 'Trees' },
              { title: 'ঐতিহাসিক মসজিদকুঁড় ৯ গুম্বুজ মসজিদ', highlight: '১৫শ শতাব্দীর প্রত্নতাত্ত্বিক নিদর্শন', desc: 'খান জাহান আলী (র.)-এর আমল বা তাঁর স্থাপত্যশৈলী অনুসরণ করে নির্মিত এই মসজিদটি কয়রা আমাদী ইউনিয়নে অবস্থিত।', icon: 'LandmarkIcon' },
              { title: 'কাছারী বাড়ি বটবৃক্ষ', highlight: 'শতবর্ষী প্রাকৃতিক ঐশ্বর্য', desc: 'উপজেলা সদরের নিকটবর্তী ঐতিহাসিক কাছারী বাড়ির বিশাল বটবৃক্ষটি যেন কালের সাক্ষী।', icon: 'Shrub' },
              { title: 'দুবলার চর', highlight: 'জেলে পল্লী ও পর্যটন দ্বীপ', desc: 'সুন্দরবনের অভ্যন্তরে কপোতাক্ষ ও শিবসা নদীর মোহনায় অবস্থিত এই দ্বীপটি। শুঁটকি মাছ উৎপাদন এবং রাস মেলার জন্য পরিচিত।', icon: 'AnchorIcon' }
            ]
          },
          "9-2-2": {
            id: "9-2-2",
            title: 'পাইকগাছা উপজেলার দর্শনীয় স্থান',
            spots: [
              { title: 'স্যার পি. সি. রায়ের বাড়ি', highlight: 'বিশ্বখ্যাত বিজ্ঞানীর পৈতৃক নিবাস', desc: 'পাইকগাছার রাড়ুলী গ্রামে অবস্থিত প্রখ্যাত বিজ্ঞানী আচার্য স্যার প্রফুল্ল চন্দ্র রায়ের বাড়ি। এটি একটি সংরক্ষিত প্রত্নতাত্ত্বিক এলাকা।', icon: 'Telescope' },
              { title: 'মৎস্য গবেষণা ও লোনা পানি কেন্দ্র', highlight: 'দক্ষিণ এশিয়ার অন্যতম মৎস্য কেন্দ্র', desc: 'পাইকগাছা সদরে অবস্থিত এই কেন্দ্রটি লোনা পানির মৎস্য প্রজনন ও গবেষণার জন্য অত্যন্ত পরিচিত।', icon: 'Fish' },
              { title: 'কপিলমুনি বেদ মন্দির', highlight: 'প্রাচীন আধ্যাত্মিক নিদর্শন', desc: 'কপিলমুনি বাজারে অবস্থিত ঐতিহাসিকভাবে অত্যন্ত সমৃদ্ধ এই মন্দিরটি স্থাপত্যশৈলী এবং আধ্যাত্মিক পরিবেশের জন্য পর্যটকদের কাছে আকর্ষণীয়।', icon: 'LandmarkIcon' }
            ]
          }
        };

        const existingData = snapshot.val();
        if (!existingData && fullMigrationSource[busId]) {
          await set(dataRef, fullMigrationSource[busId]);
          setContent(fullMigrationSource[busId]);
        } else {
          setContent(existingData);
        }
      } catch (e) {
        console.error("Database Error:", e);
      } finally {
        setIsLoading(false);
      }
    };
    handleTraditionalDataSync();
  }, [busId]);

  if (isLoading) return <div className="space-y-4 p-5">{[1, 2, 3].map(i => <SkeletonItem key={i} />)}</div>;
  if (!content) return <div className="py-20 text-center opacity-30">তথ্য পাওয়া যায়নি।</div>;

  return (
    <div className="space-y-5 animate-in fade-in duration-700 pb-10">
      <div className="flex items-center gap-4 mb-2">
        <button onClick={onBack} className="p-3 bg-white border border-slate-100 rounded-xl shadow-sm transition-transform active:scale-90"><ChevronLeft size={24} /></button>
        <div className="text-left">
          <h2 className="text-xl font-black text-slate-800 leading-tight">{content.title}</h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">ঐতিহ্য ও সংস্কৃতির সংগৃহীত তথ্যমালা</p>
        </div>
      </div>

      {content.cards?.map((card: any, idx: number) => {
        const CardIcon = ICON_MAP[card.icon] || Info;
        const style = getIconStyle(card.icon);
        return (
          <div key={idx} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm text-left space-y-3">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 ${style.bg} border ${style.border} rounded-2xl ${style.text} shadow-sm`}><CardIcon size={20} /></div>
              <h4 className="font-black text-slate-800 text-lg">{card.title}</h4>
            </div>
            <p className="text-sm font-bold text-slate-600 leading-relaxed text-justify">
              {card.text} <span className="text-blue-700 font-black px-1.5 py-0.5 bg-blue-50 rounded-lg">{card.highlight}</span>
            </p>
            {card.subText && <p className="text-[11px] font-bold text-slate-400 pl-4 border-l-2 border-slate-100">{card.subText}</p>}
          </div>
        );
      })}

      {content.expandables?.map((section: any) => {
        const SectionIcon = ICON_MAP[section.icon] || Info;
        const isExpanded = isSectionExpanded[section.id];
        const style = getIconStyle(section.icon);
        return (
          <div key={section.id} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm text-left space-y-3">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 ${style.bg} border ${style.border} rounded-2xl ${style.text} shadow-sm`}><SectionIcon size={20} /></div>
              <h4 className="font-black text-slate-800 text-lg">{section.title}</h4>
            </div>
            <div className="relative">
              <p className={`text-sm font-bold text-slate-600 leading-relaxed text-justify whitespace-pre-line ${isExpanded ? '' : 'line-clamp-4'}`}>
                {section.text}
              </p>
              <button onClick={() => setIsSectionExpanded(prev => ({...prev, [section.id]: !isExpanded}))} className="mt-2 flex items-center gap-1.5 text-xs font-black text-blue-600">
                {isExpanded ? 'সংক্ষিপ্ত করুন' : 'আরও পড়ুন'} {isExpanded ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
              </button>
            </div>
          </div>
        );
      })}

      {content.spots?.map((spot: any, idx: number) => {
        const style = getIconStyle(spot.icon);
        return (
          <div key={idx} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm text-left space-y-4">
            <div className="flex items-center gap-4">
              <div className={`p-3.5 ${style.bg} border ${style.border} rounded-2xl ${style.text} shadow-sm`}><Info size={24} /></div>
              <div>
                <h4 className="font-black text-slate-800 text-lg leading-tight">{spot.title}</h4>
                <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mt-1">{spot.highlight}</p>
              </div>
            </div>
            <p className="text-sm font-bold text-slate-500 leading-relaxed text-justify">{spot.desc}</p>
          </div>
        );
      })}
    </div>
  );
};

export default TraditionalHistory;
