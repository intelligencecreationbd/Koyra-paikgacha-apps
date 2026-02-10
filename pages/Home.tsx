
import React, { useState, useRef } from 'react';
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
  const [currentPage, setCurrentPage] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Filter out User Login (ID 12) and group items into pages of 9 (3x3 grid)
  const menuItems = CATEGORIES.filter(c => c.id !== '12');
  const itemsPerPage = 9;
  const pages = [];
  for (let i = 0; i < menuItems.length; i += itemsPerPage) {
    pages.push(menuItems.slice(i, i + itemsPerPage));
  }

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollLeft = e.currentTarget.scrollLeft;
    const width = e.currentTarget.offsetWidth;
    const newPage = Math.round(scrollLeft / width);
    if (newPage !== currentPage) setCurrentPage(newPage);
  };

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

      {/* Horizontally Scrollable Paged Menu Container */}
      <div className="relative">
        <div 
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar -mx-2 px-2"
        >
          {pages.map((pageItems, pageIdx) => (
            <div 
              key={pageIdx} 
              className="min-w-full snap-start grid grid-cols-3 gap-4"
            >
              {pageItems.map((category) => {
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
                      else navigate(`/category/${category.id}`);
                    }}
                    className="flex flex-col items-center gap-3 p-4 premium-card rounded-[24px] group"
                  >
                    <div 
                      className="w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                      style={{ 
                        backgroundColor: `${iconColor}12`,
                        color: iconColor,
                        boxShadow: `0 8px 15px -3px ${iconColor}25`,
                        border: `1px solid ${iconColor}15`
                      }}
                    >
                      <IconComponent size={32} className="icon-floating" />
                    </div>
                    <span className="text-sm font-bold text-center leading-tight text-[#1A1A1A] h-10 flex items-center px-1">
                      {category.name}
                    </span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Pagination Dots (Only show if there's more than one page) */}
        {pages.length > 1 && (
          <div className="flex justify-center items-center gap-2 mt-6">
            {pages.map((_, idx) => (
              <div 
                key={idx}
                className={`transition-all duration-300 rounded-full ${currentPage === idx ? 'w-6 h-2 bg-blue-600' : 'w-2 h-2 bg-slate-200'}`}
              />
            ))}
          </div>
        )}
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default Home;
