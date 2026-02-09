import React from 'react';
import { Calendar, AlertCircle } from 'lucide-react';

interface CustomDateInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
}

const CustomDateInput: React.FC<CustomDateInputProps> = ({ label, value, onChange, error, required }) => {
  return (
    <div className="w-full space-y-1">
      <label className="text-xs font-bold text-[#1A1A1A] block mb-1 uppercase tracking-wider">
        {label} {required && '*'}
      </label>
      <div className="relative group">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors pointer-events-none">
          <Calendar size={18} />
        </div>
        <input
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`
            w-full pl-10 pr-4 py-2 
            bg-white 
            border ${error ? 'border-red-400' : 'border-[#D1D5DB]'} 
            rounded-[4px] 
            shadow-sm 
            outline-none 
            focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 
            transition-all 
            font-inter text-sm text-[#1A1A1A] font-medium
            appearance-none
          `}
        />
      </div>
      {error && (
        <p className="text-[11px] text-red-500 font-bold mt-1 flex items-center gap-1">
          <AlertCircle size={12} /> {error}
        </p>
      )}
    </div>
  );
};

export default CustomDateInput;