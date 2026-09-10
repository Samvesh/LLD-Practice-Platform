import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/client';
import { sanitizeText } from '../utils/sanitize';

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

function scoreClass(score: number): string {
  if (score >= 7) return 'score-high';
  if (score >= 4) return 'score-mid';
  return 'score-low';
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
  }, [submission?.state, fetchSubmission]);

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

  if (loading) {
    return <div className="loading"><div className="spinner"></div>Loading submission...</div>;
  }

  if (!submission) {
    return <div className="container page"><div className="alert alert-error">Submission not found.</div></div>;
  }

  return (
    <div className="container page">
      <Link to="/" className="text-secondary text-sm" style={{ textDecoration: 'none' }}>← Back to problems</Link>

      <h1 className="mt-md mb-md">Submission Feedback</h1>

      {/* Status */}
      <div className="card mb-lg">
        <div className="flex-between">
          <div>
            <span className="text-sm text-secondary">Status: </span>
            <span className={`badge badge-${submission.state.toLowerCase()}`}>{submission.state}</span>
          </div>
          <span className="text-xs text-muted">
            Submitted {new Date(submission.submittedAt).toLocaleString()}
          </span>
        </div>

        {/* Evaluating — show polling indicator */}
        {submission.state === 'Evaluating' && (
          <div className="mt-md flex gap-sm" style={{ alignItems: 'center' }}>
            <div className="spinner"></div>
            <span className="text-secondary text-sm">Evaluating your design... This may take 15-30 seconds.</span>
          </div>
        )}

        {/* Failed — show reason and appropriate action */}
        {submission.state === 'Failed' && (
          <div className="mt-md">
            <div className="alert alert-error">
              {sanitizeText(submission.failureReason || 'Evaluation failed.')}
            </div>
            {submission.failureCause === 'system' && (
              <button
                className="btn btn-primary btn-sm"
                onClick={handleRetry}
                disabled={retrying}
              >
                {retrying ? 'Retrying...' : 'Retry Evaluation'}
              </button>
            )}
            {submission.failureCause === 'rule-based' && (
              <p className="text-sm text-secondary">
                Your submission didn't pass validation. Please start a new attempt with a more detailed design.
              </p>
            )}
          </div>
        )}

        {error && <div className="alert alert-error mt-md">{error}</div>}
      </div>

      {/* Completed — show structured feedback */}
      {submission.state === 'Completed' && submission.evaluationResult && (
        <>
          {/* Overall Score */}
          <div className="card mb-lg">
            <div className="overall-score">
              <span className={scoreClass(submission.evaluationResult.overallScore)}>
                {submission.evaluationResult.overallScore}
              </span>
              <span className="text-muted"> / 10</span>
            </div>
            <p className="text-xs text-muted" style={{ textAlign: 'center' }}>
              Overall Score · Evaluated {new Date(submission.evaluationResult.evaluatedAt).toLocaleString()}
            </p>
          </div>

          {/* Per-Dimension Feedback Table */}
          <div className="card mb-lg">
            <h2 className="mb-md">Detailed Feedback</h2>
            <table className="feedback-table">
              <thead>
                <tr>
                  <th>Criterion</th>
                  <th>Score</th>
                  <th>Evidence</th>
                  <th>Concern</th>
                  <th>Suggestion</th>
                </tr>
              </thead>
              <tbody>
                {submission.evaluationResult.feedbacks.map((fb, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 500, whiteSpace: 'nowrap' }}>{sanitizeText(fb.criterion)}</td>
                    <td>
                      <span className={`score ${scoreClass(fb.score)}`}>
                        {fb.score}/{fb.maxScore}
                      </span>
                    </td>
                    <td className="text-sm">{sanitizeText(fb.evidence)}</td>
                    <td className="text-sm">{sanitizeText(fb.concern)}</td>
                    <td className="text-sm">{sanitizeText(fb.suggestion)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Submitted Design (collapsible) */}
      <details className="card">
        <summary style={{ cursor: 'pointer', fontWeight: 500 }}>Your Submitted Design</summary>
        <pre className="mt-md text-sm" style={{
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          color: 'var(--color-text-secondary)',
          lineHeight: 1.7,
        }}>
          {sanitizeText(submission.content.body)}
        </pre>
      </details>
    </div>
  );
}
