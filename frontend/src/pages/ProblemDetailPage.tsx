import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/client';
import { sanitizeText } from '../utils/sanitize';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Lightbulb,
  Clock,
  Award,
  Calendar,
} from 'lucide-react';

interface Problem {
  id: string;
  title: string;
  slug: string;
  description: string;
  requirements: string[];
  difficulty: string;
  hints: string[];
}

interface Attempt {
  id: string;
  attemptNumber: number;
  startedAt: string;
  submission?: {
    id: string;
    state: string;
    evaluationResult?: {
      overallScore: number;
    };
  };
}

export default function ProblemDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [problem, setProblem] = useState<Problem | null>(null);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get(`/problems/${id}`),
      api.get(`/attempts/problem/${id}`),
    ])
      .then(([problemRes, attemptsRes]) => {
        setProblem(problemRes.data.problem);
        setAttempts(attemptsRes.data.attempts || []);
      })
      .catch((err) => {
        console.error('Failed to load problem:', err);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const startAttempt = async () => {
    setStarting(true);
    try {
      const res = await api.post('/attempts', { problemId: id });
      navigate(`/attempts/${res.data.attempt.id}`);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to start attempt.');
    } finally {
      setStarting(false);
    }
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

  if (loading || !problem) {
    return (
      <div className="min-h-screen bg-[#FAF6F0] flex items-center justify-center p-8">
        <div className="flex items-center gap-3 text-slate-subtext text-sm">
          <div className="w-5 h-5 border-2 border-terracotta border-t-transparent rounded-full animate-spin" />
          <span>Loading problem details...</span>
        </div>
      </div>
    );
  }

  const formattedDifficulty =
    problem.difficulty.charAt(0).toUpperCase() + problem.difficulty.slice(1).toLowerCase();

  return (
    <div className="min-h-screen bg-[#FAF6F0] py-8 sm:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Back Link */}
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-subtext hover:text-terracotta transition-colors no-underline mb-6"
        >
          <ArrowLeft size={16} />
          <span>Back to problems</span>
        </Link>

        {/* Problem Header */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-[0_4px_20px_-2px_rgba(30,41,59,0.05)] border border-[#F2EDE5] mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#F2EDE5]">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-navy tracking-tight">
              {sanitizeText(problem.title)}
            </h1>
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold tracking-wide capitalize ${getBadgeStyle(
                problem.difficulty
              )}`}
            >
              {formattedDifficulty}
            </span>
          </div>

          <p className="text-slate-subtext text-base mt-5 leading-relaxed">
            {sanitizeText(problem.description)}
          </p>

          {/* Requirements Section */}
          <div className="mt-8">
            <h2 className="text-lg font-bold text-navy mb-4 flex items-center gap-2">
              <CheckCircle2 size={18} className="text-terracotta" />
              <span>Core Requirements</span>
            </h2>
            <div className="space-y-2.5">
              {problem.requirements.map((req, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-3 rounded-xl bg-cream-50/70 border border-[#F0EAE0]"
                >
                  <div className="w-5 h-5 rounded-full bg-[#FDE8DC] text-terracotta flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">
                    {i + 1}
                  </div>
                  <span className="text-sm text-navy leading-relaxed">
                    {sanitizeText(req)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Hints Section */}
          {problem.hints && problem.hints.length > 0 && (
            <div className="mt-8 pt-6 border-t border-[#F2EDE5]">
              <h2 className="text-lg font-bold text-navy mb-4 flex items-center gap-2">
                <Lightbulb size={18} className="text-amber-500" />
                <span>Architecture Hints</span>
              </h2>
              <ul className="space-y-2 pl-2">
                {problem.hints.map((hint, i) => (
                  <li
                    key={i}
                    className="text-sm text-slate-subtext list-disc list-inside leading-relaxed"
                  >
                    {sanitizeText(hint)}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Start CTA Button */}
          <div className="mt-8 pt-6 border-t border-[#F2EDE5]">
            <button
              onClick={startAttempt}
              disabled={starting}
              className="px-6 py-3.5 bg-terracotta hover:bg-terracotta-600 active:bg-terracotta-700 text-white font-semibold rounded-xl flex items-center gap-2.5 shadow-sm transition-all duration-150 disabled:opacity-50 cursor-pointer"
            >
              <span>{starting ? 'Starting Attempt...' : 'Start New Attempt'}</span>
              <ArrowRight size={17} strokeWidth={2.4} />
            </button>
          </div>
        </div>

        {/* Previous Attempts Section */}
        {attempts.length > 0 && (
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-[0_4px_20px_-2px_rgba(30,41,59,0.05)] border border-[#F2EDE5]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-navy">
                Your Attempts ({attempts.length})
              </h2>
            </div>

            <div className="space-y-3">
              {attempts.map((attempt) => {
                const targetUrl = attempt.submission
                  ? `/submissions/${attempt.submission.id}`
                  : `/attempts/${attempt.id}`;

                return (
                  <Link
                    key={attempt.id}
                    to={targetUrl}
                    className="block p-4 rounded-xl border border-[#EFE9DF] hover:border-terracotta hover:bg-[#FDFBF7] transition-all no-underline text-inherit group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-terracotta-50 text-terracotta font-bold text-xs flex items-center justify-center">
                          #{attempt.attemptNumber}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-navy group-hover:text-terracotta transition-colors">
                            Attempt #{attempt.attemptNumber}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-subtext mt-0.5">
                            <Calendar size={12} />
                            <span>{new Date(attempt.startedAt).toLocaleDateString()}</span>
                            <span>·</span>
                            <Clock size={12} />
                            <span>{new Date(attempt.startedAt).toLocaleTimeString()}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {attempt.submission?.evaluationResult && (
                          <div className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                            <Award size={13} />
                            <span>{attempt.submission.evaluationResult.overallScore}/10</span>
                          </div>
                        )}
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${
                            attempt.submission?.state === 'Completed'
                              ? 'bg-emerald-50 text-emerald-700'
                              : attempt.submission?.state === 'Evaluating'
                              ? 'bg-amber-50 text-amber-700 animate-pulse'
                              : attempt.submission?.state === 'Failed'
                              ? 'bg-rose-50 text-rose-700'
                              : 'bg-blue-50 text-blue-700'
                          }`}
                        >
                          {attempt.submission?.state || 'In Progress'}
                        </span>
                        <ArrowRight
                          size={15}
                          className="text-slate-muted group-hover:text-terracotta group-hover:translate-x-0.5 transition-all"
                        />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
