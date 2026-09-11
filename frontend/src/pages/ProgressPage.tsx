import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import {
  ArrowLeft,
  ArrowRight,
  TrendingUp,
  Award,
  BookOpen,
  CheckCircle2,
  Sparkles,
  Info,
  Clock,
  ChevronRight,
} from 'lucide-react';

interface RubricDimensionMeta {
  criterion: string;
  description: string;
}

const OFFICIAL_RUBRIC_DIMENSIONS: RubricDimensionMeta[] = [
  {
    criterion: 'Requirement Understanding',
    description: 'Accurately addresses functional and non-functional requirements without missing constraints.',
  },
  {
    criterion: 'Class Responsibilities',
    description: 'Clear class separation adhering to the Single Responsibility Principle with coherent boundaries.',
  },
  {
    criterion: 'Coupling and Cohesion',
    description: 'Minimizes unnecessary inter-class dependencies and maximizes cohesive domain logic.',
  },
  {
    criterion: 'Encapsulation and Interfaces',
    description: 'Hides implementation details behind clean, well-defined public contracts and interfaces.',
  },
  {
    criterion: 'Abstraction and Pattern Use',
    description: 'Applies suitable design patterns (e.g. Factory, Strategy, Observer) naturally without forcing.',
  },
  {
    criterion: 'Extensibility',
    description: 'Accommodates future requirements and scale without breaking existing architecture.',
  },
  {
    criterion: 'Edge Cases',
    description: 'Identifies boundary conditions, error handling, capacity limits, and failure modes.',
  },
  {
    criterion: 'Quality of Explanation',
    description: 'Presents clear design rationale, trade-off analysis, and structured architectural justification.',
  },
];

interface CriterionStat {
  name: string;
  description: string;
  evaluatedCount: number;
  avgScore: number | null;
  percent: number;
  level: 'Strong' | 'Proficient' | 'Developing' | 'Needs Practice' | 'Not Evaluated';
}

interface ProblemProgress {
  id: string;
  title: string;
  slug: string;
  difficulty: string;
  attemptsCount: number;
  completedCount: number;
  bestScore: number | null;
  latestSubmissionId?: string;
  latestSubmissionState?: string;
}

export default function ProgressPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalAttempts: 0,
    completedSubmissions: 0,
    problemsPracticed: 0,
    totalProblems: 0,
    avgScore: 0,
    highScore: 0,
  });
  const [criteriaStats, setCriteriaStats] = useState<CriterionStat[]>([]);
  const [problemProgressList, setProblemProgressList] = useState<ProblemProgress[]>([]);

  useEffect(() => {
    api
      .get('/problems')
      .then(async (res) => {
        const problems = res.data?.problems || [];
        let totalAtt = 0;
        let completed = 0;
        let practicedCount = 0;
        let scoreSum = 0;
        let best = 0;

        // Map to aggregate rubric scores by criterion name
        const criteriaMap = new Map<string, { totalScore: number; count: number }>();

        // Problem progress list
        const progList: ProblemProgress[] = [];

        const attemptPromises = problems.map(async (p: any) => {
          try {
            const attRes = await api.get(`/attempts/problem/${p.id}`);
            return { problem: p, attempts: attRes.data?.attempts || [] };
          } catch {
            return { problem: p, attempts: [] };
          }
        });

        const problemAttempts = await Promise.all(attemptPromises);

        problemAttempts.forEach(({ problem, attempts }) => {
          if (attempts.length > 0) practicedCount++;

          let probBestScore: number | null = null;
          let probCompletedCount = 0;
          let latestSubId: string | undefined;
          let latestSubState: string | undefined;

          // Sort attempts descending by startedAt
          const sortedAttempts = [...attempts].sort(
            (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
          );

          if (sortedAttempts.length > 0 && sortedAttempts[0].submission) {
            latestSubId = sortedAttempts[0].submission.id;
            latestSubState = sortedAttempts[0].submission.state;
          }

          attempts.forEach((att: any) => {
            totalAtt++;
            if (att.submission?.state === 'Completed' && att.submission.evaluationResult) {
              completed++;
              probCompletedCount++;
              const score = att.submission.evaluationResult.overallScore || 0;
              scoreSum += score;
              if (score > best) best = score;
              if (probBestScore === null || score > probBestScore) {
                probBestScore = score;
              }

              // Aggregate real criteria feedback
              const feedbacks = att.submission.evaluationResult.feedbacks || [];
              feedbacks.forEach((fb: any) => {
                if (fb.criterion && typeof fb.score === 'number') {
                  const existing = criteriaMap.get(fb.criterion) || { totalScore: 0, count: 0 };
                  existing.totalScore += fb.score;
                  existing.count += 1;
                  criteriaMap.set(fb.criterion, existing);
                }
              });
            }
          });

          progList.push({
            id: problem.id,
            title: problem.title,
            slug: problem.slug,
            difficulty: problem.difficulty,
            attemptsCount: attempts.length,
            completedCount: probCompletedCount,
            bestScore: probBestScore,
            latestSubmissionId: latestSubId,
            latestSubmissionState: latestSubState,
          });
        });

        // Compute criterion statistics based on real evaluations
        const computedCriteria: CriterionStat[] = OFFICIAL_RUBRIC_DIMENSIONS.map((dim) => {
          const recorded = criteriaMap.get(dim.criterion);
          if (recorded && recorded.count > 0) {
            const avg = recorded.totalScore / recorded.count;
            const percent = Math.min(100, Math.round((avg / 10) * 100));
            let level: CriterionStat['level'] = 'Needs Practice';
            if (percent >= 80) level = 'Strong';
            else if (percent >= 65) level = 'Proficient';
            else if (percent >= 50) level = 'Developing';

            return {
              name: dim.criterion,
              description: dim.description,
              evaluatedCount: recorded.count,
              avgScore: Number(avg.toFixed(1)),
              percent,
              level,
            };
          }

          return {
            name: dim.criterion,
            description: dim.description,
            evaluatedCount: 0,
            avgScore: null,
            percent: 0,
            level: 'Not Evaluated',
          };
        });

        // Add any extra criteria from evaluations not in the standard list
        criteriaMap.forEach((val, key) => {
          const alreadyIncluded = computedCriteria.some(
            (c) => c.name.toLowerCase() === key.toLowerCase()
          );
          if (!alreadyIncluded && val.count > 0) {
            const avg = val.totalScore / val.count;
            const percent = Math.min(100, Math.round((avg / 10) * 100));
            let level: CriterionStat['level'] = 'Needs Practice';
            if (percent >= 80) level = 'Strong';
            else if (percent >= 65) level = 'Proficient';
            else if (percent >= 50) level = 'Developing';

            computedCriteria.push({
              name: key,
              description: 'AI-evaluated criteria dimension from submitted solutions.',
              evaluatedCount: val.count,
              avgScore: Number(avg.toFixed(1)),
              percent,
              level,
            });
          }
        });

        setStats({
          totalAttempts: totalAtt,
          completedSubmissions: completed,
          problemsPracticed: practicedCount,
          totalProblems: problems.length,
          avgScore: completed > 0 ? Number((scoreSum / completed).toFixed(1)) : 0,
          highScore: best,
        });

        setCriteriaStats(computedCriteria);
        setProblemProgressList(progList);
      })
      .catch((err) => console.error('Failed to load progress stats:', err))
      .finally(() => setLoading(false));
  }, []);

  const getLevelBadgeClass = (level: CriterionStat['level']) => {
    switch (level) {
      case 'Strong':
        return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
      case 'Proficient':
        return 'bg-blue-50 text-blue-700 border border-blue-200';
      case 'Developing':
        return 'bg-amber-50 text-amber-700 border border-amber-200';
      case 'Needs Practice':
        return 'bg-rose-50 text-rose-700 border border-rose-200';
      case 'Not Evaluated':
      default:
        return 'bg-cream-100 text-slate-muted border border-[#EAE3D8]';
    }
  };

  const getDifficultyBadge = (difficulty: string) => {
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

  // Unpracticed problems to recommend in bottom CTA
  const unpracticedProblems = problemProgressList.filter((p) => p.attemptsCount === 0);

  return (
    <div className="min-h-screen bg-[#FAF6F0] py-8 sm:py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Back Link */}
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
            PERFORMANCE ANALYTICS
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-navy tracking-tight">
            Your System Design Progress
          </h1>
          <p className="text-slate-subtext text-sm sm:text-base mt-1">
            Real-time mastery metrics calculated directly from your evaluated design submissions.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex items-center gap-3 text-slate-subtext text-sm">
              <div className="w-5 h-5 border-2 border-terracotta border-t-transparent rounded-full animate-spin" />
              <span>Calculating progress metrics from real submission data...</span>
            </div>
          </div>
        ) : (
          <>
            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
              {/* Card 1: Problems Practiced */}
              <div className="bg-white rounded-2xl p-6 border border-[#F2EDE5] shadow-card">
                <div className="flex items-center justify-between text-slate-subtext text-xs font-semibold mb-3">
                  <span>PROBLEMS PRACTICED</span>
                  <BookOpen size={16} className="text-terracotta" />
                </div>
                <div className="text-3xl font-extrabold text-navy">
                  {stats.problemsPracticed}{' '}
                  <span className="text-sm font-normal text-slate-muted">
                    / {stats.totalProblems || 5}
                  </span>
                </div>
                <div className="w-full bg-cream-100 rounded-full h-2 mt-4 overflow-hidden">
                  <div
                    className="bg-terracotta h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${
                        stats.totalProblems > 0
                          ? (stats.problemsPracticed / stats.totalProblems) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>

              {/* Card 2: Total Attempts */}
              <div className="bg-white rounded-2xl p-6 border border-[#F2EDE5] shadow-card">
                <div className="flex items-center justify-between text-slate-subtext text-xs font-semibold mb-3">
                  <span>TOTAL ATTEMPTS</span>
                  <TrendingUp size={16} className="text-blue-600" />
                </div>
                <div className="text-3xl font-extrabold text-navy">{stats.totalAttempts}</div>
                <p className="text-xs text-slate-subtext mt-4">
                  {stats.completedSubmissions} completed{' '}
                  {stats.completedSubmissions === 1 ? 'review' : 'reviews'}
                </p>
              </div>

              {/* Card 3: Average Score */}
              <div className="bg-white rounded-2xl p-6 border border-[#F2EDE5] shadow-card">
                <div className="flex items-center justify-between text-slate-subtext text-xs font-semibold mb-3">
                  <span>AVERAGE SCORE</span>
                  <Sparkles size={16} className="text-amber-500" />
                </div>
                <div className="text-3xl font-extrabold text-navy">
                  {stats.avgScore > 0 ? stats.avgScore : '—'}
                  {stats.avgScore > 0 && (
                    <span className="text-sm font-normal text-slate-muted"> / 10</span>
                  )}
                </div>
                <p className="text-xs text-slate-subtext mt-4">
                  {stats.completedSubmissions > 0
                    ? `Averaged across ${stats.completedSubmissions} reviews`
                    : 'Awaiting first completed review'}
                </p>
              </div>

              {/* Card 4: Best Score */}
              <div className="bg-white rounded-2xl p-6 border border-[#F2EDE5] shadow-card">
                <div className="flex items-center justify-between text-slate-subtext text-xs font-semibold mb-3">
                  <span>BEST SCORE</span>
                  <Award size={16} className="text-emerald-600" />
                </div>
                <div className="text-3xl font-extrabold text-navy">
                  {stats.highScore > 0 ? stats.highScore : '—'}
                  {stats.highScore > 0 && (
                    <span className="text-sm font-normal text-slate-muted"> / 10</span>
                  )}
                </div>
                <p className="text-xs text-emerald-600 font-medium mt-4">
                  {stats.highScore >= 8
                    ? 'Outstanding design quality'
                    : stats.highScore > 0
                    ? 'Keep practicing to reach 8+'
                    : 'No evaluations yet'}
                </p>
              </div>
            </div>

            {/* Rubric Criteria Mastery (Real Data Only) */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#F2EDE5] shadow-card mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <h2 className="text-lg sm:text-xl font-bold text-navy">
                  Skill & Criteria Breakdown
                </h2>
                {stats.completedSubmissions > 0 && (
                  <span className="text-xs font-semibold text-slate-subtext bg-cream-100 px-3 py-1 rounded-full border border-[#EAE3D8] self-start sm:self-auto">
                    Live data from {stats.completedSubmissions} evaluated{' '}
                    {stats.completedSubmissions === 1 ? 'submission' : 'submissions'}
                  </span>
                )}
              </div>
              <p className="text-slate-subtext text-sm mb-6">
                Evaluated competency progression across fundamental low-level system design areas, calculated directly from your AI rubric feedbacks.
              </p>

              {/* Notice if no submissions evaluated yet */}
              {stats.completedSubmissions === 0 && (
                <div className="mb-6 p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 flex items-start gap-3">
                  <Info size={18} className="text-amber-600 mt-0.5 shrink-0" />
                  <div className="text-xs sm:text-sm text-amber-900 leading-relaxed">
                    <span className="font-semibold">No evaluated submissions yet.</span> All scores and mastery levels below are displayed based on your actual submission history. Complete and submit a problem to view your real-time rubric breakdown.
                  </div>
                </div>
              )}

              <div className="space-y-6">
                {criteriaStats.map((item, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-sm">
                      <div className="font-semibold text-navy flex items-center gap-2">
                        <CheckCircle2
                          size={15}
                          className={item.evaluatedCount > 0 ? 'text-terracotta' : 'text-slate-300'}
                        />
                        <span>{item.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`text-xs font-semibold px-2.5 py-0.5 rounded-md ${getLevelBadgeClass(
                            item.level
                          )}`}
                        >
                          {item.level}
                        </span>
                        <span className="font-bold text-navy text-xs min-w-[50px] text-right">
                          {item.avgScore !== null ? `${item.avgScore} / 10` : '—'}
                        </span>
                        <span className="text-xs text-slate-muted min-w-[36px] text-right">
                          {item.percent}%
                        </span>
                      </div>
                    </div>

                    <div className="w-full bg-cream-100 rounded-full h-2.5 overflow-hidden">
                      <div
                        className={`h-2.5 rounded-full transition-all duration-500 ${
                          item.evaluatedCount > 0
                            ? 'bg-gradient-to-r from-terracotta to-amber-500'
                            : 'bg-transparent'
                        }`}
                        style={{ width: `${item.percent}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-subtext">
                      <p>{item.description}</p>
                      {item.evaluatedCount > 0 && (
                        <span className="text-[11px] text-slate-muted shrink-0 ml-3">
                          {item.evaluatedCount} {item.evaluatedCount === 1 ? 'eval' : 'evals'}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Problem-by-Problem Progress Section (Real Data) */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#F2EDE5] shadow-card mb-8">
              <h2 className="text-lg sm:text-xl font-bold text-navy mb-2">
                Problem-by-Problem Breakdown
              </h2>
              <p className="text-slate-subtext text-sm mb-6">
                Your individual attempt status, evaluation scores, and quick access for each problem.
              </p>

              <div className="divide-y divide-[#F1EBE4]">
                {problemProgressList.map((prob) => (
                  <div
                    key={prob.id}
                    className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <Link
                          to={`/problems/${prob.id}`}
                          className="font-bold text-navy hover:text-terracotta transition-colors text-base no-underline"
                        >
                          {prob.title}
                        </Link>
                        <span
                          className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full capitalize ${getDifficultyBadge(
                            prob.difficulty
                          )}`}
                        >
                          {prob.difficulty}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-slate-subtext">
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          <span>
                            {prob.attemptsCount} {prob.attemptsCount === 1 ? 'attempt' : 'attempts'}
                          </span>
                        </span>
                        <span>·</span>
                        <span>
                          {prob.completedCount} {prob.completedCount === 1 ? 'review' : 'reviews'}
                        </span>
                        {prob.bestScore !== null && (
                          <>
                            <span>·</span>
                            <span className="font-semibold text-emerald-700">
                              Best: {prob.bestScore}/10
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
                      {prob.latestSubmissionId ? (
                        <Link
                          to={`/submissions/${prob.latestSubmissionId}`}
                          className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-cream-100 hover:bg-cream-200 text-navy transition-colors no-underline flex items-center gap-1.5"
                        >
                          <span>View Review</span>
                          <ChevronRight size={14} />
                        </Link>
                      ) : (
                        <Link
                          to={`/problems/${prob.id}`}
                          className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-terracotta hover:bg-terracotta-600 text-white transition-colors no-underline flex items-center gap-1.5 shadow-sm"
                        >
                          <span>Practice</span>
                          <ArrowRight size={13} />
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Practice Next Call to Action (Dynamic Real Suggestions) */}
            <div className="bg-gradient-to-r from-[#FBF3EC] to-[#F8EFE7] rounded-2xl p-8 border border-[#EFE7DC] flex flex-col sm:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="text-lg font-bold text-navy">
                  {unpracticedProblems.length > 0
                    ? 'Ready to solve your next challenge?'
                    : 'Great work practicing all problems!'}
                </h3>
                <p className="text-slate-subtext text-sm mt-1">
                  {unpracticedProblems.length > 0
                    ? `Try tackling ${unpracticedProblems
                        .slice(0, 3)
                        .map((p) => p.title)
                        .join(', ')}.`
                    : 'Refine your designs and push for a 9+ score on any problem.'}
                </p>
              </div>
              <Link
                to="/"
                className="px-6 py-3.5 bg-terracotta hover:bg-terracotta-600 text-white font-semibold rounded-xl flex items-center gap-2 shadow-sm transition-all whitespace-nowrap no-underline shrink-0"
              >
                <span>Browse Problems</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
