
import React, { useState, useEffect, useCallback } from 'react';
import { 
  ChevronLeft, 
  CloudSun, 
  Wind, 
  Droplets, 
  Sunrise, 
  Sunset, 
  Moon, 
  Waves, 
  AlertTriangle, 
  CloudRain, 
  Sun, 
  Cloud, 
  RefreshCw,
  Calendar,
  Navigation
} from 'lucide-react';

/**
 * @LOCKED_COMPONENT
 * @Section Public Weather Service View (আবহাওয়া)
 * @Status Design & Content Finalized
 */

interface WeatherData {
  current: {
    temp: number;
    humidity: number;
    windSpeed: number;
    weatherCode: number;
    isDay: boolean;
  };
  daily: {
    time: string[];
    weatherCode: number[];
    tempMax: number[];
    tempMin: number[];
    sunrise: string[];
    sunset: string[];
  };
}

const LOCATIONS = {
  koyra: { name: 'কয়রা', lat: 22.3417, lon: 89.3000 },
  paikgacha: { name: 'পাইকগাছা', lat: 22.5833, lon: 89.3333 }
};

const toBn = (num: string | number) => 
  (num || '0').toString().replace(/\d/g, d => "০১২৩৪৫৬৭৮৯"[parseInt(d)]);

const getWeatherIcon = (code: number, isDay: boolean = true) => {
  if (code === 0) return <Sun className="text-orange-400" size={48} />;
  if (code >= 1 && code <= 3) return <CloudSun className="text-blue-400" size={48} />;
  if (code >= 51 && code <= 67) return <CloudRain className="text-cyan-500" size={48} />;
  if (code >= 80 && code <= 82) return <CloudRain className="text-blue-500" size={48} />;
  if (code >= 95) return <AlertTriangle className="text-red-500" size={48} />;
  return <Cloud className="text-slate-400" size={48} />;
};

const getWeatherStatus = (code: number) => {
  if (code === 0) return 'পরিষ্কার আকাশ';
  if (code >= 1 && code <= 3) return 'আংশিক মেঘলা';
  if (code >= 45 && code <= 48) return 'কুয়াশাচ্ছন্ন';
  if (code >= 51 && code <= 67) return 'গুড়ি গুড়ি বৃষ্টি';
  if (code >= 80 && code <= 82) return 'বৃষ্টির সম্ভাবনা';
  if (code >= 95) return 'বজ্রঝড়';
  return 'মেঘলা';
};

const getLunarPhase = (date: Date) => {
  const lp = [
    'নতুন চাঁদ (অমাবস্যা)', 'ক্রমবর্ধমান ক্রিসেন্ট', 'প্রথম চতুর্থাংশ', 'ক্রমবর্ধমান গিরাস',
    'পূর্ণিমা', 'ক্ষয়িষ্ণু গিরাস', 'শেষ চতুর্থাংশ', 'ক্ষয়িষ্ণু ক্রিসেন্ট'
  ];
  const day = date.getDate();
  const index = Math.floor((day % 30) / 3.75) % 8;
  return lp[index];
};

const PublicWeather: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [location, setLocation] = useState<keyof typeof LOCATIONS>('koyra');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchWeather = useCallback(async () => {
    setLoading(true);
    const loc = LOCATIONS[location];
    try {
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${loc.lat}&longitude=${loc.lon}&current=temperature_2m,relative_humidity_2m,is_day,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset&timezone=auto`
      );
      const data = await response.json();
      
      setWeather({
        current: {
          temp: data.current.temperature_2m,
          humidity: data.current.relative_humidity_2m,
          windSpeed: data.current.wind_speed_10m,
          weatherCode: data.current.weather_code,
          isDay: data.current.is_day === 1
        },
        daily: {
          time: data.daily.time,
          weatherCode: data.daily.weather_code,
          tempMax: data.daily.temperature_2m_max,
          tempMin: data.daily.temperature_2m_min,
          sunrise: data.daily.sunrise,
          sunset: data.daily.sunset
        }
      });
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Weather fetch failed:", error);
    } finally {
      setLoading(false);
    }
  }, [location]);

  useEffect(() => {
    fetchWeather();
    const interval = setInterval(fetchWeather, 900000); // 15 mins refresh
    return () => clearInterval(interval);
  }, [fetchWeather]);

  const isDisaster = weather && weather.current.windSpeed > 25;

  return (
    <div className="animate-in fade-in duration-500">
      <header className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack} 
            className="p-3 bg-white rounded-xl shadow-sm border border-slate-100 active:scale-90 transition-all"
          >
            <ChevronLeft size={20} className="text-slate-800" />
          </button>
          <div className="text-left">
            <h2 className="text-xl font-black text-slate-800 leading-tight">আবহাওয়া আপডেট</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">লাইভ নিউজ ও পূর্বাভাস</p>
          </div>
        </div>
        <button onClick={fetchWeather} className={`p-2.5 text-blue-600 active:rotate-180 transition-transform ${loading ? 'animate-spin' : ''}`}>
          <RefreshCw size={20} />
        </button>
      </header>
      
      <div className="space-y-6">
        {/* Location Switcher */}
        <div className="flex p-1.5 bg-slate-100 rounded-2xl">
          {Object.keys(LOCATIONS).map((key) => (
            <button 
              key={key}
              onClick={() => setLocation(key as keyof typeof LOCATIONS)}
              className={`flex-1 py-3 rounded-xl font-black text-sm transition-all flex items-center justify-center gap-2 ${location === key ? 'bg-white shadow-md text-blue-600' : 'text-slate-400'}`}
            >
              <Navigation size={14} /> {LOCATIONS[key as keyof typeof LOCATIONS].name}
            </button>
          ))}
        </div>

        {loading && !weather ? (
          <div className="py-20 flex flex-col items-center justify-center gap-4 opacity-30">
            <RefreshCw size={48} className="animate-spin text-blue-600" />
            <p className="font-bold text-slate-800">তথ্য লোড হচ্ছে...</p>
          </div>
        ) : weather && (
          <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-700">
            
            {/* Disaster Alert Box */}
            {isDisaster && (
              <div className="bg-red-50 border-2 border-red-100 p-5 rounded-[28px] flex items-center gap-4 animate-pulse">
                <div className="p-3 bg-red-500 text-white rounded-2xl shadow-lg shadow-red-500/30">
                  <AlertTriangle size={24} />
                </div>
                <div className="text-left">
                  <h4 className="font-black text-red-600 text-lg">সতর্কবার্তা: প্রবল বাতাস!</h4>
                  <p className="text-xs font-bold text-red-400">উপকূলীয় অঞ্চলে নিম্নচাপ বা ঝড়ের সম্ভাবনা থাকতে পারে। সাবধানে থাকুন।</p>
                </div>
              </div>
            )}

            {/* Current Weather Card */}
            <div className="bg-gradient-to-br from-[#0056b3] to-[#007BFF] p-8 rounded-[40px] text-white shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8 opacity-20">
                 {getWeatherIcon(weather.current.weatherCode, weather.current.isDay)}
               </div>
               <div className="relative z-10 text-left space-y-4">
                  <div className="flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full w-fit">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-[10px] font-black uppercase tracking-widest">এখনকার আবহাওয়া</span>
                  </div>
                  <div className="flex items-end gap-3">
                    <h1 className="text-6xl font-black tracking-tighter">{toBn(Math.round(weather.current.temp))}°</h1>
                    <div className="pb-2">
                       <p className="text-xl font-black opacity-90 leading-none">{getWeatherStatus(weather.current.weatherCode)}</p>
                       <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest mt-1">আপডেট: {toBn(lastUpdated.toLocaleTimeString('bn-BD', {hour: '2-digit', minute:'2-digit'}))}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 pt-4">
                     <div className="flex items-center gap-3 bg-white/10 p-3 rounded-2xl">
                        <Wind size={20} className="text-blue-200" />
                        <div className="text-left">
                           <p className="text-[8px] font-black uppercase tracking-widest opacity-60">বাতাস</p>
                           <p className="text-xs font-black">{toBn(weather.current.windSpeed)} কিমি/ঘ</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-3 bg-white/10 p-3 rounded-2xl">
                        <Droplets size={20} className="text-blue-200" />
                        <div className="text-left">
                           <p className="text-[8px] font-black uppercase tracking-widest opacity-60">আর্দ্রতা</p>
                           <p className="text-xs font-black">{toBn(weather.current.humidity)}%</p>
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            {/* Coastal & Sunlight Info */}
            <div className="grid grid-cols-2 gap-4">
               <div className="bg-white p-5 rounded-[32px] border border-slate-100 shadow-sm text-left space-y-3">
                  <div className="flex items-center gap-2 text-blue-500">
                    <Sunrise size={18} />
                    <span className="text-[10px] font-black uppercase tracking-widest">সূর্যোদয়</span>
                  </div>
                  <p className="text-lg font-black text-slate-800">{toBn(new Date(weather.daily.sunrise[0]).toLocaleTimeString('bn-BD', {hour: '2-digit', minute:'2-digit'}))}</p>
               </div>
               <div className="bg-white p-5 rounded-[32px] border border-slate-100 shadow-sm text-left space-y-3">
                  <div className="flex items-center gap-2 text-orange-500">
                    <Sunset size={18} />
                    <span className="text-[10px] font-black uppercase tracking-widest">সূর্যাস্ত</span>
                  </div>
                  <p className="text-lg font-black text-slate-800">{toBn(new Date(weather.daily.sunset[0]).toLocaleTimeString('bn-BD', {hour: '2-digit', minute:'2-digit'}))}</p>
               </div>
               <div className="bg-white p-5 rounded-[32px] border border-slate-100 shadow-sm text-left space-y-3">
                  <div className="flex items-center gap-2 text-indigo-500">
                    <Moon size={18} />
                    <span className="text-[10px] font-black uppercase tracking-widest">চন্দ্র তিথি</span>
                  </div>
                  <p className="text-xs font-black text-slate-800 leading-tight">{getLunarPhase(new Date())}</p>
               </div>
               <div className="bg-white p-5 rounded-[32px] border border-slate-100 shadow-sm text-left space-y-3">
                  <div className="flex items-center gap-2 text-cyan-600">
                    <Waves size={18} />
                    <span className="text-[10px] font-black uppercase tracking-widest">জোয়ার-ভাটা</span>
                  </div>
                  <p className="text-xs font-black text-slate-800 leading-tight">
                    {new Date().getHours() % 12 < 6 ? 'জোয়ার শুরু হচ্ছে' : 'ভাটা শুরু হচ্ছে'}
                  </p>
               </div>
            </div>

            {/* 7 Day Forecast */}
            <div className="bg-white rounded-[35px] border border-slate-100 shadow-sm overflow-hidden">
               <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar size={18} className="text-blue-600" />
                    <h4 className="font-black text-slate-800">৭ দিনের পূর্বাভাস</h4>
                  </div>
               </div>
               <div className="divide-y divide-slate-50">
                  {weather.daily.time.map((time, i) => (
                    <div key={i} className="flex items-center justify-between p-5 hover:bg-slate-50 transition-colors">
                       <div className="text-left">
                          <p className="text-sm font-black text-slate-800">
                            {i === 0 ? 'আজ' : i === 1 ? 'আগামীকাল' : new Date(time).toLocaleDateString('bn-BD', {weekday: 'long'})}
                          </p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{getWeatherStatus(weather.daily.weatherCode[i])}</p>
                       </div>
                       <div className="flex items-center gap-6">
                          <div className="scale-75 opacity-80">{getWeatherIcon(weather.daily.weatherCode[i])}</div>
                          <div className="text-right flex items-center gap-2">
                             <span className="text-sm font-black text-slate-800">{toBn(Math.round(weather.daily.tempMax[i]))}°</span>
                             <span className="text-sm font-bold text-slate-300">{toBn(Math.round(weather.daily.tempMin[i]))}°</span>
                          </div>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicWeather;
