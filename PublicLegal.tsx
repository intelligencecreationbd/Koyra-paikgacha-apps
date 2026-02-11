
import React, { useState, useEffect, useMemo } from 'react';
import { 
  ChevronLeft, 
  ArrowRight, 
  PhoneCall, 
  Building2, 
  Smartphone, 
  ShieldCheck, 
  Users, 
  X,
  MapPin,
  Mail,
  UserCheck,
  Scale,
  Home,
  Info
} from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { LegalServiceContact } from '../types';

// Firebase Imports
import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

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

const convertBnToEn = (str: string) => {
  const bn = ['০','১','২','৩','৪','৫','৬','৭','৮','৯'], en = ['0','1','2','3','4','5','6','7','8','9'];
  return (str || '').toString().split('').map(c => bn.indexOf(c) !== -1 ? en[bn.indexOf(c)] : c).join('');
};

const formatWhatsAppNumber = (num: string) => {
  const enNum = convertBnToEn(num || '');
  const cleaned = enNum.replace(/\D/g, '');
  if (cleaned.startsWith('0')) return `88${cleaned}`;
  return cleaned;
};

const WhatsAppIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.414 0 0 5.414 0 12.05c0 2.123.552 4.197 1.6 6.02L0 24l6.142-1.61A11.815 11.815 0 0012.05 24.1c6.632 0 12.05-5.417 12.05-12.05 0-3.212-1.25-6.232-3.518-8.513z"/>
  </svg>
);

const THEME_COLORS = [
  '#4F46E5', '#0EA5E9', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316', '#6366F1',
];

const SkeletonLegal = () => (
  <div className="space-y-4 animate-pulse pt-4">
    {[1, 2, 3, 4].map(i => (
      <div key={i} className="h-28 bg-white border border-slate-100 rounded-[28px] w-full shadow-sm"></div>
    ))}
  </div>
);

const DetailCard: React.FC<{ 
  icon: React.ReactNode; 
  label: string; 
  value: string; 
  colorClass?: string;
  actions?: React.ReactNode;
}> = ({ icon, label, value, colorClass = "bg-slate-50", actions }) => (
  <div className={`py-2.5 px-4 rounded-[20px] border border-slate-100 flex items-center justify-between shadow-sm ${colorClass}`}>
    <div className="flex items-center gap-3 text-left overflow-hidden">
      <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shrink-0 shadow-sm text-slate-400">
        {icon}
      </div>
      <div className="overflow-hidden">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0">{label}</p>
        <p className="text-sm font-bold text-slate-700 leading-tight truncate">{value}</p>
      </div>
    </div>
    {actions && <div className="flex gap-2 ml-2">{actions}</div>}
  </div>
);

/**
 * @LOCKED_COMPONENT
 * @Section Public Legal Service View (আইনি সেবা)
 * @Status Design Updated - Professional Card View with Direct Actions
 */
const PublicLegal: React.FC<{ 
  subId?: string; 
  onNavigate: (path: string) => void;
  onBack: () => void;
}> = ({ subId, onNavigate, onBack }) => {
  const [legalData, setLegalData] = useState<LegalServiceContact[]>([]);
  const [dynamicSubMenus, setDynamicSubMenus] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const profileIdFromUrl = searchParams.get('item');

  useEffect(() => {
    setIsLoading(true);
    const legalRef = ref(db, 'legal_services');
    const unsubscribe = onValue(legalRef, snap => {
      const data = snap.val();
      if (data) {
        const list: LegalServiceContact[] = [];
        const subMenus: any[] = [];
        Object.keys(data).forEach(catId => {
          const items = Object.values(data[catId]) as LegalServiceContact[];
          if (items.length > 0) {
            list.push(...items);
            if (!subMenus.find(s => s.id === catId)) {
              subMenus.push({ id: catId, name: items[0].categoryName });
            }
          }
        });
        setLegalData(list);
        setDynamicSubMenus(subMenus);
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const filteredContacts = useMemo(() => {
    return legalData.filter(l => l.categoryId === subId);
  }, [legalData, subId]);

  const selectedProfile = useMemo(() => {
    if (!profileIdFromUrl) return null;
    return legalData.find(item => item.id === profileIdFromUrl) || null;
  }, [profileIdFromUrl, legalData]);

  if (isLoading) return <div className="p-5 space-y-4"><SkeletonLegal /></div>;

  if (selectedProfile) {
    const p = selectedProfile;
    const emailField = p.customFields?.find(f => f.label.toLowerCase().includes('email'));
    const asstName = p.customFields?.find(f => f.label === 'সহকারীর নাম');
    const asstMobile = p.customFields?.find(f => f.label === 'সহকারীর মোবাইল');
    const extraMobiles = p.customFields?.filter(f => f.label.toLowerCase().includes('mobile') && f.label !== 'সহকারীর মোবাইল');
    const otherFields = p.customFields?.filter(f => 
      !f.label.toLowerCase().includes('email') && 
      !f.label.includes('সহকারীর') && 
      !f.label.toLowerCase().includes('mobile')
    );

    return (
      <div className="animate-in slide-in-from-bottom-6 duration-500 w-full flex flex-col items-center pb-10 space-y-2">
        <div className="w-full flex items-center justify-between py-2 px-1">
           <button onClick={onBack} className="p-3 bg-white border border-slate-100 rounded-xl shadow-sm active:scale-90 transition-all">
             <ChevronLeft size={22} className="text-slate-800" />
           </button>
           <h3 className="font-black text-slate-800 text-sm">বিস্তারিত তথ্য</h3>
           <div className="w-10 h-10"></div>
        </div>

        <div className="relative mt-2">
          <div className="w-28 h-28 rounded-[35px] border-[4px] border-white shadow-xl overflow-hidden bg-slate-50 flex items-center justify-center text-slate-200">
            {p.photo ? <img src={p.photo} className="w-full h-full object-cover" alt={p.name} /> : <Users size={40} />}
          </div>
          <div className="absolute -bottom-1 -right-1 p-2 bg-blue-600 text-white rounded-2xl shadow-lg border-2 border-white"><ShieldCheck size={16} /></div>
        </div>

        <div className="text-center space-y-1 pb-4">
          <h1 className="text-xl font-black text-slate-800 leading-tight">{p.name}</h1>
          <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em]">{p.categoryName}</p>
        </div>

        <div className="w-full space-y-3">
          {(p.officeAddress || p.homeAddress) && (
            <div className="space-y-3">
               {p.officeAddress && (
                 <DetailCard 
                   icon={<Building2 size={16} />} 
                   label="অফিসের ঠিকানা" 
                   value={p.officeAddress} 
                   colorClass="bg-blue-50/10"
                 />
               )}
               {p.homeAddress && (
                 <DetailCard 
                   icon={<Home size={16} />} 
                   label="বাসার ঠিকানা" 
                   value={p.homeAddress} 
                   colorClass="bg-slate-50"
                 />
               )}
            </div>
          )}

          <div className="space-y-3">
            <DetailCard 
              icon={<Smartphone size={16} className="text-emerald-500" />} 
              label="প্রাথমিক মোবাইল নম্বর" 
              value={p.mobile}
              colorClass="bg-emerald-50/10"
              actions={
                <>
                  <a href={`tel:${convertBnToEn(p.mobile)}`} className="p-3 bg-blue-600 text-white rounded-xl active:scale-90 transition-all"><PhoneCall size={16} /></a>
                  <a href={`https://wa.me/${formatWhatsAppNumber(p.mobile)}`} target="_blank" rel="noopener noreferrer" className="p-3 bg-[#25D366] text-white rounded-xl active:scale-90 transition-all"><WhatsAppIcon size={16} /></a>
                </>
              }
            />
            {extraMobiles?.map((mob, idx) => (
              <DetailCard 
                key={idx}
                icon={<Smartphone size={16} />} 
                label={mob.label} 
                value={mob.value}
                actions={
                  <>
                    <a href={`tel:${convertBnToEn(mob.value)}`} className="p-3 bg-blue-600 text-white rounded-xl active:scale-90 transition-all"><PhoneCall size={16} /></a>
                    <a href={`https://wa.me/${formatWhatsAppNumber(mob.value)}`} target="_blank" rel="noopener noreferrer" className="p-3 bg-[#25D366] text-white rounded-xl active:scale-90 transition-all"><WhatsAppIcon size={16} /></a>
                  </>
                }
              />
            ))}
          </div>

          {emailField && (
            <DetailCard 
              icon={<Mail size={16} className="text-blue-500" />} 
              label="ইমেইল এড্রেস" 
              value={emailField.value}
              colorClass="bg-blue-50/30"
            />
          )}

          {(asstName || asstMobile) && (
            <div className="bg-slate-50/80 p-4 rounded-[28px] border border-slate-100 shadow-sm space-y-3">
               <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center text-blue-500 shadow-sm">
                    <UserCheck size={18} />
                  </div>
                  <div className="text-left">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">সহকারীর তথ্য</p>
                    <h4 className="text-sm font-black text-slate-800">{asstName?.value || 'সহকারী'}</h4>
                  </div>
               </div>
               
               {asstMobile && (
                 <div className="flex items-center justify-between p-3 bg-white rounded-2xl border border-slate-50 shadow-sm">
                    <div className="text-left overflow-hidden">
                       <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">মোবাইল নম্বর</p>
                       <p className="text-sm font-black text-slate-700 font-inter">{asstMobile.value}</p>
                    </div>
                    <div className="flex gap-2">
                        <a href={`tel:${convertBnToEn(asstMobile.value)}`} className="p-2.5 bg-blue-600 text-white rounded-lg active:scale-90 transition-all">
                           <PhoneCall size={14} />
                        </a>
                        <a href={`https://wa.me/${formatWhatsAppNumber(asstMobile.value)}`} target="_blank" rel="noopener noreferrer" className="p-2.5 bg-[#25D366] text-white rounded-lg active:scale-90 transition-all">
                           <WhatsAppIcon size={14} />
                        </a>
                    </div>
                 </div>
               )}
            </div>
          )}

          {otherFields?.map((field, idx) => (
            <DetailCard 
              key={idx}
              icon={<Info size={16} />} 
              label={field.label} 
              value={field.value}
            />
          ))}
        </div>
      </div>
    );
  }

  if (!subId) {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
        <div className="flex items-center gap-4 mb-2">
          <button onClick={onBack} className="p-3 bg-white border border-slate-100 rounded-xl shadow-sm transition-transform active:scale-90"><ChevronLeft size={24} /></button>
          <div className="text-left">
            <h2 className="text-xl font-black text-slate-800 leading-tight">আইনি সেবা</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">সেবার ধরন নির্বাচন করুন</p>
          </div>
        </div>

        <div className="grid gap-4">
            {dynamicSubMenus.map(sub => (
              <button 
                key={sub.id} 
                onClick={() => onNavigate(`/category/4/${sub.id}`)}
                className="flex items-center justify-between p-5 bg-white rounded-[24px] premium-card active:scale-[0.98] transition-all group text-left border border-slate-50"
              >
                <div className="flex items-center gap-4">
                   <div className="p-3 bg-slate-50 rounded-2xl text-slate-400 group-hover:text-blue-600 group-hover:bg-blue-50 transition-all shadow-inner">
                      <ArrowRight size={20} />
                   </div>
                   <span className="font-black text-lg text-[#1A1A1A]">{sub.name}</span>
                </div>
                <ArrowRight size={20} className="text-slate-200 group-hover:text-blue-600 transition-colors" />
              </button>
            ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="flex items-center gap-4 mb-2">
        <button onClick={onBack} className="p-3 bg-white border border-slate-100 rounded-xl shadow-sm transition-transform active:scale-90 shrink-0"><ChevronLeft size={24} /></button>
        <div className="text-left overflow-hidden">
          <h2 className="text-xl font-black text-slate-800 leading-tight truncate">
            {dynamicSubMenus.find(s => s.id === subId)?.name || 'আইনি সেবা'}
          </h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5 truncate">সেবা প্রদানকারীদের তালিকা</p>
        </div>
      </div>
      
      {filteredContacts.length === 0 ? (
        <div className="py-24 text-center opacity-30">তথ্য সংরক্ষিত নেই।</div>
      ) : (
        <div className="space-y-4 pb-20">
          {filteredContacts.map((item, idx) => {
            const color = THEME_COLORS[idx % THEME_COLORS.length];
            return (
              <div 
                key={item.id} 
                className="bg-white p-5 rounded-[28px] border border-slate-100 shadow-sm flex items-center justify-between animate-in slide-in-from-bottom-2 duration-300"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div 
                  onClick={() => onNavigate(`${location.pathname}?item=${item.id}`)}
                  className="flex-1 text-left flex items-center gap-4 overflow-hidden active:scale-[0.98] transition-all cursor-pointer"
                >
                  <div 
                    className="w-14 h-14 rounded-[20px] flex items-center justify-center shrink-0 shadow-sm overflow-hidden border"
                    style={{ backgroundColor: `${color}10`, color: color, border: `1px solid ${color}15` }}
                  >
                    {item.photo ? (
                      <img src={item.photo} className="w-full h-full object-cover" />
                    ) : (
                      <Users size={24} />
                    )}
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-base font-black text-slate-800 leading-tight truncate">{item.name}</p>
                    <div className="flex items-center gap-1.5 mt-1.5">
                       <MapPin size={10} className="text-slate-300 shrink-0" />
                       <p className="text-[10px] font-bold text-slate-400 truncate uppercase tracking-tighter">
                         {item.officeAddress || 'ঠিকানা পাওয়া যায়নি'}
                       </p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0 ml-3">
                  <a 
                    href={`tel:${convertBnToEn(item.mobile)}`} 
                    className="p-3 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-500/20 active:scale-90 transition-all"
                  >
                    <PhoneCall size={18} />
                  </a>
                  <a 
                    href={`https://wa.me/${formatWhatsAppNumber(item.mobile)}`} 
                    target="_blank" rel="noopener noreferrer" 
                    className="p-3 bg-[#25D366] text-white rounded-xl shadow-lg shadow-emerald-500/20 active:scale-90 transition-all"
                  >
                    <WhatsAppIcon size={18} />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PublicLegal;
