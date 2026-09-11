import { Pencil, Send, MessageSquare, BarChart3 } from 'lucide-react';

export default function FloatingPracticeCards() {
  return (
    <div className="relative w-full max-w-[360px] sm:max-w-[400px] h-[360px] mx-auto select-none">
      {/* 1. Design Card */}
      <div className="absolute top-0 left-4 sm:left-6 z-10 w-[240px] sm:w-[260px] bg-white rounded-2xl p-3.5 px-4 shadow-[0_10px_25px_-5px_rgba(30,41,59,0.08),0_4px_8px_-2px_rgba(30,41,59,0.04)] border border-[#F2ECE4] flex items-center gap-3.5 transition-transform hover:-translate-y-1 duration-200">
        <div className="w-10 h-10 rounded-xl bg-[#EEF5FF] text-[#2563EB] flex items-center justify-center shrink-0">
          <Pencil size={18} strokeWidth={2.2} />
        </div>
        <div>
          <div className="font-bold text-navy text-sm sm:text-base leading-tight">Design</div>
          <div className="text-[11px] sm:text-xs text-slate-subtext mt-0.5">Think · Plan · Architect</div>
        </div>
      </div>

      {/* 2. Submit Card */}
      <div className="absolute top-[82px] right-2 sm:right-4 z-20 w-[230px] sm:w-[250px] bg-white rounded-2xl p-3.5 px-4 shadow-[0_12px_28px_-5px_rgba(30,41,59,0.09),0_4px_10px_-2px_rgba(30,41,59,0.04)] border border-[#F2ECE4] flex items-center gap-3.5 transition-transform hover:-translate-y-1 duration-200">
        <div className="w-10 h-10 rounded-xl bg-[#ECFDF5] text-[#059669] flex items-center justify-center shrink-0">
          <Send size={18} strokeWidth={2.2} />
        </div>
        <div>
          <div className="font-bold text-navy text-sm sm:text-base leading-tight">Submit</div>
          <div className="text-[11px] sm:text-xs text-slate-subtext mt-0.5">Share your solution</div>
        </div>
      </div>

      {/* 3. Get Feedback Card */}
      <div className="absolute top-[166px] left-8 sm:left-12 z-30 w-[240px] sm:w-[260px] bg-white rounded-2xl p-3.5 px-4 shadow-[0_14px_30px_-5px_rgba(30,41,59,0.1),0_4px_12px_-2px_rgba(30,41,59,0.05)] border border-[#F2ECE4] flex items-center gap-3.5 transition-transform hover:-translate-y-1 duration-200">
        <div className="w-10 h-10 rounded-xl bg-[#FEF3C7] text-[#D97706] flex items-center justify-center shrink-0">
          <MessageSquare size={18} strokeWidth={2.2} />
        </div>
        <div>
          <div className="font-bold text-navy text-sm sm:text-base leading-tight">Get Feedback</div>
          <div className="text-[11px] sm:text-xs text-slate-subtext mt-0.5">AI-powered review</div>
        </div>
      </div>

      {/* 4. Improve Card */}
      <div className="absolute top-[248px] right-6 sm:right-8 z-40 w-[230px] sm:w-[250px] bg-white rounded-2xl p-3.5 px-4 shadow-[0_14px_32px_-5px_rgba(30,41,59,0.1),0_4px_12px_-2px_rgba(30,41,59,0.05)] border border-[#F2ECE4] flex items-center gap-3.5 transition-transform hover:-translate-y-1 duration-200">
        <div className="w-10 h-10 rounded-xl bg-[#FEE2E2] text-[#E11D48] flex items-center justify-center shrink-0">
          <BarChart3 size={18} strokeWidth={2.2} />
        </div>
        <div>
          <div className="font-bold text-navy text-sm sm:text-base leading-tight">Improve</div>
          <div className="text-[11px] sm:text-xs text-slate-subtext mt-0.5">Learn and grow</div>
        </div>
      </div>
    </div>
  );
}
