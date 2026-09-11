import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { sanitizeText } from '../utils/sanitize';
import {
  ArrowLeft,
  ArrowRight,
  BarChart2,
  Calendar,
  Clock,
  Award,
} from 'lucide-react';

interface AttemptWithProblem {
  id: string;
  attemptNumber: number;
  startedAt: string;
  problemId: string;
  problemTitle: string;
  problemDifficulty: string;
  submission?: {
    id: string;
    state: string;
    evaluationResult?: {
      overallScore: number;
    };
  };
}

export default function MyAttemptsPage() {
  const [attempts, setAttempts] = useState<AttemptWithProblem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch problems first, then fetch attempts for each problem
    api
      .get('/problems')
      .then(async (res) => {
        const problems = res.data?.problems || [];
        const attemptPromises = problems.map(async (problem: any) => {
          try {
            const attemptRes = await api.get(`/attempts/problem/${problem.id}`);
            const probAttempts = attemptRes.data?.attempts || [];
            return probAttempts.map((att: any) => ({
              ...att,
              problemId: problem.id,
              problemTitle: problem.title,
              problemDifficulty: problem.difficulty,
            }));
          } catch {
            return [];
          }
        });

        const nested = await Promise.all(attemptPromises);
        const allAttempts = nested.flat();
        // Sort descending by date
        allAttempts.sort(
          (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
        );
        setAttempts(allAttempts);
      })
      .catch((err) => console.error('Failed to load attempts:', err))
      .finally(() => setLoading(false));
  }, []);

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

  return (
    <div className="min-h-screen bg-[#FAF6F0] py-8 sm:py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Back link */}
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-subtext hover:text-terracotta transition-colors no-underline mb-6"
        >
          <ArrowLeft size={16} />
          <span>Back to problems</span>
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div className="text-[11px] sm:text-xs font-bold tracking-[0.2em] text-[#9A6D55] uppercase mb-1.5">
            PRACTICE HISTORY
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-navy tracking-tight">
            My Attempts
          </h1>
          <p className="text-slate-subtext text-sm sm:text-base mt-1">
            Review your previous system design submissions, scores, and feedback.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex items-center gap-3 text-slate-subtext text-sm">
              <div className="w-5 h-5 border-2 border-terracotta border-t-transparent rounded-full animate-spin" />
              <span>Loading your attempts...</span>
            </div>
          </div>
        ) : attempts.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-[#F2EDE5] shadow-card">
            <div className="w-14 h-14 rounded-full bg-[#FDF0E8] text-terracotta flex items-center justify-center mx-auto mb-4">
              <BarChart2 size={26} strokeWidth={2} />
            </div>
            <h3 className="text-lg font-bold text-navy mb-1">No attempts yet</h3>
            <p className="text-slate-subtext text-sm max-w-md mx-auto mb-6">
              You haven&apos;t started any design attempts yet. Choose a problem and begin your first submission!
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-terracotta hover:bg-terracotta-600 text-white font-semibold rounded-xl transition-all shadow-sm no-underline"
            >
              <span>Explore Problems</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {attempts.map((attempt) => {
              const targetUrl = attempt.submission
                ? `/submissions/${attempt.submission.id}`
                : `/attempts/${attempt.id}`;

              return (
                <Link
                  key={attempt.id}
                  to={targetUrl}
                  className="block bg-white rounded-2xl p-5 sm:p-6 border border-[#F2EDE5] hover:border-terracotta hover:shadow-card transition-all no-underline text-inherit group"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start sm:items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-terracotta-50 text-terracotta font-bold text-sm flex items-center justify-center shrink-0">
                        #{attempt.attemptNumber}
                      </div>

                      <div>
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <h3 className="text-base sm:text-lg font-bold text-navy group-hover:text-terracotta transition-colors">
                            {sanitizeText(attempt.problemTitle)}
                          </h3>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${getBadgeStyle(
                              attempt.problemDifficulty
                            )}`}
                          >
                            {attempt.problemDifficulty}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 text-xs text-slate-subtext mt-1.5">
                          <span className="flex items-center gap-1">
                            <Calendar size={13} />
                            {new Date(attempt.startedAt).toLocaleDateString()}
                          </span>
                          <span>·</span>
                          <span className="flex items-center gap-1">
                            <Clock size={13} />
                            {new Date(attempt.startedAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-center">
                      {attempt.submission?.evaluationResult && (
                        <div className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                          <Award size={13} />
                          <span>{attempt.submission.evaluationResult.overallScore}/10</span>
                        </div>
                      )}

                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                          attempt.submission?.state === 'Completed'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : attempt.submission?.state === 'Evaluating'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200 animate-pulse'
                            : attempt.submission?.state === 'Failed'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}
                      >
                        {attempt.submission?.state || 'In Progress'}
                      </span>

                      <div className="w-8 h-8 rounded-full bg-[#FAF6F0] text-slate-subtext group-hover:bg-terracotta group-hover:text-white flex items-center justify-center transition-all ml-1 shrink-0">
                        <ArrowRight size={15} strokeWidth={2.4} />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
