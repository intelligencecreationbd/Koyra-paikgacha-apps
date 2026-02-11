import React, { useState, useEffect } from 'react';

const DateTimeBox: React.FC = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Function to convert numbers to Bengali digits
  const toBn = (num: number | string) => 
    num.toString().replace(/\d/g, d => "০১২৩৪৫৬৭৮৯"[parseInt(d)]);

  const getBnDay = (date: Date) => {
    const days = ["রবিবার", "সোমবার", "মঙ্গলবার", "বুধবার", "বৃহস্পতিবার", "শুক্রবার", "শনিবার"];
    return days[date.getDay()];
  };

  const getBnMonth = (date: Date) => {
    const months = ["জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন", "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"];
    return months[date.getMonth()];
  };

  const englishDateBn = `${toBn(time.getDate())} ${getBnMonth(time)} ${toBn(time.getFullYear())} ইং`;
  
  const currentTime = time.toLocaleTimeString('bn-BD', { 
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true 
  });

  return (
    <div className="mx-4 my-3 p-5 rounded-[24px] flex justify-between items-center relative overflow-hidden transition-all duration-500 shadow-[0_10px_30px_-5px_rgba(0,0,0,0.1)] group border border-white/40"
         style={{
           background: 'linear-gradient(135deg, #e0f2fe 0%, #ffffff 100%)',
           backdropFilter: 'blur(8px)',
           WebkitBackdropFilter: 'blur(8px)'
         }}>
      {/* Decorative glass elements */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-400/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-sky-400/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Left Side: Dates */}
      <div className="flex flex-col gap-1.5 text-left relative z-10">
        <span className="text-[13px] font-bold text-[#003366] tracking-tight">{englishDateBn}</span>
        <span className="text-[13px] font-bold text-[#003366] opacity-80">২১ মাঘ ১৪৩২ বাংলা</span>
        <span className="text-[13px] font-bold text-[#003366] opacity-70">১৪ শাবান ১৪৪৭ হিজরি</span>
      </div>

      {/* Vertical Divider */}
      <div className="h-12 w-[1.5px] bg-[#0056b3]/20 mx-4 rounded-full relative z-10"></div>

      {/* Right Side: Day and Time */}
      <div className="text-right flex flex-col justify-center relative z-10 flex-1">
        <div className="text-[15px] font-black text-[#003366] uppercase tracking-wide mb-0.5">
          {getBnDay(time)}
        </div>
        <div className="text-[19px] font-mono text-[#1e40af] font-black tracking-tight leading-none">
          {toBn(currentTime.split(' ')[0])} <span className="text-[12px] font-black text-[#0056b3]">{currentTime.split(' ')[1]}</span>
        </div>
      </div>
    </div>
  );
};

export default DateTimeBox;