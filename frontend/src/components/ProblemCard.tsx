import { Link } from 'react-router-dom';
import { Car, Building2, ShoppingBag, Gauge, BookOpen, FileText, ArrowRight } from 'lucide-react';

export interface Problem {
  id: string;
  title: string;
  slug: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard' | string;
  requirements: string[];
}

interface ProblemCardProps {
  problem: Problem;
}

export default function ProblemCard({ problem }: ProblemCardProps) {
  // Custom icon & pastel container per problem type
  const getProblemIcon = () => {
    const titleLower = problem.title.toLowerCase();
    if (titleLower.includes('parking')) {
      return (
        <div className="w-11 h-11 rounded-xl bg-[#FEECE8] text-[#E0533C] flex items-center justify-center shrink-0">
          <Car size={22} strokeWidth={2} />
        </div>
      );
    }
    if (titleLower.includes('elevator')) {
      return (
        <div className="w-11 h-11 rounded-xl bg-[#E9F3FF] text-[#2563EB] flex items-center justify-center shrink-0">
          <Building2 size={22} strokeWidth={2} />
        </div>
      );
    }
    if (titleLower.includes('vending')) {
      return (
        <div className="w-11 h-11 rounded-xl bg-[#E2F7F4] text-[#0D9488] flex items-center justify-center shrink-0">
          <ShoppingBag size={22} strokeWidth={2} />
        </div>
      );
    }
    if (titleLower.includes('rate') || titleLower.includes('limiter')) {
      return (
        <div className="w-11 h-11 rounded-xl bg-[#FFEBEB] text-[#E11D48] flex items-center justify-center shrink-0">
          <Gauge size={22} strokeWidth={2} />
        </div>
      );
    }
    if (titleLower.includes('library')) {
      return (
        <div className="w-11 h-11 rounded-xl bg-[#FEF6E6] text-[#D97706] flex items-center justify-center shrink-0">
          <BookOpen size={22} strokeWidth={2} />
        </div>
      );
    }
    return (
      <div className="w-11 h-11 rounded-xl bg-terracotta-50 text-terracotta flex items-center justify-center shrink-0">
        <BookOpen size={22} strokeWidth={2} />
      </div>
    );
  };

  const getBadgeStyle = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return 'bg-[#E0F2FE] text-[#0284C7]';
      case 'medium':
        return 'bg-[#FFF4E5] text-[#D97706]';
      case 'hard':
        return 'bg-[#FEE2E2] text-[#DC2626]';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const formattedDifficulty =
    problem.difficulty.charAt(0).toUpperCase() + problem.difficulty.slice(1).toLowerCase();

  return (
    <Link
      to={`/problems/${problem.id}`}
      className="block bg-white rounded-2xl p-6 shadow-[0_4px_20px_-2px_rgba(30,41,59,0.05)] border border-[#F2EDE5] hover:shadow-[0_12px_28px_-4px_rgba(30,41,59,0.08)] hover:border-[#E8DFD3] transition-all duration-200 group no-underline text-inherit flex flex-col justify-between min-h-[220px]"
    >
      <div>
        {/* Top row: Icon and Difficulty badge */}
        <div className="flex items-start justify-between">
          {getProblemIcon()}
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold tracking-wide capitalize ${getBadgeStyle(
              problem.difficulty
            )}`}
          >
            {formattedDifficulty}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-bold text-navy text-[17px] mt-4 leading-snug group-hover:text-terracotta transition-colors">
          {problem.title}
        </h3>

        {/* Description */}
        <p className="text-slate-subtext text-sm mt-2 leading-relaxed line-clamp-3">
          {problem.description}
        </p>
      </div>

      {/* Bottom row: Requirements & Circle Action Button */}
      <div className="flex items-center justify-between mt-6 pt-2">
        <div className="flex items-center gap-1.5 text-xs text-slate-subtext font-medium">
          <FileText size={14} className="text-slate-muted" strokeWidth={2} />
          <span>{problem.requirements?.length || 6} requirements</span>
        </div>

        <div className="w-8 h-8 rounded-full bg-[#FDF0E8] text-terracotta flex items-center justify-center group-hover:bg-terracotta group-hover:text-white transition-all shadow-sm">
          <ArrowRight size={15} strokeWidth={2.4} />
        </div>
      </div>
    </Link>
  );
}
