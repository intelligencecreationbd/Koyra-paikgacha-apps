import React, { useState, useEffect } from 'react';
    import { useNavigate } from 'react-router-dom';
    import { ChevronLeft, Plus, Trash2, CheckCircle2, User, UserX } from 'lucide-react';
    import { CATEGORIES } from '../constants';
    import { SubmissionType, Submission } from '../types';
    
    interface InfoSubmitProps {
      onSubmission: (submission: Submission) => void;
    }
    
    const InfoSubmit: React.FC<InfoSubmitProps> = ({ onSubmission }) => {
      const navigate = useNavigate();
      const [step, setStep] = useState(1);
      const [isAnonymous, setIsAnonymous] = useState<boolean | null>(null);
      const [identity, setIdentity] = useState({ name: '', mobile: '', address: '' });
      
      const [formData, setFormData] = useState({
        type: SubmissionType.ADD,
        mainMenuId: '',
        subMenuId: '',
        details: ['']
      });
    
      const [isSubmitted, setIsSubmitted] = useState(false);
    
      useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, [step]);
    
      const activeCategory = CATEGORIES.find(c => c.id === formData.mainMenuId);
    
      const handleAddField = () => {
        setFormData(prev => ({ ...prev, details: [...prev.details, ''] }));
      };
    
      const handleRemoveField = (index: number) => {
        if (formData.details.length === 1) return;
        const newDetails = [...formData.details];
        newDetails.splice(index, 1);
        setFormData(prev => ({ ...prev, details: newDetails }));
      };
    
      const handleDetailChange = (index: number, value: string) => {
        const newDetails = [...formData.details];
        newDetails[index] = value;
        setFormData(prev => ({ ...prev, details: newDetails }));
      };
    
      const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const submission: Submission = {
          id: Math.random().toString(36).substr(2, 9),
          timestamp: new Date().toISOString(),
          type: formData.type,
          mainMenu: activeCategory?.name || '',
          subMenu: activeCategory?.subMenus.find(s => s.id === formData.subMenuId)?.name || '',
          details: formData.details.filter(d => d.trim() !== ''),
          status: 'pending',
          identity: {
            isAnonymous: isAnonymous || false,
            ...(!isAnonymous ? identity : {})
          }
        };
        onSubmission(submission);
        setIsSubmitted(true);
        setTimeout(() => navigate('/services'), 3000);
      };
    
      if (isSubmitted) {
        return (
          <div className="flex flex-col items-center justify-center h-[80vh] p-10 text-center animate-in zoom-in duration-500 bg-white">
            <div className="w-24 h-24 bg-blue-50 rounded-[32px] flex items-center justify-center text-blue-600 mb-8 icon-pulse">
              <CheckCircle2 size={56} strokeWidth={1.5} />
            </div>
            <h2 className="text-2xl font-bold mb-4 text-slate-800">অসংখ্য ধন্যবাদ!</h2>
            <p className="text-slate-500 text-sm leading-relaxed max-w-xs mx-auto font-medium">
              আপনার অংশগ্রহনের জন্য এডমিন কতৃক আপনাকে অসংখ্য ধন্যবাদ... আপনার তথ্য যাচাই করে দ্রুত প্রকাশ করা হবে।
            </p>
            <div className="mt-12 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-blue-400">
              <div className="w-2 h-2 rounded-full bg-blue-600 animate-ping"></div>
              হোমে রিডাইরেক্ট হচ্ছে
            </div>
          </div>
        );
      }
    
      return (
        <div className="p-5 space-y-6 animate-in slide-in-from-right-4 duration-500 min-h-screen bg-white">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/services')} className="p-3 bg-white rounded-xl shadow-sm border border-slate-100">
              <ChevronLeft size={20} className="text-slate-800" />
            </button>
            <h2 className="text-xl font-black text-slate-800">তথ্য প্রদান করুন</h2>
          </div>
    
          {step === 1 && (
            <div className="space-y-6">
              <p className="font-bold text-xs uppercase tracking-widest text-slate-400">আপনার পরিচয় নির্বাচন করুন</p>
              <div className="grid grid-cols-1 gap-4">
                <button 
                  onClick={() => { setIsAnonymous(true); setStep(2); }}
                  className="flex items-center gap-5 p-6 bg-white rounded-2xl border border-slate-100 shadow-sm transition-all hover:border-blue-400 group text-left"
                >
                  <div className="p-4 bg-slate-50 rounded-2xl text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                    <UserX size={28} />
                  </div>
                  <div>
                    <span className="block font-bold text-slate-800">পরিচয় গোপন রাখতে চাই</span>
                    <span className="text-xs text-slate-400 font-bold">আপনার তথ্যগুলো গোপন থাকবে</span>
                  </div>
                </button>
                <button 
                  onClick={() => { setIsAnonymous(false); setStep(2); }}
                  className="flex items-center gap-5 p-6 bg-white rounded-2xl border border-slate-100 shadow-sm transition-all hover:border-blue-400 group text-left"
                >
                  <div className="p-4 bg-blue-50 rounded-2xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <User size={28} />
                  </div>
                  <div>
                    <span className="block font-bold text-slate-800">পরিচয় সংযুক্ত রাখতে চাই</span>
                    <span className="text-xs text-slate-400 font-bold">আপনার নাম ও ঠিকানা থাকবে</span>
                  </div>
                </button>
              </div>
            </div>
          )}
    
          {step === 2 && !isAnonymous && (
            <div className="bg-white p-8 rounded-[24px] shadow-sm border border-slate-50 space-y-6">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                   <User size={20} />
                 </div>
                 <h3 className="font-black text-slate-800">আপনার ব্যক্তিগত তথ্য</h3>
              </div>
              <div className="space-y-5">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-2 uppercase tracking-wider">নাম *</label>
                  <input 
                    className="w-full px-5 py-4 rounded-xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold text-slate-800" 
                    placeholder="আপনার নাম"
                    value={identity.name}
                    onChange={e => setIdentity({...identity, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-2 uppercase tracking-wider">মোবাইল নম্বর *</label>
                  <input 
                    className="w-full px-5 py-4 rounded-xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold text-slate-800" 
                    placeholder="০১xxxxxxxxx"
                    value={identity.mobile}
                    onChange={e => setIdentity({...identity, mobile: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-2 uppercase tracking-wider">ঠিকানা *</label>
                  <textarea 
                    className="w-full px-5 py-4 rounded-xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold text-slate-800" 
                    placeholder="গ্রাম, ইউনিয়ন"
                    rows={2}
                    value={identity.address}
                    onChange={e => setIdentity({...identity, address: e.target.value})}
                  />
                </div>
                <button 
                  disabled={!identity.name || !identity.mobile || !identity.address}
                  onClick={() => setStep(3)}
                  className="w-full py-4 bg-[#0056b3] text-white font-black rounded-xl shadow-lg shadow-blue-500/20 disabled:opacity-50 transition-all active:scale-95"
                >
                  পরবর্তী ধাপ
                </button>
              </div>
            </div>
          )}
    
          {((step === 2 && isAnonymous) || step === 3) && (
            <form onSubmit={handleSubmit} className="space-y-6 pb-20">
              <div className="bg-white p-8 rounded-[24px] shadow-sm border border-slate-50 space-y-6">
                 <div className="space-y-6">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 block mb-2 uppercase tracking-wider">আবেদনের ধরন</label>
                      <select 
                        className="w-full px-5 py-4 rounded-xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none font-bold text-slate-800"
                        value={formData.type}
                        onChange={e => setFormData({...formData, type: e.target.value as SubmissionType})}
                      >
                        {Object.values(SubmissionType).map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
    
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 block mb-2 uppercase tracking-wider">প্রধান বিভাগ</label>
                      <select 
                        className="w-full px-5 py-4 rounded-xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none font-bold text-slate-800"
                        value={formData.mainMenuId}
                        onChange={e => setFormData({...formData, mainMenuId: e.target.value, subMenuId: ''})}
                      >
                        <option value="">নির্বাচন করুন</option>
                        {CATEGORIES.filter(c => c.id !== '11' && c.id !== '12').map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
    
                    {activeCategory && activeCategory.subMenus.length > 0 && (
                        <div className="animate-in slide-in-from-top-2 duration-300">
                            <label className="text-[10px] font-bold text-slate-400 block mb-2 uppercase tracking-wider">উপ-বিভাগ</label>
                            <select 
                                className="w-full px-5 py-4 rounded-xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none font-bold text-slate-800"
                                value={formData.subMenuId}
                                onChange={e => setFormData({...formData, subMenuId: e.target.value})}
                            >
                                <option value="">নির্বাচন করুন</option>
                                {activeCategory.subMenus.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>
                    )}
    
                    <div className="space-y-4">
                      <label className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">তথ্য বিস্তারিত</label>
                      {formData.details.map((detail, index) => (
                        <div key={index} className="flex gap-3 group">
                          <input 
                            className="flex-1 px-5 py-4 rounded-xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold text-slate-800"
                            placeholder="বিস্তারিত বিবরণ..."
                            value={detail}
                            onChange={e => handleDetailChange(index, e.target.value)}
                          />
                          {formData.details.length > 1 && (
                            <button type="button" onClick={() => handleRemoveField(index)} className="p-4 text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                              <Trash2 size={20} />
                            </button>
                          )}
                        </div>
                      ))}
                      <button 
                        type="button" 
                        onClick={handleAddField}
                        className="w-full flex items-center justify-center gap-2 text-blue-600 font-bold text-sm bg-blue-50 px-5 py-4 rounded-xl hover:bg-blue-100 transition-all active:scale-95"
                      >
                        <Plus size={18} className="icon-pulse" /> আরো তথ্য ফিল্ড যোগ করুন
                      </button>
                    </div>
                 </div>
              </div>
    
              <button 
                type="submit"
                disabled={!formData.mainMenuId || formData.details[0] === ''}
                className="w-full py-5 bg-[#0056b3] text-white font-black rounded-[22px] shadow-2xl shadow-blue-500/30 hover:opacity-95 active:scale-[0.98] transition-all disabled:opacity-50"
              >
                আবেদন জমা দিন
              </button>
            </form>
          )}
        </div>
      );
    };
    
    export default InfoSubmit;