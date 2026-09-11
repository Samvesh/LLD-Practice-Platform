import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import ProblemCard, { type Problem } from '../components/ProblemCard';
import FloatingPracticeCards from '../components/FloatingPracticeCards';
import { LeftBotanical, RightBotanical } from '../components/HeroBotanical';
import {
  ArrowRight,
  BarChart2,
  Sparkles,
  FileCheck,
  TrendingUp,
  Search,
} from 'lucide-react';

// Default 5 reference problems to ensure instant exact display
const DEFAULT_PROBLEMS: Problem[] = [
  {
    id: 'parking-lot',
    title: 'Parking Lot System',
    slug: 'parking-lot',
    description:
      'Design a parking lot system that can manage vehicles of different sizes across multiple floors. The system should handle entry/exit, spot assignment, and billing.',
    difficulty: 'medium',
    requirements: [
      'Support multiple vehicle types (motorcycle, car, truck)',
      'Multiple floors with configurable capacity per floor',
      'Assign nearest available spot to an incoming vehicle',
      'Track entry and exit times for billing purposes',
      'Calculate parking fees based on duration and vehicle type',
      'Display real-time availability per floor and spot type',
    ],
  },
  {
    id: 'elevator-system',
    title: 'Elevator System',
    slug: 'elevator-system',
    description:
      'Design an elevator system for a multi-floor building with multiple elevators. The system should efficiently dispatch elevators to requested floors.',
    difficulty: 'hard',
    requirements: [
      'Support multiple elevators in a single building',
      'Handle up and down requests from any floor',
      'Implement an efficient dispatching algorithm (e.g. SCAN)',
      'Support capacity limits per elevator',
      'Handle door open/close timing and emergency stop',
      'Track elevator state (moving, idle, maintenance)',
    ],
  },
  {
    id: 'vending-machine',
    title: 'Vending Machine',
    slug: 'vending-machine',
    description:
      'Design a vending machine that dispenses products, accepts payments, and manages inventory. The system should handle various payment methods and product types.',
    difficulty: 'easy',
    requirements: [
      'Support multiple product types with different prices',
      'Accept multiple payment methods (coins, card)',
      'Dispense correct product and calculate change',
      'Track and update inventory in real time',
      'Handle out-of-stock scenarios gracefully',
      'Support restock and admin operations',
    ],
  },
  {
    id: 'rate-limiter',
    title: 'Rate Limiter',
    slug: 'rate-limiter',
    description:
      'Design a rate limiter that can throttle API requests based on configurable rules. The system should support different rate limiting algorithms and be extensible.',
    difficulty: 'hard',
    requirements: [
      'Support multiple rate limiting algorithms (token bucket, sliding window)',
      'Configure rules per API endpoint or per user',
      'Return HTTP 429 when rate limit is exceeded',
      'Support configurable time windows and request thresholds',
      'Handle distributed state across multiple instances',
      'Provide metrics for rate limit hits and quota remaining',
    ],
  },
  {
    id: 'library-management',
    title: 'Library Management System',
    slug: 'library-management',
    description:
      'Design a library management system that handles book cataloging, member management, borrowing/returning, and reservation of books.',
    difficulty: 'medium',
    requirements: [
      'Maintain catalog of books with copies available',
      'Support member registration and tiers',
      'Handle checkout and return with due date tracking',
      'Implement reservation system for books on loan',
      'Apply late fees for overdue returns',
      'Search books by title, author, or category',
    ],
  },
];

export default function ProblemsPage() {
  const [problems, setProblems] = useState<Problem[]>(DEFAULT_PROBLEMS);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    api
      .get('/problems')
      .then((res) => {
        if (res.data?.problems && res.data.problems.length > 0) {
          setProblems(res.data.problems);
        }
      })
      .catch((err) => {
        console.warn('Using default problem list due to API fetch error:', err);
      });
  }, []);

  const filteredProblems = problems.filter((problem) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      problem.title.toLowerCase().includes(query) ||
      problem.description.toLowerCase().includes(query) ||
      problem.difficulty.toLowerCase().includes(query)
    );
  });

  const scrollToProblems = () => {
    const el = document.getElementById('problems-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF6F0] relative overflow-hidden">
      {/* ================= HERO SECTION ================= */}
      <section className="relative pt-12 pb-20 md:pt-16 md:pb-28 border-b border-[#F0EAE0] overflow-hidden">
        {/* Botanical illustrations in corners */}
        <LeftBotanical />
        <RightBotanical />

        {/* Ambient subtle warm gradient in background */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#FDFBF7]/80 via-transparent to-[#FAF6F0] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left Column: Headline, CTAs, Feature callouts */}
            <div className="lg:col-span-7">
              {/* Eyebrow badge */}
              <div className="inline-block text-[11px] sm:text-xs font-bold tracking-[0.2em] text-[#9A6D55] bg-[#F7EFE8] px-3 py-1 rounded-md mb-5 uppercase">
                PRACTICE · DESIGN · IMPROVE
              </div>

              {/* Main Headline */}
              <h1 className="text-3xl sm:text-4xl lg:text-[46px] font-extrabold text-navy tracking-tight leading-[1.18]">
                Master Low-Level Design,{' '}
                <span className="text-terracotta whitespace-nowrap">One Problem</span> at a Time
              </h1>

              {/* Subtext */}
              <p className="text-slate-subtext text-base sm:text-lg mt-5 max-w-xl leading-relaxed">
                Choose a problem, design a solution, submit, and get structured
                AI feedback. Track your progress and become a better system designer.
              </p>

              {/* Action Buttons */}
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={scrollToProblems}
                  className="px-6 py-3.5 bg-terracotta hover:bg-terracotta-600 active:bg-terracotta-700 text-white font-semibold rounded-xl flex items-center gap-2.5 shadow-sm transition-all duration-150 group cursor-pointer"
                >
                  <span>Start Practicing</span>
                  <ArrowRight
                    size={17}
                    strokeWidth={2.4}
                    className="group-hover:translate-x-0.5 transition-transform"
                  />
                </button>

                <Link
                  to="/progress"
                  className="px-6 py-3.5 bg-white/80 hover:bg-white border border-terracotta text-terracotta font-semibold rounded-xl flex items-center gap-2.5 transition-all duration-150 cursor-pointer shadow-subtle no-underline"
                >
                  <BarChart2 size={17} strokeWidth={2.2} />
                  <span>View My Progress</span>
                </Link>
              </div>

              {/* Three inline feature callouts */}
              <div className="mt-12 pt-6 border-t border-[#EFE7DC] flex flex-wrap items-center gap-6 sm:gap-8">
                {/* Feature 1 */}
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#FDE8DC] text-[#D4622C] flex items-center justify-center shrink-0">
                    <Sparkles size={16} strokeWidth={2.2} />
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-navy">
                    AI-Powered Feedback
                  </span>
                </div>

                {/* Feature 2 */}
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#FEF3C7] text-[#D97706] flex items-center justify-center shrink-0">
                    <FileCheck size={16} strokeWidth={2.2} />
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-navy">
                    Real-World Problems
                  </span>
                </div>

                {/* Feature 3 */}
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#FDE7DC] text-[#EA580C] flex items-center justify-center shrink-0">
                    <TrendingUp size={16} strokeWidth={2.2} />
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-navy">
                    Track Your Improvement
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: 4 Floating Overlapping Loop Cards */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end mt-4 lg:mt-0">
              <FloatingPracticeCards />
            </div>
          </div>
        </div>
      </section>

      {/* ================= PROBLEMS SECTION ================= */}
      <section id="problems-section" className="py-16 md:py-20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6">
            <div>
              <div className="text-[11px] sm:text-xs font-bold tracking-[0.2em] text-[#9A6D55] uppercase mb-1.5">
                PRACTICE PROBLEMS
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-navy tracking-tight">
                LLD Practice Problems
              </h2>
              <p className="text-slate-subtext text-sm sm:text-base mt-1">
                Choose a problem, design a solution, submit, and get structured AI feedback.
              </p>
            </div>

            {/* Search Input */}
            <div className="w-full sm:w-72 relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-muted pointer-events-none flex items-center">
                <Search size={17} strokeWidth={2} />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search problems..."
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E8E2D8] rounded-xl text-sm text-navy placeholder:text-slate-muted focus:border-terracotta focus:ring-1 focus:ring-terracotta outline-none transition-all shadow-subtle"
              />
            </div>
          </div>

          {/* Problems Grid (3 Columns) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {filteredProblems.map((problem) => (
              <ProblemCard key={problem.id} problem={problem} />
            ))}
          </div>

          {/* No results message */}
          {filteredProblems.length === 0 && (
            <div className="text-center py-16 bg-white rounded-2xl border border-[#EFE9DF] mt-6">
              <p className="text-slate-subtext text-base">
                No problems found matching &quot;{searchQuery}&quot;.
              </p>
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="mt-3 text-sm font-semibold text-terracotta hover:underline"
              >
                Clear search
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
