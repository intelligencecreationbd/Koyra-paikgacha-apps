
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, ChevronRight } from 'lucide-react';
import { CATEGORIES, ICON_MAP } from '../constants';
import { Notice, User } from '../types';

interface HomeProps {
  notices: Notice[];
  isAdmin: boolean;
  user: User | null;
}

export function Home({ notices, isAdmin, user }: HomeProps) {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(0);

  // Filter out User Login (ID 12) from the main grid
  const menuItems = CATEGORIES.filter(c => c.id !== '12');

  // Chunking logic: 12 items per page (4 rows of 3 grid)
  const chunkSize = 12;
  const pages = [];
  for (let i = 0; i < menuItems.length; i += chunkSize) {
    pages.push(menuItems.slice(i, i + chunkSize));
  }

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollLeft = e.currentTarget.scrollLeft;
    const width = e.currentTarget.offsetWidth;
    if (width > 0) {
      const newPage = Math.round(scrollLeft / width);
      if (newPage !== currentPage) {
        setCurrentPage(newPage);
      }
    }
  };

  return (
    <div className="fixed inset-x-0 bottom-4 top-16 overflow-hidden flex flex-col p-4 animate-in fade-in duration-700">
      
      {/* Notice Board - Compact */}
      <div className="shrink-0 relative overflow-hidden bg-notice rounded-full py-1.5 px-6 border border-blue-100 shadow-[inset_0_1px_2px_rgba(0,86,179,0.05)] mb-3">
        <div className="relative h-5 flex items-center overflow-hidden">
          <div className="scrolling-text absolute whitespace-nowrap text-[13px] font-bold text-[#001f3f]">
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
          className="shrink-0 w-full flex items-center justify-between p-2.5 bg-white border border-blue-100 rounded-[20px] shadow-md transform active:scale-[0.98] transition-all group mb-3"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-xl text-[#0056b3] group-hover:bg-[#0056b3] group-hover:text-white transition-all">
              <LayoutDashboard size={18} />
            </div>
            <div className="text-left">
              <p className="font-bold text-sm text-[#1A1A1A]">এডমিন প্যানেল</p>
            </div>
          </div>
          <ChevronRight size={16} className="text-blue-200 group-hover:text-[#0056b3] transition-colors" />
        </button>
      )}

      {/* Paginated Menu Container - 4 Rows of 3 */}
      <div className="flex-1 flex flex-col relative min-h-0">
        <div 
          className="flex-1 flex overflow-x-auto snap-x snap-mandatory no-scrollbar -mx-2 px-2"
          onScroll={handleScroll}
          style={{ scrollBehavior: 'smooth', WebkitOverflowScrolling: 'touch' }}
        >
          {pages.map((chunk, pageIdx) => (
            <div 
              key={pageIdx} 
              className="w-full h-full shrink-0 snap-start grid grid-cols-3 gap-x-4 gap-y-3 px-2"
            >
              {chunk.map((category) => {
                const IconComponent = ICON_MAP[category.icon];
                const iconColor = category.color;
                if (!IconComponent) return null;

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
                      else if (category.id === '17') navigate('/medical');
                      else if (category.id === '19') navigate('/age-calculator');
                      else if (category.id === '18') {
                        navigate('/auth');
                      }
                      else navigate(`/category/${category.id}`);
                    }}
                    className="flex flex-col items-center justify-center gap-2 p-2 premium-card rounded-[28px] group w-full aspect-square shadow-md border border-slate-50 relative overflow-hidden"
                  >
                    <div 
                      className="w-14 h-14 rounded-[20px] flex items-center justify-center transition-all duration-300 group-hover:scale-110 shrink-0"
                      style={{ 
                        backgroundColor: `${iconColor}12`,
                        color: iconColor,
                        boxShadow: `0 6px 14px -3px ${iconColor}24`,
                        border: `1px solid ${iconColor}18`
                      }}
                    >
                      <IconComponent size={34} className="icon-floating" />
                    </div>
                    <span className="text-[11px] font-black text-center leading-tight text-slate-800 line-clamp-1 px-0.5 uppercase tracking-tighter">
                      {category.name}
                    </span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Pagination Indicators - Positioned right above the bottom nav area */}
        {pages.length > 1 && (
          <div className="shrink-0 flex justify-center items-center gap-2 pt-2 pb-12">
            {pages.map((_, i) => (
              <div 
                key={i} 
                className={`h-1.5 rounded-full transition-all duration-500 ${currentPage === i ? 'w-6 bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.4)]' : 'w-1.5 bg-slate-200'}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;
