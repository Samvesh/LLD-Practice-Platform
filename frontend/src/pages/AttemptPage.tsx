import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import api from '../api/client';
import { ArrowLeft, Send, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function AttemptPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [designText, setDesignText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState<any>(null);
  const [existingSubmission, setExistingSubmission] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Generate idempotency key once on mount — prevents duplicate submissions on double-click
  const idempotencyKeyRef = useRef(uuidv4());

  useEffect(() => {
    api
      .get(`/attempts/${id}`)
      .then((res) => {
        setAttempt(res.data.attempt);
        if (res.data.submission) {
          setExistingSubmission(res.data.submission);
        }
      })
      .catch((err) => console.error('Failed to load attempt:', err))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async () => {
    if (!designText.trim()) {
      setError('Please write your design solution before submitting.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await api.post('/submissions', {
        attemptId: id,
        content: { format: 'text', body: designText },
        idempotencyKey: idempotencyKeyRef.current,
      });

      // Navigate to submission status page
      navigate(`/submissions/${res.data.submission.id}`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Submission failed. Please try again.');
      // Generate a new idempotency key for the next attempt
      idempotencyKeyRef.current = uuidv4();
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF6F0] flex items-center justify-center p-8">
        <div className="flex items-center gap-3 text-slate-subtext text-sm">
          <div className="w-5 h-5 border-2 border-terracotta border-t-transparent rounded-full animate-spin" />
          <span>Loading attempt...</span>
        </div>
      </div>
    );
  }

  // If a submission already exists, redirect to it
  if (existingSubmission) {
    return (
      <div className="min-h-screen bg-[#FAF6F0] py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <div className="bg-white rounded-2xl p-8 shadow-[0_4px_20px_-2px_rgba(30,41,59,0.05)] border border-[#F2EDE5] text-center">
            <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={24} />
            </div>
            <h2 className="text-xl font-bold text-navy mb-2">Submission Already Exists</h2>
            <p className="text-slate-subtext text-sm mb-6">
              This attempt already has a completed or ongoing submission.
            </p>
            <Link
              to={`/submissions/${existingSubmission.id}`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-terracotta hover:bg-terracotta-600 text-white font-semibold rounded-xl transition-colors no-underline"
            >
              <span>View Submission Feedback</span>
              <Send size={15} />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF6F0] py-8 sm:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Back link */}
        <Link
          to={attempt ? `/problems/${attempt.problemId}` : '/'}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-subtext hover:text-terracotta transition-colors no-underline mb-6"
        >
          <ArrowLeft size={16} />
          <span>Back to problem</span>
        </Link>

        {/* Card */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-[0_4px_20px_-2px_rgba(30,41,59,0.05)] border border-[#F2EDE5]">
          <div className="pb-4 border-b border-[#F2EDE5]">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-navy tracking-tight">
              Write Your Design — Attempt #{attempt?.attemptNumber}
            </h1>
            <p className="text-slate-subtext text-sm sm:text-base mt-2">
              Describe your low-level design: classes, responsibilities, relationships, patterns used, and trade-offs.
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mt-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2">
              <AlertCircle size={18} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Text Area */}
          <div className="mt-6">
            <label htmlFor="design-input" className="block text-sm font-semibold text-navy mb-2">
              Design Solution
            </label>
            <textarea
              id="design-input"
              rows={14}
              value={designText}
              onChange={(e) => setDesignText(e.target.value)}
              placeholder={`Describe your design here...\n\nSuggested structure:\n1. Key Classes & Responsibilities\n2. Relationships & Interfaces\n3. Design Patterns Used\n4. Edge Cases Considered\n5. Extensibility & Trade-offs`}
              disabled={submitting}
              className="w-full p-4 bg-cream-50/60 border border-[#E2E8F0] rounded-xl text-navy text-sm font-mono leading-relaxed placeholder:text-slate-muted focus:bg-white focus:border-terracotta focus:ring-1 focus:ring-terracotta outline-none transition-all resize-y"
            />
          </div>

          {/* Footer Controls */}
          <div className="mt-6 pt-4 border-t border-[#F2EDE5] flex items-center justify-between">
            <span className="text-xs text-slate-subtext font-medium">
              {designText.length} characters written
            </span>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting || !designText.trim()}
              className="px-6 py-3 bg-terracotta hover:bg-terracotta-600 active:bg-terracotta-700 text-white font-semibold rounded-xl flex items-center gap-2 shadow-sm transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <Send size={16} strokeWidth={2.2} />
              <span>{submitting ? 'Submitting Design...' : 'Submit for Evaluation'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
