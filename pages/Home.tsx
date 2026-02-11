
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, ChevronRight } from 'lucide-react';
import { CATEGORIES, ICON_MAP } from '../constants';
import { Notice, User } from '../types';

interface HomeProps {
  notices: Notice[];
  isAdmin: boolean;
  user: User | null;
}

const Home: React.FC<HomeProps> = ({ notices, isAdmin, user }) => {
  const navigate = useNavigate();

  // Filter out User Login (ID 12) from the main grid as it's in the drawer
  const menuItems = CATEGORIES.filter(c => c.id !== '12');

  return (
    <div className="p-5 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Notice Board */}
      <div className="relative overflow-hidden bg-notice rounded-full py-2 px-6 border border-blue-100 shadow-[inset_0_1px_2px_rgba(0,86,179,0.05)]">
        <div className="relative h-6 flex items-center overflow-hidden">
          <div className="scrolling-text absolute whitespace-nowrap text-sm font-bold text-[#001f3f]">
            {notices.length > 0 
              ? notices.map(n => n.content).join('  •  ') 
              : 'কয়রা-পাইকগাছা ডিজিটাল অ্যাপে আপনাকে স্বাগতম!'}
          </div>
        </div>
      </div>

      {/* Admin Quick Access */}
      {isAdmin && (
        <button 
          onClick={() => navigate('/admin')}
          className="w-full flex items-center justify-between p-5 bg-white border border-blue-100 rounded-[22px] shadow-lg transform active:scale-105 transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 rounded-2xl text-[#0056b3] group-hover:bg-[#0056b3] group-hover:text-white transition-all">
              <LayoutDashboard size={28} className="icon-floating" />
            </div>
            <div className="text-left">
              <p className="font-bold text-2xl text-[#1A1A1A]">এডমিন প্যানেল</p>
              <p className="text-sm text-slate-500 font-semibold uppercase tracking-wider">সিস্টেম কন্ট্রোল</p>
            </div>
          </div>
          <ChevronRight size={24} className="text-blue-200 group-hover:text-[#0056b3] transition-colors" />
        </button>
      )}

      {/* Fixed Vertical Grid Menu - Clean & Professional */}
      <div className="grid grid-cols-3 gap-4 pb-10">
        {menuItems.map((category) => {
          const IconComponent = ICON_MAP[category.icon];
          const iconColor = category.color;
          return (
            <button
              key={category.id}
              onClick={() => {
                if (category.id === '1') navigate('/hotline');
                else if (category.id === '11') navigate('/info-submit');
                else if (category.id === '12') navigate('/auth');
                else if (category.id === '13') {
                  if (user) navigate('/ledger');
                  else navigate('/auth?to=ledger');
                }
                else if (category.id === '7') navigate('/online-haat');
                else if (category.id === '10') navigate('/weather');
                else if (category.id === '16') navigate('/chat');
                else navigate(`/category/${category.id}`);
              }}
              className="flex flex-col items-center justify-center gap-3 p-4 premium-card rounded-[24px] group min-h-[130px] w-full"
            >
              <div 
                className="w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 shrink-0"
                style={{ 
                  backgroundColor: `${iconColor}12`,
                  color: iconColor,
                  boxShadow: `0 8px 15px -3px ${iconColor}25`,
                  border: `1px solid ${iconColor}15`
                }}
              >
                <IconComponent size={30} className="icon-floating" />
              </div>
              <span className="text-[11px] font-black text-center leading-tight text-slate-700 line-clamp-2 px-1 uppercase tracking-tighter">
                {category.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Home;
