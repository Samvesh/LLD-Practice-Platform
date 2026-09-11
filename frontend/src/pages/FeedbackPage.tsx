import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/client';
import { sanitizeText } from '../utils/sanitize';
import {
  ArrowLeft,
  Award,
  RefreshCw,
  AlertCircle,
  FileCode,
  Calendar,
} from 'lucide-react';

interface Feedback {
  criterion: string;
  score: number;
  maxScore: number;
  evidence: string;
  concern: string;
  suggestion: string;
  confidence: number;
}

interface Submission {
  id: string;
  attemptId: string;
  content: { format: string; body: string };
  state: string;
  failureReason?: string;
  failureCause?: string;
  evaluationResult?: {
    feedbacks: Feedback[];
    overallScore: number;
    evaluatedAt: string;
    evaluatorType: string;
  };
  submittedAt: string;
}

export default function FeedbackPage() {
  const { id } = useParams<{ id: string }>();
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState(false);
  const [error, setError] = useState('');

  const fetchSubmission = useCallback(async () => {
    try {
      const res = await api.get(`/submissions/${id}`);
      setSubmission(res.data.submission);
      return res.data.submission;
    } catch (err) {
      console.error('Failed to fetch submission:', err);
      return null;
    }
  }, [id]);

  useEffect(() => {
    fetchSubmission().finally(() => setLoading(false));
  }, [fetchSubmission]);

  // Poll while Evaluating
  useEffect(() => {
    if (!submission || submission.state !== 'Evaluating') return;

    const interval = setInterval(async () => {
      const updated = await fetchSubmission();
      if (updated && updated.state !== 'Evaluating') {
        clearInterval(interval);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [submission, fetchSubmission]);

  const handleRetry = async () => {
    setRetrying(true);
    setError('');
    try {
      await api.post(`/submissions/${id}/retry`);
      await fetchSubmission();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Retry failed.');
    } finally {
      setRetrying(false);
    }
  };

  const getScoreBadgeClass = (score: number) => {
    if (score >= 7) return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
    if (score >= 4) return 'bg-amber-50 text-amber-700 border border-amber-200';
    return 'bg-rose-50 text-rose-700 border border-rose-200';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF6F0] flex items-center justify-center p-8">
        <div className="flex items-center gap-3 text-slate-subtext text-sm">
          <div className="w-5 h-5 border-2 border-terracotta border-t-transparent rounded-full animate-spin" />
          <span>Loading submission feedback...</span>
        </div>
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="min-h-screen bg-[#FAF6F0] py-12">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
            Submission not found.
          </div>
          <Link to="/" className="mt-4 inline-block text-terracotta font-semibold hover:underline">
            ← Return to problems
          </Link>
        </div>
      </div>
    );
  }

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

        {/* Status Card */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-[0_4px_20px_-2px_rgba(30,41,59,0.05)] border border-[#F2EDE5] mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-navy tracking-tight">
                Submission Feedback
              </h1>
              <div className="flex items-center gap-2 text-xs text-slate-subtext mt-1">
                <Calendar size={13} />
                <span>Submitted on {new Date(submission.submittedAt).toLocaleString()}</span>
              </div>
            </div>

            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                submission.state === 'Completed'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : submission.state === 'Evaluating'
                  ? 'bg-amber-50 text-amber-700 border border-amber-200 animate-pulse'
                  : submission.state === 'Failed'
                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                  : 'bg-blue-50 text-blue-700 border border-blue-200'
              }`}
            >
              {submission.state}
            </span>
          </div>

          {/* Evaluating state alert */}
          {submission.state === 'Evaluating' && (
            <div className="mt-6 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-amber-600 border-t-transparent rounded-full animate-spin shrink-0" />
              <div className="text-sm">
                <span className="font-semibold">Evaluating your design...</span>
                <span className="ml-1 text-amber-700">
                  Our structured AI rubric is analyzing your classes, patterns, and trade-offs. This usually takes 15-30 seconds.
                </span>
              </div>
            </div>
          )}

          {/* Failed state alert */}
          {submission.state === 'Failed' && (
            <div className="mt-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800">
              <div className="flex items-start gap-2.5">
                <AlertCircle size={18} className="text-rose-600 shrink-0 mt-0.5" />
                <div className="text-sm">
                  <div className="font-semibold text-rose-900">Evaluation Failed</div>
                  <p className="mt-1 text-rose-700">
                    {sanitizeText(submission.failureReason || 'An error occurred during evaluation.')}
                  </p>
                  {submission.failureCause === 'system' && (
                    <button
                      onClick={handleRetry}
                      disabled={retrying}
                      className="mt-3 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <RefreshCw size={13} className={retrying ? 'animate-spin' : ''} />
                      <span>{retrying ? 'Retrying...' : 'Retry Evaluation'}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              {error}
            </div>
          )}
        </div>

        {/* Evaluation Results */}
        {submission.state === 'Completed' && submission.evaluationResult && (
          <>
            {/* Overall Score Card */}
            <div className="bg-white rounded-2xl p-8 shadow-[0_4px_20px_-2px_rgba(30,41,59,0.05)] border border-[#F2EDE5] mb-6 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-terracotta-50 text-terracotta mb-4">
                <Award size={32} />
              </div>
              <div className="text-4xl sm:text-5xl font-extrabold text-navy tracking-tight">
                <span>{submission.evaluationResult.overallScore}</span>
                <span className="text-slate-muted text-2xl sm:text-3xl font-normal"> / 10</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-subtext font-medium mt-2">
                Overall Assessment Score · Evaluated on{' '}
                {new Date(submission.evaluationResult.evaluatedAt).toLocaleDateString()}
              </p>
            </div>

            {/* Detailed Criteria Table */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-[0_4px_20px_-2px_rgba(30,41,59,0.05)] border border-[#F2EDE5] mb-6 overflow-hidden">
              <h2 className="text-xl font-bold text-navy mb-6">Detailed Feedback by Criterion</h2>

              <div className="overflow-x-auto -mx-6 sm:mx-0">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-[#F0EAE0] text-xs font-bold text-slate-subtext uppercase tracking-wider">
                      <th className="pb-3 px-4">Criterion</th>
                      <th className="pb-3 px-4">Score</th>
                      <th className="pb-3 px-4">Evidence</th>
                      <th className="pb-3 px-4">Concern</th>
                      <th className="pb-3 px-4">Suggestion</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F2EDE5]">
                    {submission.evaluationResult.feedbacks.map((fb, i) => (
                      <tr key={i} className="hover:bg-cream-50/50 transition-colors">
                        <td className="py-4 px-4 font-bold text-navy whitespace-nowrap align-top">
                          {sanitizeText(fb.criterion)}
                        </td>
                        <td className="py-4 px-4 align-top whitespace-nowrap">
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-bold ${getScoreBadgeClass(
                              fb.score
                            )}`}
                          >
                            {fb.score}/{fb.maxScore}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-slate-subtext align-top leading-relaxed text-xs sm:text-sm">
                          {sanitizeText(fb.evidence)}
                        </td>
                        <td className="py-4 px-4 text-slate-subtext align-top leading-relaxed text-xs sm:text-sm">
                          {sanitizeText(fb.concern)}
                        </td>
                        <td className="py-4 px-4 text-slate-subtext align-top leading-relaxed text-xs sm:text-sm">
                          {sanitizeText(fb.suggestion)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* Collapsible submitted design */}
        <details className="bg-white rounded-2xl p-6 sm:p-8 shadow-[0_4px_20px_-2px_rgba(30,41,59,0.05)] border border-[#F2EDE5] group">
          <summary className="cursor-pointer font-bold text-navy flex items-center justify-between select-none">
            <span className="flex items-center gap-2">
              <FileCode size={18} className="text-terracotta" />
              <span>Your Submitted Design</span>
            </span>
            <span className="text-xs text-terracotta font-semibold group-open:rotate-180 transition-transform">
              ▼
            </span>
          </summary>
          <div className="mt-4 pt-4 border-t border-[#F2EDE5]">
            <pre className="text-xs sm:text-sm text-slate-subtext font-mono bg-cream-50 p-4 rounded-xl whitespace-pre-wrap leading-relaxed overflow-x-auto border border-[#EFE8DF]">
              {sanitizeText(submission.content.body)}
            </pre>
          </div>
        </details>
      </div>
    </div>
  );
}
